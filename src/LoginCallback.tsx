import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { supabase } from "./lib/services/events"

export default function LoginCallback() {
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        async function verify() {
            const tokenHash = searchParams.get("token_hash")
            const type = searchParams.get("type")

            if (!tokenHash || !type) {
                setError("Invalid or missing confirmation link.")
                return
            }

            const { error } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: type as "email",
            })

            if (error) {
                setError(error.message)
                return
            }

            navigate("/")
        }
        verify()
    }, [])

    return (
        <div>
            {error ? <p className="text-red-400">{error}</p> : <p>Verifying your login...</p>}
        </div>
    )
}
