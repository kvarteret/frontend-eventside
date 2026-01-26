import { Input } from "@/components/ui/input"
import type { EventForm, EventFormValues } from "@/types"
import { FieldWrapper } from "./FieldWrapper"

interface TextFieldConfig {
  name: keyof EventFormValues
  label: string
  type?: string
  placeholder?: string
  required?: boolean
}

const detailsFields: TextFieldConfig[] = [
  { name: "facebookUrl", label: "Lenke til event på Facebook", type: "url" },
  { name: "price", label: "Pris" },
  { name: "ticketsUrl", label: "Lenke til nettside eller billettkjøp", type: "url" },
  { name: "image", label: "Bilde", type: "file" },
]

const timeFields: TextFieldConfig[] = [
  { name: "startTime", label: "Starttid", type: "datetime-local", required: true },
  { name: "endTime", label: "Slutttid", type: "datetime-local", required: true },
]

interface TextFieldProps {
  form: EventForm
  config: TextFieldConfig
}

const TextField = ({ form, config }: TextFieldProps) => (
  <form.Field name={config.name}>
    {(field: any) => (
      <FieldWrapper label={config.label}>
        <Input
          type={config.type}
          placeholder={config.placeholder}
          required={config.required}
          value={config.type === "file" ? undefined : field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </FieldWrapper>
    )}
  </form.Field>
)

interface DetailsSectionProps {
  form: EventForm
}

export const DetailsSection = ({ form }: DetailsSectionProps) => (
  <section className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2">
      {timeFields.map((config) => (
        <TextField key={config.name} form={form} config={config} />
      ))}
    </div>
    {detailsFields.map((config) => (
      <TextField key={config.name} form={form} config={config} />
    ))}
  </section>
)
