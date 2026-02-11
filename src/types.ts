export type Language = "no" | "en"

export interface LanguageContent {
    available: boolean
    name: string
    imageCaption: string
    intro: string
    article: string
}

export interface EventFormValues {
    categories: number[]
    organizers: number[]
    startTime: Date | undefined
    endTime: Date | undefined
    facebookUrl: string
    price: string
    ticketsUrl: string
    image: File | null
    no: LanguageContent
    en: LanguageContent
}

// TanStack Form's complex generic types make precise typing impractical here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventForm = any
