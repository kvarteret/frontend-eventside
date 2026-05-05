import { execFileSync } from "node:child_process"
import { createClient } from "@supabase/supabase-js"

type LegacyImageEvent = {
    id: string
    slug: string
    image_url: string
}

const SUPABASE_URL = process.env.SUPABASE_URL?.trim()
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
const DATABASE_URL = process.env.DATABASE_URL?.trim()
const EVENT_IMAGES_BUCKET = "event-images"

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !DATABASE_URL) {
    throw new Error(
        "Missing SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, or DATABASE_URL for image migration.",
    )
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

const sqlString = (value: string): string => `'${value.replaceAll("'", "''")}'`

const listLegacyImageEvents = (): LegacyImageEvent[] => {
    const rows = runPsql(`
        select id, slug, image_url
        from public.events
        where image_url is not null
          and image_url not like ${sqlString(`${SUPABASE_URL}/storage/v1/object/public/${EVENT_IMAGES_BUCKET}/%`)}
        order by event_start asc;
    `)

    if (!rows) {
        return []
    }

    return rows.split("\n").map(row => {
        const [id, slug, image_url] = row.split("|")
        if (!id || !slug || !image_url) {
            throw new Error(`Unexpected event row format: ${row}`)
        }
        return { id, slug, image_url }
    })
}

const updateImageUrl = (eventId: string, nextImageUrl: string): void => {
    runPsql(`
        update public.events
        set image_url = ${sqlString(nextImageUrl)}
        where id = ${sqlString(eventId)};
    `)
}

const sanitizeExtension = (value: string | null | undefined): string | null => {
    if (!value) {
        return null
    }

    const normalized = value.trim().toLowerCase()
    if (!normalized || normalized.length > 8) {
        return null
    }

    return normalized.replace(/[^a-z0-9]/g, "") || null
}

const inferExtension = (response: Response, sourceUrl: string): string => {
    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase()
    const byMimeType: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/svg+xml": "svg",
        "image/avif": "avif",
    }

    if (contentType && byMimeType[contentType]) {
        return byMimeType[contentType]
    }

    try {
        const pathname = new URL(sourceUrl).pathname
        const byPath = pathname.split(".").pop()
        const sanitized = sanitizeExtension(byPath)
        if (sanitized) {
            return sanitized
        }
    } catch {
        // Ignore malformed source URLs here; fetch succeeded already.
    }

    return "bin"
}

const buildStoragePath = (event: LegacyImageEvent, extension: string): string =>
    `events/${event.slug}/migrated-${event.id}.${extension}`

const downloadImage = async (url: string): Promise<Response> => {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to download image (${response.status}).`)
    }

    return response
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
})

const run = async () => {
    const legacyEvents = listLegacyImageEvents()

    if (legacyEvents.length === 0) {
        console.log("No legacy event images to migrate.")
        return
    }

    const migrated: { id: string; slug: string; nextUrl: string }[] = []
    const failures: { id: string; slug: string; reason: string }[] = []

    for (const event of legacyEvents) {
        try {
            const downloadResponse = await downloadImage(event.image_url)
            const contentType =
                downloadResponse.headers.get("content-type")?.split(";")[0]?.trim() ||
                "application/octet-stream"
            const extension = inferExtension(downloadResponse, event.image_url)
            const path = buildStoragePath(event, extension)
            const blob = await downloadResponse.blob()

            const uploadResult = await supabase.storage
                .from(EVENT_IMAGES_BUCKET)
                .upload(path, blob, {
                    cacheControl: "3600",
                    contentType,
                    upsert: true,
                })

            if (uploadResult.error) {
                throw new Error(`Failed to upload image: ${uploadResult.error.message}`)
            }

            const { data } = supabase.storage.from(EVENT_IMAGES_BUCKET).getPublicUrl(path)
            if (!data.publicUrl) {
                throw new Error("Failed to generate public URL for migrated image.")
            }

            updateImageUrl(event.id, data.publicUrl)
            migrated.push({
                id: event.id,
                slug: event.slug,
                nextUrl: data.publicUrl,
            })
        } catch (error) {
            failures.push({
                id: event.id,
                slug: event.slug,
                reason: error instanceof Error ? error.message : "Unknown migration error",
            })
        }
    }

    console.log(`Migrated ${migrated.length} event images.`)

    if (failures.length > 0) {
        console.error("Failed migrations:")
        console.error(JSON.stringify(failures, null, 2))
        process.exitCode = 1
    }
}

void run()
