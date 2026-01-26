export type Language = "no" | "en"

export interface LanguageContent {
  available: boolean
  name: string
  imageCaption: string
  intro: string
  article: string
  location: string
}

export interface EventFormValues {
  name: string
  category: string
  subCategories: string
  eventByExtra: string
  startTime: string
  endTime: string
  facebookUrl: string
  price: string
  ticketsUrl: string
  image: string
  no: LanguageContent
  en: LanguageContent
}

// TanStack Form's complex generic types make precise typing impractical here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventForm = any
