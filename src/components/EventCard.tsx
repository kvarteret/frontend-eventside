import { Link } from "react-router-dom"
import type { FirestoreEvent } from "@/lib/services/types"
import {
    eventDateCard,
    getFirestoreTranslation,
    projectDescriptionPreview,
    timeRemaining,
    weekday,
} from "@/lib/utils"
import { Card } from "./ui/card"

export function EventCard({ event }: { event: FirestoreEvent }) {
    const { translations, event_start: startDate } = event
    const { data: translation, ok, error } = getFirestoreTranslation(translations)

    if (!ok) {
        throw Error(error)
    }

    const descriptionPreview = projectDescriptionPreview(translation.description)

    return (
        <Link to={`/events/${event.id}/edit`}>
            <Card className="p-4 rounded cursor-pointer flex flex-col gap-4 hover:border-primary/40 transition-colors">
                <h1 className="text-xl">{translation.title}</h1>
                {!!descriptionPreview && <p className="text-xs">{descriptionPreview}</p>}
                <div className="flex justify-between">
                    <span className="justify-left">{timeRemaining(startDate)}</span>
                    <div className="justify-right">
                        <span className="text-red-600 font-bold">{weekday(startDate)}</span>
                        <span>{eventDateCard(startDate)}</span>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
