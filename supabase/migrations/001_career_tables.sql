-- ══════════════════════════════════════════════
--  CAREER Platform — Core Tables
-- ══════════════════════════════════════════════

-- نتائج الاستبيانات (RIASEC + Choice + Career Readiness)
create table if not exists survey_results (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  email         text,
  name          text,
  survey_type   text not null,       -- 'riasec' | 'choice' | 'career'
  total_score   numeric,
  modal_scores  jsonb,               -- {"R":18,"I":14,...} أو {"direction":80,...}
  ai_analysis   text,
  language      text default 'ar',
  created_at    timestamptz default now()
);

-- الاستشارات المهنية
create table if not exists consultations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  user_email  text,
  user_name   text,
  subject     text not null,
  message     text not null,
  reply       text,
  status      text default 'pending',   -- 'pending' | 'replied' | 'closed'
  created_at  timestamptz default now()
);

-- تقييمات الورشة
create table if not exists workshop_evaluations (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete set null,
  user_name          text,
  trainer_rating     int check (trainer_rating between 1 and 5),
  interaction_rating int check (interaction_rating between 1 and 5),
  content_rating     int check (content_rating between 1 and 5),
  facilities_rating  int check (facilities_rating between 1 and 5),
  benefit_rating     int check (benefit_rating between 1 and 5),
  comments           text,
  created_at         timestamptz default now()
);

-- إعدادات التقييم
create table if not exists evaluation_settings (
  id       int primary key default 1,
  is_open  boolean default false
);
insert into evaluation_settings (id, is_open) values (1, false)
on conflict (id) do nothing;

-- ══════════════════════════════════════════════
--  Row Level Security
-- ══════════════════════════════════════════════

alter table survey_results       enable row level security;
alter table consultations        enable row level security;
alter table workshop_evaluations enable row level security;
alter table evaluation_settings  enable row level security;

-- المستخدم يقرأ نتائجه فقط
create policy "user reads own surveys"
  on survey_results for select
  using (auth.uid() = user_id);

-- المستخدم يقرأ استشاراته فقط
create policy "user reads own consultations"
  on consultations for select
  using (auth.uid() = user_id);

-- المستخدم يرسل استشارة
create policy "user inserts consultation"
  on consultations for insert
  with check (auth.uid() = user_id);

-- الكل يقرأ إعدادات التقييم
create policy "anyone reads eval settings"
  on evaluation_settings for select
  using (true);
