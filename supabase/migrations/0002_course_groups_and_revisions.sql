-- Skywaves Educare - client revisions
-- Idempotent. Run against the database, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0002_course_groups_and_revisions.sql

set search_path = skywaves, public;

-- 1. COURSE GROUPS (public categories for courses)
create table if not exists skywaves.course_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_path text,
  status text not null default 'active',
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  archived_at timestamptz
);
create unique index if not exists uq_course_groups_name on skywaves.course_groups (lower(name)) where deleted_at is null;
drop trigger if exists trg_course_groups_u on skywaves.course_groups;
create trigger trg_course_groups_u before update on skywaves.course_groups for each row execute function skywaves.set_updated_at();
alter table skywaves.course_groups enable row level security;

-- 2. COURSES: new columns
alter table skywaves.courses add column if not exists description text;
alter table skywaves.courses add column if not exists image_path text;
alter table skywaves.courses add column if not exists course_group_id uuid references skywaves.course_groups(id);

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'skywaves' and table_name = 'courses' and column_name = 'frontend_visible'
  ) then
    alter table skywaves.courses add column frontend_visible boolean not null default false;
    update skywaves.courses set frontend_visible = true;
  end if;
end $$;

create index if not exists idx_courses_group on skywaves.courses (course_group_id) where deleted_at is null;

-- 3. SUBJECTS: new columns
alter table skywaves.subjects add column if not exists description text;
alter table skywaves.subjects add column if not exists image_path text;
alter table skywaves.subjects add column if not exists duration text;
alter table skywaves.subjects add column if not exists status text not null default 'active';

-- 4. EMPLOYEES: ensure markdown column exists (referenced by the app)
alter table skywaves.employees add column if not exists certificate_markdown text;

-- 5. Approval workflow: only create marks for ACTIVE, non-deleted subjects.
create or replace function skywaves.approve_registration(
  p_registration_id uuid,
  p_roll_number text,
  p_actor uuid,
  p_start_date date default null,
  p_end_date date default null
) returns skywaves.students
language plpgsql
set search_path = skywaves, public
as $$
declare
  v_reg skywaves.registrations;
  v_student skywaves.students;
begin
  select * into v_reg from registrations where id = p_registration_id and deleted_at is null for update;
  if not found then raise exception 'registration not found' using errcode = 'P0002'; end if;
  if v_reg.status = 'approved' then raise exception 'registration already approved' using errcode = 'P0001'; end if;
  if exists (select 1 from students where roll_number = p_roll_number) then
    raise exception 'roll number already in use' using errcode = '23505';
  end if;

  insert into students (
    roll_number, registration_id, admission_number, name, father_name, mother_name,
    date_of_birth, address, contact_number, course_id, profile_photo_path, start_date, end_date
  ) values (
    p_roll_number, v_reg.id, v_reg.admission_number, v_reg.name, v_reg.father_name, v_reg.mother_name,
    v_reg.date_of_birth, v_reg.address, v_reg.contact_number, v_reg.course_id, v_reg.profile_photo_path,
    p_start_date, p_end_date
  ) returning * into v_student;

  insert into student_marks (roll_number, subject_id, obtained_marks)
  select p_roll_number, s.id, null
  from subjects s
  where s.course_id = v_reg.course_id and s.deleted_at is null and s.status = 'active';

  update registrations
    set status = 'approved', archived_at = now(), student_roll_number = p_roll_number
    where id = v_reg.id;

  insert into audit_logs (actor_admin_id, action, entity, entity_id, prev_value, new_value)
  values (
    p_actor, 'registration.approve', 'registrations', v_reg.id::text,
    to_jsonb(v_reg),
    jsonb_build_object('roll_number', p_roll_number, 'student', to_jsonb(v_student))
  );

  return v_student;
end $$;

-- 6. Pin search_path on remaining functions (clears Supabase linter warnings; no behavior change).
alter function skywaves.next_admission_number() set search_path = skywaves, public;
alter function skywaves.set_updated_at() set search_path = skywaves, public;

-- 7. Grants for the new table (service_role bypasses RLS but still needs grants on a non-public schema).
grant all on all tables in schema skywaves to anon, authenticated, service_role;
grant all on all sequences in schema skywaves to anon, authenticated, service_role;
grant all on all functions in schema skywaves to anon, authenticated, service_role;
