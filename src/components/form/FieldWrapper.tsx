import { Label } from "@/components/ui/label"

interface FieldWrapperProps {
  label: string
  hint?: string
  children: React.ReactNode
}

export const FieldWrapper = ({ label, hint, children }: FieldWrapperProps) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
    {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
  </div>
)
