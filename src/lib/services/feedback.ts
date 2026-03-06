import { ERR, OK, type Result } from "@/lib/services/types"

interface FeedbackSubmission {
    email?: string
    message: string
    page: string
}

interface FeedbackErrorResponse {
    error?: string
}

export async function submitFeedback(payload: FeedbackSubmission): Promise<Result<null>> {
    try {
        const response = await fetch("/api/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const body = (await response.json().catch(() => null)) as FeedbackErrorResponse | null
            return ERR(body?.error ?? "Could not send feedback right now. Please try again.")
        }

        return OK(null)
    } catch {
        return ERR("Could not send feedback right now. Please check your connection and try again.")
    }
}
