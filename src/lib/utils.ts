import { type ClassValue, clsx } from "clsx"
import { format, parse } from "date-fns"
import { twMerge } from "tailwind-merge"
import {
    ERR,
    type Event,
    OK,
    type OrganizerGroup,
    type Result,
    type Status,
    type StatusEvents,
    type Translation,
    type Translations,
} from "./services/types"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(string: string) {
    if (typeof string !== "string" || string.length === 0) {
        return ""
    }
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export function getEventStatus(event: Event): Status {
    const now = new Date()

    const { event_start, event_end } = event
    const start = new Date(event_start)
    const end = new Date(event_end)
    const nextWeek = (start.getTime() - now.getTime()) / 1000 < 604800

    if (now < start && nextWeek) return "nextWeek"
    if (now < start) return "upcoming"
    if (now > end) return "archived"
    return "in progress"
}

export function categorizeEvents(events: Event[]): StatusEvents[] {
    const inProgress: Event[] = []
    const nextWeek: Event[] = []
    const upcoming: Event[] = []
    const archived: Event[] = []

    for (const event of events) {
        const status = getEventStatus(event)
        if (status === "in progress") {
            inProgress.push(event)
            continue
        }

        if (status === "nextWeek") {
            nextWeek.push(event)
            continue
        }

        if (status === "upcoming") {
            upcoming.push(event)
            continue
        }

        archived.push(event)
    }

    return [
        { status: "in progress", events: inProgress },
        { status: "nextWeek", events: nextWeek },
        { status: "upcoming", events: upcoming },
        { status: "archived", events: archived },
    ]
}

export const READABLE_STATUS: Record<Status, string> = {
    "in progress": "Pågår nå",
    nextWeek: "Neste ukes",
    upcoming: "Kommende",
    archived: "Tidligere",
}

const DESCRIPTION_PREVIEW_MAX_CHARS = 200

const decodeHtmlEntities = (value: string): string =>
    value
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")

const stripHtml = (value: string): string => {
    const withoutTags = value.replace(/<[^>]+>/g, " ")
    const decoded = decodeHtmlEntities(withoutTags)
    return decoded.replace(/\s+/g, " ").trim()
}

export const projectDescriptionPreview = (
    value: string | null | undefined,
    maxChars = DESCRIPTION_PREVIEW_MAX_CHARS,
): string => {
    const source = (value ?? "").trim()
    if (!source) {
        return ""
    }

    const normalized = stripHtml(source)
    if (normalized.length <= maxChars) {
        return normalized
    }

    return `${normalized.slice(0, maxChars).trimEnd()}...`
}

export function getTranslation(translations: Translations): Result<Translation> {
    const { en, no } = translations
    if (no !== null) return OK(no)
    if (en !== null) return OK(en)
    return ERR("Could not find event translation")
}

export function eventDateCard(date: string): string {
    return format(new Date(date), "dd.MM.yyyy")
}

export function timeRemaining(isostring: string): string {
    const date = new Date(isostring)
    const diff = (date.getTime() - Date.now()) / 1000
    const hours = diff / 3600
    const days = hours / 24
    if (hours < 0) return ""
    if (hours >= 24) return `Dager gjenstår: ${Math.round(days)}`
    return `Timer gjenstår: ${Math.round(hours)}`
}

export function weekday(isostring: string): string {
    const date = new Date(isostring)
    const days = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"]
    return days[date.getDay()] + " "
}

export function buildOrganizerGroupText(groups: OrganizerGroup[]): string {
    return groups.map(group => group.name).join(", ")
}

export function buildEventTaxonomyText(event: Event): string {
    const eventTypeName = event.event_type?.name ?? "Ukjent type"
    const organizerGroups = buildOrganizerGroupText(event.organizer_groups)

    if (!organizerGroups) {
        return eventTypeName
    }

    return `${eventTypeName} (${organizerGroups})`
}
