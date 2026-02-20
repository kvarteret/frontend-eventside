import { useRef } from "react"
import { DateTimePicker } from "@/components/ui/date-time-picker"
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

interface TextFieldProps {
    form: EventForm
    config: TextFieldConfig
    existingImageUrl?: string | null
}

const TextField = ({ form, config, existingImageUrl }: TextFieldProps) => (
    <form.Field name={config.name}>
        {(field: any) => (
            <FieldWrapper
                label={config.label}
                hint={
                    config.type === "file" && existingImageUrl ? (
                        <span>
                            Eksisterende bilde:{" "}
                            <a href={existingImageUrl} target="_blank" rel="noopener noreferrer">
                                åpne bildet
                            </a>
                            . Velg ny fil for å erstatte.
                        </span>
                    ) : undefined
                }
            >
                <Input
                    type={config.type}
                    placeholder={config.placeholder}
                    required={config.required}
                    value={config.type === "file" ? undefined : field.state.value}
                    onBlur={field.handleBlur}
                    accept={config.type === "file" ? "image/*" : undefined}
                    onChange={e => {
                        if (config.type === "file") {
                            const file = e.currentTarget.files?.[0] ?? null
                            field.handleChange(file)
                            if (file) {
                                form.setFieldValue("removeImage", false)
                            }
                            return
                        }
                        field.handleChange(e.target.value)
                    }}
                />
            </FieldWrapper>
        )}
    </form.Field>
)

interface RemoveImageFieldProps {
    form: EventForm
    existingImageUrl?: string | null
}

const RemoveImageField = ({ form, existingImageUrl }: RemoveImageFieldProps) => {
    if (!existingImageUrl) {
        return null
    }

    return (
        <form.Field name="removeImage">
            {(field: any) => (
                <FieldWrapper
                    label="Fjern eksisterende bilde"
                    hint="Velg dette for å slette nåværende bilde ved lagring."
                >
                    <label className="inline-flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={field.state.value}
                            onChange={e => field.handleChange(e.target.checked)}
                        />
                        <span>Slett bildet fra arrangementet</span>
                    </label>
                </FieldWrapper>
            )}
        </form.Field>
    )
}

interface DetailsSectionProps {
    form: EventForm
    existingImageUrl?: string | null
}

export const DetailsSection = ({ form, existingImageUrl }: DetailsSectionProps) => {
    const hasInitializedEndTime = useRef(false)

    return (
        <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <form.Field name="startTime">
                    {(field: any) => (
                        <DateTimePicker
                            label="Starttid"
                            value={field.state.value}
                            required
                            onChange={date => {
                                field.handleChange(date)

                                // Sync end time with start time on first set
                                if (date && !hasInitializedEndTime.current) {
                                    const endTimeField = form.getFieldValue("endTime")
                                    if (!endTimeField) {
                                        const endDate = new Date(date)
                                        endDate.setHours(endDate.getHours() + 2)
                                        form.setFieldValue("endTime", endDate)
                                        hasInitializedEndTime.current = true
                                    }
                                }
                            }}
                        />
                    )}
                </form.Field>

                <form.Field name="endTime">
                    {(field: any) => (
                        <DateTimePicker
                            label="Slutttid"
                            value={field.state.value}
                            required
                            onChange={date => {
                                field.handleChange(date)

                                // Sync start time with end time on first set
                                if (date && !hasInitializedEndTime.current) {
                                    const startTimeField = form.getFieldValue("startTime")
                                    if (!startTimeField) {
                                        const startDate = new Date(date)
                                        startDate.setHours(startDate.getHours() - 2)
                                        form.setFieldValue("startTime", startDate)
                                        hasInitializedEndTime.current = true
                                    }
                                }
                            }}
                        />
                    )}
                </form.Field>
            </div>

            {detailsFields.map(config => (
                <TextField
                    key={config.name}
                    form={form}
                    config={config}
                    existingImageUrl={existingImageUrl}
                />
            ))}
            <RemoveImageField form={form} existingImageUrl={existingImageUrl} />
        </section>
    )
}
