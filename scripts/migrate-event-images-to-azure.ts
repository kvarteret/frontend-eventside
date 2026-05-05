import { execFileSync } from "node:child_process"
import { BlobServiceClient, ContainerClient, StorageSharedKeyCredential } from "@azure/storage-blob"

type EventRow = {
    id: string
    slug: string
    image_url: string
}

const AZURE_CONNECTION_STRING = process.env.AZURE_BLOB_CONNECTION_STRING?.trim()
const AZURE_ACCOUNT_NAME = process.env.AZURE_BLOB_ACCOUNT_NAME?.trim()
const AZURE_ACCOUNT_KEY = process.env.AZURE_BLOB_ACCOUNT_KEY?.trim()
const AZURE_CONTAINER = process.env.AZURE_EVENT_IMAGES_CONTAINER?.trim() ?? "event-images"
const SUPABASE_URL = process.env.SUPABASE_URL?.trim()
const DATABASE_URL = process.env.DATABASE_URL?.trim()

if (!AZURE_CONNECTION_STRING && (!AZURE_ACCOUNT_NAME || !AZURE_ACCOUNT_KEY)) {
    throw new Error(
        "Missing AZURE_BLOB_CONNECTION_STRING or AZURE_BLOB_ACCOUNT_NAME/AZURE_BLOB_ACCOUNT_KEY.",
    )
}
if (!SUPABASE_URL) {
    throw new Error("Missing SUPABASE_URL to identify source images.")
}
if (!DATABASE_URL) {
    throw new Error("Missing DATABASE_URL.")
}

const toPsqlConnectionString = (value: string): string =>
    value
        .replace(/^postgresql\+asyncpg:\/\//, "postgresql://")
        .replace("ssl=require", "sslmode=require")

const runPsql = (sql: string): string =>
    execFileSync(
        "psql",
        [
            toPsqlConnectionString(DATABASE_URL!),
            "-v",
            "ON_ERROR_STOP=1",
            "-At",
            "-F",
            "|",
            "-c",
            sql,
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim()

const sqlString = (value: string): string => `'${value.replaceAll("'", "''")}'`

const listSupabaseImageEvents = (): EventRow[] => {
    const rows = runPsql(`
        select id, slug, image_url
        from public.events
        where image_url is not null
          and image_url like ${sqlString(`${SUPABASE_URL}/storage/v1/object/public/%`)}
        order by event_start asc;
    `)

    if (!rows) return []

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
    if (!value) return null
    const normalized = value.trim().toLowerCase()
    if (!normalized || normalized.length > 8) return null
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

    if (contentType && byMimeType[contentType]) return byMimeType[contentType]

    try {
        const byPath = new URL(sourceUrl).pathname.split(".").pop()
        const sanitized = sanitizeExtension(byPath)
        if (sanitized) return sanitized
    } catch {
        // Ignore malformed source URLs
    }

    return "bin"
}

const buildAzurePath = (event: EventRow, extension: string): string =>
    `events/${event.slug}/migrated-${event.id}.${extension}`

const getBlobServiceClient = (): BlobServiceClient => {
    if (AZURE_CONNECTION_STRING?.includes("AccountName=")) {
        return BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING)
    }

    if (!AZURE_ACCOUNT_NAME || !AZURE_ACCOUNT_KEY) {
        throw new Error("Missing Azure account credentials.")
    }

    return new BlobServiceClient(
        `https://${AZURE_ACCOUNT_NAME}.blob.core.windows.net`,
        new StorageSharedKeyCredential(AZURE_ACCOUNT_NAME, AZURE_ACCOUNT_KEY),
    )
}

const getContainerClient = (): ContainerClient =>
    getBlobServiceClient().getContainerClient(AZURE_CONTAINER)

const run = async () => {
    const containerClient = getContainerClient()

    try {
        await containerClient.createIfNotExists({ access: "blob" })
    } catch {
        // Container may already exist with different access settings.
    }

    const events = listSupabaseImageEvents()

    if (events.length === 0) {
        console.log("No Supabase event images to migrate.")
        return
    }

    console.log(`Found ${events.length} event(s) with Supabase image URLs.`)

    const migrated: { id: string; slug: string; nextUrl: string }[] = []
    const failures: { id: string; slug: string; reason: string }[] = []

    for (const event of events) {
        try {
            const response = await fetch(event.image_url)
            if (!response.ok) {
                throw new Error(`Download failed (${response.status}): ${event.image_url}`)
            }

            const contentType =
                response.headers.get("content-type")?.split(";")[0]?.trim() ??
                "application/octet-stream"
            const extension = inferExtension(response, event.image_url)
            const path = buildAzurePath(event, extension)
            const buffer = Buffer.from(await response.arrayBuffer())

            const blobClient = containerClient.getBlockBlobClient(path)
            await blobClient.uploadData(buffer, {
                blobHTTPHeaders: {
                    blobContentType: contentType,
                    blobCacheControl: "public, max-age=31536000, immutable",
                },
            })

            const nextUrl = blobClient.url
            updateImageUrl(event.id, nextUrl)
            migrated.push({ id: event.id, slug: event.slug, nextUrl })
            console.log(`  OK ${event.slug}`)
        } catch (error) {
            const reason = error instanceof Error ? error.message : "Unknown error"
            failures.push({ id: event.id, slug: event.slug, reason })
            console.error(`  FAIL ${event.slug}: ${reason}`)
        }
    }

    console.log(`\nMigrated ${migrated.length}/${events.length} event images.`)

    if (failures.length > 0) {
        console.error("Failed:")
        console.error(JSON.stringify(failures, null, 2))
        process.exitCode = 1
    }
}

void run()
