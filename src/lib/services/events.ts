import { categoryOptions, organizerOptions } from "@/data/studentbergen-form"
import type { EventFormValues } from "@/types"
import { generateUniqueSlug } from "./slugify"
import { uploadEventImage } from "./storage"
import { ERR, type Event, OK, type Result } from "./types"
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
    "https://jeezqitchepgwxjknwhz.supabase.co",
    "sb_publishable_z2eZR6_Ao8Uc8qfmrvNj1A_0AjgALRO",

    //import.meta.env.VITE_PUBLIC_SUPABASE_URL || "",
    //import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "",
)

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message
    }

    return "Ukjent feil"
}

/*const isIgnorableStorageDeleteError = (error: unknown): boolean => {
    if (typeof error !== "object" || error === null) {
        return false
    }

    const errorWithCode = error as { code?: string }
    return (
        errorWithCode.code === "storage/object-not-found" ||
        errorWithCode.code === "storage/invalid-url" ||
        errorWithCode.code === "storage/invalid-argument"
    )
}*/

const canDeleteImageFromStorage = (
    imageUrl: string,
    eventIdToIgnore: string,
) => {
    // IMPLEMENT WHEN HAVING DECIDED ON IMAGE STORAGE
}

function getCategoryById(id: number): { id: number; name: string } | null {
    const category = categoryOptions.find((c) => c.id === id)
    return category ? { id: category.id, name: category.name } : null
}

/**
 * Look up an organizer by ID
 */
function getOrganizerById(
    id: number,
): { id: number | null; name: string } | null {
    const organizer = organizerOptions.find((o) => o.id === id)
    return organizer ? { id: organizer.id, name: organizer.name } : null
}

/**
 * Convert form values to Firestore document format
 */
async function formToEvent(
    formValues: EventFormValues,
    options?: {
        slug?: string
        imageUrl?: string | null
        status?: Event["status"]
        createdAt?: string
        updatedAt?: string
    },
): Promise<Event> {
    const now = new Date().toISOString()

    // Generate slug from Norwegian or English name
    const nameForSlug = formValues.no.name || formValues.en.name
    const slug = options?.slug ?? (await generateUniqueSlug(nameForSlug))

    // Build categories array from selected IDs
    const categories = formValues.categories
        .map((id) => getCategoryById(id))
        .filter((c): c is { id: number; name: string } => c !== null)

    // Build organizers array from selected IDs (first one is primary)
    const organizers = formValues.organizers
        .map((id) => getOrganizerById(id))
        .filter((o): o is { id: number | null; name: string } => o !== null)
    const organizer = organizers[0] ?? null

    if (!formValues.startTime || !formValues.endTime) {
        throw new Error("Start- og sluttid må fylles ut.")
    }

    // Parse timestamps
    const eventStart = formValues.startTime.toISOString()
    const eventEnd = formValues.endTime.toISOString()

    // TODO FIX IMAGE BECAUSE WHAT IS THIS, BECAUSE I HAVE NO IDEA THIS COMMENT WILL STAY RIDICILOUS BECAUSE THIS HAS TO BE FIXED
    return {
        id: "",
        slug,
        status: options?.status ?? "published",

        event_start: eventStart,
        event_end: eventEnd,
        created_at: options?.createdAt ?? now,
        updated_at: options?.updatedAt ?? now,

        ticket_url: formValues.ticketsUrl || null,
        facebook_url: formValues.facebookUrl || null,

        //image: options?.imageUrl,

        image: null,
        organizer,
        categories,
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

/**
 * Create a new event in Firestore
 */
export async function createEvent(
    formValues: EventFormValues,
): Promise<Result<Event>> {
    const nameForSlug = formValues.no.name || formValues.en.name
    const slug = await generateUniqueSlug(nameForSlug)
    const imageUrl = formValues.image
        ? await uploadEventImage(formValues.image, slug)
        : null
    const eventData = await formToEvent(formValues, { slug, imageUrl })
    const { data, error } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single()

    if (error) {
        return ERR(error.message)
    }

    return OK(data)
}

/**
 * Update an existing event in Firestore
 */
function deleteImageFromStorageIfUnused(a: any, b: any) {
    // IMPLEMENT IF STILL NEEDED IDK
}

export async function updateEvent(
    id: string,
    formValues: EventFormValues,
): Promise<Result<Event>> {
    try {
        const { data: existingEvent, error: fetchError } = await supabase
            .from("events")
            .select("*")
            .eq("id", id)
            .single()

        if (fetchError || !existingEvent) {
            return ERR(fetchError?.message || "Fant ikke arrangementet.")
        }

        const existingImageUrl = existingEvent.image?.url ?? null
        let nextImageUrl = existingImageUrl

        if (formValues.image) {
            nextImageUrl = await uploadEventImage(
                formValues.image,
                existingEvent.slug,
            )

            if (existingImageUrl && existingImageUrl !== nextImageUrl) {
                await deleteImageFromStorageIfUnused(existingImageUrl, id)
            }
        } else if (formValues.removeImage) {
            await deleteImageFromStorageIfUnused(existingImageUrl, id)
            nextImageUrl = null
        }

        const eventData = await formToEvent(formValues, {
            slug: existingEvent.slug,
            status: existingEvent.status,
            imageUrl: nextImageUrl,
            createdAt: existingEvent.created_at,
            updatedAt: new Date().toISOString(),
        })

        const { data, error } = await supabase
            .from("events")
            .update(eventData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            return ERR(error.message)
        }

        return OK(data)
    } catch (err) {
        console.log(err)
        return ERR(getErrorMessage(err))
    }
}
