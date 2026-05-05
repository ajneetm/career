-- ══════════════════════════════════════════════
--  CAREER Platform — Workshops & Projects
-- ══════════════════════════════════════════════

create table if not exists workshops (
  id               uuid primary key default gen_random_uuid(),
  name_ar          text not null,
  name_en          text,
  description_ar   text,
  description_en   text,
  category         text,
  duration         text,
  discount_percent int  default 0,
  discount_code    text,
  is_active        boolean default true,
  created_at       timestamptz default now()
);

create table if not exists workshop_enrollments (
  id          uuid primary key default gen_random_uuid(),
  workshop_id uuid references workshops(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  user_email  text,
  created_at  timestamptz default now(),
  unique(workshop_id, user_id)
);

create table if not exists workshop_materials (
  id           uuid primary key default gen_random_uuid(),
  workshop_id  uuid references workshops(id) on delete cascade,
  name         text not null,
  url          text not null,
  content_type text default 'file',   -- file | video | link | quiz
  sort_order   int  default 0,
  created_at   timestamptz default now()
);

create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete set null,
  owner_name  text,
  title       text not null,
  description text,
  is_active   boolean default false,
  created_at  timestamptz default now(),
  unique(owner_id)
);

create table if not exists project_evaluations (
  id                   uuid primary key default gen_random_uuid(),
  project_id           uuid references projects(id) on delete cascade,
  evaluator_id         uuid references auth.users(id) on delete set null,
  person_name          text,
  project_name         text,
  purpose_rating       int check (purpose_rating between 1 and 10),
  purpose_notes        text,
  return_rating        int check (return_rating between 1 and 10),
  return_notes         text,
  obtainability_rating int check (obtainability_rating between 1 and 10),
  obtainability_notes  text,
  design_rating        int check (design_rating between 1 and 10),
  design_notes         text,
  users_rating         int check (users_rating between 1 and 10),
  users_notes          text,
  competition_rating   int check (competition_rating between 1 and 10),
  competition_notes    text,
  timeline_rating      int check (timeline_rating between 1 and 10),
  timeline_notes       text,
  created_at           timestamptz default now(),
  unique(project_id, evaluator_id)
);

-- ══════════════════════════════════════════════
--  Row Level Security
-- ══════════════════════════════════════════════

alter table workshops            enable row level security;
alter table workshop_enrollments enable row level security;
alter table workshop_materials   enable row level security;
alter table projects             enable row level security;
alter table project_evaluations  enable row level security;

-- الكل يقرأ الورش النشطة
create policy "anyone reads active workshops"
  on workshops for select using (is_active = true);

-- المستخدم يقرأ تسجيلاته
create policy "user reads own enrollments"
  on workshop_enrollments for select using (auth.uid() = user_id);

-- المواد: المسجّل يقرأها (service role يكفي لعرضها)
create policy "enrolled user reads materials"
  on workshop_materials for select using (true);

-- المشاريع: المستخدم يقرأ مشروعه + الكل يقرأ المشاريع النشطة للتقييم
create policy "user reads own project"
  on projects for select using (auth.uid() = owner_id);

create policy "anyone reads active projects"
  on projects for select using (is_active = true);

-- تقييمات المشاريع: المستخدم يقرأ ما قيّمه
create policy "user reads own evaluations"
  on project_evaluations for select using (auth.uid() = evaluator_id);
