import { FeedbackValidationError, forwardFeedbackToSlack } from "../src/lib/server/slack-feedback"

/**
 * Handles feedback submissions for Vercel deployments.
 */
export async function POST(request: Request): Promise<Response> {
    try {
        const payload = await request.json()
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
}
