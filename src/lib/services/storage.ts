import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { storage } from "@/lib/firebase"

export async function uploadEventImage(file: File | null, slug: string): Promise<string | null> {
    if (!file) {
        return null
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const objectPath = `events/${slug}/${timestamp}-${safeName}`
    const objectRef = ref(storage, objectPath)

    await uploadBytes(objectRef, file, { contentType: file.type })
    return getDownloadURL(objectRef)
}
