import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
    value?: Date
    onChange: (date: Date | undefined) => void
    label?: string
    placeholder?: string
    required?: boolean
    error?: string
}

export function DateTimePicker({
    value,
    onChange,
    label,
    placeholder = "Velg dato og tid",
    required,
    error,
}: DateTimePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [time, setTime] = React.useState(value ? format(value, "HH:mm") : "12:00")

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) {
            onChange(undefined)
            return
        }

        // Parse current time
        const [hours, minutes] = time.split(":").map(Number)

        // Set time on selected date
        const newDate = new Date(date)
        newDate.setHours(hours || 12)
        newDate.setMinutes(minutes || 0)

        onChange(newDate)
        setOpen(false)
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeStr = e.target.value
        setTime(timeStr)

        if (!value || !timeStr) return

        const [hours, minutes] = timeStr.split(":").map(Number)
        if (isNaN(hours!) || isNaN(minutes!)) return

        const newDate = new Date(value)
        newDate.setHours(hours!)
        newDate.setMinutes(minutes!)
        onChange(newDate)
    }

    return (
        <Field>
            {label && (
                <FieldLabel>
                    {label}
                    {required && " *"}
                </FieldLabel>
            )}
            <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "flex-1 justify-start text-left font-normal",
                                !value && "text-muted-foreground",
                            )}
                            aria-invalid={!!error}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {value ? (
                                format(value, "PPP", { locale: nb })
                            ) : (
                                <span>{placeholder}</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar selected={value} onSelect={handleDateSelect} />
                    </PopoverContent>
                </Popover>
                <div className="relative w-32">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="time"
                        value={time}
                        onChange={handleTimeChange}
                        className="pl-9"
                        required={required}
                        aria-invalid={!!error}
                    />
                </div>
            </div>
            {error && <FieldError>{error}</FieldError>}
        </Field>
    )
}
