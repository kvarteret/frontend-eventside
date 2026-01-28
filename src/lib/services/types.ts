import type { Timestamp } from "firebase/firestore"

export interface FirestoreTranslation {
  available: boolean
  title: string
  description: string | null // intro
  content: string | null // article
  image_caption: string | null
}

export interface FirestoreEvent {
  id: string // Firestore doc ID
  slug: string // Auto-generated from name
  status: "published" | "draft" | "archived"

  // Timestamps
  event_start: Timestamp
  event_end: Timestamp
  created_at: Timestamp
  updated_at: Timestamp

  // Links
  ticket_url: string | null
  facebook_url: string | null

  // Image (URL-based for MVP)
  image: { url: string; __typename: "firestore" } | null

  // Organization
  organizer: { id: number | null; name: string } | null
  categories: { id: number; name: string }[]
  price: string | null

  // Bilingual content
  translations: {
    no: FirestoreTranslation | null
    en: FirestoreTranslation | null
  }
}

// Type for creating a new event (without id which is assigned by Firestore)
export type CreateFirestoreEvent = Omit<FirestoreEvent, "id">
