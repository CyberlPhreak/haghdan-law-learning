# HaghDān · حق‌دان

A Persian-first, offline-capable learning app for understanding the law of England and Wales. It runs on Android, iOS, tablets, and the web from one Expo/React Native codebase.

## What works

- First-run onboarding with a learner name and daily study goal
- Five complete learning pathways with 15 bilingual lessons
- Section-by-section lessons, scored quizzes, explanations, and haptic feedback
- Durable on-device progress, quiz scores, bookmarks, streaks, and daily goals
- Adaptive spaced-repetition queue for correct and incorrect answers
- Persian and English search across lessons and the legal glossary
- Responsive bottom navigation on phones and sidebar navigation on desktop
- Accessible controls, RTL reading layouts, safe-area support, and legal disclaimers
- Resettable local profile and settings

Progress is stored locally with AsyncStorage and works without an account. Cloud accounts and cross-device sync are intentionally not represented as complete features.

## Stable Expo baseline

The project is pinned to Expo SDK 54.0.36, React Native 0.81.5, React 19.1.0, and Node 20.19.4. All native dependencies are exact-version pinned and pass Expo's SDK compatibility check.

Expo Go must match SDK 54. On Android, use the matching build from:

https://expo.dev/go?device=true&platform=android&sdkVersion=54

On iPhone, update Expo Go from the App Store. Apple does not allow installing arbitrary older Expo Go versions on a physical iPhone; use a development build if the current store client no longer supports SDK 54.

## Run on a phone

```powershell
nvm use 20.19.4
npm ci
npm start
```

Scan the QR code in the matching Expo Go app. The phone and computer must be able to reach each other on the same network.

## Run on the web

```powershell
npm run web
```

Open http://localhost:8084.

## Validation

```powershell
npm run typecheck
node scripts/run-expo.cjs install --check
npm run export:web
```

## Product boundary

The app is now a functional offline-first MVP, not only a visual demo. A public commercial release still needs solicitor review of every lesson, privacy and terms documents, store assets, analytics consent decisions, and a production authentication/sync service if cross-device accounts are required.

The content is general legal education, not legal advice. Law and procedural deadlines can change.
