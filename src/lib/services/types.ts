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

export type User = {
    id: number
    fornavn: string
    etternavn: string
    aktiveVerv: InternKortVerv[]
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

export type EventType = {
    id: string
    slug: string
    name: string
    description: string | null
    sort_order: number
    is_active: boolean
}

export type OrganizerGroup = {
    id: string
    slug: string
    name: string
    sort_order: number
    is_active: boolean
    default_event_type_id: string | null
}

export type Room = {
    id: string
    slug: string
    name: string
    sort_order: number
    is_active: boolean
}

export type EventTaxonomy = {
    eventTypes: EventType[]
    organizerGroups: OrganizerGroup[]
    rooms: Room[]
}

export type Event = {
    id: string
    slug: string
    status: "published" | "draft" | "archived"
    event_start: string
    event_end: string
    created_at: string
    updated_at: string
    ticket_url: string | null
    facebook_url: string | null
    image: { url: string; __typename: "supabase" } | null
    event_type_id: string
    event_type: EventType | null
    room_id: string | null
    room_text: string | null
    room: Room | null
    organizer_groups: OrganizerGroup[]
    is_internal: boolean
    is_featured: boolean
    recurring_interval_days: number | null
    price: string | null
    translations: Translations
}
