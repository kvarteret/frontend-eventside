import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { useUser } from "./providers/UserProvider"

export default function Login() {
    const { requestAccessToken, login, submitCode, error, isLoading } = useUser()
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

    return (
        <div className="h-full py-32 flex flex-col items-center gap-10">
            {error && <p style={{ color: "red" }}>{error}</p>}
            {isLoading && <p>Loading...</p>}

            <Card className="flex flex-col w-96 gap-2">
                {step === "email" ? (
                    <>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Email Login</CardTitle>
                            <CardDescription>Please enter internbevis email</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Input
                                type="email"
                                value={email}
                                className={"h-12"}
                                onChange={e => setEmail(e.target.value)}
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
                            <CardTitle className="text-xl font-bold">LOGIN</CardTitle>
                            <CardDescription>
                                Please enter THE CODE, recieved from email, pressing the link does
                                not work
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Input
                                value={token}
                                className={"h-12"}
                                onChange={e => setToken(e.target.value)}
                                placeholder="ZMICH2MR2ZX8QR6H4ISK6SO0U8UQ8MK2"
                            />
                            <Button onClick={handleLogin} className={"h-12"}>
                                Log in
                            </Button>
                        </CardContent>
                    </>
                )}
            </Card>

            <p className="text-gray-400">or</p>

            <Card className="flex flex-col w-96 gap-2">
                <CardHeader>
                    <CardTitle>External? Login with code instead</CardTitle>
                    <CardDescription>Please enter secret code</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Input
                        type="text"
                        value={secretCode}
                        className={"h-12"}
                        onChange={e => setSecretCode(e.target.value)}
                        placeholder="CODE"
                    />
                    <Button onClick={handleSecretCode} className={"h-12 bg-gray-600"}>
                        Submit code
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
