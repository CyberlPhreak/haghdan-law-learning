# Privacy Policy — HaghDān / حق‌دان

Effective date: 23 July 2026

HaghDān is an offline-capable application for studying the law of England and Wales and preparing for the SQE. This policy explains the repository release identified as version 1.0.0.

## Account and learning data

When the production cloud account service is configured, HaghDān processes:

- email address, authentication identifier, email-verification status and chosen sign-in provider;
- name or nickname and username;
- acceptance timestamp, language, theme, sound and daily-goal settings;
- completed lessons, quiz scores, bookmarks, review schedule and study streak;
- practice-test history, XP, missions and achievements; and
- limited network, authentication and security metadata needed to deliver and protect the service.

Supabase provides authentication, transactional account email and the hosted Postgres database. Passwords are handled by Supabase Auth and are not stored in the HaghDān app or learning tables. Database Row Level Security is designed so an authenticated user can access only rows bearing that user's identifier. Google processes information when the user chooses Google sign-in under Google's own terms.

The app also caches account and learning state in application storage so it can load reliably and retry interrupted synchronisation. Signing out clears cached personal learning data from that device. Platform backups controlled by the user, Apple, Google or a device provider may retain app data according to their settings.

If a distributed build intentionally omits cloud configuration, the app offers an offline fallback. In that mode, the profile, learning data and a salted iteratively hashed PIN remain in app storage on that device and are not sent to HaghDān. The PIN itself is not stored.

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

## Purpose, retention and legal basis

Account and progress data is used to provide sign-in, recovery, synchronisation, personal learning features, support and service security. The publisher must document the applicable legal basis and production retention schedule for each launch territory. Cloud account data is retained while the account is active and is deleted when in-app account deletion succeeds, subject to short-lived provider backups, security records and legal obligations disclosed by the production provider.

## Deleting data and exercising choices

Use **Profile → Support → Delete account and data**. For a cloud account, this requests deletion of the Supabase authentication user and the associated profile, settings and progress, then clears the device cache. For an offline fallback account, it erases the local profile, PIN hash, progress and settings. Removing the app clears device data but does not itself delete an active cloud account.

For access, correction, deletion or a question about account or AI processing, use the [privacy request form](https://github.com/CyberlPhreak/haghdan-law-learning/issues/new?template=privacy-request.yml). That first-contact form is public; submit only a non-sensitive summary and never post a password, reset link or identity document.

## Children

HaghDān is intended for legal education and is not directed to children under 13. Users must not enter information about a child in the AI assistant.

## International processing

Supabase, Google, model and hosting providers may process data outside the user's country. The publisher must confirm production regions, subprocessors, contractual safeguards, transfer mechanisms and store disclosures before release in each territory.

## Changes and contact

Material changes will be shown by an updated effective date. Privacy and support enquiries can be started through the [HaghDān support page](../SUPPORT.md). Before commercial publication, the store seller must ensure that its verified legal identity, correspondence details and any required data-controller information are displayed in the applicable store listing or public support page.
