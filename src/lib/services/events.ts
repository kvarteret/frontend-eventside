import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { generateUniqueSlug } from "./slugify"
import { categoryOptions, organizerOptions } from "@/data/studentbergen-form"
import type { EventFormValues } from "@/types"
import type { FirestoreEvent, CreateFirestoreEvent } from "./types"

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
  id: number
): { id: number | null; name: string } | null {
  const organizer = organizerOptions.find((o) => o.id === id)
  return organizer ? { id: organizer.id, name: organizer.name } : null
}

/**
 * Parse comma-separated IDs into category objects
 */
function parseSubCategories(
  subCategories: string
): { id: number; name: string }[] {
  if (!subCategories.trim()) return []

  return subCategories
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((id) => !isNaN(id))
    .map((id) => getCategoryById(id))
    .filter((c): c is { id: number; name: string } => c !== null)
}

/**
 * Convert form values to Firestore document format
 */
async function formToFirestore(
  formValues: EventFormValues
): Promise<CreateFirestoreEvent> {
  const now = Timestamp.now()

  // Generate slug from Norwegian or English name
  const nameForSlug = formValues.no.name || formValues.en.name || formValues.name
  const slug = await generateUniqueSlug(nameForSlug)

  // Parse category
  const categoryId = parseInt(formValues.category, 10)
  const primaryCategory = !isNaN(categoryId) ? getCategoryById(categoryId) : null

  // Build categories array
  const categories: { id: number; name: string }[] = []
  if (primaryCategory) {
    categories.push(primaryCategory)
  }
  categories.push(...parseSubCategories(formValues.subCategories))

  // Parse organizer
  const organizerId = parseInt(formValues.eventByExtra, 10)
  const organizer = !isNaN(organizerId) ? getOrganizerById(organizerId) : null

  // Parse timestamps
  const eventStart = formValues.startTime
    ? Timestamp.fromDate(new Date(formValues.startTime))
    : Timestamp.now()

  const eventEnd = formValues.endTime
    ? Timestamp.fromDate(new Date(formValues.endTime))
    : eventStart

  return {
    slug,
    status: "published",

    event_start: eventStart,
    event_end: eventEnd,
    created_at: now,
    updated_at: now,

    ticket_url: formValues.ticketsUrl || null,
    facebook_url: formValues.facebookUrl || null,

    image: formValues.image ? { url: formValues.image, __typename: "firestore" } : null,

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

    location: {
      no: formValues.no.location || null,
      en: formValues.en.location || null,
    },

    is_recurring: false,
    weekly_recurring: null,
  }
}

/**
 * Create a new event in Firestore
 */
export async function createEvent(
  formValues: EventFormValues
): Promise<FirestoreEvent> {
  const eventData = await formToFirestore(formValues)
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
export async function getEvents(): Promise<FirestoreEvent[]> {
  const eventsRef = collection(db, "events")
  const q = query(
    eventsRef,
    where("status", "==", "published"),
    orderBy("event_start", "asc")
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as FirestoreEvent[]
}

/**
 * Get a single event by slug
 */
export async function getEventBySlug(
  slug: string
): Promise<FirestoreEvent | null> {
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
