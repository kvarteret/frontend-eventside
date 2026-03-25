import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { FeedbackPanel } from "@/components/feedback-panel"
import { Input } from "@/components/ui/input"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { useUser } from "./providers/UserProvider"

export default function Login() {
    const { requestAccessToken, login, submitCode, error, isLoading, user, guessedCode } = useUser()
    const [email, setEmail] = useState("")
    const [token, setToken] = useState("")
    const [step, setStep] = useState<"email" | "token">("email")
    const [secretCode, setSecretCode] = useState("")
    const navigate = useNavigate()

    const handleSendCode = async () => {
        const sent = await requestAccessToken(email)
        if (sent) {
            setStep("token")
        }
    }

    const onSuccess = (success: boolean) => (success ? navigate("/") : {})
    const handleLogin = async () => onSuccess(await login(email, token))
    const handleSecretCode = () => onSuccess(submitCode(secretCode))

    if (!isLoading && (user || guessedCode)) {
        return <Navigate to="/" replace />
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8">
                    <div className="flex w-full max-w-md flex-col gap-8">
                        {error ? <p className="text-destructive text-sm">{error}</p> : null}
                        {isLoading ? (
                            <p className="text-muted-foreground text-sm">Laster...</p>
                        ) : null}

                        <Card className="flex flex-col gap-2">
                            {step === "email" ? (
                                <>
                                    <CardHeader>
                                        <CardTitle className="font-bold">
                                            Logg inn med e-post
                                        </CardTitle>
                                        <CardDescription>
                                            Skriv inn e-postadressen til internbeviset
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-2">
                                        <Input
                                            type="email"
                                            value={email}
                                            className="h-12"
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                        />
                                        <Button onClick={handleSendCode} className="h-12">
                                            Send kode
                                        </Button>
                                    </CardContent>
                                </>
                            ) : (
                                <>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold">
                                            LOGG INN
                                        </CardTitle>
                                        <CardDescription>
                                            Skriv inn koden du fikk på e-post. Det fungerer ikke å
                                            trykke på lenken.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-2">
                                        <Input
                                            value={token}
                                            className="h-12"
                                            onChange={e => setToken(e.target.value)}
                                            placeholder="ZMICH2MR2ZX8QR6H4ISK6SO0U8UQ8MK2"
                                        />
                                        <Button onClick={handleLogin} className="h-12">
                                            Logg inn
                                        </Button>
                                    </CardContent>
                                </>
                            )}
                        </Card>

                        {step !== "token" ? (
                            <p className="text-muted-foreground text-center text-sm">eller</p>
                        ) : null}
                        {step !== "token" ? (
                            <Card className="flex flex-col gap-2">
                                <CardHeader>
                                    <CardTitle className="font-bold">Logg inn med kode</CardTitle>
                                    <CardDescription>Skriv inn hemmelig kode</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    <Input
                                        type="text"
                                        value={secretCode}
                                        className="h-12"
                                        onChange={e => setSecretCode(e.target.value)}
                                        placeholder="Hemmelig kode"
                                    />
                                    <Button onClick={handleSecretCode} className="h-12">
                                        Send inn kode
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>
                </section>

                <aside className="lg:sticky lg:top-8 lg:self-start">
                    <FeedbackPanel page="/login" />
                </aside>
            </div>
        </main>
    )
}
