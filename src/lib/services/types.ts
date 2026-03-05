import type { Timestamp } from "firebase/firestore"

export interface Translation {
    available: boolean
    title: string
    description: string | null // rich description/article
    image_caption: string | null
}

export type Result<T, E = string> =
    | { ok: true; data: T; error: null }
    | { ok: false; data: null; error: E }

export const OK = <T>(data: T): Result<T, never> => ({
    ok: true,
    data,
    error: null,
})

export const ERR = <E>(error: E): Result<never, E> => ({
    ok: false,
    data: null,
    error,
})

export type Status = "in progress" | "nextWeek" | "upcoming" | "archived"
export type StatusEvents = {
    status: Status
    events: Event[]
}

export type InternKortVerv = {
    navn: string
    gruppe: string
    signertKontrakt: boolean
    rabattTrinn: number
}

export type Profile = {
    id: number
    first_name: string
    last_name: string
    active_vervs: InternKortVerv[]
}

export type Translations = {
    no: Translation | null
    en: Translation | null
}

export type Event = {
    id: string // Firestore doc ID
    slug: string // Auto-generated from name
    status: "published" | "draft" | "archived"

    // Timestamps
    event_start: Timestamp
    event_end: Timestamp
    created_at: Timestamp
    updated_at: Timestamp

    // Links
    ticket_url: string | null
    facebook_url: string | null

    // Image (URL-based for MVP)
    image: { url: string; __typename: "firestore" } | null

    // Organization
    organizer: { id: number | null; name: string } | null
    categories: { id: number; name: string }[]
    price: string | null

    // Bilingual translations
    translations: Translations
}

// Type for creating a new event (without id which is assigned by Firestore)
//export type CreateFirestoreEvent = Omit<Event, "id">
