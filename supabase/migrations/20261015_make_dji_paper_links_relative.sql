-- Links to the paper page no longer hard-code the host, so they keep working on any domain.
update public.projects
set publication_url = '/publications/2',
    rich_content = replace(rich_content, 'https://mohammedbajhaw.github.io/publications/2', '/publications/2')
where slug = 'rko-lio-dji-uav-gps-denied-mapping';
