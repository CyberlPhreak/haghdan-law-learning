export const product = {
  name: 'HaghDān',
  persianName: 'حق‌دان',
  trademark: 'HaghDān™',
  version: '1.0.0',
  copyright: '© 2026 HaghDān. All rights reserved.',
  repository: 'https://github.com/CyberlPhreak/haghdan-law-learning',
  supportUrl: 'https://github.com/CyberlPhreak/haghdan-law-learning/issues/new/choose',
  contentReportUrl: 'https://github.com/CyberlPhreak/haghdan-law-learning/issues/new?template=content-error.yml',
  privacyRequestUrl: 'https://github.com/CyberlPhreak/haghdan-law-learning/issues/new?template=privacy-request.yml',
  privacyUrl: 'https://github.com/CyberlPhreak/haghdan-law-learning/blob/main/docs/PRIVACY_POLICY.md',
  termsUrl: 'https://github.com/CyberlPhreak/haghdan-law-learning/blob/main/docs/TERMS_AND_DISCLAIMER.md',
  rightsUrl: 'https://github.com/CyberlPhreak/haghdan-law-learning/blob/main/COPYRIGHT.md',
} as const;

export type LegalDocumentId = 'privacy' | 'terms' | 'rights';
export type LegalSection = { heading: string; body: string };

export const legalDocuments: Record<LegalDocumentId, { title: string; updated: string; sections: LegalSection[] }> = {
  privacy: {
    title: 'Privacy Policy',
    updated: '23 July 2026',
    sections: [
      { heading: 'Local learning account', body: 'Your display name, username, hashed PIN, settings and learning progress are stored in app storage on this device. HaghDān does not receive this local account data.' },
      { heading: 'AI Study Assistant', body: 'Offline assistant searches remain on the device. If the online assistant is enabled, the text you submit, a privacy-preserving learner identifier and relevant curriculum excerpts are sent to the HaghDān AI service and its model provider to generate the answer. Do not submit personal, confidential or privileged information. The app does not save chat history after you leave the chat screen.' },
      { heading: 'Retention and service providers', body: 'The HaghDān AI proxy does not intentionally retain chat content and requests the model provider not to store response state. Provider security and abuse-monitoring retention may still apply under its API data policy. Operational server logs must be configured to exclude request bodies.' },
      { heading: 'Permissions and tracking', body: 'The app does not request location, contacts, camera, microphone, photos, advertising identifier or notification permissions. It contains no advertising or third-party analytics SDK.' },
      { heading: 'Deletion and choices', body: 'Use “Delete account and data” in Profile to erase app-local data. You can use the assistant offline by leaving the online endpoint unconfigured. A privacy request can be submitted from Support.' },
      { heading: 'Children', body: 'The app is for legal education and is not directed to children under 13. Users should not place information about a child in AI chat.' },
    ],
  },
  terms: {
    title: 'Terms and Educational Disclaimer',
    updated: '23 July 2026',
    sections: [
      { heading: 'Educational licence', body: 'HaghDān grants you a personal, limited, revocable, non-transferable licence to use the app for lawful private study. You may not extract, resell, republish, scrape or train another model on the curriculum, questions, artwork or software except where applicable law expressly permits.' },
      { heading: 'No legal advice', body: 'Lessons, scores and AI responses are general education. They are not legal advice, do not create a solicitor-client relationship and must not be used to decide a live legal matter. Obtain advice from an authorised professional when needed.' },
      { heading: 'AI limitations and acceptable use', body: 'AI responses may be incomplete, inaccurate or outdated. Do not submit confidential, privileged, identifying or unlawful material. Do not attempt to bypass safeguards, overload the service, automate extraction or use outputs to impersonate a lawyer or official examination provider.' },
      { heading: 'Independent product', body: 'HaghDān is not produced, approved, endorsed or quality-assured by the SRA, Kaplan SQE, Pearson VUE, OpenAI or any university. SQE and third-party names are used descriptively and remain the property of their respective owners.' },
      { heading: 'No guarantee and availability', body: 'Scores do not guarantee an examination pass, admission or legal outcome. Features may change or be suspended for security, maintenance, legal or cost reasons. The offline curriculum remains available without the online AI service.' },
      { heading: 'Liability and governing law', body: 'Nothing excludes liability that cannot lawfully be excluded. To the fullest extent permitted by law, HaghDān is supplied without warranties and is not liable for indirect loss arising from reliance on educational content. These terms are governed by the laws of England and Wales, subject to mandatory consumer rights.' },
    ],
  },
  rights: {
    title: 'Copyright and Trade Mark Notice',
    updated: '23 July 2026',
    sections: [
      { heading: 'HaghDān material', body: 'The HaghDān curriculum structure, original explanations, practice questions, interface copy, code, illustrations, sound design and brand assets are protected by copyright and other intellectual-property rights. © 2026 HaghDān. All rights reserved.' },
      { heading: 'Trade mark notice', body: 'HaghDān™ and حق‌دان™ are used as unregistered trade marks. The ™ symbol is a claim of brand rights and does not represent registration. Do not use confusingly similar names, marks, icons or store listings.' },
      { heading: 'Third-party rights', body: 'SRA, Solicitors Regulation Authority, SQE, Kaplan, Pearson VUE, Apple, Google, Expo and OpenAI names and marks belong to their respective owners. Their mention does not imply sponsorship or endorsement.' },
      { heading: 'Open-source components', body: 'Third-party software remains subject to its own licence terms. Those licences do not grant rights in HaghDān content, artwork or branding.' },
    ],
  },
};
