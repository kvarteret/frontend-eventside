const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254
const MAX_MESSAGE_LENGTH = 2000
const MAX_PAGE_LENGTH = 120

interface FeedbackPayload {
    email?: unknown
    message?: unknown
    page?: unknown
}

interface NormalizedFeedback {
    email: string | null
    message: string
    page: string
    submittedAt: string
}

interface SlackTextObject {
    type: "plain_text" | "mrkdwn"
    text: string
}

interface SlackBlock {
    type: "header" | "section" | "divider"
    text?: SlackTextObject
    fields?: SlackTextObject[]
}

interface SlackWebhookPayload {
    text: string
    blocks: SlackBlock[]
}

export class FeedbackValidationError extends Error {}

export async function forwardFeedbackToSlack(payload: unknown): Promise<void> {
    const webhookUrl = process.env.SLACK_FEEDBACK_WEBHOOK_URL

    if (!webhookUrl) {
        throw new Error("Missing SLACK_FEEDBACK_WEBHOOK_URL")
    }

    const normalized = normalizeFeedbackPayload(payload)

    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(buildSlackPayload(normalized)),
    })

    if (!response.ok) {
        const body = await response.text()
        throw new Error(
            `Slack webhook request failed with status ${response.status}${body ? `: ${body}` : ""}`,
        )
    }
}

function normalizeFeedbackPayload(payload: unknown): NormalizedFeedback {
    if (!payload || typeof payload !== "object") {
        throw new FeedbackValidationError("Invalid feedback payload.")
    }

    const { email, message, page } = payload as FeedbackPayload

    const normalizedMessage = normalizeRequiredString(message, "Please enter a message.", {
        maxLength: MAX_MESSAGE_LENGTH,
    })
    const normalizedPage =
        normalizeOptionalString(page, { maxLength: MAX_PAGE_LENGTH }) ?? "unknown"
    const normalizedEmail = normalizeOptionalString(email, { maxLength: MAX_EMAIL_LENGTH })

    if (normalizedEmail && !EMAIL_PATTERN.test(normalizedEmail)) {
        throw new FeedbackValidationError("Please enter a valid email address.")
    }

    return {
        email: normalizedEmail,
        message: normalizedMessage,
        page: normalizedPage,
        submittedAt: formatSubmittedAt(new Date()),
    }
}

function normalizeRequiredString(
    value: unknown,
    errorMessage: string,
    options: { maxLength: number },
): string {
    if (typeof value !== "string") {
        throw new FeedbackValidationError(errorMessage)
    }

    const normalized = value.trim()

    if (!normalized) {
        throw new FeedbackValidationError(errorMessage)
    }

    if (normalized.length > options.maxLength) {
        throw new FeedbackValidationError(
            `Message must be ${options.maxLength} characters or less.`,
        )
    }

    return normalized
}

function normalizeOptionalString(value: unknown, options: { maxLength: number }): string | null {
    if (value === undefined || value === null || value === "") {
        return null
    }

    if (typeof value !== "string") {
        throw new FeedbackValidationError("Invalid feedback payload.")
    }

    const normalized = value.trim()

    if (!normalized) {
        return null
    }

    if (normalized.length > options.maxLength) {
        throw new FeedbackValidationError(`Input must be ${options.maxLength} characters or less.`)
    }

    return normalized
}

function buildSlackPayload(feedback: NormalizedFeedback): SlackWebhookPayload {
    const emailValue = feedback.email ? escapeSlack(feedback.email) : "_Ikke oppgitt_"

    return {
        text: `Ny tilbakemelding fra ${feedback.page}`,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "Ny tilbakemelding til E-tjenesten",
                },
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Side*\n${escapeSlack(feedback.page)}`,
                    },
                    {
                        type: "mrkdwn",
                        text: `*E-post*\n${emailValue}`,
                    },
                    {
                        type: "mrkdwn",
                        text: `*Sendt*\n${escapeSlack(feedback.submittedAt)}`,
                    },
                ],
            },
            {
                type: "divider",
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Melding*\n${escapeSlack(feedback.message)}`,
                },
            },
        ],
    }
}

function escapeSlack(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

function formatSubmittedAt(date: Date): string {
    return new Intl.DateTimeFormat("nb-NO", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Oslo",
    }).format(date)
}
