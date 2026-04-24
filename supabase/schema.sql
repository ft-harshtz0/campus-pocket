-- Required KR0463/KR0464/KR0465 schema and business rules.
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

drop table if exists public.assignment_submission cascade;
drop table if exists public.assignment cascade;
drop table if exists public.attendance cascade;
drop table if exists public.class_session cascade;
drop table if exists public.classroom_membership cascade;
drop table if exists public.parent_student_link cascade;
drop table if exists public.classroom cascade;
drop table if exists public."user" cascade;
drop type if exists attendance_status cascade;
drop type if exists user_role cascade;

create type user_role as enum ('student', 'parent');
create type attendance_status as enum ('PRESENT', 'ABSENT', 'LATE');

create table public."user" (
  id integer generated always as identity primary key,
  username text not null unique,
  role user_role not null,
  school_id integer not null
);

create table public.parent_student_link (
  id integer generated always as identity primary key,
  parent_id integer not null references public."user"(id) on delete cascade,
  student_id integer not null references public."user"(id) on delete cascade,
  unique (parent_id, student_id),
  check (parent_id <> student_id)
);

create table public.classroom (
  id integer generated always as identity primary key,
  name text not null,
  school_id integer not null
);

create table public.classroom_membership (
  id integer generated always as identity primary key,
  classroom_id integer not null references public.classroom(id) on delete cascade,
  user_id integer not null references public."user"(id) on delete cascade,
  role text not null check (role = 'student'),
  unique (classroom_id, user_id)
);

create table public.class_session (
  id integer generated always as identity primary key,
  classroom_id integer not null references public.classroom(id) on delete cascade,
  date date not null,
  topic text not null
);

create table public.attendance (
  id integer generated always as identity primary key,
  student_id integer not null references public."user"(id) on delete cascade,
  session_id integer not null references public.class_session(id) on delete cascade,
  status attendance_status not null,
  unique (student_id, session_id)
);

create table public.assignment (
  id integer generated always as identity primary key,
  classroom_id integer not null references public.classroom(id) on delete cascade,
  title text not null
);

create table public.assignment_submission (
  id integer generated always as identity primary key,
  assignment_id integer not null references public.assignment(id) on delete cascade,
  user_id integer not null references public."user"(id) on delete cascade,
  score double precision not null check (score >= 0),
  total double precision not null check (total > 0),
  percentage double precision generated always as ((score / total) * 100.0) stored,
  unique (assignment_id, user_id)
);

create index idx_user_school_role on public."user"(school_id, role);
create index idx_classroom_school on public.classroom(school_id);
create index idx_parent_link_parent on public.parent_student_link(parent_id);
create index idx_membership_user on public.classroom_membership(user_id);
create index idx_session_classroom_date on public.class_session(classroom_id, date);
create index idx_attendance_student on public.attendance(student_id);
create index idx_submission_user on public.assignment_submission(user_id);

create or replace function public.enforce_parent_student_roles()
returns trigger
language plpgsql
as $$
declare
  parent_role user_role;
  child_role user_role;
begin
  select role into parent_role from public."user" where id = new.parent_id;
  select role into child_role from public."user" where id = new.student_id;
  if parent_role is distinct from 'parent'::user_role then
    raise exception 'parent_id % is not a parent', new.parent_id;
  end if;
  if child_role is distinct from 'student'::user_role then
    raise exception 'student_id % is not a student', new.student_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_parent_student_roles on public.parent_student_link;
create trigger trg_parent_student_roles
before insert or update on public.parent_student_link
for each row execute function public.enforce_parent_student_roles();

create or replace function public.enforce_school_isolation_membership()
returns trigger
language plpgsql
as $$
declare
  member_role user_role;
  member_school integer;
  class_school integer;
begin
  select role, school_id into member_role, member_school
  from public."user"
  where id = new.user_id;

  select school_id into class_school
  from public.classroom
  where id = new.classroom_id;

  if member_role is distinct from 'student'::user_role then
    raise exception 'Only student users can join classrooms';
  end if;

  if member_school is distinct from class_school then
    raise exception 'School isolation violation: student and classroom must share school_id';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_school_isolation_membership on public.classroom_membership;
create trigger trg_school_isolation_membership
before insert or update on public.classroom_membership
for each row execute function public.enforce_school_isolation_membership();

create or replace function public.enforce_attendance_student_membership()
returns trigger
language plpgsql
as $$
declare
  class_id integer;
begin
  select classroom_id into class_id
  from public.class_session
  where id = new.session_id;

  if not exists (
    select 1
    from public.classroom_membership cm
    where cm.classroom_id = class_id
      and cm.user_id = new.student_id
      and cm.role = 'student'
  ) then
    raise exception 'Attendance violation: student must belong to the class session classroom';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_attendance_membership on public.attendance;
create trigger trg_attendance_membership
before insert or update on public.attendance
for each row execute function public.enforce_attendance_student_membership();

create or replace view public.v_student_performance as
select
  u.id as student_id,
  u.school_id,
  coalesce((
    (
      count(*) filter (where a.status in ('PRESENT', 'LATE'))::numeric
      / nullif(count(*)::numeric, 0)
    ) * 100
  ), 0) as overall_attendance_percentage,
  coalesce(avg(s.percentage), 0) as average_grade_percentage
from public."user" u
left join public.attendance a on a.student_id = u.id
left join public.assignment_submission s on s.user_id = u.id
where u.role = 'student'
group by u.id, u.school_id;

create or replace function public.get_overall_attendance_percentage(p_student_id integer)
returns double precision
language sql
stable
as $$
  select coalesce(
    (
      count(*) filter (where a.status in ('PRESENT', 'LATE'))::double precision
      / nullif(count(*)::double precision, 0)
    ) * 100.0,
    0.0
  )
  from public.attendance a
  where a.student_id = p_student_id
$$;

create or replace function public.get_average_grade_percentage(p_student_id integer)
returns double precision
language sql
stable
as $$
  select coalesce(avg(s.percentage), 0.0)
  from public.assignment_submission s
  where s.user_id = p_student_id
$$;

-- Parent-child linking with exact child username/password.
-- Assumption: "user".username is the child's auth.users.email in Supabase Auth.
create or replace function public.link_child_with_credentials(
  p_parent_id integer,
  p_child_username text,
  p_child_password text
)
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_parent_role user_role;
  v_child_id integer;
  v_child_role user_role;
  v_hash text;
  v_link_id integer;
begin
  select role into v_parent_role from public."user" where id = p_parent_id;
  if v_parent_role is distinct from 'parent'::user_role then
    raise exception 'Only parent users can link children';
  end if;

  select id, role into v_child_id, v_child_role
  from public."user"
  where username = p_child_username;

  if v_child_id is null or v_child_role is distinct from 'student'::user_role then
    raise exception 'Invalid child username';
  end if;

  select encrypted_password into v_hash
  from auth.users
  where email = p_child_username;

  if v_hash is null then
    raise exception 'Child auth record not found';
  end if;

  if crypt(p_child_password, v_hash) <> v_hash then
    raise exception 'Invalid child password';
  end if;

  insert into public.parent_student_link(parent_id, student_id)
  values (p_parent_id, v_child_id)
  on conflict (parent_id, student_id) do update set parent_id = excluded.parent_id
  returning id into v_link_id;

  return v_link_id;
end;
$$;

revoke all on function public.link_child_with_credentials(integer, text, text) from public;
grant execute on function public.link_child_with_credentials(integer, text, text) to authenticated;
