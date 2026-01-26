import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { EventFormValues, Language } from "@/types"

const formatDateTime = (dateStr: string, language: Language) => {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleString(language === "no" ? "nb-NO" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface PreviewImageProps {
  hasImage: boolean
}

const PreviewImage = ({ hasImage }: PreviewImageProps) => (
  <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">
    <span className="text-sm">{hasImage ? "Bilde valgt" : "Ingen bilde"}</span>
  </div>
)

interface PreviewHeaderProps {
  title: string
  caption?: string
}

const PreviewHeader = ({ title, caption }: PreviewHeaderProps) => (
  <div>
    <h3 className="text-xl font-bold">{title}</h3>
    {caption && <p className="text-sm text-muted-foreground">{caption}</p>}
  </div>
)

interface PreviewDateProps {
  startTime?: string
  endTime?: string
  language: Language
}

const PreviewDate = ({ startTime, endTime, language }: PreviewDateProps) => {
  if (!startTime && !endTime) return null
  return (
    <div className="text-sm text-muted-foreground">
      {startTime && <p>{formatDateTime(startTime, language)}</p>}
      {endTime && <p className="text-xs">til {formatDateTime(endTime, language)}</p>}
    </div>
  )
}

interface PreviewDetailProps {
  label: string
  value?: string
}

const PreviewDetail = ({ label, value }: PreviewDetailProps) => {
  if (!value) return null
  return (
    <p className="text-sm">
      <span className="font-medium">{label}</span> {value}
    </p>
  )
}

interface PreviewLinksProps {
  ticketsUrl?: string
  facebookUrl?: string
  language: Language
}

const PreviewLinks = ({ ticketsUrl, facebookUrl, language }: PreviewLinksProps) => {
  if (!ticketsUrl && !facebookUrl) return null
  return (
    <div className="flex gap-2 pt-4">
      {ticketsUrl && (
        <Button size="sm" variant="default">
          {language === "no" ? "Kjøp billetter" : "Get tickets"}
        </Button>
      )}
      {facebookUrl && (
        <Button size="sm" variant="outline">
          Facebook
        </Button>
      )}
    </div>
  )
}

interface EventPreviewProps {
  event: EventFormValues
  language: Language
}

export const EventPreview = ({ event, language }: EventPreviewProps) => {
  const content = event[language]
  const displayName = content.name || event.name || "Arrangement"

  return (
    <Card className="overflow-hidden">
      <PreviewImage hasImage={!!event.image} />
      <CardContent className="p-6 space-y-4">
        <PreviewHeader title={displayName} caption={content.imageCaption} />
        <PreviewDate startTime={event.startTime} endTime={event.endTime} language={language} />
        <PreviewDetail label={language === "no" ? "Sted:" : "Location:"} value={content.location} />
        <PreviewDetail label={language === "no" ? "Pris:" : "Price:"} value={event.price} />
        {content.intro && <p className="text-sm font-medium">{content.intro}</p>}
        {content.article && (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">{content.article}</div>
        )}
        <PreviewLinks ticketsUrl={event.ticketsUrl} facebookUrl={event.facebookUrl} language={language} />
      </CardContent>
    </Card>
  )
}
