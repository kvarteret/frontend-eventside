import { supabase } from "./supabase"

const EVENT_IMAGES_BUCKET = "event-images"

const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/avif": "avif",
}

const getFileExtension = (file: File): string => {
    const filenameExtension = file.name.split(".").pop()?.trim().toLowerCase()
    if (filenameExtension) {
        return filenameExtension
    }

    return MIME_TYPE_TO_EXTENSION[file.type] ?? "bin"
}

const buildImagePath = (slug: string, file: File): string => {
    const extension = getFileExtension(file)
    return `events/${slug}/${Date.now()}-${crypto.randomUUID()}.${extension}`
}

const extractStoragePathFromUrl = (url: string): string | null => {
    try {
        const parsedUrl = new URL(url)
        const publicPrefix = `/storage/v1/object/public/${EVENT_IMAGES_BUCKET}/`

        if (!parsedUrl.pathname.startsWith(publicPrefix)) {
            return null
        }

        return decodeURIComponent(parsedUrl.pathname.slice(publicPrefix.length))
    } catch {
        return null
    }
}

export async function uploadEventImage(file: File | null, slug: string): Promise<string | null> {
    if (!file) {
        return null
    }

    const path = buildImagePath(slug, file)
    const { error } = await supabase.storage.from(EVENT_IMAGES_BUCKET).upload(path, file, {
        cacheControl: "3600",
        contentType: file.type || undefined,
        upsert: false,
    })

    if (error) {
        throw new Error(`Failed to upload event image: ${error.message}`)
    }

    const { data } = supabase.storage.from(EVENT_IMAGES_BUCKET).getPublicUrl(path)
    if (!data.publicUrl) {
        throw new Error("Failed to generate public URL for uploaded event image.")
    }

    return data.publicUrl
}

export async function deleteEventImageByUrl(url: unknown): Promise<void> {
    if (typeof url !== "string" || !url.trim()) {
        return
    }

    const path = extractStoragePathFromUrl(url)
    if (!path) {
        return
    }

    const { error } = await supabase.storage.from(EVENT_IMAGES_BUCKET).remove([path])
    if (error) {
        throw new Error(`Failed to delete event image: ${error.message}`)
    }
}
