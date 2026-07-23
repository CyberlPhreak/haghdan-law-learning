# Publication Runbook

The codebase is configured for Expo SDK 54, EAS Build and EAS Submit. It can produce preview and production binaries, but store submission requires owner-controlled accounts and the release blockers below.

## Release controls requiring the publisher

1. Provide the verified store seller/legal identity, correspondence details and a monitored private contact route.
2. Obtain documented solicitor/editorial approval for every lesson, question and translated string.
3. Confirm the final business model. Version 1.0.0 currently has no purchases, subscriptions or advertising.
4. Create or nominate the Expo account and run `eas init` to add the real project ID.
5. Provide Apple Developer and Google Play Console accounts.
6. Merge the release branch so the public support, privacy, terms and rights URLs resolve from `main`; a dedicated publisher-controlled domain is recommended for long-term stability.
7. Choose online or offline-only AI. For online AI, deploy `server/ai-chat.mjs` behind HTTPS, keep `OPENAI_API_KEY` server-side, set a strict `ALLOWED_ORIGINS`, prevent request-body logging and inject `EXPO_PUBLIC_AI_CHAT_ENDPOINT` at build time.
8. Complete the current store privacy, data-safety, generative-AI, age-rating, content-rights, export-compliance and app-access declarations using the signed build's actual behaviour.
9. Test production-signed builds and account deletion on physical iPhone, iPad and Android devices.

## Local release checks

```powershell
nvm use 20.19.4
npm ci
npm run release:check
npm run export:web
```

If online AI is part of the release, also verify the deployed proxy:

```powershell
curl https://YOUR-AI-HOST.example/health
```

## Preview builds

```powershell
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile preview --platform ios
```

## Production builds and submission

```powershell
npx eas-cli build --profile production --platform all
npx eas-cli submit --profile production --platform android
npx eas-cli submit --profile production --platform ios
```

Apple submission requires an Apple Developer account. Android submission requires a Play Console app and service-account credentials when using EAS Submit.

## Versioning

- Marketing version: `expo.version`
- iOS build: `expo.ios.buildNumber`
- Android build: `expo.android.versionCode`
- Content version: document the SRA specification window and law cut-off date separately.

## Final evidence pack

Retain successful release-check output, Expo Doctor output, AI health/security configuration, signed-build identifiers, physical-device screenshots, accessibility checks, privacy/data-safety answers and the legal editorial sign-off register.

Use [store/APP_STORE_SUBMISSION.md](./store/APP_STORE_SUBMISSION.md) and [store/PLAY_STORE_SUBMISSION.md](./store/PLAY_STORE_SUBMISSION.md) as evidence worksheets. They are not substitutes for the live store questionnaires, which can change.
