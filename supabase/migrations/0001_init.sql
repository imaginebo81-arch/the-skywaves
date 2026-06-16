-- Skywaves Educare schema
-- Creates a dedicated "skywaves" Postgres schema and all objects inside it.
-- Run against the database (e.g. psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql).
--
-- IMPORTANT: for the REST API (PostgREST/Kong) to serve this schema, the schema
-- name must be added to PostgREST's exposed schemas, e.g.
--   PGRST_DB_SCHEMAS=public,storage,graphql_public,skywaves
-- and PostgREST reloaded. The backend supabase client is configured to use it
-- via SUPABASE_DB_SCHEMA (defaults to "skywaves").

create extension if not exists pgcrypto;

create schema if not exists skywaves;

-- Allow the API roles to use the schema. RLS (enabled below, with no policies)
-- still blocks anon/authenticated; the backend uses the service_role key which
-- bypasses RLS but still needs these grants on a non-public schema.
grant usage on schema skywaves to anon, authenticated, service_role;
alter default privileges in schema skywaves grant all on tables to anon, authenticated, service_role;
alter default privileges in schema skywaves grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema skywaves grant all on functions to anon, authenticated, service_role;

set search_path = skywaves, public;

do $$ begin
  create type reg_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_role as enum ('superadmin','admin');
exception when duplicate_object then null; end $$;

create sequence if not exists skywaves.admission_seq start 1;

create or replace function skywaves.next_admission_number() returns text language sql as
$$ select 'SR' || lpad(nextval('skywaves.admission_seq')::text, 8, '0') $$;

create or replace function skywaves.set_updated_at() returns trigger language plpgsql as
$$ begin new.updated_at = now(); return new; end $$;

-- COURSES (academic)
create table if not exists skywaves.courses (
  id uuid primary key default gen_random_uuid(),
  course_name text not null,
  duration text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  archived_at timestamptz
);
drop trigger if exists trg_courses_u on skywaves.courses;
create trigger trg_courses_u before update on skywaves.courses for each row execute function skywaves.set_updated_at();

-- SUBJECTS
create table if not exists skywaves.subjects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references skywaves.courses(id),
  subject_name text not null,
  min_marks int not null default 35,
  max_marks int not null default 100,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);
drop trigger if exists trg_subjects_u on skywaves.subjects;
create trigger trg_subjects_u before update on skywaves.subjects for each row execute function skywaves.set_updated_at();
create index if not exists idx_subjects_course on skywaves.subjects (course_id) where deleted_at is null;

-- REGISTRATIONS
create table if not exists skywaves.registrations (
  id uuid primary key default gen_random_uuid(),
  admission_number text unique not null default skywaves.next_admission_number(),
  admission_date date not null default current_date,
  name text not null,
  father_name text,
  mother_name text,
  date_of_birth date,
  gender text,
  address text,
  contact_number text not null,
  course_id uuid references skywaves.courses(id),
  profile_photo_path text,
  status reg_status not null default 'pending',
  student_roll_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  archived_at timestamptz
);
drop trigger if exists trg_reg_u on skywaves.registrations;
create trigger trg_reg_u before update on skywaves.registrations for each row execute function skywaves.set_updated_at();
create index if not exists idx_reg_status on skywaves.registrations (status) where deleted_at is null;

-- STUDENTS
create table if not exists skywaves.students (
  roll_number text primary key,
  registration_id uuid references skywaves.registrations(id),
  admission_number text,
  name text not null,
  father_name text,
  mother_name text,
  date_of_birth date not null,
  address text,
  contact_number text,
  course_id uuid not null references skywaves.courses(id),
  profile_photo_path text,
  start_date date,
  end_date date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  archived_at timestamptz
);
drop trigger if exists trg_students_u on skywaves.students;
create trigger trg_students_u before update on skywaves.students for each row execute function skywaves.set_updated_at();
create index if not exists idx_students_verify on skywaves.students (roll_number, date_of_birth) where deleted_at is null;

-- STUDENT MARKS (one row per student per subject)
create table if not exists skywaves.student_marks (
  id uuid primary key default gen_random_uuid(),
  roll_number text not null references skywaves.students(roll_number),
  subject_id uuid not null references skywaves.subjects(id),
  obtained_marks numeric(6,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  unique (roll_number, subject_id)
);
drop trigger if exists trg_marks_u on skywaves.student_marks;
create trigger trg_marks_u before update on skywaves.student_marks for each row execute function skywaves.set_updated_at();
create index if not exists idx_marks_roll on skywaves.student_marks (roll_number) where deleted_at is null;

-- EMPLOYEES
create table if not exists skywaves.employees (
  employment_reference_number text primary key,
  name text not null,
  father_name text,
  date_of_birth date not null,
  address text,
  joining_date date,
  leaving_date date,
  designation text,
  certificate_template_variables jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  archived_at timestamptz
);
drop trigger if exists trg_emp_u on skywaves.employees;
create trigger trg_emp_u before update on skywaves.employees for each row execute function skywaves.set_updated_at();
create index if not exists idx_emp_verify on skywaves.employees (employment_reference_number, date_of_birth) where deleted_at is null;

-- ADMIN USERS
create table if not exists skywaves.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  display_name text,
  role admin_role not null default 'admin',
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);
drop trigger if exists trg_admin_u on skywaves.admin_users;
create trigger trg_admin_u before update on skywaves.admin_users for each row execute function skywaves.set_updated_at();

-- SITE CONTENT (CMS)
create table if not exists skywaves.site_content (
  key text primary key,
  data jsonb not null,
  updated_by uuid references skywaves.admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);
drop trigger if exists trg_content_u on skywaves.site_content;
create trigger trg_content_u before update on skywaves.site_content for each row execute function skywaves.set_updated_at();

-- SETTINGS
create table if not exists skywaves.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ENQUIRIES
create table if not exists skywaves.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  course text,
  message text,
  source text not null default 'enquiry',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);
drop trigger if exists trg_enq_u on skywaves.enquiries;
create trigger trg_enq_u before update on skywaves.enquiries for each row execute function skywaves.set_updated_at();

-- AUDIT LOGS (append-only)
create table if not exists skywaves.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_admin_id uuid references skywaves.admin_users(id),
  action text not null,
  entity text not null,
  entity_id text,
  prev_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_entity on skywaves.audit_logs (entity, entity_id);
create index if not exists idx_audit_created on skywaves.audit_logs (created_at desc);

-- Approval workflow as one atomic transaction.
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
  where s.course_id = v_reg.course_id and s.deleted_at is null;

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

-- Deny-by-default: enable RLS with no policies. The server uses the service-role
-- key (bypasses RLS); the anon key can never read or write these tables directly.
alter table skywaves.courses enable row level security;
alter table skywaves.subjects enable row level security;
alter table skywaves.registrations enable row level security;
alter table skywaves.students enable row level security;
alter table skywaves.student_marks enable row level security;
alter table skywaves.employees enable row level security;
alter table skywaves.admin_users enable row level security;
alter table skywaves.site_content enable row level security;
alter table skywaves.settings enable row level security;
alter table skywaves.enquiries enable row level security;
alter table skywaves.audit_logs enable row level security;

-- Explicit grants on the objects created above (covers any that predate the
-- default-privileges statement, e.g. on re-runs).
grant all on all tables in schema skywaves to anon, authenticated, service_role;
grant all on all sequences in schema skywaves to anon, authenticated, service_role;
grant all on all functions in schema skywaves to anon, authenticated, service_role;

-- Private storage bucket for student profile photos.
insert into storage.buckets (id, name, public)
values ('skywaves', 'skywaves', false)
on conflict (id) do nothing;
