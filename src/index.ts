import { serve } from "bun"
import {
    DELETE as handleEventDelete,
    GET as handleEventGet,
    PATCH as handleEventPatch,
} from "../api/events/[id]"
import { GET as handleEventsGet, POST as handleEventsPost } from "../api/events/index"
import { POST as handleFeedbackPost } from "../api/feedback"
import index from "./index.html"

const server = serve({
    routes: {
        "/api/hello": {
            async GET(req) {
                return Response.json({
                    message: "Hello, world!",
                    method: "GET",
                })
            },
            async PUT(req) {
                return Response.json({
                    message: "Hello, world!",
                    method: "PUT",
                })
            },
        },

        "/api/hello/:name": async req => {
            const name = req.params.name
            return Response.json({
                message: `Hello, ${name}!`,
            })
        },

        "/api/feedback": {
            async POST(req) {
                return handleFeedbackPost(req)
            },
        },

        "/api/events": {
            async GET() {
                return handleEventsGet()
            },
            async POST(req) {
                return handleEventsPost(req)
            },
        },

        "/api/events/:id": {
            async GET(req) {
                return handleEventGet(req)
            },
            async PATCH(req) {
                return handleEventPatch(req)
            },
            async DELETE(req) {
                return handleEventDelete(req)
            },
        },

        // Serve index.html for all unmatched routes.
        "/*": index,
    },

    development: process.env.NODE_ENV !== "production" && {
        // Enable browser hot reloading in development
        hmr: true,

        // Echo console logs from the browser to the server
        console: true,
    },
})

console.log(`🚀 Server running at ${server.url}`)
