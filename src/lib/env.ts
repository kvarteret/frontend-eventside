type ImportMetaWithEnv = ImportMeta & {
    env?: Record<string, string | undefined>
}

const PUBLIC_STORAGE_KEY = "BUN_PUBLIC_FIREBASE_STORAGE_ENABLED"
const LEGACY_STORAGE_KEY = "FIREBASE_STORAGE_ENABLED"

function readEnv(key: string): string | undefined {
    if (typeof process !== "undefined" && process?.env?.[key]) {
        return process.env[key]
    }

    const metaEnv = (import.meta as ImportMetaWithEnv).env
    return metaEnv?.[key]
}

const storageFlag = readEnv(PUBLIC_STORAGE_KEY) ?? readEnv(LEGACY_STORAGE_KEY)

export const isFirebaseStorageEnabled = storageFlag === "true"
