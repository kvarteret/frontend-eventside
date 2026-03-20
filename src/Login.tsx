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
            {isLoading && <p>Laster...</p>}

            <Card className="flex flex-col w-96 gap-2">
                {step === "email" ? (
                    <>
                        <CardHeader>
                            <CardTitle className="font-bold">Logg inn med e-post</CardTitle>
                            <CardDescription>
                                Skriv inn e-postadressen til internbeviset
                            </CardDescription>
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
                                Send kode
                            </Button>
                        </CardContent>
                    </>
                ) : (
                    <>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">LOGG INN</CardTitle>
                            <CardDescription>
                                Skriv inn koden du fikk på e-post. Det fungerer ikke å trykke på
                                lenken.
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
                                Logg inn
                            </Button>
                        </CardContent>
                    </>
                )}
            </Card>

            {/* REDUNDANT BUT AVOIDS DIV HELL */}
            {step !== "token" && <p className="text-gray-400">eller</p>}
            {step !== "token" && (
                <Card className="flex flex-col w-96 gap-2">
                    <CardHeader>
                        <CardTitle className="font-bold">Logg inn med kode</CardTitle>
                        <CardDescription>Skriv inn hemmelig kode</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Input
                            type="text"
                            value={secretCode}
                            className={"h-12"}
                            onChange={e => setSecretCode(e.target.value)}
                            placeholder="Hemmelig kode"
                        />
                        <Button onClick={handleSecretCode} className={"h-12"}>
                            Send inn kode
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
