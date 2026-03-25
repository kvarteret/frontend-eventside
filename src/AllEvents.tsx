import { useEffect, useMemo, useState } from "react"
import ErrorOccured from "./components/ErrorOccured"
import { EventCategory } from "./components/EventCategory"
import { fetchEvents } from "./lib/services/events"
import { type Event, type Status } from "./lib/services/types"
import { categorizeEvents } from "./lib/utils"

export const AllEvents = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const [events, setEvents] = useState<Event[]>([])
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState<Map<Status, boolean>>(
        () =>
            new Map<Status, boolean>([
                ["in progress", true],
                ["nextWeek", true],
                ["upcoming", false],
                ["archived", false],
            ]),
    )

    useEffect(() => {
        async function loadEvents() {
            try {
                setLoading(true)
                const result = await fetchEvents()

                if (!result.ok) {
                    setError(result.error)
                    return
                }

                setEvents(result.data)
            } finally {
                setLoading(false)
            }
        }

        void loadEvents()
    }, [])

    const categorizedEvents = useMemo(() => categorizeEvents(events), [events])

    if (loading) {
        return <div className="p-8">Laster...</div>
    }

    if (error) {
        console.error(error)
        return <ErrorOccured />
    }

    if (events.length === 0) {
        return <div className="p-8">Fant ingen arrangementer.</div>
    }

    return (
        <div className="w-full h-full p-8 space-y-8">
            {categorizedEvents.map(ce => (
                <EventCategory
                    key={ce.status}
                    statusEvents={ce}
                    isOpen={open.get(ce.status)!}
                    toggleOpen={() =>
                        setOpen(prev => {
                            const next = new Map(prev)
                            const isOpen = next.get(ce.status) ?? false
                            next.set(ce.status, !isOpen)
                            return next
                        })
                    }
                />
            ))}
        </div>
    )
}

export default AllEvents
