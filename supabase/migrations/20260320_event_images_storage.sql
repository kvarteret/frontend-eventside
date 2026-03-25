insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'event-images',
    'event-images',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif']
)
on conflict (id) do update
set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Public event images are readable'
    ) then
        create policy "Public event images are readable"
            on storage.objects
            for select
            to public
            using (bucket_id = 'event-images');
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Anyone can upload event images'
    ) then
        create policy "Anyone can upload event images"
            on storage.objects
            for insert
            to anon, authenticated
            with check (bucket_id = 'event-images');
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Anyone can update event images'
    ) then
        create policy "Anyone can update event images"
            on storage.objects
            for update
            to anon, authenticated
            using (bucket_id = 'event-images')
            with check (bucket_id = 'event-images');
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Anyone can delete event images'
    ) then
        create policy "Anyone can delete event images"
            on storage.objects
            for delete
            to anon, authenticated
            using (bucket_id = 'event-images');
    end if;
end
$$;
