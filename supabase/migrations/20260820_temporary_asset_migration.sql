create policy "temporary_migration_upload" on storage.objects
for insert to anon
with check (
  bucket_id = 'portfolio-media'
  and (storage.foldername(name))[1] = 'migration'
);
