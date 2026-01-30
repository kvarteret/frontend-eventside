import { capitalizeFirstLetter } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { EventCard } from "./EventCard"
import type { StatusEvents } from "@/lib/services/types"

export function EventCategory({
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
                <h1 className="text-xl">
                    {capitalizeFirstLetter(status)} events
                </h1>
                {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </div>
            <div className="border-t" />
            {isOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {events.map((event, i) => (
                        <EventCard key={i} event={event} />
                    ))}
                </div>
            )}
        </div>
    )
}
