import { Timestamp } from "firebase/firestore"
import { categoryOptions, organizerOptions } from "@/data/studentbergen-form"
import type { EventFormValues } from "@/types"
import { generateUniqueSlug } from "./slugify"
import { uploadEventImage } from "./storage"
import { ERR, type Event, OK, type Result } from "./types"
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
    "https://ydkxiragzzsaapnbnebm.supabase.co",
    "sb_publishable_keMmOX3o5wRLw0_nj0c7Zw_jt28YDaf",
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

/*const canDeleteImageFromStorage = async (
    imageUrl: string,
    eventIdToIgnore: string,
): Promise<boolean> => {
    const imageQuery = query(
        collection(db, "events"),
        where("image.url", "==", imageUrl),
        limit(2),
    )
    const snapshot = await getDocs(imageQuery)

    return !snapshot.docs.some((imageDoc) => imageDoc.id !== eventIdToIgnore)
}*/

/*const deleteImageFromStorageIfUnused = async (
    imageUrl: unknown,
    eventIdToIgnore: string,
): Promise<void> => {
    if (typeof imageUrl !== "string" || !imageUrl.trim()) {
        return
    }

    const normalizedUrl = imageUrl.trim()
    const isUsedByOtherEvents = !(await canDeleteImageFromStorage(
        normalizedUrl,
        eventIdToIgnore,
    ))
    if (isUsedByOtherEvents) {
        return
    }

    try {
        await deleteEventImageByUrl(normalizedUrl)
    } catch (error) {
        if (isIgnorableStorageDeleteError(error)) {
            return
        }

        throw error
    }
}*/

/**
 * Look up a category by ID
 */
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
        createdAt?: Timestamp
        updatedAt?: Timestamp
    },
): Promise<Event> {
    const now = Timestamp.now()

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
    const eventStart = Timestamp.fromDate(formValues.startTime)
    const eventEnd = Timestamp.fromDate(formValues.endTime)

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
 * Get all published events, ordered by start time
 */
/*export async function getEvents(): Promise<Result<Event[]>> {
    const { data, error } = supabase.from("events").select("*")

    if (error) {
        return ERR(error)
    }

    try {
        const eventsRef = collection(db, "events")
        const q = query(
            eventsRef,
            where("status", "==", "published"),
            orderBy("event_start", "asc"),
        )

        const snapshot = await getDocs(q)

        const events = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Event[]

        console.log(events)

        return OK(events)
    } catch (err) {
        console.log(err)
        return ERR(getErrorMessage(err))
    }
}*/

/**
 * Get an event by document id
 */
/*export async function getEventById(id: string): Promise<Result<Event>> {
    try {
        const eventRef = doc(db, "events", id)
        const eventSnapshot = await getDoc(eventRef)

        if (!eventSnapshot.exists()) {
            return ERR("Fant ikke arrangementet.")
        }

        return OK({
            id: eventSnapshot.id,
            ...eventSnapshot.data(),
        } as Event)
    } catch (err) {
        console.log(err)
        return ERR(getErrorMessage(err))
    }
}*/

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
            updatedAt: Timestamp.now(),
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

/**
 * Delete an event and its associated image from Firebase Storage.
 */
export async function deleteEvent(id: string): Promise<Result<null>> {
    const { error } = await supabase.from("events").select("*").eq("id", id)

    if (error) {
        return ERR(error.message)
    }

    return OK(null)

    // SOME SEPERATE LOGIC IS PROBABLY NEEDED FOR DELETING IMAGES
    /*const imageUrl = eventResult.data.image?.url ?? null
        await deleteDoc(doc(db, "events", id))
        await deleteImageFromStorageIfUnused(imageUrl, id)*/
}

/**
 * Get a single event by slug
 */
/*export async function getEventBySlug(slug: string): Promise<Event | null> {
    const eventsRef = collection(db, "events")
    const q = query(eventsRef, where("slug", "==", slug))

    const snapshot = await getDocs(q)

    const firstDoc = snapshot.docs[0]
    if (!firstDoc) {
        return null
    }

    return {
        id: firstDoc.id,
        ...firstDoc.data(),
    } as Event
}*/

/*export async function getEventsBySlug(slug: string): Promise<Result<Event>> {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single()

    if (error) {
        return ERR(error.message)
    }
    return OK(data)
}*/
