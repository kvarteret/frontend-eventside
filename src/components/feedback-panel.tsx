import { type FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { submitFeedback } from "@/lib/services/feedback"

interface FeedbackPanelProps {
    page: string
}

type SubmitState = { kind: "idle"; message: null } | { kind: "success" | "error"; message: string }

export function FeedbackPanel({ page }: FeedbackPanelProps) {
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [submitState, setSubmitState] = useState<SubmitState>({
        kind: "idle",
        message: null,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const trimmedEmail = email.trim()
        const trimmedMessage = message.trim()

        if (!trimmedMessage) {
            setSubmitState({
                kind: "error",
                message: "Du må skrive noe først. Ugetit?.",
            })
            return
        }

        setIsSubmitting(true)
        setSubmitState({ kind: "idle", message: null })

        const result = await submitFeedback({
            email: trimmedEmail || undefined,
            message: trimmedMessage,
            page,
        })

        setIsSubmitting(false)

        if (!result.ok) {
            setSubmitState({
                kind: "error",
                message: result.error,
            })
            return
        }

        setEmail("")
        setMessage("")
        setSubmitState({
            kind: "success",
            message: "Melding sendt!.",
        })
    }

    return (
        <Card className="border-border/80 bg-card/95 gap-5 backdrop-blur supports-backdrop-filter:bg-card/85">
            <CardHeader className="gap-3">
                <div className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                    Feedback
                </div>
                <CardTitle className="text-2xl font-semibold">Gi oss en lyd</CardTitle>
                <CardDescription className="space-y-3 text-sm leading-6">
                    <p>Hallaien 👋</p>
                    <p>
                        E-tjenesten trenger{" "}
                        <span className="font-semibold underline decoration-2 underline-offset-4">
                            din
                        </span>{" "}
                        hjelp til å gjøre en god jobb. Ønsker du noe endret, forbedret, eller
                        fikset? Gi oss en lyd i skjemaet her, så skal vi se på saken.
                    </p>
                    <p>okthxbye 👋</p>
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                        E-post (valgfritt)
                        <Input
                            type="email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            placeholder="navn@example.com"
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-medium">
                        Ris / Ros goes here:
                        <Textarea
                            value={message}
                            onChange={event => setMessage(event.target.value)}
                            placeholder="blahblahblah"
                            className="min-h-36 resize-y"
                        />
                    </label>

                    {submitState.kind !== "idle" ? (
                        <p
                            className={
                                submitState.kind === "success"
                                    ? "text-sm text-emerald-700"
                                    : "text-destructive text-sm"
                            }
                        >
                            {submitState.message}
                        </p>
                    ) : null}

                    <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Sender..." : "Sendt"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
