import { describe, expect, test } from "bun:test"
import { formatEventDateTimeForApi, parseEventDateTime } from "./date-time"

describe("event date time serialization", () => {
    test("preserves an Oslo DST evening across API round-trips", () => {
        const localDate = new Date(2026, 3, 7, 18, 0, 0)
        const serialized = formatEventDateTimeForApi(localDate)
        const parsed = parseEventDateTime(serialized)

        expect(serialized).toBe("2026-04-07T16:00:00.000Z")
        expect(parsed.getFullYear()).toBe(2026)
        expect(parsed.getMonth()).toBe(3)
        expect(parsed.getDate()).toBe(7)
        expect(parsed.getHours()).toBe(18)
        expect(parsed.getMinutes()).toBe(0)
    })

    test("preserves an Oslo standard-time evening across API round-trips", () => {
        const localDate = new Date(2026, 0, 5, 18, 0, 0)
        const serialized = formatEventDateTimeForApi(localDate)
        const parsed = parseEventDateTime(serialized)

        expect(serialized).toBe("2026-01-05T17:00:00.000Z")
        expect(parsed.getFullYear()).toBe(2026)
        expect(parsed.getMonth()).toBe(0)
        expect(parsed.getDate()).toBe(5)
        expect(parsed.getHours()).toBe(18)
        expect(parsed.getMinutes()).toBe(0)
    })
})
