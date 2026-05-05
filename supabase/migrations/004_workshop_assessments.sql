-- ══════════════════════════════════════════════
--  CAREER Platform — Workshop Pre/Post Assessments
-- ══════════════════════════════════════════════

create table if not exists workshop_pre_assessments (
  id          uuid primary key default gen_random_uuid(),
  workshop_id uuid references workshops(id) on delete cascade,
  user_id     uuid,
  user_email  text,
  answers     jsonb not null,
  total_score numeric,
  axis1       numeric,
  axis2       numeric,
  axis3       numeric,
  created_at  timestamptz default now(),
  unique(workshop_id, user_id)
);

create table if not exists workshop_post_assessments (
  id          uuid primary key default gen_random_uuid(),
  workshop_id uuid references workshops(id) on delete cascade,
  user_id     uuid,
  user_email  text,
  answers     jsonb not null,
  total_score numeric,
  axis1       numeric,
  axis2       numeric,
  axis3       numeric,
  created_at  timestamptz default now(),
  unique(workshop_id, user_id)
);

alter table workshops add column if not exists post_assessment_open boolean default false;

alter table workshop_pre_assessments  enable row level security;
alter table workshop_post_assessments enable row level security;

create policy "anyone inserts pre"  on workshop_pre_assessments  for insert with check (true);
create policy "anyone reads pre"    on workshop_pre_assessments  for select using (true);
create policy "anyone inserts post" on workshop_post_assessments for insert with check (true);
create policy "anyone reads post"   on workshop_post_assessments for select using (true);
