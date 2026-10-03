-- Crear bucket exercise-videos desde Storage > New bucket, o ejecutar si tenés permisos:
insert into storage.buckets(id,name,public) values('exercise-videos','exercise-videos',true) on conflict(id)do update set public=true;
drop policy if exists "Videos public read" on storage.objects;create policy "Videos public read" on storage.objects for select using(bucket_id='exercise-videos');
drop policy if exists "Staff video upload" on storage.objects;create policy "Staff video upload" on storage.objects for insert to authenticated with check(bucket_id='exercise-videos' and public.is_staff());
drop policy if exists "Staff video update" on storage.objects;create policy "Staff video update" on storage.objects for update to authenticated using(bucket_id='exercise-videos' and public.is_staff()) with check(bucket_id='exercise-videos' and public.is_staff());
drop policy if exists "Staff video delete" on storage.objects;create policy "Staff video delete" on storage.objects for delete to authenticated using(bucket_id='exercise-videos' and public.is_staff());
