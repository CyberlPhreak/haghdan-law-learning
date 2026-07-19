# HaghDān · حق‌دان

A Persian-first, cross-platform microlearning app for understanding the law of England and Wales. Built with Expo and React Native for iOS, Android, tablets, and the web.

## Product concept

HaghDān turns intimidating legal concepts into short bilingual learning sessions. The interface is right-to-left by default, while important English legal terms stay visible to help Persian speakers build practical vocabulary.

The first interactive prototype includes:

- A personalised daily learning dashboard
- Map-style pathways and lesson progression
- A bilingual lesson about court hierarchy and judicial precedent
- Active-recall questions with answer feedback
- A spaced-review queue and memory-strength indicators
- Streak, mastery, and knowledge-bank progress
- Responsive mobile, tablet, and desktop navigation
- Educational-content disclaimers throughout

The current lesson content is illustrative and must be legally reviewed before public release. HaghDān provides education, not legal advice.

## Run locally

```bash
npm install
npm run web
```

From the Expo terminal, press `a` for Android or scan the QR code with a compatible Expo Go app. On macOS, press `i` for iOS.

## Validation

```bash
npm run typecheck
npm run export:web
```

## Next production steps

- Add authentication and encrypted cloud progress sync
- Replace sample pathways with solicitor-reviewed curricula
- Add a content-management and legal-review workflow
- Add audio narration and offline lesson downloads
- Add adaptive spaced repetition and durable local persistence
- Add analytics consent, privacy documents, and store assets
