import { serve } from "bun"
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
