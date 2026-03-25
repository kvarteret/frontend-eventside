import { useEffect, useMemo, useState } from "react"
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox"
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
import { useUser } from "@/providers/UserProvider"
import type { EventForm } from "@/types"
import { FieldWrapper } from "./FieldWrapper"

interface BasicsSectionProps {
    form: EventForm
}

export const BasicsSection = ({ form }: BasicsSectionProps) => <BasicsSectionContent form={form} />

const normalize = (value: string | null | undefined): string => (value ?? "").trim().toLowerCase()

const BasicsSectionContent = ({ form }: BasicsSectionProps) => {
    const { user } = useUser()
    const [taxonomy, setTaxonomy] = useState<EventTaxonomy | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        const loadTaxonomy = async () => {
            const result = await listEventTaxonomy()

            if (cancelled) {
                return
            }

            if (!result.ok) {
                setError(result.error)
                return
            }

            setTaxonomy(result.data)
            setError(null)
        }

        void loadTaxonomy()

        return () => {
            cancelled = true
        }
    }, [])

    const matchedOrganizerGroups = useMemo(() => {
        if (!taxonomy || !user) {
            return []
        }

        const userGroups = new Set(user.aktiveVerv.map(verv => normalize(verv.gruppe)))
        return taxonomy.organizerGroups.filter(group => userGroups.has(normalize(group.name)))
    }, [taxonomy, user])

    const eventTypeLabelById = useMemo(
        () =>
            new Map((taxonomy?.eventTypes ?? []).map(eventType => [eventType.id, eventType.name])),
        [taxonomy],
    )

    useEffect(() => {
        if (!taxonomy) {
            return
        }

        if (
            form.getFieldValue("organizerGroupIds").length === 0 &&
            matchedOrganizerGroups.length > 0
        ) {
            form.setFieldValue(
                "organizerGroupIds",
                matchedOrganizerGroups.map(group => group.id),
            )
        }

        if (form.getFieldValue("eventTypeId")) {
            return
        }

        const defaultEventTypeId = matchedOrganizerGroups.find(
            group => typeof group.default_event_type_id === "string",
        )?.default_event_type_id

        if (defaultEventTypeId) {
            form.setFieldValue("eventTypeId", defaultEventTypeId)
        }
    }, [form, matchedOrganizerGroups, taxonomy])

    return (
        <section className="space-y-6">
            <form.Field name="eventTypeId">
                {(field: any) => (
                    <FieldWrapper
                        label="Arrangementstype"
                        hint={error ? `Kunne ikke laste arrangementstyper: ${error}` : undefined}
                    >
                        <Select
                            value={field.state.value || undefined}
                            onValueChange={field.handleChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Velg arrangementstype">
                                    {value =>
                                        typeof value === "string"
                                            ? (eventTypeLabelById.get(value) ?? value)
                                            : undefined
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {(taxonomy?.eventTypes ?? []).map(option => (
                                        <SelectItem key={option.id} value={option.id}>
                                            {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </FieldWrapper>
                )}
            </form.Field>

            <form.Field name="organizerGroupIds">
                {(field: any) => (
                    <FieldWrapper label="Arrangørgrupper">
                        <MultiSelectCombobox
                            options={(taxonomy?.organizerGroups ?? []).map(group => ({
                                id: group.id,
                                name: group.name,
                            }))}
                            value={field.state.value}
                            onChange={field.handleChange}
                            placeholder="Velg arrangørgrupper..."
                            searchPlaceholder="Søk etter arrangørgrupper..."
                            emptyText="Fant ingen arrangørgrupper."
                        />
                    </FieldWrapper>
                )}
            </form.Field>
        </section>
    )
}
