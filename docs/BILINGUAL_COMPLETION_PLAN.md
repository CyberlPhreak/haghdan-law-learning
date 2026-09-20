# Bilingual curriculum completion

Work in progress: English and Persian only. Publication remains blocked until substantive syllabus coverage, assessment quality, and persisted study progress have been verified. Lesson and question counts are not evidence of completeness.

## Implemented locally on 16 September 2026

- Only English and Persian are selectable. Retired language preferences migrate to English without resetting learner records. Archived dictionaries remain in source, not in the selectable runtime catalog.
- Twelve units have new, independently authored bilingual editorial drafts: seven contract units (including unjust enrichment) and five tort units. These replace generic sections for those units and include objectives, primary-source references and 24 original five-option scenario questions. This is not a declaration that either subject has complete subtopic coverage or independent legal approval.
- Explicit reading acknowledgement, resume position, section completion and content version persist separately from assessment completion. Merely reading does not increase quiz scores, mastery or assessment XP. Analytics distinguish reading from practice and label estimated time as estimated.
- New test attempts retain question IDs, selected answers, answer keys and content versions for read-only answer review. Historical scores remain intact when an old question is unavailable or changed.
- A separate new-scenario practice entry never fills missing authored questions with generated variants. Old review questions no longer block the valid queue. Reading sections scroll back to the top on navigation.
- Full-length practice uses two separately shuffled 90-question subject groups, following the current SRA session grouping. App allocation targets are not exact SRA question-count guarantees. FLK2 accounts scenarios still need wills/property context classification; the practice bank remains a draft.
- Test countdown uses a wall-clock deadline and refreshes when the app returns to the foreground. Recorded test duration excludes the inter-session break. Native background behavior still requires device verification.

## Content still required

`npm run content:audit` lists outstanding units per subject. The inventory has 138 SQE units, including stations, but only the twelve units above have this new authored bilingual treatment. There are still 1,068 legacy generated question variants requiring substantive replacement and independent review.

1. Map each current SRA subtopic, not just subject names, to detailed English and Persian teaching, realistic examples, exceptions, worked calculations where applicable, and assessment evidence. Even the new contract/tort drafts require this review; guarantees and indemnities are an explicit contract follow-up.
2. Expand business, dispute resolution, legal systems/public law/legal services, all FLK2 subjects, and SQE2 skills. Preserve stable lesson IDs and increment content versions when meaning changes.
3. Replace repeated variants with independently authored, legally checked client scenarios, five plausible options and explanations for all alternatives. Tag accounts scenarios by wills/property context and ethics across the bank. Do not silently invent filler when a pool is insufficient.
4. Review all SQE2 candidate instructions, source documents, timed tasks, model answers and assessment rubrics. Self-assessment must not be presented as an official examiner score.
5. Obtain independent legal and bilingual editorial review against the relevant assessment-window law cut-off. Record reviewer, date, syllabus subtopic, sources and outstanding issues. The app is not SRA-endorsed.

## Engineering and release follow-up

- Deploy `supabase/migrations/202609160001_study_progress.sql` to the authorized Supabase project before releasing this client to cloud-account users. It is not deployed by editing the local file. Verify two-device sync, guest-to-account migration and account isolation.
- Repair the local dependency installation: `expo-auth-session`, `expo-web-browser`, `@supabase/supabase-js` and `expo-linking` are absent from the available node_modules. Expo SDK 54 specifies `expo-linking ~8.0.12`; it is now declared directly and already resolved in the lockfile. Do not suppress these type errors with fake declarations.
- Verify storage failure reporting and concurrent writes; test refresh/restart, logout/login and updated-content behavior without progress loss. Question history and reading versioning have pure tests, but full storage/cloud round trips still require end-to-end validation.
- Run typecheck, functional tests, bilingual tests, web export and actual browser flows after dependencies are restored. Then test physical iPhone and Android: RTL/LTR, dark/light, long reading pages, answer input, audio, background timers, offline restart and interrupted exams. Responsive screenshots alone are not device certification.
- Interrupted in-progress tests are not yet persisted. Add versioned attempt drafts and resume/expiry behavior before claiming comprehensive progress tracking.

## Validation commands and current boundary

- `npm test`: structural and functional checks.
- `npm run test:bilingual`: language migration, versioned reading progress, analytics separation, authored content integrity, session grouping and deadline arithmetic.
- `npm run content:audit`: explicit curriculum gaps; counts do not establish legal correctness.
- `npm run content:release-gate`: deliberately fails while editorial coverage/review requirements remain unmet. `npm run release:check` also enforces this gate.

The local pure checks pass; full typecheck is blocked by missing installed dependencies. No browser, native build, physical-device certification, cloud migration deployment, or GitHub push is implied by this milestone.

## Official reference

[SRA SQE1 specification, applicable from 1 September 2026](https://sqe.sra.org.uk/assessments/sqe1-assessments/sqe1-specification), including the linked FLK1, FLK2 and blueprint pages. Checked 16 September 2026. This is a syllabus reference, not approval of the app's content.
