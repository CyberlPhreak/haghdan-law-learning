# Google Play Submission Notes

Use this as the Play Console evidence sheet for version 1.0.0. The publisher must verify every answer against the final app bundle and deployed services.

## App access and deletion

- Production sign-in uses verified email/password or Google login. Provide Play review with working app-access instructions and a durable review account.
- An offline device-local PIN fallback exists only when the distributed build intentionally omits cloud configuration.
- In-app deletion: **Profile → Support → Delete account and data**.
- Public deletion/help route: https://github.com/CyberlPhreak/haghdan-law-learning/blob/main/SUPPORT.md

The public route explains in-app cloud-account deletion, local-cache deletion and the privacy-request path.

## Data safety working answers

Verify the Play Console form against the production host:

- Email address, Supabase authentication ID, username, display name, verification state and sign-in provider are collected for account management.
- Learning progress, bookmarks, settings, scores, review schedule, test history and XP are collected for app functionality and cross-device sync.
- Passwords are handled by Supabase Auth and are not stored in HaghDān learning tables.
- Account and progress data is cached on device for loading and sync retry.
- When the user submits an online AI prompt, prompt text, recent chat, curriculum excerpts, requested language and a pseudonymous identifier leave the device for app functionality.
- Basic network metadata may be processed for service delivery, security and rate limiting.
- Data is encrypted in transit through HTTPS in production.
- AI use is optional for learning because the assistant has an offline fallback.
- No advertising, sale of data, cross-app tracking or behavioural analytics SDK.
- No location, contacts, camera, microphone, photos, advertising ID or notification permission.

Do not mark the app as collecting no data. Select the current Play data types covering account/contact information, user IDs, app activity/progress, free-text AI messages and security/network metadata, then classify Supabase, Google, model and hosting providers under Google's current service-provider/sharing definitions.

## Content and policy

- Education only; no legal advice or legal-service marketplace.
- Free-text AI input is moderated and rate limited.
- No user-to-user content, payments, subscriptions or advertising in version 1.0.0.
- Use the current target-API, generative-AI, content-rating and developer-verification requirements shown in the Play Console at submission time.

## Final owner checks

- Provide verified developer identity and monitored contact details.
- Merge the release so all public URLs resolve.
- Deploy the HTTPS AI proxy, set its strict origin allowlist and prevent request-body logging.
- Configure Supabase custom SMTP, Google OAuth, approved redirects, database policies and the deletion function.
- Test the signed Android App Bundle on phones and tablets.
- Upload final screenshots and translations.
- Complete Data safety, app access, content rating, ads, target audience, content rights and generative-AI declarations.
