import type { User } from "@supabase/supabase-js"
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    clearCode,
    getDeepLinkToken,
    clearDeepLinkToken as storageClearDeepLinkToken,
    saveDeepLinkToken as storageSaveDeepLinkToken,
} from "@/lib/services/auth"
import { supabase } from "@/lib/services/events"

const SECRET_CODE = "KVARTERET1111"

interface UserContextValue {
    user: User | null
    isLoading: boolean
    error: string | null
    guessedCode: boolean
    submitCode: (code: string) => boolean
    logout: () => void
    saveDeepLinkToken: (token: string) => void
    consumeDeepLinkToken: () => string | null
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [guessedCode, setGuessedCode] = useState<boolean>(false)
    const navigate = useNavigate()

    useEffect(() => {
        const restore = async () => {
            try {
                const storedCode = localStorage.getItem("guessedCode")
                if (storedCode === "true") {
                    setGuessedCode(true)
                }

                const {
                    data: { user },
                    error,
                } = await supabase.auth.getUser()

                if (error) {
                    setError(error.message)
                    return
                }

                setUser(user)
            } finally {
                setIsLoading(false)
            }
        }
        restore()
    }, [])

    const submitCode = useCallback((code: string) => {
        if (code === SECRET_CODE) {
            localStorage.setItem("guessedCode", "true")
            setGuessedCode(true)
            return true
        }
        return false
    }, [])

    const logout = useCallback(() => {
        clearCode()
        storageClearDeepLinkToken()
        supabase.auth.signOut()
        setUser(null)
        setError(null)
        navigate("/login")
    }, [])

    const saveDeepLink = useCallback((token: string) => {
        storageSaveDeepLinkToken(token)
    }, [])

    const consumeDeepLink = useCallback(() => {
        const token = getDeepLinkToken()
        if (token) storageClearDeepLinkToken()
        return token
    }, [])

    return (
        <UserContext.Provider
            value={{
                user,
                isLoading,
                error,
                guessedCode,
                submitCode,
                logout,
                saveDeepLinkToken: saveDeepLink,
                consumeDeepLinkToken: consumeDeepLink,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export function useUser(): UserContextValue {
    const ctx = useContext(UserContext)
    if (!ctx) {
        throw new Error("useUser must be used within a <UserProvider>")
    }
    return ctx
}
