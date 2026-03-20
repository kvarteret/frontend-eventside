alter table public.events
    alter column event_type_id set not null;

alter table public.events
    drop column if exists categories;
