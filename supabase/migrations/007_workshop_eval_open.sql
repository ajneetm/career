alter table workshops
  add column if not exists evaluation_open boolean default false;

alter table workshop_evaluations
  add column if not exists workshop_id uuid references workshops(id) on delete set null;
