import { collection, getDocs, query, where } from "firebase/firestore"
import slugify from "slugify"
import { db } from "@/lib/firebase"

/**
 * Generate a URL-safe slug from a name.
 * Queries Firestore for duplicates and appends -2, -3 etc. if needed.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = slugify(name, {
        lower: true,
        strict: true,
        locale: "nb",
    })

    if (!baseSlug) {
        throw new Error("Could not generate slug from name")
    }

    const eventsRef = collection(db, "events")

    // Check if base slug exists
    const baseQuery = query(eventsRef, where("slug", "==", baseSlug))
    const baseSnapshot = await getDocs(baseQuery)

    if (baseSnapshot.empty) {
        return baseSlug
    }

    // Find next available suffix
    let suffix = 2
    while (true) {
        const candidateSlug = `${baseSlug}-${suffix}`
        const candidateQuery = query(eventsRef, where("slug", "==", candidateSlug))
        const candidateSnapshot = await getDocs(candidateQuery)

        if (candidateSnapshot.empty) {
            return candidateSlug
        }

        suffix++

        // Safety limit to prevent infinite loops
        if (suffix > 1000) {
            throw new Error("Could not generate unique slug after 1000 attempts")
        }
    }
}
