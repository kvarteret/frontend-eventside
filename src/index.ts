import { serve } from "bun"
import index from "./index.html"
import { FeedbackValidationError, forwardFeedbackToSlack } from "./lib/server/slack-feedback"

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
                try {
                    const payload = await req.json()
                    await forwardFeedbackToSlack(payload)
                    return Response.json({ ok: true })
                } catch (error) {
                    if (error instanceof FeedbackValidationError) {
                        return Response.json({ error: error.message }, { status: 400 })
                    }

                    console.error("Failed to send feedback to Slack", error)

                    return Response.json(
                        {
                            error: "Could not send feedback right now. Please try again shortly.",
                        },
                        { status: 500 },
                    )
                }
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
