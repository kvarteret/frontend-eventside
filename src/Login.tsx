// LoginPage.tsx
import { useState } from "react"
import { useUser } from "./providers/UserProvider"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "./components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./components/ui/card"

export default function LoginPage() {
    const { requestAccessToken, login, error, isLoading } = useUser()
    const [email, setEmail] = useState("")
    const [token, setToken] = useState("")
    const [step, setStep] = useState<"email" | "token">("email")
    const navigate = useNavigate()

    const handleSendCode = async () => {
        // Step 1: User enters email, clicks "Send code"
        const sent = await requestAccessToken(email)
        if (sent) {
            setStep("token") // Move to token input
            // User checks email, gets one-time code
        }
        // If !sent, error is in `error` state → display it
    }

    const handleLogin = async () => {
        // Step 2: User enters token, clicks "Log in"
        const success = await login(email, token)
        if (success) {
            // useUser().user is now populated
            // redirect to dashboard
            navigate("/")
        }
        // If !success, error is in `error` state → display it
    }

    return (
        <div className="h-full py-32">
            {error && <p style={{ color: "red" }}>{error}</p>}
            {isLoading && <p>Loading...</p>}

            <Card className="flex flex-col mx-64 gap-2">
                {step === "email" ? (
                    <>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">
                                LOGIN
                            </CardTitle>
                            <CardDescription>
                                Please enter your email
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Input
                                type="email"
                                value={email}
                                className={"h-12"}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                            />
                            <Button onClick={handleSendCode} className={"h-12"}>
                                Send code
                            </Button>
                        </CardContent>
                    </>
                ) : (
                    <>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">
                                LOGIN
                            </CardTitle>
                            <CardDescription>
                                Please enter THE CODE, recieved from email,
                                pressing the link does not work
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Input
                                value={token}
                                className={"h-12"}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="ZMICH2MR2ZX8QR6H4ISK6SO0U8UQ8MK2"
                            />
                            <Button onClick={handleLogin} className={"h-12"}>
                                Log in
                            </Button>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    )
}
