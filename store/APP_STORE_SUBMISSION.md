# Apple App Store Submission Notes

Use this as the App Store Connect evidence sheet for version 1.0.0. The publisher must verify every answer against the final signed build and deployed production services.

## App review information

- Sign-in uses a device-local username and PIN. It does not require an external account, email or network connection.
- Reviewers may create any valid username of at least three characters and any PIN that meets the on-screen rules.
- Account deletion: **Profile → Support → Delete account and data**.
- AI assistant: **Home → AI Study Assistant** or **Profile → AI Study Assistant**.
- If the online service is unavailable, the assistant automatically uses the installed curriculum.
- The app provides education only and does not offer legal services or legal advice.

## Required public URLs

- Support URL: https://github.com/CyberlPhreak/haghdan-law-learning/blob/main/SUPPORT.md
- Privacy Policy URL: https://github.com/CyberlPhreak/haghdan-law-learning/blob/main/docs/PRIVACY_POLICY.md
- Terms URL: https://github.com/CyberlPhreak/haghdan-law-learning/blob/main/docs/TERMS_AND_DISCLAIMER.md

These links become final only after the release branch is merged to `main`. Confirm they open without authentication before submission.

## Privacy nutrition-label working answers

Verify in App Store Connect against the production host:

- Local username, hashed PIN and progress: stored only on device; not collected by HaghDān.
- Online AI prompt, recent chat, curriculum excerpts and pseudonymous identifier: transmitted for app functionality when the user submits a prompt.
- Infrastructure network metadata such as IP address: may be processed for delivery, abuse prevention and rate limiting.
- Advertising: none.
- Tracking across apps or websites: none.
- Behavioural analytics SDK: none.
- AI chat history in the app: not persisted after leaving the screen.

Do not state “data not collected” if the production online AI assistant is enabled. Complete the label using Apple's current definitions and the production provider's actual retention configuration.

## Age rating and content

- Educational/legal reference content.
- No gambling, user-to-user chat, unrestricted web browsing, advertising, purchases or social feed in version 1.0.0.
- Free-text AI input is moderated and bounded to education, but reviewers must assess the current generative-AI questionnaire and age-rating definitions.

## Final owner checks

- Provide the verified seller/legal identity and monitored contact details.
- Confirm content rights and qualified legal-editorial review.
- Test on physical iPhone and iPad.
- Supply final screenshots for supported device sizes and each advertised language.
- Confirm the privacy/support URLs, AI endpoint, origin allowlist and deletion path work in the signed production build.
- Complete export-compliance, content-rights and age-rating questionnaires.
