import { MultiSelectCombobox } from "@/components/ui/category-combobox"
import { categoryOptions, organizerOptions } from "@/data/studentbergen-form"
import type { EventForm } from "@/types"
import { FieldWrapper } from "./FieldWrapper"

interface BasicsSectionProps {
    form: EventForm
}

export const BasicsSection = ({ form }: BasicsSectionProps) => (
    <section className="space-y-6">
        <form.Field name="categories">
            {(field: any) => (
                <FieldWrapper label="Kategorier">
                    <MultiSelectCombobox
                        options={categoryOptions}
                        value={field.state.value}
                        onChange={field.handleChange}
                        placeholder="Velg kategorier..."
                        searchPlaceholder="Søk kategorier..."
                        emptyText="Ingen kategorier funnet."
                    />
                </FieldWrapper>
            )}
        </form.Field>

        <form.Field name="organizers">
            {(field: any) => (
                <FieldWrapper label="Medarrangører">
                    <MultiSelectCombobox
                        options={organizerOptions}
                        value={field.state.value}
                        onChange={field.handleChange}
                        placeholder="Velg medarrangører..."
                        searchPlaceholder="Søk arrangører..."
                        emptyText="Ingen arrangører funnet."
                    />
                </FieldWrapper>
            )}
        </form.Field>
    </section>
)
