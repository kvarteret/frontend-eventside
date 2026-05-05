import {
    BlobServiceClient,
    type ContainerClient,
    StorageSharedKeyCredential,
} from "@azure/storage-blob"
import { createClient } from "@supabase/supabase-js"
import slugify from "slugify"

type LanguageContentPayload = {
    available: boolean
    name: string
    imageCaption: string
    article: string
}

type EventFormPayload = {
    eventTypeId: string
    organizerGroupIds: string[]
    roomId: string
    roomText: string
    isInternal: boolean
    isFeatured: boolean
    recurringIntervalDays: string
    startTime: string | null
    endTime: string | null
    facebookUrl: string
    price: string
    ticketsUrl: string
    removeImage: boolean
    no: LanguageContentPayload
    en: LanguageContentPayload
}

type EventRow = {
    id: string
    slug: string
    status: "published" | "draft" | "archived"
    event_start: string
    event_end: string
    created_at: string
    updated_at: string
    image_url: string | null
}

const DEFAULT_CONTAINER = "event-images"
const DEFAULT_PUBLIC_BASE_URL = "https://personaldatabasen.blob.core.windows.net/event-images"
const CACHE_CONTROL = "public, max-age=31536000, immutable"
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/avif": "avif",
}

const EVENT_SELECT = `
    id,
    slug,
    status,
    event_start,
    event_end,
    created_at,
    updated_at,
    ticket_url,
    facebook_url,
    image_url,
    price,
    event_type_id,
    room_id,
    room_text,
    is_internal,
    is_featured,
    recurring_interval_days,
    translations,
    event_type:event_types (
        id,
        slug,
        name,
        description,
        sort_order,
        is_active
    ),
    room:rooms (
        id,
        slug,
        name,
        sort_order,
        is_active
    ),
    event_organizer_group_memberships (
        display_order,
        organizer_group:event_organizer_groups (
            id,
            slug,
            name,
            sort_order,
            is_active,
            default_event_type_id
        )
    )
`

export class EventWriteError extends Error {
    constructor(
        message: string,
        public readonly status = 400,
    ) {
        super(message)
    }
}

export function handleEventWriteError(error: unknown): Response {
    if (error instanceof EventWriteError) {
        return Response.json({ error: error.message }, { status: error.status })
    }

    console.error("Failed to write event", error)
    return Response.json({ error: "Could not write event." }, { status: 500 })
}

export async function readEventFormData(request: Request): Promise<FormData> {
    try {
        return await request.formData()
    } catch {
        throw new EventWriteError("Expected multipart form data.")
    }
}

export async function createEvent(formData: FormData): Promise<unknown> {
    const payload = parsePayload(formData)
    const image = getOptionalImage(formData)
    let uploadedImageUrl: string | null = null

    if (!image) {
        throw new EventWriteError("Arrangement må ha et bilde.")
    }

    try {
        const slug = await generateUniqueSlug(payload.no.name || payload.en.name)
        uploadedImageUrl = await uploadEventImage(image, slug)
        const eventData = formToEventRecord(payload, { slug, imageUrl: uploadedImageUrl })

        const { data, error } = await supabase()
            .from("events")
            .insert(eventData)
            .select("id")
            .single()

        if (error || !data?.id) {
            throw new EventWriteError(error?.message ?? "Failed to create event.")
        }

        await syncOrganizerGroupMemberships(data.id, payload.organizerGroupIds)
        return fetchEventById(data.id)
    } catch (error) {
        if (uploadedImageUrl) {
            await deleteEventImageByUrl(uploadedImageUrl)
        }
        throw error
    }
}

export async function updateEvent(id: string, formData: FormData): Promise<unknown> {
    const payload = parsePayload(formData)
    const image = getOptionalImage(formData)
    let uploadedImageUrl: string | null = null

    try {
        const existingEvent = await fetchEventById(id)
        const existingImageUrl = existingEvent.image_url

        if (!image && (payload.removeImage || !existingImageUrl)) {
            throw new EventWriteError("Arrangement må ha et bilde.")
        }

        let nextImageUrl = existingImageUrl
        if (image) {
            uploadedImageUrl = await uploadEventImage(image, existingEvent.slug)
            nextImageUrl = uploadedImageUrl
        } else if (payload.removeImage) {
            nextImageUrl = null
        }

        const eventData = formToEventRecord(payload, {
            slug: existingEvent.slug,
            status: existingEvent.status,
            imageUrl: nextImageUrl,
            createdAt: existingEvent.created_at,
            updatedAt: new Date().toISOString(),
        })

        const { error } = await supabase().from("events").update(eventData).eq("id", id)
        if (error) {
            throw new EventWriteError(error.message)
        }

        await syncOrganizerGroupMemberships(id, payload.organizerGroupIds)

        if (payload.removeImage && existingImageUrl) {
            await deleteEventImageByUrl(existingImageUrl)
        } else if (uploadedImageUrl && existingImageUrl && uploadedImageUrl !== existingImageUrl) {
            await deleteEventImageByUrl(existingImageUrl)
        }

        return fetchEventById(id)
    } catch (error) {
        if (uploadedImageUrl) {
            await deleteEventImageByUrl(uploadedImageUrl)
        }
        throw error
    }
}

export async function deleteEvent(id: string): Promise<void> {
    const existingEvent = await fetchEventById(id)
    const { error } = await supabase().from("events").delete().eq("id", id)

    if (error) {
        throw new EventWriteError(error.message)
    }

    if (existingEvent.image_url) {
        await deleteEventImageByUrl(existingEvent.image_url)
    }
}

export async function listEvents(): Promise<unknown[]> {
    const { data, error } = await supabase()
        .from("events")
        .select(EVENT_SELECT)
        .order("event_start", { ascending: true })

    if (error) {
        throw new EventWriteError(error.message)
    }

    return data ?? []
}

export async function fetchEventById(id: string): Promise<EventRow & Record<string, unknown>> {
    const { data, error } = await supabase()
        .from("events")
        .select(EVENT_SELECT)
        .eq("id", id)
        .single()

    if (error || !data) {
        throw new EventWriteError(error?.message ?? "Event not found.", error ? 400 : 404)
    }

    return data as EventRow & Record<string, unknown>
}

function formToEventRecord(
    formValues: EventFormPayload,
    options: {
        slug: string
        imageUrl: string | null
        status?: EventRow["status"]
        createdAt?: string
        updatedAt?: string
    },
) {
    const now = new Date().toISOString()

    if (!formValues.eventTypeId) {
        throw new EventWriteError("Event type must be selected.")
    }

    if (!formValues.startTime || !formValues.endTime) {
        throw new EventWriteError("Start and end time must be filled in.")
    }

    const normalizedRoom = normalizeRoomValues(formValues.roomId, formValues.roomText)

    return {
        slug: options.slug,
        status: options.status ?? "published",
        event_start: new Date(formValues.startTime).toISOString(),
        event_end: new Date(formValues.endTime).toISOString(),
        created_at: options.createdAt ?? now,
        updated_at: options.updatedAt ?? now,
        ticket_url: formValues.ticketsUrl || null,
        facebook_url: formValues.facebookUrl || null,
        image_url: options.imageUrl,
        event_type_id: formValues.eventTypeId,
        room_id: normalizedRoom.roomId,
        room_text: normalizedRoom.roomText,
        is_internal: formValues.isInternal,
        is_featured: formValues.isFeatured,
        recurring_interval_days: parseRecurringIntervalDays(formValues.recurringIntervalDays),
        price: formValues.price || null,
        translations: {
            no: formValues.no.available
                ? {
                      available: true,
                      title: formValues.no.name,
                      description: formValues.no.article || null,
                      image_caption: formValues.no.imageCaption || null,
                  }
                : null,
            en: formValues.en.available
                ? {
                      available: true,
                      title: formValues.en.name,
                      description: formValues.en.article || null,
                      image_caption: formValues.en.imageCaption || null,
                  }
                : null,
        },
    }
}

async function syncOrganizerGroupMemberships(
    eventId: string,
    organizerGroupIds: string[],
): Promise<void> {
    const { error: deleteError } = await supabase()
        .from("event_organizer_group_memberships")
        .delete()
        .eq("event_id", eventId)

    if (deleteError) {
        throw new EventWriteError(deleteError.message)
    }

    if (organizerGroupIds.length === 0) {
        return
    }

    const { error: insertError } = await supabase()
        .from("event_organizer_group_memberships")
        .insert(
            organizerGroupIds.map((organizerGroupId, index) => ({
                event_id: eventId,
                organizer_group_id: organizerGroupId,
                display_order: index,
            })),
        )

    if (insertError) {
        throw new EventWriteError(insertError.message)
    }
}

async function generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = slugify(name, { lower: true, strict: true, locale: "nb" })

    if (!baseSlug) {
        throw new EventWriteError("Could not generate slug from name")
    }

    const { data } = await supabase().from("events").select("id").eq("slug", baseSlug)
    if (data === null || data.length === 0) {
        return baseSlug
    }

    let suffix = 2
    while (suffix < 20) {
        const candidateSlug = `${baseSlug}-${suffix}`
        const { data: events } = await supabase()
            .from("events")
            .select("id")
            .eq("slug", candidateSlug)

        if (events === null || events.length === 0) {
            return candidateSlug
        }

        suffix++
    }

    throw new EventWriteError("Could not generate unique slug after 100 attempts")
}

async function uploadEventImage(file: File, slug: string): Promise<string> {
    if (!file.type.startsWith("image/")) {
        throw new EventWriteError("File must be an image.")
    }

    if (file.size > MAX_IMAGE_BYTES) {
        throw new EventWriteError("Image must be 10 MB or less.")
    }

    const path = buildImagePath(slug, file)
    const blobClient = getContainerClient().getBlockBlobClient(path)

    await blobClient.uploadData(await file.arrayBuffer(), {
        blobHTTPHeaders: {
            blobContentType: file.type || "application/octet-stream",
            blobCacheControl: CACHE_CONTROL,
        },
    })

    return buildPublicUrl(path)
}

async function deleteEventImageByUrl(url: string): Promise<void> {
    const path = extractBlobPath(url)
    if (!path) {
        return
    }

    await getContainerClient().getBlockBlobClient(path).deleteIfExists()
}

function parsePayload(formData: FormData): EventFormPayload {
    const payload = formData.get("payload")
    if (typeof payload !== "string") {
        throw new EventWriteError("Missing event payload.")
    }

    try {
        return JSON.parse(payload) as EventFormPayload
    } catch {
        throw new EventWriteError("Invalid event payload.")
    }
}

function getOptionalImage(formData: FormData): File | null {
    const image = formData.get("image")
    if (!image || typeof image === "string" || image.size === 0) {
        return null
    }

    return image
}

function normalizeRoomValues(
    roomId: string,
    roomText: string,
): { roomId: string | null; roomText: string | null } {
    const normalizedRoomId = roomId.trim()
    const normalizedRoomText = roomText.trim()

    if (normalizedRoomId && normalizedRoomText) {
        throw new EventWriteError("Velg enten et rom eller skriv inn et annet rom.")
    }

    if (!normalizedRoomId && !normalizedRoomText) {
        throw new EventWriteError("Arrangement må ha enten et valgt rom eller et egendefinert rom.")
    }

    return {
        roomId: normalizedRoomId || null,
        roomText: normalizedRoomText || null,
    }
}

function parseRecurringIntervalDays(value: string): number | null {
    const trimmed = value.trim()
    if (!trimmed) {
        return null
    }

    const parsed = Number.parseInt(trimmed, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new EventWriteError("Recurring interval must be a positive number of days.")
    }

    return parsed
}

function getFileExtension(file: File): string {
    const filenameExtension = file.name.split(".").pop()?.trim().toLowerCase()
    if (filenameExtension && /^[a-z0-9]{1,8}$/.test(filenameExtension)) {
        return filenameExtension
    }

    return MIME_TYPE_TO_EXTENSION[file.type] ?? "bin"
}

function buildImagePath(slug: string, file: File): string {
    return `events/${slug}/${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file)}`
}

function buildPublicUrl(path: string): string {
    const encodedPath = path.split("/").map(encodeURIComponent).join("/")
    return `${getPublicBaseUrl().replace(/\/$/, "")}/${encodedPath}`
}

function extractBlobPath(url: string): string | null {
    try {
        const parsed = new URL(url)
        const publicBase = new URL(getPublicBaseUrl())

        if (parsed.origin !== publicBase.origin) {
            return null
        }

        const containerPrefix = publicBase.pathname.replace(/\/?$/, "/")
        if (!parsed.pathname.startsWith(containerPrefix)) {
            return null
        }

        return decodeURIComponent(parsed.pathname.slice(containerPrefix.length))
    } catch {
        return null
    }
}

function getContainerClient(): ContainerClient {
    const connectionString = process.env.AZURE_BLOB_CONNECTION_STRING?.trim()
    const container = process.env.AZURE_EVENT_IMAGES_CONTAINER?.trim() || DEFAULT_CONTAINER

    if (connectionString?.includes("AccountName=")) {
        return BlobServiceClient.fromConnectionString(connectionString).getContainerClient(
            container,
        )
    }

    const accountName = process.env.AZURE_BLOB_ACCOUNT_NAME?.trim()
    const accountKey = process.env.AZURE_BLOB_ACCOUNT_KEY?.trim()

    if (!accountName || !accountKey) {
        throw new Error("Missing Azure Blob Storage credentials.")
    }

    return new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new StorageSharedKeyCredential(accountName, accountKey),
    ).getContainerClient(container)
}

function getPublicBaseUrl(): string {
    return process.env.AZURE_EVENT_IMAGES_PUBLIC_URL?.trim() || DEFAULT_PUBLIC_BASE_URL
}

function supabase() {
    const supabaseUrl =
        process.env.SUPABASE_URL?.trim() ||
        process.env.VITE_PUBLIC_SUPABASE_URL?.trim() ||
        "https://jeezqitchepgwxjknwhz.supabase.co"
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
        process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
        process.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
        "sb_publishable_z2eZR6_Ao8Uc8qfmrvNj1A_0AjgALRO"

    return createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    })
}
