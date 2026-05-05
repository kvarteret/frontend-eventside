import { createEvent, handleEventWriteError, listEvents, readEventFormData } from "./_service.js"

export async function GET(): Promise<Response> {
    try {
        return Response.json({ events: await listEvents() })
    } catch (error) {
        return handleEventWriteError(error)
    }
}

export async function POST(request: Request): Promise<Response> {
    try {
        return Response.json(
            { event: await createEvent(await readEventFormData(request)) },
            { status: 201 },
        )
    } catch (error) {
        return handleEventWriteError(error)
    }
}
