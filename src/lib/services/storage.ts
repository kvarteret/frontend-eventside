import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { storage } from "@/lib/firebase"

const EVENT_IMAGE_CACHE_CONTROL = "public,max-age=604800,immutable"

export async function uploadEventImage(file: File | null, slug: string): Promise<string | null> {
    if (!file) {
        return null
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const objectPath = `events/${slug}/${timestamp}-${safeName}`
    const objectRef = ref(storage, objectPath)

    await uploadBytes(objectRef, file, {
        contentType: file.type,
        cacheControl: EVENT_IMAGE_CACHE_CONTROL,
    })
    return getDownloadURL(objectRef)
}

export async function deleteEventImageByUrl(url: unknown): Promise<void> {
    if (typeof url !== "string" || !url.trim()) {
        return
    }

    const normalizedUrl = url.trim()
    const isFirebaseUrl =
        normalizedUrl.startsWith("gs://") ||
        normalizedUrl.includes("firebasestorage.googleapis.com") ||
        normalizedUrl.includes("firebasestorage.app")
    if (!isFirebaseUrl) {
        return
    }

    const objectRef = ref(storage, normalizedUrl)
    await deleteObject(objectRef)
}
