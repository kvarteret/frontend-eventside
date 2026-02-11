import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import type { EventForm, Language } from "@/types"
import { FieldWrapper } from "./FieldWrapper"

const languageLabels = {
    no: {
        publish: "Publiser på norsk",
        name: "Tittel",
        imageCaption: "Blindetekst for bilde",
        intro: "Kort oppsummering",
        article: "Beskrivelse",
        placeholders: {
            name: "Frokostmøte om fusjonen",
            imageCaption: "Studenter spiser pingvin i Teglverket",
            intro: "Vi arrangerer frokostmøte angående fusjonen mellom Studentersamfunnet i Bergen og Kvarteret.",
            article:
                "Det vil bli servert pingvin og pinnsvin til frokost.\n\nVi gleder oss til å se deg!",
        },
    },
    en: {
        publish: "Publish in English",
        name: "Title",
        imageCaption: "Alt-text",
        intro: "Short summary",
        article: "Description",
        placeholders: {
            name: "Breakfast meeting about the fusjonering",
            imageCaption: "Students eating breakfast at Teglverket",
            intro: "We are hosting a breakfast meeting about the fusion between Studentersamfunnet i Bergen and Kvarteret.",
            article: "Penguin and hedgehog will be served.\n\nWe look forward to seeing you!",
        },
    },
}

type LanguageFieldKey = "name" | "imageCaption" | "intro"
const languageTextFields: LanguageFieldKey[] = ["name", "imageCaption", "intro"]

interface LanguageTextFieldProps {
    form: EventForm
    language: Language
    fieldKey: LanguageFieldKey
    label: string
    placeholder?: string
    required?: boolean
}

const LanguageTextField = ({
    form,
    language,
    fieldKey,
    label,
    placeholder,
    required,
}: LanguageTextFieldProps) => (
    <form.Field name={`${language}.${fieldKey}`}>
        {(field: any) => (
            <FieldWrapper label={label}>
                <Input
                    value={field.state.value as string}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                />
            </FieldWrapper>
        )}
    </form.Field>
)

interface LanguageSectionProps {
    form: EventForm
    language: Language
}

export const LanguageSection = ({ form, language }: LanguageSectionProps) => {
    const l = languageLabels[language]

    return (
        <section className="space-y-6">
            <form.Field name={`${language}.available`}>
                {(field: any) => (
                    <div className="flex items-center gap-3">
                        <Input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={field.state.value as boolean}
                            onChange={e => field.handleChange(e.target.checked)}
                        />
                        <Label>{l.publish}</Label>
                    </div>
                )}
            </form.Field>

            {languageTextFields.map(fieldKey => (
                <LanguageTextField
                    key={fieldKey}
                    form={form}
                    language={language}
                    fieldKey={fieldKey}
                    label={l[fieldKey]}
                    placeholder={l.placeholders[fieldKey]}
                    required={language === "no" && (fieldKey === "name" || fieldKey === "intro")}
                />
            ))}

            <form.Field name={`${language}.article`}>
                {(field: any) => (
                    <FieldWrapper label={l.article}>
                        <RichTextEditor
                            value={field.state.value as string}
                            onBlur={field.handleBlur}
                            onChange={field.handleChange}
                            placeholder={l.placeholders.article}
                        />
                    </FieldWrapper>
                )}
            </form.Field>
        </section>
    )
}
