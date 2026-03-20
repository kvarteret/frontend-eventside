insert into public.event_types (slug, name, description, sort_order)
values (
    'internarrangement',
    'Internarrangement',
    'Interne arrangementer som kun vises for innloggede interne.',
    180
)
on conflict (slug) do update
set
    name = excluded.name,
    description = excluded.description,
    sort_order = excluded.sort_order,
    is_active = true,
    updated_at = timezone('utc', now());
