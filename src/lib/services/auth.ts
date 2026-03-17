import axios, { AxiosError } from "axios"
import { ERR, OK, type Result, type User } from "./types"

const api = axios.create({
    baseURL: "https://api.kvarteret.no/api/DigitalInternkort",
    headers: { "Content-Type": "application/json" },
})

export function clearCode(): void {
    localStorage.removeItem("guessedCode")
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
