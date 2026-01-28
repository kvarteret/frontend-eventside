import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"
import { BasicsSection } from "@/components/form/BasicsSection"
import { LanguageSection } from "@/components/form/LanguageSection"
import { DetailsSection } from "@/components/form/DetailsSection"
import { LanguageToggle } from "@/components/LanguageToggle"
import { Footer } from "@/components/Footer"
import { createEvent } from "@/lib/services/events"
import type { EventFormValues, Language, LanguageContent } from "@/types"
import "./index.css"

const initialLanguageContent: LanguageContent = {
  available: true,
  name: "",
  imageCaption: "",
  intro: "",
  article: "",
}

const defaultValues: EventFormValues = {
  categories: [],
  organizers: [],
  startTime: undefined,
  endTime: undefined,
  facebookUrl: "",
  price: "",
  ticketsUrl: "",
  image: null,
  no: { ...initialLanguageContent },
  en: { ...initialLanguageContent },
}

export const App = () => {
  const [editingLanguage, setEditingLanguage] = useState<Language>("no")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      setPublishedSlug(null)
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
        setPublishedSlug(event.slug)
        form.reset()
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
    <div className="min-h-screen bg-background p-6 md:p-10">
      <Toaster richColors />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Innhold</CardTitle>
                <LanguageToggle value={editingLanguage} onChange={setEditingLanguage} />
              </div>
            </CardHeader>
            <CardContent>
              <LanguageSection form={form} language={editingLanguage} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detaljer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <BasicsSection form={form} />
              <DetailsSection form={form} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? "Publiserer..." : "Publiser arrangementet"}
            </Button>
          </div>
        </div>
      </form>
      <Footer />
    </div>
  )
}

export default App
