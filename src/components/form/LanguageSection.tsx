import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { EventForm, Language } from "@/types"
import { FieldWrapper } from "./FieldWrapper"

const languageLabels = {
  no: {
    title: "Norsk innhold",
    publish: "Publiser på norsk",
    name: "Navn",
    imageCaption: "Bildetekst for hovedbilde",
    intro: "Ingress (kort oppsummering)",
    article: "Tekst om arrangementet",
    articleHint: "Bruk overskrift 3. Ikke bruk fet skrift til mellomoverskrifter.",
    location: "Sted (adresse eller møteplass)",
  },
  en: {
    title: "English content",
    publish: "Publish in English",
    name: "Name",
    imageCaption: "Image caption",
    intro: "Introduction (short summary)",
    article: "Event description",
    articleHint: undefined as string | undefined,
    location: "Location (address or meeting point)",
  },
}

type LanguageFieldKey = "name" | "imageCaption" | "intro" | "location"
const languageTextFields: LanguageFieldKey[] = ["name", "imageCaption", "intro", "location"]

interface LanguageTextFieldProps {
  form: EventForm
  language: Language
  fieldKey: LanguageFieldKey
  label: string
  required?: boolean
}

const LanguageTextField = ({ form, language, fieldKey, label, required }: LanguageTextFieldProps) => (
  <form.Field name={`${language}.${fieldKey}`}>
    {(field: any) => (
      <FieldWrapper label={label}>
        <Input
          value={field.state.value as string}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
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
      <h2 className="text-lg font-semibold">{l.title}</h2>

      <form.Field name={`${language}.available`}>
        {(field: any) => (
          <div className="flex items-center gap-3">
            <Input
              type="checkbox"
              className="h-4 w-4"
              checked={field.state.value as boolean}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            <Label>{l.publish}</Label>
          </div>
        )}
      </form.Field>

      {languageTextFields.map((fieldKey) => (
        <LanguageTextField
          key={fieldKey}
          form={form}
          language={language}
          fieldKey={fieldKey}
          label={l[fieldKey]}
          required={fieldKey === "intro" && language === "no"}
        />
      ))}

      <form.Field name={`${language}.article`}>
        {(field: any) => (
          <FieldWrapper label={l.article} hint={l.articleHint}>
            <Textarea
              rows={6}
              value={field.state.value as string}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </FieldWrapper>
        )}
      </form.Field>
    </section>
  )
}
