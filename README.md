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
- Offline-first local account with required username, hashed PIN, and no advertising or analytics SDK

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

## Validate

```powershell
npm run typecheck
npm run release:check
npm run export:web
npx expo-doctor
```

## Publication preparation

App icons, splash assets, native identifiers, EAS profiles, privacy policy, terms, editorial policy and draft store listings are included. Follow [PUBLISHING.md](./PUBLISHING.md).

The SRA scope, assessment-format and transition audit is recorded in [docs/SRA_COVERAGE_AUDIT.md](./docs/SRA_COVERAGE_AUDIT.md).

The remaining release blockers require the publisher rather than code:

- replace publisher/contact placeholders;
- host privacy/support pages;
- complete Apple and Google account setup;
- obtain item-by-item legal editorial sign-off;
- test signed builds on physical devices.

## Content boundary

The curriculum follows the published SRA assessment structure, but HaghDān is independent and is not approved by the SRA, Kaplan SQE or Pearson VUE. The practice bank is original and must not be represented as official past questions. Content is general education, not legal advice, and scores do not guarantee an examination pass.
