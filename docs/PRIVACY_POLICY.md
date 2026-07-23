# Privacy Policy — HaghDān / حق‌دان

Effective date: 23 July 2026

HaghDān is an offline-first application for studying the law of England and Wales and preparing for the SQE. This policy explains the repository release identified as version 1.0.0.

## App-local account and learning data

The app stores the following in its application storage on the user's device:

- name or nickname and username;
- a salted, iteratively hashed local PIN (the PIN itself is not stored);
- acceptance timestamp, language, theme, sound and daily-goal settings;
- completed lessons, quiz scores, bookmarks, review schedule and study streak;
- practice-test history, XP, missions and achievements.

HaghDān does not receive this local account or learning data. It may be included in operating-system backups controlled by the user and Apple, Google or another platform provider.

## AI Study Assistant

The assistant has two modes:

1. **Offline mode.** The app searches bundled curriculum material on the device. The prompt and result are not transmitted.
2. **Online mode, when enabled by the distributed build.** The text submitted by the user, recent chat turns, up to three relevant curriculum excerpts, requested language and a one-way pseudonymous learner identifier are sent to the HaghDān AI proxy and its model service provider to generate an answer.

Online AI use is optional for studying because unavailable online requests automatically fall back to the offline assistant. Users must not submit personal, confidential, legally privileged, financial, health, immigration, criminal-case or identifying information.

Chat messages are held only in the current chat screen and the app does not add them to local account history. The HaghDān proxy is designed not to log request bodies and requests that the model provider not store response state. Limited provider security and abuse-monitoring retention may nevertheless apply under the provider's API data policy.

## Safety and service operation

Online prompts are checked by a model-provider moderation service. The proxy applies request-size limits, origin restrictions and rate limiting. Basic network and hosting metadata, such as an IP address and request time, may be processed transiently by infrastructure providers for delivery and security. Production hosting must be configured to avoid request-body logging.

## Permissions, analytics and advertising

Version 1.0.0 does not request location, contacts, camera, microphone, photos, advertising identifier or notification permissions. It contains no advertising or third-party behavioural analytics SDK.

Apple, Google, device manufacturers, app stores and operating-system services may independently process download, crash, payment, backup or device information under their own privacy terms.

## Deleting data and exercising choices

Use **Profile → Support → Delete account and data** to erase the local account, progress and settings from the device. Removing the app also removes app-local data, subject to platform backup and restore behaviour.

Because HaghDān does not receive local-account data, the in-app deletion control is the primary deletion path. For a question about online AI processing or a privacy request, use the [privacy request form](https://github.com/CyberlPhreak/haghdan-law-learning/issues/new?template=privacy-request.yml). That first-contact form is public; submit only a non-sensitive summary.

## Children

HaghDān is intended for legal education and is not directed to children under 13. Users must not enter information about a child in the AI assistant.

## International processing

If online AI is enabled, model and hosting providers may process requests outside the user's country. The publisher must confirm the production providers, contractual safeguards and store disclosure before release in each territory.

## Changes and contact

Material changes will be shown by an updated effective date. Privacy and support enquiries can be started through the [HaghDān support page](../SUPPORT.md). Before commercial publication, the store seller must ensure that its verified legal identity, correspondence details and any required data-controller information are displayed in the applicable store listing or public support page.
