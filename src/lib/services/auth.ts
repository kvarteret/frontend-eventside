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

export async function getInternkortInformationByPhone(
    phone: string,
    accessToken: string,
): Promise<Result<User>> {
    try {
        const { data } = await api.post<User>("/GetInternkortInformationByPhone", {
            phone,
            accessToken,
        })
        return OK(data)
    } catch (err) {
        if (err instanceof AxiosError) {
            if (err.response?.status === 401 || err.response?.status === 400) {
                return ERR("Invalid phone number or access token")
            }
            return ERR(`Failed to fetch user information: ${err.response?.status}`)
        }
        return ERR("Network error")
    }
}

export async function loginWithFirebaseToken(
    idToken: string,
): Promise<Result<{ user: User; accessToken: string }>> {
    try {
        const { data } = await api.post<User & { accessToken: string }>("/LoginWithFirebase", {
            idToken,
        })
        const { accessToken, ...user } = data
        if (!accessToken) {
            return ERR("Server did not return an access token")
        }
        return OK({ user: user as User, accessToken })
    } catch (err) {
        if (err instanceof AxiosError) {
            if (err.response?.status === 400) {
                return ERR((err.response.data as string) || "Authentication failed")
            }
            return ERR(`Failed to login with Firebase: ${err.response?.status}`)
        }
        return ERR("Network error")
    }
}

export function saveCredentials(email: string, accessToken: string): void {
    localStorage.setItem("email", email)
    localStorage.setItem("accessToken", accessToken)
    localStorage.removeItem("phone")
}

export function savePhoneCredentials(phone: string, accessToken: string): void {
    localStorage.setItem("phone", phone)
    localStorage.setItem("accessToken", accessToken)
    localStorage.removeItem("email")
}

export function getSavedCredentials(): {
    email: string | null
    phone: string | null
    accessToken: string | null
} {
    return {
        email: localStorage.getItem("email"),
        phone: localStorage.getItem("phone"),
        accessToken: localStorage.getItem("accessToken"),
    }
}

export function clearCredentials(): void {
    localStorage.removeItem("guessedCode")
    localStorage.removeItem("email")
    localStorage.removeItem("phone")
    localStorage.removeItem("accessToken")
}
