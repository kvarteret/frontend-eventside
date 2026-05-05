import { useEffect, useMemo, useRef, useState } from "react"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { listEventTaxonomy } from "@/lib/services/events"
import type { EventTaxonomy } from "@/lib/services/types"
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
    { name: "recurringIntervalDays", label: "Gjentas hver X. dag", type: "number" },
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
                    required={config.type === "file" ? !existingImageUrl : config.required}
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

const BooleanField = ({
    form,
    name,
    label,
    hint,
}: {
    form: EventForm
    name: "isInternal" | "isFeatured"
    label: string
    hint?: string
}) => (
    <form.Field name={name}>
        {(field: any) => (
            <FieldWrapper label={label} hint={hint}>
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={field.state.value}
                        onChange={e => field.handleChange(e.target.checked)}
                    />
                    <span>{label}</span>
                </label>
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
    const [taxonomy, setTaxonomy] = useState<EventTaxonomy | null>(null)
    const [taxonomyError, setTaxonomyError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        const loadTaxonomy = async () => {
            const result = await listEventTaxonomy()

            if (cancelled) {
                return
            }

            if (!result.ok) {
                setTaxonomyError(result.error)
                return
            }

            setTaxonomy(result.data)
            setTaxonomyError(null)
        }

        void loadTaxonomy()

        return () => {
            cancelled = true
        }
    }, [])

    const roomLabelById = useMemo(
        () => new Map((taxonomy?.rooms ?? []).map(room => [room.id, room.name])),
        [taxonomy],
    )

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

            <form.Field name="roomId">
                {(field: any) => (
                    <FieldWrapper
                        label="Rom"
                        hint={
                            taxonomyError
                                ? `Kunne ikke laste rom: ${taxonomyError}`
                                : "Velg et navngitt rom, eller bruk feltet for annet rom under."
                        }
                    >
                        <Select
                            value={field.state.value || undefined}
                            onValueChange={value => {
                                const nextValue = value === "__none__" ? "" : value
                                field.handleChange(nextValue)
                                if (nextValue) {
                                    form.setFieldValue("roomText", "")
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Velg rom">
                                    {value =>
                                        typeof value === "string"
                                            ? (roomLabelById.get(value) ?? value)
                                            : undefined
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="__none__">Annet / ikke valgt</SelectItem>
                                    {(taxonomy?.rooms ?? []).map(room => (
                                        <SelectItem key={room.id} value={room.id}>
                                            {room.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </FieldWrapper>
                )}
            </form.Field>

            <form.Field name="roomText">
                {(field: any) => (
                    <FieldWrapper
                        label="Annet rom"
                        hint="Bruk dette bare når arrangementet ikke passer i romlisten."
                    >
                        <Input
                            placeholder="Skriv inn rom eller sted"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={e => {
                                const nextValue = e.target.value
                                field.handleChange(nextValue)
                                if (nextValue.trim()) {
                                    form.setFieldValue("roomId", "")
                                }
                            }}
                        />
                    </FieldWrapper>
                )}
            </form.Field>

            {detailsFields.map(config => (
                <TextField
                    key={config.name}
                    form={form}
                    config={config}
                    existingImageUrl={existingImageUrl}
                />
            ))}
            <div className="grid gap-4 md:grid-cols-2">
                <BooleanField
                    form={form}
                    name="isFeatured"
                    label="Fremhevet arrangement"
                    hint="Hvis flere arrangementer er fremhevet, skal klientene bruke det nærmeste kommende arrangementet."
                />
                <BooleanField
                    form={form}
                    name="isInternal"
                    label="Kun internt"
                    hint="Interne arrangementer skjules på den offentlige nettsiden."
                />
            </div>
            <RemoveImageField form={form} existingImageUrl={existingImageUrl} />
        </section>
    )
}
