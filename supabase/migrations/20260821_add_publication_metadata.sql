alter table public.publications
  add column if not exists doi text;

alter table public.projects
  add column if not exists publication_url text;
