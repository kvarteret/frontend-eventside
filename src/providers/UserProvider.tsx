import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    requestAccessToken as apiRequestAccessToken,
    clearCredentials,
    getInternkortInformation,
    getInternkortInformationByPhone,
    getSavedCredentials,
    loginWithFirebaseToken,
    saveCredentials,
    savePhoneCredentials,
} from "@/lib/services/auth"
import type { User } from "@/lib/services/types"

const SECRET_CODE = "KVARTERET1111"

interface UserContextValue {
    user: User | null
    isLoading: boolean
    error: string | null
    guessedCode: boolean
    submitCode: (code: string) => boolean
    requestAccessToken: (email: string) => Promise<boolean>
    login: (email: string, accessToken: string) => Promise<boolean>
    loginWithFirebase: (idToken: string, phone: string) => Promise<boolean>
    logout: () => void
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
            const storedCode = localStorage.getItem("guessedCode")
            if (storedCode === "true") {
                setGuessedCode(true)
            }

            const { email, phone, accessToken } = getSavedCredentials()

            if (phone && accessToken) {
                const result = await getInternkortInformationByPhone(phone, accessToken)
                if (result.ok) {
                    setUser(result.data)
                    setIsLoading(false)
                    return
                }
                clearCredentials()
            }

            if (email && accessToken) {
                const result = await getInternkortInformation(email, accessToken)
                if (result.ok) {
                    setUser(result.data)
                } else {
                    clearCredentials()
                }
            }
            setIsLoading(false)
        }
        restore()
    }, [])

    const requestAccessToken = useCallback(async (email: string) => {
        setError(null)
        const result = await apiRequestAccessToken(email)
        if (result.ok) {
            return true
        }
        setError(result.error)
        return false
    }, [])

    const submitCode = useCallback((code: string) => {
        if (code === SECRET_CODE) {
            localStorage.setItem("guessedCode", "true")
            setGuessedCode(true)
            return true
        }
        return false
    }, [])

    const login = useCallback(async (email: string, accessToken: string) => {
        setError(null)
        setIsLoading(true)
        const result = await getInternkortInformation(email, accessToken)
        if (result.ok) {
            saveCredentials(email, accessToken)
            setUser(result.data)
            setIsLoading(false)
            return true
        }
        setError(result.error)
        setIsLoading(false)
        return false
    }, [])

    const loginWithFirebase = useCallback(async (idToken: string, phone: string) => {
        setError(null)
        setIsLoading(true)
        const result = await loginWithFirebaseToken(idToken)
        if (result.ok) {
            savePhoneCredentials(phone, result.data.accessToken)
            setUser(result.data.user)
            setIsLoading(false)
            return true
        }
        setError(result.error)
        setIsLoading(false)
        return false
    }, [])

    const logout = useCallback(() => {
        clearCredentials()
        setUser(null)
        setError(null)
        navigate("/login")
    }, [])

    return (
        <UserContext.Provider
            value={{
                user,
                isLoading,
                error,
                guessedCode,
                submitCode,
                requestAccessToken,
                login,
                loginWithFirebase,
                logout,
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
