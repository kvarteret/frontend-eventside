import { type ClassValue, clsx } from "clsx"
import { Timestamp } from "firebase/firestore"
import { twMerge } from "tailwind-merge"
import type { FirestoreEvent, Status, StatusEvents } from "./services/types"

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
