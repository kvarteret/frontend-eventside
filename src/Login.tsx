import { useCallback, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { useUser } from "./providers/UserProvider"

type LoginMethod = "phone" | "email"
type Step = "input" | "verify"

export default function Login() {
    const { requestAccessToken, login, loginWithFirebase, submitCode, error: ctxError, isLoading } =
        useUser()
    const [method, setMethod] = useState<LoginMethod>("phone")
    const [step, setStep] = useState<Step>("input")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [otpCode, setOtpCode] = useState("")
    const [secretCode, setSecretCode] = useState("")
    const [localError, setLocalError] = useState<string | null>(null)
    const confirmationRef = useRef<ConfirmationResult | null>(null)
    const recaptchaRef = useRef<RecaptchaVerifier | null>(null)
    const navigate = useNavigate()

    const error = localError ?? ctxError

    const setupRecaptcha = useCallback(() => {
        if (!recaptchaRef.current) {
            recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
            })
        }
        return recaptchaRef.current
    }, [])

    const handleSendSms = async () => {
        setLocalError(null)
        try {
            const verifier = setupRecaptcha()
            const result = await signInWithPhoneNumber(auth, phone, verifier)
            confirmationRef.current = result
            setStep("verify")
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : "Failed to send SMS")
            recaptchaRef.current = null
        }
    }

    const handleVerifyOtp = async () => {
        if (!confirmationRef.current) return
        setLocalError(null)
        try {
            const credential = await confirmationRef.current.confirm(otpCode)
            const idToken = await credential.user.getIdToken()
            const success = await loginWithFirebase(idToken, phone)
            if (success) navigate("/")
        } catch {
            setLocalError("Invalid code. Please try again.")
        }
    }

    const handleSendEmailCode = async () => {
        const sent = await requestAccessToken(email)
        if (sent) setStep("verify")
    }

    const handleEmailLogin = async () => {
        const success = await login(email, otpCode)
        if (success) navigate("/")
    }

    const handleSecretCode = () => {
        if (submitCode(secretCode)) navigate("/")
    }

    const switchToEmail = () => {
        setMethod("email")
        setStep("input")
        setOtpCode("")
        setLocalError(null)
        confirmationRef.current = null
    }

    const switchToPhone = () => {
        setMethod("phone")
        setStep("input")
        setOtpCode("")
        setLocalError(null)
        confirmationRef.current = null
    }

    return (
        <div className="h-full py-32 flex flex-col items-center gap-10">
            <div id="recaptcha-container" />
            {error && <p style={{ color: "red" }}>{error}</p>}
            {isLoading && <p>Loading...</p>}

            <Card className="flex flex-col w-96 gap-2">
                {method === "phone" && step === "input" && (
                    <>
                        <CardHeader>
                            <CardTitle className="font-bold">Login with phone</CardTitle>
                            <CardDescription>Enter your Norwegian phone number</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Input
                                type="tel"
                                value={phone}
                                className="h-12"
                                onChange={e => setPhone(e.target.value)}
                                placeholder="+47 XXX XX XXX"
                            />
                            <Button onClick={handleSendSms} className="h-12">
                                Send SMS code
                            </Button>
                            <Button variant="outline" onClick={switchToEmail} className="h-12">
                                Use email instead
                            </Button>
                        </CardContent>
                    </>
                )}

                {method === "phone" && step === "verify" && (
                    <>
                        <CardHeader>
                            <CardTitle className="font-bold">Verify SMS code</CardTitle>
                            <CardDescription>
                                Enter the 6-digit code sent to {phone}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Input
                                value={otpCode}
                                className="h-12 text-center tracking-widest text-lg"
                                inputMode="numeric"
                                maxLength={6}
                                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="123456"
                            />
                            <Button onClick={handleVerifyOtp} className="h-12">
                                Verify
                            </Button>
                            <Button variant="outline" onClick={switchToPhone} className="h-12">
                                Back
                            </Button>
                            <Button variant="outline" onClick={switchToEmail} className="h-12">
                                Use email instead
                            </Button>
                        </CardContent>
                    </>
                )}

                {method === "email" && step === "input" && (
                    <>
                        <CardHeader>
                            <CardTitle className="font-bold">Login with email</CardTitle>
                            <CardDescription>Enter your internbevis email</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Input
                                type="email"
                                value={email}
                                className="h-12"
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@example.com"
                            />
                            <Button onClick={handleSendEmailCode} className="h-12">
                                Send code
                            </Button>
                            <Button variant="outline" onClick={switchToPhone} className="h-12">
                                Use phone instead
                            </Button>
                        </CardContent>
                    </>
                )}

                {method === "email" && step === "verify" && (
                    <>
                        <CardHeader>
                            <CardTitle className="font-bold">Verify code</CardTitle>
                            <CardDescription>
                                Enter the 5-digit code sent to your email
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Input
                                value={otpCode}
                                className="h-12 text-center tracking-widest text-lg"
                                inputMode="numeric"
                                maxLength={5}
                                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="12345"
                            />
                            <Button onClick={handleEmailLogin} className="h-12">
                                Log in
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStep("input")
                                    setOtpCode("")
                                }}
                                className="h-12"
                            >
                                Back
                            </Button>
                        </CardContent>
                    </>
                )}
            </Card>

            {step === "input" && <p className="text-gray-400">or</p>}
            {step === "input" && (
                <Card className="flex flex-col w-96 gap-2">
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
            )}
        </div>
    )
}
