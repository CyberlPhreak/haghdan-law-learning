# Publication Runbook

The codebase is configured for Expo SDK 54, EAS Build and EAS Submit. It can produce preview and production binaries, but store submission requires owner-controlled accounts and the release blockers below.

## Release blockers requiring the publisher

1. Replace publisher/contact placeholders in privacy policy and terms.
2. Obtain documented solicitor/editorial approval for every lesson and question.
3. Confirm the final business model and whether purchases or subscriptions will be included.
4. Create or nominate the Expo account and run `eas init` to add the project ID.
5. Provide Apple Developer and Google Play Console accounts.
6. Host the privacy policy and support page at public HTTPS URLs.
7. Complete store questionnaires, age rating, content rights and data-safety declarations.
8. Test production-signed builds on physical iPhone, iPad and Android devices.

## Local release checks

```powershell
nvm use 20.19.4
npm ci
npm run release:check
npm run export:web
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

Retain successful release-check output, Expo Doctor output, signed-build identifiers, physical-device screenshots, accessibility checks, privacy/data-safety answers and the legal editorial sign-off register.
