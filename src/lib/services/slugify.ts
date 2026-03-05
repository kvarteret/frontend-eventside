import slugify from "slugify"
import { supabase } from "./events"

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

    const { data } = await supabase
        .from("events")
        .select("*")
        .eq("slug", baseSlug)

    if (data === null || data.length === 0) {
        return baseSlug
    }

    let suffix = 2
    while (suffix < 20) {
        const candidateSlug = `${baseSlug}-${suffix}`
        const { data: events } = await supabase
            .from("events")
            .select("*")
            .eq("slug", candidateSlug)

        if (events === null || events.length === 0) {
            return candidateSlug
        }

        suffix++
    }

    throw new Error("Could not generate unique slug after 100 attempts")
}
