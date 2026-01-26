import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BasicsSection } from "@/components/form/BasicsSection"
import { LanguageSection } from "@/components/form/LanguageSection"
import { DetailsSection } from "@/components/form/DetailsSection"
import { LanguageToggle } from "@/components/LanguageToggle"
import { EventPreview } from "@/components/EventPreview"
import type { EventFormValues, Language, LanguageContent } from "@/types"
import "./index.css"

const initialLanguageContent: LanguageContent = {
  available: true,
  name: "",
  imageCaption: "",
  intro: "",
  article: "",
  location: "",
}

const defaultValues: EventFormValues = {
  name: "",
  category: "",
  subCategories: "",
  eventByExtra: "",
  startTime: "",
  endTime: "",
  facebookUrl: "",
  price: "",
  ticketsUrl: "",
  image: "",
  no: { ...initialLanguageContent },
  en: { ...initialLanguageContent },
}

export const App = () => {
  const [editingLanguage, setEditingLanguage] = useState<Language>("no")

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value)
    },
  })

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="grid gap-6 xl:grid-cols-[1fr,420px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grunnleggende</CardTitle>
              </CardHeader>
              <CardContent>
                <BasicsSection form={form} />
              </CardContent>
            </Card>

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
              <CardContent>
                <DetailsSection form={form} />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting ? "Publiserer..." : "Publiser arrangementet"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </div>

          <div className="xl:sticky xl:top-6 xl:self-start space-y-4 hidden xl:block">
            <h2 className="text-lg font-semibold">Forhåndsvisning</h2>
            <form.Subscribe selector={(state) => state.values}>
              {(values) => <EventPreview event={values} language={editingLanguage} />}
            </form.Subscribe>
          </div>
        </div>
      </form>
    </div>
  )
}

export default App
