import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"

interface FieldWrapperProps {
  label: string
  hint?: string
  children: React.ReactNode
}

export const FieldWrapper = ({ label, hint, children }: FieldWrapperProps) => (
  <Field>
    <FieldLabel>{label}</FieldLabel>
    {children}
    {hint && <FieldDescription>{hint}</FieldDescription>}
  </Field>
)
