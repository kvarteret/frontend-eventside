import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categoryOptions, organizerOptions, subCategoryOptions } from "@/data/studentbergen-form"
import type { EventForm, EventFormValues } from "@/types"
import { FieldWrapper } from "./FieldWrapper"

interface DatalistFieldConfig {
  name: keyof EventFormValues
  label: string
  placeholder: string
  options: readonly { id: number | string; name: string }[]
}

const datalistFields: DatalistFieldConfig[] = [
  {
    name: "subCategories",
    label: "Andre kategorier",
    placeholder: "Skriv inn flere kategorier, separert med komma",
    options: subCategoryOptions,
  },
  {
    name: "eventByExtra",
    label: "Andre arrangører",
    placeholder: "Søk eller skriv inn arrangører",
    options: organizerOptions,
  },
]

interface DatalistFieldProps {
  form: EventForm
  config: DatalistFieldConfig
}

const DatalistField = ({ form, config }: DatalistFieldProps) => (
  <form.Field name={config.name}>
    {(field: any) => (
      <FieldWrapper label={config.label}>
        <Input
          placeholder={config.placeholder}
          list={`${config.name}-options`}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        />
        <datalist id={`${config.name}-options`}>
          {config.options.map((option) => (
            <option key={option.id} value={`${option.name} (${option.id})`} />
          ))}
        </datalist>
      </FieldWrapper>
    )}
  </form.Field>
)

interface BasicsSectionProps {
  form: EventForm
}

export const BasicsSection = ({ form }: BasicsSectionProps) => (
  <section className="space-y-6">
    <form.Field name="name">
      {(field: any) => (
        <FieldWrapper label="Navn">
          <Input
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        </FieldWrapper>
      )}
    </form.Field>

    <form.Field name="category">
      {(field: any) => (
        <FieldWrapper label="Kategori">
          <Select value={field.state.value} onValueChange={field.handleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Velg kategori" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      )}
    </form.Field>

    {datalistFields.map((config) => (
      <DatalistField key={config.name} form={form} config={config} />
    ))}
  </section>
)
