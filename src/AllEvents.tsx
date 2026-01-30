import { useEffect, useMemo, useState } from "react"

import { getEvents } from "./lib/services/events"
import type { FirestoreEvent } from "./lib/services/types"
import ErrorOccured from "./components/ErrorOccured"

function Event({ event }: { event: FirestoreEvent }) {
    const {} = event

    return <div>{}</div>
}
export const AllEvents = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [events, setEvents] = useState<FirestoreEvent[]>([])
    const [error, setError] = useState<string | null>(null)

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

    if (error) {
        console.error(error)
        return <ErrorOccured />
    }

    return (
        <div className="w-full h-full">
            {loading
                ? "loading"
                : events.map((event, i) => <Event key={i} event={event} />)}
        </div>
    )
}

export default AllEvents
