import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore"
import { categoryOptions, organizerOptions } from "@/data/studentbergen-form"
import { db } from "@/lib/firebase"
import type { EventFormValues } from "@/types"
import { generateUniqueSlug } from "./slugify"
import { uploadEventImage } from "./storage"
import { type CreateFirestoreEvent, ERR, type FirestoreEvent, OK, type Result } from "./types"

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message
    }

    return "Ukjent feil"
}

/**
 * Look up a category by ID
 */
function getCategoryById(id: number): { id: number; name: string } | null {
    const category = categoryOptions.find(c => c.id === id)
    return category ? { id: category.id, name: category.name } : null
}

/**
 * Look up an organizer by ID
 */
function getOrganizerById(id: number): { id: number | null; name: string } | null {
    const organizer = organizerOptions.find(o => o.id === id)
    return organizer ? { id: organizer.id, name: organizer.name } : null
}

/**
 * Convert form values to Firestore document format
 */
async function formToFirestore(
    formValues: EventFormValues,
    options?: {
        slug?: string
        imageUrl?: string | null
        status?: FirestoreEvent["status"]
        createdAt?: Timestamp
        updatedAt?: Timestamp
    },
): Promise<CreateFirestoreEvent> {
    const now = Timestamp.now()

    // Generate slug from Norwegian or English name
    const nameForSlug = formValues.no.name || formValues.en.name
    const slug = options?.slug ?? (await generateUniqueSlug(nameForSlug))

    // Build categories array from selected IDs
    const categories = formValues.categories
        .map(id => getCategoryById(id))
        .filter((c): c is { id: number; name: string } => c !== null)

    // Build organizers array from selected IDs (first one is primary)
    const organizers = formValues.organizers
        .map(id => getOrganizerById(id))
        .filter((o): o is { id: number | null; name: string } => o !== null)
    const organizer = organizers[0] ?? null

    if (!formValues.startTime || !formValues.endTime) {
        throw new Error("Start- og sluttid må fylles ut.")
    }

    // Parse timestamps
    const eventStart = Timestamp.fromDate(formValues.startTime)
    const eventEnd = Timestamp.fromDate(formValues.endTime)

    return {
        slug,
        status: options?.status ?? "published",

        event_start: eventStart,
        event_end: eventEnd,
        created_at: options?.createdAt ?? now,
        updated_at: options?.updatedAt ?? now,

        ticket_url: formValues.ticketsUrl || null,
        facebook_url: formValues.facebookUrl || null,

        image: options?.imageUrl ? { url: options.imageUrl, __typename: "firestore" } : null,

        organizer,
        categories,
        price: formValues.price || null,

        translations: {
            no: formValues.no.available
                ? {
                      available: true,
                      title: formValues.no.name,
                      description: formValues.no.intro || null,
                      content: formValues.no.article || null,
                      image_caption: formValues.no.imageCaption || null,
                  }
                : null,
            en: formValues.en.available
                ? {
                      available: true,
                      title: formValues.en.name,
                      description: formValues.en.intro || null,
                      content: formValues.en.article || null,
                      image_caption: formValues.en.imageCaption || null,
                  }
                : null,
        },
    }
}

/**
 * Create a new event in Firestore
 */
export async function createEvent(formValues: EventFormValues): Promise<FirestoreEvent> {
    const nameForSlug = formValues.no.name || formValues.en.name
    const slug = await generateUniqueSlug(nameForSlug)
    const imageUrl = formValues.image ? await uploadEventImage(formValues.image, slug) : null
    const eventData = await formToFirestore(formValues, { slug, imageUrl })
    const eventsRef = collection(db, "events")
    const docRef = await addDoc(eventsRef, eventData)

    return {
        id: docRef.id,
        ...eventData,
    }
}

/**
 * Get all published events, ordered by start time
 */
export async function getEvents(): Promise<Result<FirestoreEvent[]>> {
    try {
        const eventsRef = collection(db, "events")
        const q = query(
            eventsRef,
            where("status", "==", "published"),
            orderBy("event_start", "asc"),
        )

        const snapshot = await getDocs(q)

        const events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as FirestoreEvent[]

        console.log(events)

        return OK(events)
    } catch (err) {
        console.log(err)
        return ERR(getErrorMessage(err))
    }
}

/**
 * Get an event by document id
 */
export async function getEventById(id: string): Promise<Result<FirestoreEvent>> {
    try {
        const eventRef = doc(db, "events", id)
        const eventSnapshot = await getDoc(eventRef)

        if (!eventSnapshot.exists()) {
            return ERR("Fant ikke arrangementet.")
        }

        return OK({
            id: eventSnapshot.id,
            ...eventSnapshot.data(),
        } as FirestoreEvent)
    } catch (err) {
        console.log(err)
        return ERR(getErrorMessage(err))
    }
}

/**
 * Update an existing event in Firestore
 */
export async function updateEvent(
    id: string,
    formValues: EventFormValues,
): Promise<Result<FirestoreEvent>> {
    try {
        const existingEventResult = await getEventById(id)
        if (!existingEventResult.ok) {
            return ERR(existingEventResult.error)
        }

        const existingEvent = existingEventResult.data
        const nextImageUrl = formValues.image
            ? await uploadEventImage(formValues.image, existingEvent.slug)
            : (existingEvent.image?.url ?? null)

        const eventData = await formToFirestore(formValues, {
            slug: existingEvent.slug,
            status: existingEvent.status,
            imageUrl: nextImageUrl,
            createdAt: existingEvent.created_at,
            updatedAt: Timestamp.now(),
        })

        const eventRef = doc(db, "events", id)
        await updateDoc(eventRef, eventData)

        return OK({
            id,
            ...eventData,
        })
    } catch (err) {
        console.log(err)
        return ERR(getErrorMessage(err))
    }
}

/**
 * Get a single event by slug
 */
export async function getEventBySlug(slug: string): Promise<FirestoreEvent | null> {
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
    } as FirestoreEvent
}
