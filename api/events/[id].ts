import {
    deleteEvent,
    fetchEventById,
    handleEventWriteError,
    readEventFormData,
    updateEvent,
} from "./_service.js"
import { getEventId } from "./getEventId.js"

export async function GET(request: Request): Promise<Response> {
    try {
        return Response.json({ event: await fetchEventById(getEventId(request)) })
    } catch (error) {
        return handleEventWriteError(error)
    }
}

export async function PATCH(request: Request): Promise<Response> {
    try {
        return Response.json({
            event: await updateEvent(getEventId(request), await readEventFormData(request)),
        })
    } catch (error) {
        return handleEventWriteError(error)
    }
}

export async function DELETE(request: Request): Promise<Response> {
    try {
        await deleteEvent(getEventId(request))
        return Response.json({ ok: true })
    } catch (error) {
        return handleEventWriteError(error)
    }
}
