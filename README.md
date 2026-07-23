# HaghDān · حق‌دان

A Persian-first, offline-capable learning and practice app for the law of England and Wales, FLK1, FLK2 and SQE2 skills. One Expo/React Native codebase runs on Android, iOS, tablets and web.

## Product coverage

- 14 SQE1 subject pathways across FLK1 and FLK2
- All six SQE2 assessed legal skills
- 137 structured SQE learning and timed-station units plus 15 everyday-law lessons
- Five-part SQE lessons: overview, core knowledge, application method, guided scenario and exam clinic
- Bilingual English/Persian legal terminology, examples and checklists
- Six knowledge checks inside each FLK lesson and four rubric checks inside each SQE2 lesson
- 1,068 unit-specific five-option practice checks across 89 FLK1 and FLK2 learning units
- Quick 10-question, diagnostic 30-question and timed 90-question sessions
- Full 180-question FLK mock split into two independent 90-question, 153-minute sessions
- Annex 4 blueprint-balanced mock selection, with Solicitors Accounts integrated into Property and Wills contexts
- 24 timed SQE2 station packs across all official skills and valid practice-area combinations
- Subject-specific 20-question practice from every FLK pathway
- Persistent results, bookmarks, streaks, daily goals and spaced review
- Persistent XP and seven learning levels, three daily missions, eight achievement badges, answer chains and finite reward celebrations
- Persistent interface and curriculum choice for Persian, English, Simplified Chinese, Arabic and Spanish, with automatic RTL/LTR layout
- 2,103 offline-translated lesson, SQE2 station, review and mock-question strings per additional language; official English terminology is retained and draft translations require qualified legal editorial review before publication
- Learning-intelligence dashboard with readiness, seven-day activity, subject mastery, strengths and focus priorities
- Original justice-themed subject artwork across FLK1, FLK2, SQE2 and everyday-law pathways
- Floating illustrated mobile navigation with clear active states and persistent labels
- Layered tap, correct-answer, retry and lesson/test milestone sound feedback with optional mute
- Offline-first local account with required username, hashed PIN, in-app deletion, and no advertising or analytics SDK
- Curriculum-grounded AI Study Assistant with five-language prompts, local fallback and non-persistent in-app chat
- Server-side online AI proxy with moderation, rate limiting, strict production origin configuration, `store: false` and pseudonymous safety identifiers
- In-app Support Centre, privacy policy, terms, educational disclaimer, copyright and trade-mark notice

## Stable Expo baseline

The project is pinned to Expo SDK 54.0.36, React Native 0.81.5 and React 19.1.0. Native dependencies are exact-version pinned.

Expo Go must support SDK 54. On Android, obtain the matching client from:

https://expo.dev/go?device=true&platform=android&sdkVersion=54

On iPhone, use the App Store version if it still supports SDK 54 or use an EAS development build.

## Run

```powershell
nvm use 20.19.4
npm ci
npm start
```

Web:

```powershell
npm run web
```

## AI Study Assistant

The app is fully usable without an API key. If `EXPO_PUBLIC_AI_CHAT_ENDPOINT` is absent or an online request is unavailable, the assistant searches the installed curriculum locally and labels the answer as offline.

For higher-quality hosted answers, deploy the included proxy and keep the OpenAI key on that server:

```powershell
cp .env.example .env
# Set OPENAI_API_KEY and a strict ALLOWED_ORIGINS value on the server.
npm run ai:server
```

Then set `EXPO_PUBLIC_AI_CHAT_ENDPOINT` in the app build environment to the public HTTPS origin of the proxy. Never put `OPENAI_API_KEY` in an `EXPO_PUBLIC_` variable or in a mobile/web bundle.

The proxy defaults to `gpt-5.6-terra`, can be changed with `OPENAI_MODEL`, binds to `127.0.0.1` by default, moderates the latest prompt, sends only recent chat and up to three relevant curriculum excerpts, disables Responses API state storage, and avoids logging request bodies. Set `HOST=0.0.0.0` only inside an appropriately protected production host or container. Production hosting must also be configured not to log bodies.

## Validate

```powershell
npm run typecheck
npm run release:check
npm run export:web
npx expo-doctor
```

## Publication preparation

App icons, splash assets, native identifiers, EAS profiles, privacy policy, terms, editorial policy, support forms, rights notice, store listings and Apple/Google submission worksheets are included. Follow [PUBLISHING.md](./PUBLISHING.md).

The SRA scope, assessment-format and transition audit is recorded in [docs/SRA_COVERAGE_AUDIT.md](./docs/SRA_COVERAGE_AUDIT.md).

Public product documents:

- [Support](./SUPPORT.md)
- [Privacy Policy](./docs/PRIVACY_POLICY.md)
- [Terms and Educational Disclaimer](./docs/TERMS_AND_DISCLAIMER.md)
- [Copyright and Trade Mark Notice](./COPYRIGHT.md)

The remaining release controls require the publisher rather than code:

- provide the verified seller/legal identity and monitored private contact route;
- deploy the HTTPS AI proxy and set the production endpoint/origin allowlist, or ship offline-only;
- merge the release so public support/privacy URLs resolve from `main`;
- complete Apple, Google and Expo account setup;
- obtain item-by-item legal editorial sign-off;
- complete current privacy/data-safety/generative-AI questionnaires;
- test production-signed builds on physical iPhone, iPad and Android devices.

## Content boundary

The curriculum follows the published SRA assessment structure, but HaghDān is independent and is not approved by the SRA, Kaplan SQE or Pearson VUE. The practice bank is original and must not be represented as official past questions. Content is general education, not legal advice, and scores do not guarantee an examination pass.
