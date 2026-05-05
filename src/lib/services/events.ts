import type { EventFormValues } from "@/types"
import { supabase } from "./supabase"
import {
    ERR,
    type Event,
    type EventTaxonomy,
    OK,
    type OrganizerGroup,
    type Result,
    type Room,
} from "./types"

type EventRow = {
    id: string
    slug: string
    status: Event["status"]
    event_start: string
    event_end: string
    created_at: string
    updated_at: string
    ticket_url: string | null
    facebook_url: string | null
    image_url: string | null
    price: string | null
    event_type_id: string
    room_id: string | null
    room_text: string | null
    is_internal: boolean
    is_featured: boolean
    recurring_interval_days: number | null
    translations: Event["translations"]
    event_type: Event["event_type"]
    room: Room | null
    event_organizer_group_memberships:
        | {
              display_order: number
              organizer_group: OrganizerGroup | null
          }[]
        | null
}

const EVENT_SELECT = `
    id,
    slug,
    status,
    event_start,
    event_end,
    created_at,
    updated_at,
    ticket_url,
    facebook_url,
    image_url,
    price,
    event_type_id,
    room_id,
    room_text,
    is_internal,
    is_featured,
    recurring_interval_days,
    translations,
    event_type:event_types (
        id,
        slug,
        name,
        description,
        sort_order,
        is_active
    ),
    room:rooms (
        id,
        slug,
        name,
        sort_order,
        is_active
    ),
    event_organizer_group_memberships (
        display_order,
        organizer_group:event_organizer_groups (
            id,
            slug,
            name,
            sort_order,
            is_active,
            default_event_type_id
        )
    )
`

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message
    }

    return "Unknown error"
}

const serializeFormValues = (formValues: EventFormValues) => ({
    ...formValues,
    image: undefined,
    startTime: formValues.startTime?.toISOString() ?? null,
    endTime: formValues.endTime?.toISOString() ?? null,
})

const buildEventFormData = (formValues: EventFormValues): FormData => {
    const formData = new FormData()
    formData.set("payload", JSON.stringify(serializeFormValues(formValues)))

    if (formValues.image) {
        formData.set("image", formValues.image)
    }

    return formData
}

const parseEventWriteResponse = async (response: Response): Promise<Result<Event>> => {
    const payload = (await response.json()) as { event?: unknown; error?: unknown }

    if (!response.ok) {
        return ERR(typeof payload.error === "string" ? payload.error : "Failed to write event.")
    }

    if (!payload.event || typeof payload.event !== "object") {
        return ERR("Failed to write event.")
    }

    return OK(mapEventRow(payload.event as EventRow))
}

const mapEventRow = (row: EventRow): Event => ({
    id: row.id,
    slug: row.slug,
    status: row.status,
    event_start: row.event_start,
    event_end: row.event_end,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ticket_url: row.ticket_url,
    facebook_url: row.facebook_url,
    image: row.image_url
        ? {
              url: row.image_url,
              __typename: "supabase",
          }
        : null,
    event_type_id: row.event_type_id,
    event_type: row.event_type,
    room_id: row.room_id,
    room_text: row.room_text,
    room: row.room,
    organizer_groups: [...(row.event_organizer_group_memberships ?? [])]
        .sort((left, right) => left.display_order - right.display_order)
        .map(membership => membership.organizer_group)
        .filter((group): group is OrganizerGroup => group !== null),
    is_internal: row.is_internal,
    is_featured: row.is_featured,
    recurring_interval_days: row.recurring_interval_days,
    price: row.price,
    translations: row.translations,
})

export async function listEventTaxonomy(): Promise<Result<EventTaxonomy>> {
    const [
        { data: eventTypes, error: eventTypesError },
        { data: organizerGroups, error: organizerGroupsError },
        { data: rooms, error: roomsError },
    ] = await Promise.all([
        supabase
            .from("event_types")
            .select("id, slug, name, description, sort_order, is_active")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
        supabase
            .from("event_organizer_groups")
            .select("id, slug, name, sort_order, is_active, default_event_type_id")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
        supabase
            .from("rooms")
            .select("id, slug, name, sort_order, is_active")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
    ])

    if (eventTypesError) {
        return ERR(eventTypesError.message)
    }

    if (organizerGroupsError) {
        return ERR(organizerGroupsError.message)
    }

    if (roomsError) {
        return ERR(roomsError.message)
    }

    return OK({
        eventTypes: eventTypes ?? [],
        organizerGroups: organizerGroups ?? [],
        rooms: rooms ?? [],
    })
}

export async function fetchEvents(): Promise<Result<Event[]>> {
    try {
        const response = await fetch("/api/events")
        const payload = (await response.json()) as { events?: unknown; error?: unknown }

        if (!response.ok) {
            return ERR(
                typeof payload.error === "string" ? payload.error : "Failed to fetch events.",
            )
        }

        if (!Array.isArray(payload.events)) {
            return ERR("Failed to fetch events.")
        }

        return OK((payload.events as EventRow[]).map(mapEventRow))
    } catch (error) {
        return ERR(getErrorMessage(error))
    }
}

export async function fetchEventById(id: string): Promise<Result<Event>> {
    try {
        const response = await fetch(`/api/events/${encodeURIComponent(id)}`)
        const payload = (await response.json()) as { event?: unknown; error?: unknown }

        if (!response.ok) {
            return ERR(typeof payload.error === "string" ? payload.error : "Failed to fetch event.")
        }

        if (!payload.event || typeof payload.event !== "object") {
            return ERR("Failed to fetch event.")
        }

        return OK(mapEventRow(payload.event as EventRow))
    } catch (error) {
        return ERR(getErrorMessage(error))
    }
}

export async function createEvent(formValues: EventFormValues): Promise<Result<Event>> {
    try {
        if (!formValues.image) {
            return ERR("Arrangement må ha et bilde.")
        }

        const response = await fetch("/api/events", {
            method: "POST",
            body: buildEventFormData(formValues),
        })

        return parseEventWriteResponse(response)
    } catch (error) {
        return ERR(getErrorMessage(error))
    }
}

export async function updateEvent(id: string, formValues: EventFormValues): Promise<Result<Event>> {
    try {
        const response = await fetch(`/api/events/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: buildEventFormData(formValues),
        })

        return parseEventWriteResponse(response)
    } catch (error) {
        return ERR(getErrorMessage(error))
    }
}

export async function deleteEvent(id: string): Promise<Result<null>> {
    try {
        const response = await fetch(`/api/events/${encodeURIComponent(id)}`, {
            method: "DELETE",
        })
        const payload = (await response.json()) as { error?: unknown }

        if (!response.ok) {
            return ERR(
                typeof payload.error === "string" ? payload.error : "Failed to delete event.",
            )
        }

        return OK(null)
    } catch (error) {
        return ERR(getErrorMessage(error))
    }
}

export { supabase }
