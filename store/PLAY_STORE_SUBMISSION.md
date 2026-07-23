# Google Play Submission Notes

Use this as the Play Console evidence sheet for version 1.0.0. The publisher must verify every answer against the final app bundle and deployed services.

## App access and deletion

- The account is device-local and can be created with any valid username and PIN.
- The app does not require an external account, email or network connection.
- In-app deletion: **Profile → Support → Delete account and data**.
- Public deletion/help route: https://github.com/CyberlPhreak/haghdan-law-learning/blob/main/SUPPORT.md

The public route explains that app-local data is erased on the device and provides a privacy-request path for online AI questions.

## Data safety working answers

Verify the Play Console form against the production host:

- Local account and progress remain on device and are not collected by HaghDān.
- When the user submits an online AI prompt, prompt text, recent chat, curriculum excerpts, requested language and a pseudonymous identifier leave the device for app functionality.
- Basic network metadata may be processed for service delivery, security and rate limiting.
- Data is encrypted in transit through HTTPS in production.
- AI use is optional for learning because the assistant has an offline fallback.
- No advertising, sale of data, cross-app tracking or behavioural analytics SDK.
- No location, contacts, camera, microphone, photos, advertising ID or notification permission.

Do not mark the app as collecting no data when online AI is enabled. Select the current Play data types that cover free-text AI messages and security/network metadata, then classify the production model and hosting providers under Google's current service-provider/sharing definitions.

## Content and policy

- Education only; no legal advice or legal-service marketplace.
- Free-text AI input is moderated and rate limited.
- No user-to-user content, payments, subscriptions or advertising in version 1.0.0.
- Use the current target-API, generative-AI, content-rating and developer-verification requirements shown in the Play Console at submission time.

## Final owner checks

- Provide verified developer identity and monitored contact details.
- Merge the release so all public URLs resolve.
- Deploy the HTTPS AI proxy, set its strict origin allowlist and prevent request-body logging.
- Test the signed Android App Bundle on phones and tablets.
- Upload final screenshots and translations.
- Complete Data safety, app access, content rating, ads, target audience, content rights and generative-AI declarations.
