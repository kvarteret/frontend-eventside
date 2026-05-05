import { EventWriteError } from "./_service"

export function getEventId(request: Request): string {
    const id = new URL(request.url).pathname.split("/").filter(Boolean).pop()
    if (!id) {
        throw new EventWriteError("Missing event id.")
    }

    return decodeURIComponent(id)
}
