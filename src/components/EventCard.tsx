import {
    type Translations,
    type Result,
    type FirestoreTranslation,
    OK,
    ERR,
    type FirestoreEvent,
} from "@/lib/services/types"
import { capitalizeFirstLetter } from "@/lib/utils"
import { Card } from "./ui/card"

export function getFirestoreTranslation(
    translations: Translations,
): Result<FirestoreTranslation> {
    const { en, no } = translations
    if (no !== null) return OK(no)
    if (en !== null) return OK(en)
    return ERR("Could not find event translation")
}

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

    return (
        <Card className="p-4 rounded cursor-pointer">
            <h1 className="">{capitalizeFirstLetter(translation.title)}</h1>
            <p className="text-xs">{translation.description}</p>
        </Card>
    )
}
