import { formatEventDateTimeForApi } from "@/lib/date-time"
import type { EventFormValues } from "@/types"
import { generateUniqueSlug } from "./slugify"
import { deleteEventImageByUrl, uploadEventImage } from "./storage"
import { supabase } from "./supabase"
import { ERR, type Event, type EventTaxonomy, OK, type OrganizerGroup, type Result } from "./types"

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
    is_internal: boolean
    is_featured: boolean
    recurring_interval_days: number | null
    translations: Event["translations"]
    event_type: Event["event_type"]
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

const parseRecurringIntervalDays = (value: string): number | null => {
    const trimmed = value.trim()
    if (!trimmed) {
        return null
    }

    const parsed = Number.parseInt(trimmed, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error("Recurring interval must be a positive number of days.")
    }

    return parsed
}

async function formToEventRecord(
    formValues: EventFormValues,
    options?: {
        slug?: string
        imageUrl?: string | null
        status?: Event["status"]
        createdAt?: string
        updatedAt?: string
    },
) {
    const now = new Date().toISOString()
    const nameForSlug = formValues.no.name || formValues.en.name
    const slug = options?.slug ?? (await generateUniqueSlug(nameForSlug))

    if (!formValues.eventTypeId) {
        throw new Error("Event type must be selected.")
    }

    if (!formValues.startTime || !formValues.endTime) {
        throw new Error("Start and end time must be filled in.")
    }

    return {
        slug,
        status: options?.status ?? "published",
        event_start: formatEventDateTimeForApi(formValues.startTime),
        event_end: formatEventDateTimeForApi(formValues.endTime),
        created_at: options?.createdAt ?? now,
        updated_at: options?.updatedAt ?? now,
        ticket_url: formValues.ticketsUrl || null,
        facebook_url: formValues.facebookUrl || null,
        image_url: options?.imageUrl ?? null,
        event_type_id: formValues.eventTypeId,
        is_internal: formValues.isInternal,
        is_featured: formValues.isFeatured,
        recurring_interval_days: parseRecurringIntervalDays(formValues.recurringIntervalDays),
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

async function syncOrganizerGroupMemberships(
    eventId: string,
    organizerGroupIds: string[],
): Promise<Result<null>> {
    const { error: deleteError } = await supabase
        .from("event_organizer_group_memberships")
        .delete()
        .eq("event_id", eventId)

    if (deleteError) {
        return ERR(deleteError.message)
    }

    if (organizerGroupIds.length === 0) {
        return OK(null)
    }

    const { error: insertError } = await supabase.from("event_organizer_group_memberships").insert(
        organizerGroupIds.map((organizerGroupId, index) => ({
            event_id: eventId,
            organizer_group_id: organizerGroupId,
            display_order: index,
        })),
    )

    if (insertError) {
        return ERR(insertError.message)
    }

    return OK(null)
}

export async function listEventTaxonomy(): Promise<Result<EventTaxonomy>> {
    const [
        { data: eventTypes, error: eventTypesError },
        { data: organizerGroups, error: organizerGroupsError },
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
    ])

    if (eventTypesError) {
        return ERR(eventTypesError.message)
    }

    if (organizerGroupsError) {
        return ERR(organizerGroupsError.message)
    }

    return OK({
        eventTypes: eventTypes ?? [],
        organizerGroups: organizerGroups ?? [],
    })
}

export async function fetchEvents(): Promise<Result<Event[]>> {
    const { data, error } = await supabase
        .from("events")
        .select(EVENT_SELECT)
        .order("event_start", { ascending: true })

    if (error) {
        return ERR(error.message)
    }

    return OK(((data ?? []) as EventRow[]).map(mapEventRow))
}

export async function fetchEventById(id: string): Promise<Result<Event>> {
    const { data, error } = await supabase.from("events").select(EVENT_SELECT).eq("id", id).single()

    if (error) {
        return ERR(error.message)
    }

    return OK(mapEventRow(data as EventRow))
}

export async function createEvent(formValues: EventFormValues): Promise<Result<Event>> {
    let uploadedImageUrl: string | null = null

    try {
        const nameForSlug = formValues.no.name || formValues.en.name
        const slug = await generateUniqueSlug(nameForSlug)
        uploadedImageUrl = formValues.image ? await uploadEventImage(formValues.image, slug) : null
        const eventData = await formToEventRecord(formValues, { slug, imageUrl: uploadedImageUrl })

        const { data, error } = await supabase
            .from("events")
            .insert(eventData)
            .select("id")
            .single()

        if (error || !data?.id) {
            return ERR(error?.message ?? "Failed to create event.")
        }

        const membershipsResult = await syncOrganizerGroupMemberships(
            data.id,
            formValues.organizerGroupIds,
        )

        if (!membershipsResult.ok) {
            return membershipsResult
        }

        return fetchEventById(data.id)
    } catch (error) {
        if (uploadedImageUrl) {
            try {
                await deleteEventImageByUrl(uploadedImageUrl)
            } catch (cleanupError) {
                console.warn(
                    "Failed to clean up uploaded image after create failure.",
                    cleanupError,
                )
            }
        }

        return ERR(getErrorMessage(error))
    }
}

export async function updateEvent(id: string, formValues: EventFormValues): Promise<Result<Event>> {
    let uploadedImageUrl: string | null = null

    try {
        const existingEventResult = await fetchEventById(id)
        if (!existingEventResult.ok) {
            return ERR(existingEventResult.error)
        }

        const existingEvent = existingEventResult.data
        const existingImageUrl = existingEvent.image?.url ?? null
        let nextImageUrl = existingImageUrl

        if (formValues.image) {
            uploadedImageUrl = await uploadEventImage(formValues.image, existingEvent.slug)
            nextImageUrl = uploadedImageUrl
        } else if (formValues.removeImage) {
            nextImageUrl = null
        }

        const eventData = await formToEventRecord(formValues, {
            slug: existingEvent.slug,
            status: existingEvent.status,
            imageUrl: nextImageUrl,
            createdAt: existingEvent.created_at,
            updatedAt: new Date().toISOString(),
        })

        const { error } = await supabase.from("events").update(eventData).eq("id", id)

        if (error) {
            return ERR(error.message)
        }

        const membershipsResult = await syncOrganizerGroupMemberships(
            id,
            formValues.organizerGroupIds,
        )

        if (!membershipsResult.ok) {
            return membershipsResult
        }

        if (formValues.removeImage && existingImageUrl) {
            try {
                await deleteEventImageByUrl(existingImageUrl)
            } catch (cleanupError) {
                console.warn("Failed to delete removed event image.", cleanupError)
            }
        } else if (uploadedImageUrl && existingImageUrl && uploadedImageUrl !== existingImageUrl) {
            try {
                await deleteEventImageByUrl(existingImageUrl)
            } catch (cleanupError) {
                console.warn("Failed to delete replaced event image.", cleanupError)
            }
        }

        return fetchEventById(id)
    } catch (error) {
        if (uploadedImageUrl) {
            try {
                await deleteEventImageByUrl(uploadedImageUrl)
            } catch (cleanupError) {
                console.warn(
                    "Failed to clean up uploaded image after update failure.",
                    cleanupError,
                )
            }
        }

        return ERR(getErrorMessage(error))
    }
}

export { supabase }
