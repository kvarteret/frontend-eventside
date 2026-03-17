import { useState } from "react"
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
import { useUser } from "./providers/UserProvider"
import { supabase } from "./lib/services/events"

export default function Login() {
    const { submitCode, error, isLoading } = useUser()
    const [email, setEmail] = useState("")
    const [step, setStep] = useState<"login" | "verify">("login")
    const [secretCode, setSecretCode] = useState("")
    const navigate = useNavigate()

    const handleSendEmailCode = async () => {
        const { error: signInError } = await supabase.auth.signInWithOtp({
            email: email.toLowerCase(),
            options: {
                shouldCreateUser: false,
                emailRedirectTo: "http://localhost:3000/callback",
            },
        })

        if (signInError) {
            console.log(signInError.message)
            return
        }

        setStep("verify")
    }

    const onSuccess = (success: boolean) => (success ? navigate("/") : {})
    const handleSecretCode = () => onSuccess(submitCode(secretCode))

    return (
        <div className="h-full py-32 flex flex-col items-center gap-10">
            {error && <p style={{ color: "red" }}>{error}</p>}
            {isLoading && <p>Loading...</p>}

            <Card className="flex flex-col w-96 gap-2">
                {step === "login" ? (
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
                                className={"h-12"}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                            />
                            <Button
                                onClick={handleSendEmailCode}
                                className={"h-12"}
                            >
                                Send code
                            </Button>
                        </CardContent>
                    </>
                ) : (
                    <CardHeader>
                        <CardDescription>
                            VERIFICATION LINK SENT TO {email.toUpperCase()}
                        </CardDescription>
                    </CardHeader>
                )}
            </Card>

            {/* REDUNDANT BUT AVOIDS DIV HELL */}
            {step !== "verify" && <p className="text-gray-400">or</p>}
            {step !== "verify" && (
                <Card className="flex flex-col w-96 gap-2">
                    <CardHeader>
                        <CardTitle className="font-bold">
                            Login with code
                        </CardTitle>
                        <CardDescription>Please enter secret</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Input
                            type="text"
                            value={secretCode}
                            className={"h-12"}
                            onChange={(e) => setSecretCode(e.target.value)}
                            placeholder="Secret"
                        />
                        <Button onClick={handleSecretCode} className={"h-12"}>
                            Submit code
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
