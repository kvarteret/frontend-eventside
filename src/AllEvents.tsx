import { useEffect, useMemo, useState } from "react"

import { getEvents } from "./lib/services/events"
import {
    ERR,
    OK,
    type FirestoreEvent,
    type FirestoreTranslation,
    type Result,
    type Translations,
} from "./lib/services/types"
import ErrorOccured from "./components/ErrorOccured"
import { Card } from "./components/ui/card"
import { Timestamp } from "firebase/firestore"
import { ChevronDown, ChevronUp } from "lucide-react"
import { capitalizeFirstLetter } from "./lib/utils"

/**
 * 
 * available: boolean
    title: string
    description: string | null // intro
    content: string | null // article
    image_caption: string | null
*/

type EventStatus = "in progress" | "upcoming" | "archived"

function getEventStatus(event: FirestoreEvent): EventStatus {
    const now = Timestamp.now()
    const { event_start: start, event_end: end } = event

    if (now < start) return "upcoming"
    if (now > end) return "archived"
    return "in progress"
}

export function getFirestoreTranslation(
    translations: Translations,
): Result<FirestoreTranslation> {
    const { en, no } = translations
    if (no !== null) return OK(no)
    if (en !== null) return OK(en)
    return ERR("Could not find event translation")
}

export function Event({ event }: { event: FirestoreEvent }) {
    const { translations } = event
    const {
        data: translation,
        ok,
        error,
    } = getFirestoreTranslation(translations)

    if (!ok) {
        throw Error(error)
    }

    return (
        <Card className="p-4 rounded cursor-pointer">
            <h1 className="">{capitalizeFirstLetter(translation.title)}</h1>
            <p className="text-xs">{translation.description}</p>
        </Card>
    )
}

type StatusEvents = {
    status: EventStatus
    events: FirestoreEvent[]
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

function EventCategory({
    statusEvents,
    isOpen,
    toggleOpen,
}: {
    statusEvents: StatusEvents
    isOpen: boolean
    toggleOpen: () => void
}) {
    const { status, events } = statusEvents

    if (events.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            <div
                className="flex px-2 flex items-center justify-between cursor-pointer"
                onClick={toggleOpen}
            >
                <h1 className="text-xl">{capitalizeFirstLetter(status)}</h1>
                {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </div>
            <div className="border-t" />
            {isOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {events.map((event, i) => (
                        <Event key={i} event={event} />
                    ))}
                </div>
            )}
        </div>
    )
}

export const AllEvents = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [events, setEvents] = useState<FirestoreEvent[]>([])
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState<Map<EventStatus, boolean>>(
        () =>
            new Map<EventStatus, boolean>([
                ["in progress", true],
                ["upcoming", true],
                ["archived", false],
            ]),
    )

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true)
            const eventsResult = await getEvents()
            setLoading(false)

            if (!eventsResult.ok) {
                setError(eventsResult.error)
                return
            }

            setEvents(eventsResult.data)
        }

        fetchEvents()
    }, [])

    const categorizedEvents = useMemo(() => categorizeEvents(events), [events])

    if (loading) {
        // add centered spinner pls
        return <div className="p-8">Loading...</div>
    }

    if (error) {
        console.error(error)
        return <ErrorOccured />
    }

    return (
        <div className="w-full h-full p-8 space-y-8">
            {categorizedEvents.map((ce) => (
                <EventCategory
                    statusEvents={ce}
                    isOpen={open.get(ce.status)!}
                    toggleOpen={() => {
                        setOpen((prev) => {
                            const next = new Map(prev)
                            const isOpen = next.get(ce.status) ?? false
                            next.set(ce.status, !isOpen)
                            return next
                        })
                    }}
                />
            ))}
        </div>
    )
}

export default AllEvents
