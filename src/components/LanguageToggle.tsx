import { cn } from "@/lib/utils"
import type { Language } from "@/types"

interface LanguageToggleProps {
  value: Language
  onChange: (lang: Language) => void
}

export const LanguageToggle = ({ value, onChange }: LanguageToggleProps) => (
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => onChange("no")}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-all font-medium",
        value === "no"
          ? "border-primary bg-primary/10 text-primary"
          : "border-muted hover:border-muted-foreground/50"
      )}
    >
      <span className="text-xl">🇳🇴</span>
      Norsk
    </button>
    <button
      type="button"
      onClick={() => onChange("en")}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-all font-medium",
        value === "en"
          ? "border-primary bg-primary/10 text-primary"
          : "border-muted hover:border-muted-foreground/50"
      )}
    >
      <span className="text-xl">🇬🇧</span>
      English
    </button>
  </div>
)
