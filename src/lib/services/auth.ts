import axios, { AxiosError } from "axios"
import { ERR, OK, type Result, type User } from "./types"

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

export function saveCredentials(email: string, accessToken: string): void {
    localStorage.setItem("email", email)
    localStorage.setItem("accessToken", accessToken)
}

export function getSavedCredentials(): {
    email: string | null
    accessToken: string | null
} {
    return {
        email: localStorage.getItem("email"),
        accessToken: localStorage.getItem("accessToken"),
    }
}

export function clearCredentials(): void {
    localStorage.removeItem("email")
    localStorage.removeItem("accessToken")
}

export function saveDeepLinkToken(token: string): void {
    localStorage.setItem("deep_link_token", token)
}

export function getDeepLinkToken(): string | null {
    return localStorage.getItem("deep_link_token")
}

export function clearDeepLinkToken(): void {
    localStorage.removeItem("deep_link_token")
}
