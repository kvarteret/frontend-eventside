import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { toast } from "sonner"
import { EventFormLayout } from "@/components/form/EventFormLayout"
import { createDefaultEventFormValues } from "@/lib/event-form"
import { createEvent } from "@/lib/services/events"
import "./index.css"

export const CreateEvent = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        defaultValues: createDefaultEventFormValues(),
        onSubmit: async ({ value }) => {
            setIsSubmitting(true)
            try {
                const event = await createEvent(value)
                toast.success(
                    <a
                        href={`https://kvarteret.no/events/${event.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Klikk for å gå til arrangement på Kvarteret.no
                    </a>,
                )
                form.reset(createDefaultEventFormValues())
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Ukjent feil ved publisering"
                toast.error("Feil ved publisering", {
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
            submitLabel="Publiser arrangementet"
            submittingLabel="Publiserer..."
        />
    )
}

export default CreateEvent
