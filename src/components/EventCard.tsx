import {
    type Translations,
    type Result,
    type FirestoreTranslation,
    OK,
    ERR,
    type FirestoreEvent,
} from "@/lib/services/types"
import { Card } from "./ui/card"
import { eventTimeCard, getFirestoreTranslation, timeRemaining, weekday } from "@/lib/utils"

export function EventCard({ event }: { event: FirestoreEvent }) {
    const { translations, event_start: startDate } = event
    const {
        data: translation,
        ok,
        error,
    } = getFirestoreTranslation(translations)

    if (!ok) {
        throw Error(error)
    }

    const { description } = translation

    return (
        <Card className="p-4 rounded cursor-pointer flex flex-col gap-4">
            <h1 className="text-xl">{translation.title}</h1>
            {!!description && (
                <p className="text-s">{description.substring(0, 150)}...</p>
            )}
            <p className="flex justify-between">
                <span>{timeRemaining(startDate)} </span>
                <div>
                    {weekday(startDate).map((day, i) => (
                    <span key={i} className={day.active ? "text-red-600 font-bold" : "text-gray-400"} > {day.label}</span> ))}
                </div>
                <span>{eventTimeCard(startDate)}</span>
            </p>
        </Card>
    )
}
