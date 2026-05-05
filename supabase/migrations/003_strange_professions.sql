-- ══════════════════════════════════════════════
--  CAREER Platform — Strange Professions
-- ══════════════════════════════════════════════

create table if not exists strange_professions (
  id          uuid primary key default gen_random_uuid(),
  workshop_id uuid references workshops(id) on delete cascade,
  name        text not null,
  code        text not null unique,   -- 3-digit string e.g. '472'
  is_active   boolean default true,
  created_at  timestamptz default now()
);

create table if not exists strange_profession_votes (
  id            uuid primary key default gen_random_uuid(),
  profession_id uuid references strange_professions(id) on delete cascade,
  session_id    text,                 -- from localStorage, prevent double vote
  q1 int check (q1 between 1 and 5),
  q2 int check (q2 between 1 and 5),
  q3 int check (q3 between 1 and 5),
  q4 int check (q4 between 1 and 5),
  q5 int check (q5 between 1 and 5),
  q6 int check (q6 between 1 and 5),
  avg_score     numeric,
  created_at    timestamptz default now()
);

alter table strange_professions      enable row level security;
alter table strange_profession_votes enable row level security;

-- الكل يقرأ المهن النشطة (للصفحة العامة)
create policy "anyone reads active professions"
  on strange_professions for select using (is_active = true);

-- الكل يقرأ الأصوات (لعرض النتائج)
create policy "anyone reads votes"
  on strange_profession_votes for select using (true);
