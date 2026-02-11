import type { FirestoreEvent } from "@/lib/services/types"
import { Link } from "react-router-dom"
import { Card } from "./ui/card"
import { getFirestoreTranslation } from "@/lib/utils"

export function EventCard({ event }: { event: FirestoreEvent }) {
    const { translations } = event
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
        <Link to={`/events/${event.id}/edit`}>
            <Card className="p-4 rounded cursor-pointer flex flex-col gap-4 hover:border-primary/40 transition-colors">
                <h1>{translation.title}</h1>
                {!!description && (
                    <p className="text-xs">
                        {description.substring(0, 100)}...
                    </p>
                )}
            </Card>
        </Link>
    )
}
