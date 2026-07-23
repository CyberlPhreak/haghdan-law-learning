import { createServer } from 'node:http';

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '127.0.0.1';
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-5.6-terra';
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean));
const requests = new Map();

const json = (response, status, payload, origin) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  response.end(JSON.stringify(payload));
};

const requestOrigin = (request) => {
  const origin = request.headers.origin || '';
  if (!origin) return '*';
  if (!allowedOrigins.size || allowedOrigins.has(origin)) return origin;
  return '';
};

const rateLimited = (request) => {
  const key = request.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const recent = (requests.get(key) || []).filter((time) => now - time < 60_000);
  recent.push(now);
  requests.set(key, recent);
  return recent.length > 20;
};

const readJson = async (request) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 32_000) throw new Error('request_too_large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const openAiRequest = async (path, body) => {
  const response = await fetch(`https://api.openai.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) {
    console.error('OpenAI request failed', response.status, payload?.error?.type || 'unknown');
    throw new Error('provider_error');
  }
  return payload;
};

const outputText = (response) => response.output
  ?.flatMap((item) => item.content || [])
  .filter((item) => item.type === 'output_text')
  .map((item) => item.text)
  .join('\n')
  .trim();

const systemPrompt = `You are the HaghDān Study Assistant for learners studying the law of England and Wales and the SQE.
Use only the curriculum context supplied with the request. If it is insufficient, say so and identify what the learner should verify.
Explain concepts for education and exam preparation. Do not give case-specific legal advice, predict outcomes, create a solicitor-client relationship, or claim affiliation with the SRA, Kaplan SQE, Pearson VUE, or OpenAI.
Do not ask for or repeat personal, confidential, privileged, financial, health, immigration, criminal-case, or identifying information.
Distinguish black-letter law, procedure, professional conduct, and exam technique. State that law and assessment specifications can change when the answer depends on a deadline, threshold, tax amount, procedural rule, or assessment window.
Answer in the requested language while retaining precise English legal terminology where useful. Lead with the answer, then give a short rule, application method, and study checkpoint.`;

createServer(async (request, response) => {
  const origin = requestOrigin(request);
  if (!origin) return json(response, 403, { error: 'origin_not_allowed' }, 'null');
  if (request.method === 'OPTIONS') return json(response, 204, {}, origin);
  if (request.method === 'GET' && request.url === '/health') return json(response, 200, { ok: true, model }, origin);
  if (request.method !== 'POST' || request.url !== '/ai/chat') return json(response, 404, { error: 'not_found' }, origin);
  if (!apiKey) return json(response, 503, { error: 'assistant_not_configured' }, origin);
  if (rateLimited(request)) return json(response, 429, { error: 'rate_limited' }, origin);

  try {
    const body = await readJson(request);
    const messages = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
    const latest = messages.filter((message) => message?.role === 'user').at(-1)?.text?.trim();
    if (!latest || latest.length > 2_000) return json(response, 400, { error: 'invalid_message' }, origin);

    const moderation = await openAiRequest('moderations', {
      model: 'omni-moderation-latest',
      input: latest,
    });
    if (moderation.results?.[0]?.flagged) return json(response, 400, { error: 'message_not_supported' }, origin);

    const context = JSON.stringify(Array.isArray(body.curriculumContext) ? body.curriculumContext.slice(0, 3) : []);
    const conversation = messages
      .filter((message) => ['user', 'assistant'].includes(message?.role) && typeof message?.text === 'string')
      .map((message) => ({ role: message.role, content: message.text.slice(0, 2_000) }));
    const result = await openAiRequest('responses', {
      model,
      store: false,
      safety_identifier: typeof body.safetyId === 'string' ? body.safetyId.slice(0, 64) : 'anonymous_learner',
      reasoning: { effort: 'low' },
      text: { verbosity: 'medium' },
      instructions: `${systemPrompt}\nRequested language: ${String(body.language || 'en')}.\nCurriculum context: ${context}`,
      input: conversation,
      max_output_tokens: 900,
    });
    const answer = outputText(result);
    if (!answer) throw new Error('empty_provider_response');
    return json(response, 200, { answer }, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'assistant_error';
    const clientErrors = new Set(['request_too_large', 'invalid_message']);
    return json(response, clientErrors.has(message) ? 400 : 500, { error: clientErrors.has(message) ? message : 'assistant_unavailable' }, origin);
  }
}).listen(port, host, () => {
  console.log(`HaghDān AI proxy listening on http://${host}:${port}`);
});
