-- Applied on 2026-11-12 through the signed-in admin panel, with the same resulting values as the statements below.
-- The DJI UAV paper was published at ATEEC 2026 (6–8 November 2026, paper 117), first author Mohammed Bajhaw.
-- Code side of the same change: lib/hiddenPublications.ts no longer hides id 2, and lib/projectOverrides.ts no longer
-- withholds the rko-lio-dji-uav-gps-denied-mapping project's results, so the full project row below is shown again.
begin;

update public.publications
set venue = $q$ATEEC 2026$q$,
    status = $q$Published · Conference Paper$q$
where id = 2;

commit;
