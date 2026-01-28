import * as React from "react"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  required?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  required,
}: DateTimePickerProps) {
  const dateValue = value
    ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
    : ""

  const timeValue = value
    ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    : ""

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value
    if (!dateStr) {
      onChange(undefined)
      return
    }

    const [year, month, day] = dateStr.split("-").map(Number)
    const newDate = value ? new Date(value) : new Date()
    newDate.setFullYear(year!)
    newDate.setMonth(month! - 1)
    newDate.setDate(day!)

    if (!value) {
      newDate.setHours(12)
      newDate.setMinutes(0)
    }

    onChange(newDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value
    if (!timeStr) return

    const [hours, minutes] = timeStr.split(":").map(Number)
    if (isNaN(hours!) || isNaN(minutes!)) return

    const newDate = value ? new Date(value) : new Date()
    newDate.setHours(hours!)
    newDate.setMinutes(minutes!)
    onChange(newDate)
  }

  return (
    <div className="flex gap-2">
      <Input
        type="date"
        value={dateValue}
        onChange={handleDateChange}
        className="flex-1"
        required={required}
      />
      <Input
        type="time"
        value={timeValue}
        onChange={handleTimeChange}
        className="w-28"
        required={required}
      />
    </div>
  )
}
