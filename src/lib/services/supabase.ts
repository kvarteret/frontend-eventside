import { createClient } from "@supabase/supabase-js"

const getProcessEnv = (key: string): string | undefined => {
    if (typeof process === "undefined" || !process.env) {
        return undefined
    }

    return process.env[key]?.trim()
}

const SUPABASE_URL =
    getProcessEnv("VITE_PUBLIC_SUPABASE_URL") ||
    getProcessEnv("BUN_PUBLIC_SUPABASE_URL") ||
    "https://jeezqitchepgwxjknwhz.supabase.co"

const SUPABASE_PUBLISHABLE_KEY =
    getProcessEnv("VITE_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY") ||
    getProcessEnv("BUN_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY") ||
    "sb_publishable_z2eZR6_Ao8Uc8qfmrvNj1A_0AjgALRO"

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

export { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL }
