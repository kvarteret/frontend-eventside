import { useEffect, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { EventFormLayout } from "@/components/form/EventFormLayout"
import {
    firestoreEventToFormValues,
} from "@/lib/event-form"
import { getEventById, updateEvent } from "@/lib/services/events"
import type { FirestoreEvent } from "@/lib/services/types"
import type { EventFormValues } from "@/types"

interface EditEventFormProps {
    event: FirestoreEvent
    initialValues: EventFormValues
}

function EditEventForm({ event, initialValues }: EditEventFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [existingImageUrl, setExistingImageUrl] = useState(
        event.image?.url ?? null,
    )

    const form = useForm({
        defaultValues: initialValues,
        onSubmit: async ({ value }) => {
            setIsSubmitting(true)
            try {
                const updateResult = await updateEvent(event.id, value)

                if (!updateResult.ok) {
                    toast.error("Kunne ikke oppdatere arrangement", {
                        description: updateResult.error,
                    })
                    return
                }

                setExistingImageUrl(updateResult.data.image?.url ?? null)
                toast.success(
                    <a
                        href={`https://kvarteret.no/events/${updateResult.data.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Arrangement oppdatert. Klikk for å åpne på Kvarteret.no
                    </a>,
                )
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Ukjent feil ved oppdatering"

                toast.error("Kunne ikke oppdatere arrangement", {
                    description: message,
                })
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    return (
        <EventFormLayout
            form={form}
            isSubmitting={isSubmitting}
            submitLabel="Oppdater arrangementet"
            submittingLabel="Oppdaterer..."
            existingImageUrl={existingImageUrl}
        />
    )
}

export default function EditEvent() {
    const { id } = useParams<{ id: string }>()
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [event, setEvent] = useState<FirestoreEvent | null>(null)
    const [initialValues, setInitialValues] = useState<EventFormValues | null>(
        null,
    )

    useEffect(() => {
        let cancelled = false

        const loadEvent = async () => {
            if (!id) {
                setLoadError("Mangler arrangement-ID.")
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            const eventResult = await getEventById(id)

            if (cancelled) {
                return
            }

            if (!eventResult.ok) {
                setLoadError(eventResult.error)
                setIsLoading(false)
                return
            }

            setEvent(eventResult.data)
            setInitialValues(firestoreEventToFormValues(eventResult.data))
            setLoadError(null)
            setIsLoading(false)
        }

        loadEvent()

        return () => {
            cancelled = true
        }
    }, [id])

    if (isLoading) {
        return <div className="p-8">Laster arrangement...</div>
    }

    if (loadError || !event || !initialValues) {
        return (
            <div className="p-8 space-y-4">
                <p>{loadError ?? "Fant ikke arrangementet."}</p>
                <Link className="underline font-semibold" to="/events">
                    Tilbake til arrangementer
                </Link>
            </div>
        )
    }

    return <EditEventForm key={event.id} event={event} initialValues={initialValues} />
}
