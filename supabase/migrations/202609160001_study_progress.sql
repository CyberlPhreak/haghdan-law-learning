-- Deploy before releasing the bilingual reading-progress client.
-- Existing RLS on learner_progress continues to protect each user's data.
alter table public.learner_progress
  add column if not exists study_progress jsonb not null default '{}'::jsonb;
