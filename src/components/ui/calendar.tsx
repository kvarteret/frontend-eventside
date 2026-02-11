"use client"

import * as React from "react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CalendarProps = {
    selected?: Date
    onSelect?: (date: Date | undefined) => void
    disabled?: (date: Date) => boolean
    className?: string
}

export function Calendar({ selected, onSelect, disabled, className }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())

    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const startDate = new Date(monthStart)
    startDate.setDate(startDate.getDate() - monthStart.getDay())

    const endDate = new Date(monthEnd)
    endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()))

    const dates: Date[] = []
    const current = new Date(startDate)
    const maxIterations = 42 // 6 weeks max
    let iterations = 0

    while (current <= endDate && iterations < maxIterations) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 1)
        iterations++
    }

    const weeks: Date[][] = []
    for (let i = 0; i < dates.length; i += 7) {
        weeks.push(dates.slice(i, i + 7))
    }

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const isSelected = (date: Date) => {
        if (!selected) return false
        return (
            date.getDate() === selected.getDate() &&
            date.getMonth() === selected.getMonth() &&
            date.getFullYear() === selected.getFullYear()
        )
    }

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentMonth.getMonth()
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    const isDisabled = (date: Date) => {
        return disabled?.(date) ?? false
    }

    return (
        <div className={cn("p-3", className)}>
            <div className="flex items-center justify-between mb-2">
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={previousMonth}
                    aria-label="Previous month"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="font-medium">
                    {format(currentMonth, "MMMM yyyy", { locale: nb })}
                </div>
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={nextMonth}
                    aria-label="Next month"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"].map(day => (
                            <th
                                key={day}
                                className="text-xs font-normal text-muted-foreground p-0 pb-2 text-center w-9"
                            >
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week, weekIndex) => (
                        <tr key={weekIndex}>
                            {week.map((date, dayIndex) => {
                                const disabled = isDisabled(date)
                                const selected = isSelected(date)
                                const currentMonth = isCurrentMonth(date)
                                const today = isToday(date)

                                return (
                                    <td key={dayIndex} className="p-0 text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => !disabled && onSelect?.(date)}
                                            disabled={disabled}
                                            className={cn(
                                                "w-9 h-9 p-0 font-normal",
                                                !currentMonth && "text-muted-foreground opacity-50",
                                                today && "bg-accent",
                                                selected &&
                                                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                                                disabled && "opacity-30",
                                            )}
                                        >
                                            {date.getDate()}
                                        </Button>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
