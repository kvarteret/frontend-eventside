import { execFileSync } from "node:child_process"

const DATABASE_URL = process.env.DATABASE_URL?.trim()

if (!DATABASE_URL) {
    throw new Error("Missing DATABASE_URL for taxonomy backfill.")
}

const toPsqlConnectionString = (value: string): string =>
    value
        .replace(/^postgresql\+asyncpg:\/\//, "postgresql://")
        .replace("ssl=require", "sslmode=require")

const runPsql = (sql: string): string =>
    execFileSync(
        "psql",
        [
            toPsqlConnectionString(DATABASE_URL),
            "-v",
            "ON_ERROR_STOP=1",
            "-At",
            "-F",
            "|",
            "-c",
            sql,
        ],
        {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        },
    ).trim()

const BACKFILL_SQL = `
with inferred as (
    select
        e.id,
        case
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%programslipp%' then 'programslipp'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%generalforsamling%' then 'generalforsamling'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%panelsamtale%' then 'panelsamtale'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%foredrag%' then 'foredrag'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%debatt%' then 'debatt'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%åpningsmøte%' then 'apningsmote'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%frokostmøte%' then 'frokostmote'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%revy%' then 'revy'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%film%' then 'film-kino'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%kino%' then 'film-kino'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%quiz%' then 'quiz'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%marked%' then 'marked'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%infomøte%' then 'infomote'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%konsert%' then 'konsert'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%festival%' then 'festival'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%forestilling%' then 'forestilling'
            when coalesce(e.translations->'no'->>'title', e.translations->'en'->>'title', e.slug) ilike '%pitch a friend%' then 'sosialt'
            when coalesce(e.translations->'no'->>'description', e.translations->'en'->>'description', '') ilike '%vi inviterer til debatt%' then 'debatt'
            when coalesce(e.translations->'no'->>'description', e.translations->'en'->>'description', '') ilike '%debatt om%' then 'debatt'
            when coalesce(e.translations->'no'->>'description', e.translations->'en'->>'description', '') ilike '%debatten om%' then 'debatt'
            when coalesce(e.translations->'no'->>'description', e.translations->'en'->>'description', '') ilike '%ekspertene er splittet%' then 'debatt'
            when coalesce(e.translations->'no'->>'description', e.translations->'en'->>'description', '') ilike '%hvem bør ha makten%' then 'debatt'
            when coalesce(e.translations->'no'->>'description', e.translations->'en'->>'description', '') ilike '%moralsk forsvare%' then 'debatt'
            when coalesce(e.translations->'no'->>'description', e.translations->'en'->>'description', '') ilike '%partiterapi%' then 'debatt'
            when exists (
                select 1
                from json_array_elements(e.categories) category
                where category->>'name' = 'Konsert og musikk'
            ) then 'konsert'
            when exists (
                select 1
                from json_array_elements(e.categories) category
                where category->>'name' = 'Debatter og foredrag'
            ) then 'foredrag'
            when exists (
                select 1
                from json_array_elements(e.categories) category
                where category->>'name' = 'Quiz'
            ) then 'quiz'
            when exists (
                select 1
                from json_array_elements(e.categories) category
                where category->>'name' = 'Sosialt'
            ) then 'sosialt'
            else null
        end as event_type_slug
    from public.events e
), updated as (
    update public.events e
    set event_type_id = event_types.id
    from inferred
    join public.event_types on event_types.slug = inferred.event_type_slug
    where e.id = inferred.id
      and inferred.event_type_slug is not null
    returning e.id
), cleared_memberships as (
    delete from public.event_organizer_group_memberships
    returning id
)
select
    (select count(*) from updated) as updated_rows,
    (select count(*) from cleared_memberships) as cleared_membership_rows;
`

const UNMAPPED_SQL = `
select id, slug
from public.events
where event_type_id is null
order by event_start asc;
`

const run = () => {
    const backfillResult = runPsql(BACKFILL_SQL)
    const unmappedResult = runPsql(UNMAPPED_SQL)

    if (unmappedResult) {
        const unmappedEvents = unmappedResult.split("\n").map(row => {
            const [id, slug] = row.split("|")
            return { id, slug, reason: "Unable to infer event type." }
        })

        console.error("Unmapped events:")
        console.error(JSON.stringify(unmappedEvents, null, 2))
        process.exitCode = 1
        return
    }

    const [updatedRows, clearedMembershipRows] = backfillResult.split("|")
    console.log(
        `Backfilled ${updatedRows ?? "0"} events and cleared ${clearedMembershipRows ?? "0"} organizer memberships.`,
    )
}

run()
