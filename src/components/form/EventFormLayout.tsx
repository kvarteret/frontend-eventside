import { useState } from "react"
import { Footer } from "@/components/Footer"
import { BasicsSection } from "@/components/form/BasicsSection"
import { DetailsSection } from "@/components/form/DetailsSection"
import { LanguageSection } from "@/components/form/LanguageSection"
import { LanguageToggle } from "@/components/LanguageToggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"
import type { EventForm, Language } from "@/types"

interface EventFormLayoutProps {
    form: EventForm
    isSubmitting: boolean
    submitLabel: string
    submittingLabel: string
    existingImageUrl?: string | null
}

export function EventFormLayout({
    form,
    isSubmitting,
    submitLabel,
    submittingLabel,
    existingImageUrl,
}: EventFormLayoutProps) {
    const [editingLanguage, setEditingLanguage] = useState<Language>("no")

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <Toaster richColors />
            <form
                onSubmit={e => {
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
                                <LanguageToggle
                                    value={editingLanguage}
                                    onChange={setEditingLanguage}
                                />
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
                            <DetailsSection form={form} existingImageUrl={existingImageUrl} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="submit" disabled={isSubmitting} size="lg">
                            {isSubmitting ? submittingLabel : submitLabel}
                        </Button>
                    </div>
                </div>
            </form>
            <Footer />
        </div>
    )
}
