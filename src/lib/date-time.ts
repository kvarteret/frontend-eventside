import { parseISO } from "date-fns"

export function formatEventDateTimeForApi(value: Date): string {
    return value.toISOString()
}

export function parseEventDateTime(value: string): Date {
    const normalizedValue = value.includes(" ") ? value.replace(" ", "T") : value
    return parseISO(normalizedValue)
}
