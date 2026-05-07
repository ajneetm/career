-- Change rating range from 1-5 to 1-10 and add per-criterion notes

alter table workshop_evaluations
  drop constraint if exists workshop_evaluations_trainer_rating_check,
  drop constraint if exists workshop_evaluations_interaction_rating_check,
  drop constraint if exists workshop_evaluations_content_rating_check,
  drop constraint if exists workshop_evaluations_facilities_rating_check,
  drop constraint if exists workshop_evaluations_benefit_rating_check;

alter table workshop_evaluations
  add constraint workshop_evaluations_trainer_rating_check     check (trainer_rating between 1 and 10),
  add constraint workshop_evaluations_interaction_rating_check check (interaction_rating between 1 and 10),
  add constraint workshop_evaluations_content_rating_check     check (content_rating between 1 and 10),
  add constraint workshop_evaluations_facilities_rating_check  check (facilities_rating between 1 and 10),
  add constraint workshop_evaluations_benefit_rating_check     check (benefit_rating between 1 and 10);

alter table workshop_evaluations
  add column if not exists trainer_notes     text,
  add column if not exists interaction_notes text,
  add column if not exists content_notes     text,
  add column if not exists facilities_notes  text,
  add column if not exists benefit_notes     text;
