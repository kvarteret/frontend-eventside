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
                            <p className="text-muted-foreground text-sm">Loading...</p>
                        ) : null}

                        <Card className="flex flex-col gap-2">
                            {step === "email" ? (
                                <>
                                    <CardHeader>
                                        <CardTitle className="font-bold">
                                            Login with email
                                        </CardTitle>
                                        <CardDescription>
                                            Please enter internbevis email
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
                                            Send code
                                        </Button>
                                    </CardContent>
                                </>
                            ) : (
                                <>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold">LOGIN</CardTitle>
                                        <CardDescription>
                                            Please enter the 6 digit code sent to your email.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-2">
                                        <Input
                                            value={token}
                                            className="h-12"
                                            onChange={e => setToken(e.target.value)}
                                            placeholder="123456"
                                        />
                                        <Button onClick={handleLogin} className="h-12">
                                            Log in
                                        </Button>
                                    </CardContent>
                                </>
                            )}
                        </Card>

                        {step !== "token" ? (
                            <p className="text-muted-foreground text-center text-sm">or</p>
                        ) : null}
                        {step !== "token" ? (
                            <Card className="flex flex-col gap-2">
                                <CardHeader>
                                    <CardTitle className="font-bold">Login with code</CardTitle>
                                    <CardDescription>Please enter secret</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    <Input
                                        type="text"
                                        value={secretCode}
                                        className="h-12"
                                        onChange={e => setSecretCode(e.target.value)}
                                        placeholder="Secret"
                                    />
                                    <Button onClick={handleSecretCode} className="h-12">
                                        Submit code
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
