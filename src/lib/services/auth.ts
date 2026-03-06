import axios, { AxiosError } from "axios"
import { ERR, OK, type Result, type User } from "./types"

const STORAGE_KEYS = {
    guessedCode: "guessedCode",
    email: "email",
    accessToken: "accessToken",
    user: "user",
    deepLinkToken: "deep_link_token",
} as const

const api = axios.create({
    baseURL: "https://api.kvarteret.no/api/DigitalInternkort",
    headers: { "Content-Type": "application/json" },
})

export async function requestAccessToken(email: string): Promise<Result<null>> {
    try {
        await api.post("/RequestAccessTokenOnEmail", { email })
        return OK(null)
    } catch (err) {
        if (err instanceof AxiosError) {
            if (err.response?.status === 404) {
                return ERR("Email not found in the database")
            }
            return ERR(`Failed to request access token: ${err.response?.status}`)
        }
        return ERR("Network error")
    }
}

export async function getInternkortInformation(
    email: string,
    accessToken: string,
): Promise<Result<User>> {
    try {
        const { data } = await api.post<User>("/GetInternkortInformation", {
            email,
            accessToken,
        })
        return OK(data)
    } catch (err) {
        if (err instanceof AxiosError) {
            if (err.response?.status === 401) {
                return ERR("Invalid or expired access token")
            }
            if (err.response?.status === 404) {
                return ERR("User not found")
            }
            return ERR(`Failed to fetch user information: ${err.response?.status}`)
        }
        return ERR("Network error")
    }
}

export function saveCredentials(email: string, accessToken: string, user: User): void {
    localStorage.setItem(STORAGE_KEYS.email, email)
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

export function getSavedCredentials(): {
    email: string | null
    accessToken: string | null
} {
    return {
        email: localStorage.getItem(STORAGE_KEYS.email),
        accessToken: localStorage.getItem(STORAGE_KEYS.accessToken),
    }
}

export function getSavedUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    if (!raw) {
        return null
    }

    try {
        return JSON.parse(raw) as User
    } catch {
        localStorage.removeItem(STORAGE_KEYS.user)
        return null
    }
}

export function saveCachedUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

export function clearCredentials(): void {
    localStorage.removeItem(STORAGE_KEYS.guessedCode)
    localStorage.removeItem(STORAGE_KEYS.email)
    localStorage.removeItem(STORAGE_KEYS.accessToken)
    localStorage.removeItem(STORAGE_KEYS.user)
}

export function saveDeepLinkToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.deepLinkToken, token)
}

export function getDeepLinkToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.deepLinkToken)
}

export function clearDeepLinkToken(): void {
    localStorage.removeItem(STORAGE_KEYS.deepLinkToken)
}
