import { type ClassValue, clsx } from "clsx"
import { Timestamp } from "firebase/firestore"
import { twMerge } from "tailwind-merge"
import {
    ERR,
    OK,
    type FirestoreEvent,
    type FirestoreTranslation,
    type Result,
    type Status,
    type StatusEvents,
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

export function getEventStatus(event: FirestoreEvent): Status {
    const now = Timestamp.now()
    const { event_start: start, event_end: end } = event

    if (now < start) return "upcoming"
    if (now > end) return "archived"
    return "in progress"
}

export function categorizeEvents(events: FirestoreEvent[]): StatusEvents[] {
    const inProgress: FirestoreEvent[] = []
    const upcoming: FirestoreEvent[] = []
    const archived: FirestoreEvent[] = []

    for (const event of events) {
        const status = getEventStatus(event)
        if (status === "in progress") {
            inProgress.push(event)
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
        { status: "upcoming", events: upcoming },
        { status: "archived", events: archived },
    ]
}

export const READABLE_STATUS: Record<Status, string> = {
    "in progress": "Pågår nå",
    upcoming: "Kommende",
    archived: "Tidligere",
}

export function getFirestoreTranslation(
    translations: Translations,
): Result<FirestoreTranslation> {
    const { en, no } = translations
    if (no !== null) return OK(no)
    if (en !== null) return OK(en)
    return ERR("Could not find event translation")
}

export function eventTimeCard(date: Timestamp) {
    const newTime = `Dato: ${date.toDate().toLocaleDateString()}`
    return newTime
}

export function timeRemaining(date: Timestamp) {
    const eventTime = date.toDate().getTime()
    const currentTime = Date.now()
    const diff = (eventTime - currentTime) / 1000
    if (diff < 0) {return ""}
    else return Math.round(diff / 3600)
}
