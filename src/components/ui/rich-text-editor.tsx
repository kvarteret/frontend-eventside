import Quill from "quill"
import { useEffect, useRef } from "react"
import "quill/dist/quill.snow.css"
import { cn } from "@/lib/utils"

const toolbarOptions = [
    ["bold", "italic", "underline", "strike", "link"],
    [{ list: "ordered" }, { list: "bullet" }],
]
const enabledFormats = ["bold", "italic", "underline", "strike", "link", "list"]

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    onBlur?: () => void
    placeholder?: string
    className?: string
}

const normalizeHtml = (html: string) => {
    const trimmed = html.trim()
    return trimmed === "<p><br></p>" ? "" : trimmed
}

const normalizeUrl = (url: string): string | null => {
    const trimmed = url.trim()
    if (!trimmed) {
        return null
    }

    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)
    const candidate = hasProtocol ? trimmed : `https://${trimmed}`

    try {
        const parsed = new URL(candidate)
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return null
        }
        return parsed.toString()
    } catch {
        return null
    }
}

export function RichTextEditor({
    value,
    onChange,
    onBlur,
    placeholder,
    className,
}: RichTextEditorProps) {
    const hostRef = useRef<HTMLDivElement | null>(null)
    const quillRef = useRef<Quill | null>(null)
    const onChangeRef = useRef(onChange)
    const onBlurRef = useRef(onBlur)

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
        onBlurRef.current = onBlur
    }, [onBlur])

    useEffect(() => {
        if (!hostRef.current || quillRef.current) {
            return
        }

        const host = hostRef.current
        host.innerHTML = ""

        const editorElement = document.createElement("div")
        host.append(editorElement)

        const quill = new Quill(editorElement, {
            theme: "snow",
            placeholder,
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: {
                        link(this: { quill: Quill }, active: boolean) {
                            if (!active) {
                                this.quill.format("link", false, "user")
                                return
                            }

                            const range = this.quill.getSelection()
                            const existingLink = range
                                ? this.quill.getFormat(range).link
                                : undefined

                            const rawUrl = window.prompt(
                                "Skriv inn URL",
                                typeof existingLink === "string" ? existingLink : "https://",
                            )

                            if (rawUrl === null) {
                                return
                            }

                            const nextUrl = normalizeUrl(rawUrl)
                            if (!nextUrl) {
                                return
                            }

                            this.quill.format("link", nextUrl, "user")
                        },
                    },
                },
            },
            formats: enabledFormats,
        })

        const handleTextChange = () => {
            const nextValue = normalizeHtml(quill.root.innerHTML)
            onChangeRef.current(nextValue)
        }

        const handleSelectionChange = (range: unknown) => {
            if (range === null) {
                onBlurRef.current?.()
            }
        }

        quill.on("text-change", handleTextChange)
        quill.on("selection-change", handleSelectionChange)
        quillRef.current = quill

        return () => {
            quill.off("text-change", handleTextChange)
            quill.off("selection-change", handleSelectionChange)
            quillRef.current = null

            host.innerHTML = ""
        }
    }, [placeholder])

    useEffect(() => {
        const quill = quillRef.current
        if (!quill) {
            return
        }

        quill.root.dataset.placeholder = placeholder ?? ""
    }, [placeholder])

    useEffect(() => {
        const quill = quillRef.current
        if (!quill) {
            return
        }

        const editorValue = normalizeHtml(quill.root.innerHTML)
        const nextValue = normalizeHtml(value)

        if (editorValue === nextValue) {
            return
        }

        if (!nextValue) {
            quill.setText("", "silent")
            return
        }

        quill.clipboard.dangerouslyPasteHTML(nextValue, "silent")
    }, [value])

    return <div ref={hostRef} className={cn("rich-text-editor", className)} />
}
