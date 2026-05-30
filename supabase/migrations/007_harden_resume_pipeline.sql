create or replace function public.sync_resume_file_contract()
returns trigger
language plpgsql
as $$
begin
  if new.file_name is null or btrim(new.file_name) = '' then
    new.file_name := coalesce(nullif(btrim(new.title), ''), 'Untitled Resume');
  end if;

  if new.title is null or btrim(new.title) = '' then
    new.title := coalesce(
      nullif(regexp_replace(new.file_name, '\.[^.]+$', ''), ''),
      'Untitled Resume'
    );
  end if;

  if new.mime_type is null or btrim(new.mime_type) = '' then
    new.mime_type := coalesce(nullif(btrim(new.file_type), ''), 'text/plain');
  end if;

  if new.file_type is null or btrim(new.file_type) = '' then
    new.file_type := coalesce(nullif(btrim(new.mime_type), ''), 'text/plain');
  end if;

  return new;
end;
$$;

drop trigger if exists sync_resume_file_contract_before_write on public.resumes;

create trigger sync_resume_file_contract_before_write
before insert or update on public.resumes
for each row
execute function public.sync_resume_file_contract();

update public.resumes
set
  title = coalesce(
    nullif(title, ''),
    nullif(regexp_replace(file_name, '\.[^.]+$', ''), ''),
    'Untitled Resume'
  ),
  file_type = coalesce(nullif(file_type, ''), nullif(mime_type, ''), 'text/plain'),
  file_name = coalesce(nullif(file_name, ''), nullif(title, ''), 'Untitled Resume'),
  mime_type = coalesce(nullif(mime_type, ''), nullif(file_type, ''), 'text/plain');

create or replace function public.set_analysis_user_from_resume()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resume_owner_id uuid;
begin
  select resumes.user_id
  into resume_owner_id
  from public.resumes
  where resumes.id = new.resume_id;

  if resume_owner_id is null then
    raise exception 'analysis resume owner could not be resolved';
  end if;

  if new.user_id is null then
    new.user_id := resume_owner_id;
  end if;

  if new.user_id <> resume_owner_id then
    raise exception 'analysis user_id must match the resume owner';
  end if;

  return new;
end;
$$;

drop trigger if exists set_analysis_user_from_resume_before_write on public.analyses;

create trigger set_analysis_user_from_resume_before_write
before insert or update of resume_id, user_id on public.analyses
for each row
execute function public.set_analysis_user_from_resume();
