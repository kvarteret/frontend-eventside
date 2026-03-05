import type { Event, Translation } from "@/lib/services/types"
import { projectDescriptionPreview } from "@/lib/utils"
import type { EventFormValues, LanguageContent } from "@/types"

const createDefaultLanguageContent = (): LanguageContent => ({
    available: true,
    name: "",
    imageCaption: "",
    intro: "",
    article: "",
})

export const createDefaultEventFormValues = (): EventFormValues => ({
    categories: [],
    organizers: [],
    startTime: undefined,
    endTime: undefined,
    facebookUrl: "",
    price: "",
    ticketsUrl: "",
    image: null,
    removeImage: false,
    no: createDefaultLanguageContent(),
    en: createDefaultLanguageContent(),
})

const mapTranslationToLanguageContent = (
    translation: Translation | null,
): LanguageContent => {
    if (!translation) {
        return {
            ...createDefaultLanguageContent(),
            available: false,
        }
    }

    return {
        available: translation.available,
        name: translation.title,
        imageCaption: translation.image_caption ?? "",
        intro: projectDescriptionPreview(translation.description),
        article: translation.description ?? "",
    }
}

export const eventToFormValues = (event: Event): EventFormValues => {
    const organizerId = event.organizer?.id

    return {
        categories: event.categories.map((category) => category.id),
        organizers: typeof organizerId === "number" ? [organizerId] : [],
        startTime: event.event_start.toDate(),
        endTime: event.event_end.toDate(),
        facebookUrl: event.facebook_url ?? "",
        price: event.price ?? "",
        ticketsUrl: event.ticket_url ?? "",
        image: null,
        removeImage: false,
        no: mapTranslationToLanguageContent(event.translations.no),
        en: mapTranslationToLanguageContent(event.translations.en),
    }
}
