import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categoryOptions, organizerOptions, subCategoryOptions } from "@/data/studentbergen-form";
import { cn } from "@/lib/utils";
import "./index.css";

// Types
type Language = "no" | "en";

interface LanguageContent {
  available: boolean;
  name: string;
  imageCaption: string;
  intro: string;
  article: string;
  location: string;
}

interface EventFormValues {
  name: string;
  category: string;
  subCategories: string;
  eventByExtra: string;
  startTime: string;
  endTime: string;
  locationLink: string;
  facebookUrl: string;
  price: string;
  ticketsUrl: string;
  image: string;
  no: LanguageContent;
  en: LanguageContent;
}

interface SelectOption {
  readonly id: number | string;
  readonly name: string;
}

// Initial values
const initialLanguageContent: LanguageContent = {
  available: true,
  name: "",
  imageCaption: "",
  intro: "",
  article: "",
  location: "",
};

const defaultValues: EventFormValues = {
  name: "",
  category: "",
  subCategories: "",
  eventByExtra: "",
  startTime: "",
  endTime: "",
  locationLink: "",
  facebookUrl: "",
  price: "",
  ticketsUrl: "",
  image: "",
  no: { ...initialLanguageContent },
  en: { ...initialLanguageContent },
};

// Components
export const App = () => {
  const [editingLanguage, setEditingLanguage] = useState<Language>("no");

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value);
    },
  });

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Legg til nytt arrangement</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-10"
            >
              <BasicsSection form={form} />

              <LanguageToggle value={editingLanguage} onChange={setEditingLanguage} />

              <LanguageSection form={form} language={editingLanguage} />

              <GeneralSection form={form} />

              <div className="flex justify-end">
                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Publiserer..." : "Publiser arrangementet"}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <form.Subscribe selector={(state) => state.values}>
            {(values) => <EventPreview event={values} language={editingLanguage} />}
          </form.Subscribe>
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormInstance = any;

interface LanguageToggleProps {
  value: Language;
  onChange: (lang: Language) => void;
}

const LanguageToggle = ({ value, onChange }: LanguageToggleProps) => (
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => onChange("no")}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-all font-medium",
        value === "no"
          ? "border-primary bg-primary/10 text-primary"
          : "border-muted hover:border-muted-foreground/50"
      )}
    >
      <span className="text-xl">🇳🇴</span>
      Norsk
    </button>
    <button
      type="button"
      onClick={() => onChange("en")}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-all font-medium",
        value === "en"
          ? "border-primary bg-primary/10 text-primary"
          : "border-muted hover:border-muted-foreground/50"
      )}
    >
      <span className="text-xl">🇬🇧</span>
      English
    </button>
  </div>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <section className="space-y-6">
    <h2 className="text-lg font-semibold">{title}</h2>
    {children}
  </section>
);

interface FieldWrapperProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

const FieldWrapper = ({ label, hint, error, children }: FieldWrapperProps) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
    {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

const TwoColumn = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {left}
    {right}
  </div>
);

interface BasicsSectionProps {
  form: FormInstance;
}

const BasicsSection = ({ form }: BasicsSectionProps) => (
  <section className="space-y-6">
    <form.Field name="name">
      {(field: any) => (
        <FieldWrapper label="Navn">
          <Input
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e: any) => field.handleChange(e.target.value)}
          />
        </FieldWrapper>
      )}
    </form.Field>

    <form.Field name="category">
      {(field: any) => (
        <FieldWrapper label="Kategori">
          <Select value={field.state.value} onValueChange={field.handleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Velg kategori" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option: SelectOption) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      )}
    </form.Field>

    <form.Field name="subCategories">
      {(field: any) => (
        <FieldWrapper label="Andre kategorier">
          <Input
            placeholder="Skriv inn flere kategorier, separert med komma"
            list="subCategories-options"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e: any) => field.handleChange(e.target.value)}
          />
          <datalist id="subCategories-options">
            {subCategoryOptions.map((option) => (
              <option key={option.id} value={`${option.name} (${option.id})`} />
            ))}
          </datalist>
        </FieldWrapper>
      )}
    </form.Field>

    <form.Field name="eventByExtra">
      {(field: any) => (
        <FieldWrapper label="Andre arrangører">
          <Input
            placeholder="Søk eller skriv inn arrangører"
            list="eventByExtra-options"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e: any) => field.handleChange(e.target.value)}
          />
          <datalist id="eventByExtra-options">
            {organizerOptions.map((option) => (
              <option key={option.id} value={`${option.name} (${option.id})`} />
            ))}
          </datalist>
        </FieldWrapper>
      )}
    </form.Field>
  </section>
);

interface LanguageSectionProps {
  form: FormInstance;
  language: Language;
}

const LanguageSection = ({ form, language }: LanguageSectionProps) => {
  const labels = {
    no: {
      title: "Norsk innhold",
      publish: "Publiser på norsk",
      name: "Navn",
      imageCaption: "Bildetekst for hovedbilde",
      intro: "Ingress (kort oppsummering)",
      article: "Tekst om arrangementet",
      articleHint: "Bruk overskrift 3. Ikke bruk fet skrift til mellomoverskrifter.",
      location: "Sted (adresse eller møteplass)",
    },
    en: {
      title: "English content",
      publish: "Publish in English",
      name: "Name",
      imageCaption: "Image caption",
      intro: "Introduction (short summary)",
      article: "Event description",
      articleHint: undefined,
      location: "Location (address or meeting point)",
    },
  };

  const l = labels[language];

  return (
    <Section title={l.title}>
      <form.Field name={`${language}.available`}>
        {(field: any) => (
          <div className="flex items-center gap-3">
            <Input
              type="checkbox"
              className="h-4 w-4"
              checked={field.state.value}
              onChange={(e: any) => field.handleChange(e.target.checked)}
            />
            <Label>{l.publish}</Label>
          </div>
        )}
      </form.Field>

      <form.Field name={`${language}.name`}>
        {(field: any) => (
          <FieldWrapper label={l.name}>
            <Input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e: any) => field.handleChange(e.target.value)}
            />
          </FieldWrapper>
        )}
      </form.Field>

      <form.Field name={`${language}.imageCaption`}>
        {(field: any) => (
          <FieldWrapper label={l.imageCaption}>
            <Input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e: any) => field.handleChange(e.target.value)}
            />
          </FieldWrapper>
        )}
      </form.Field>

      <form.Field name={`${language}.intro`}>
        {(field: any) => (
          <FieldWrapper label={l.intro}>
            <Input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e: any) => field.handleChange(e.target.value)}
              required={language === "no"}
            />
          </FieldWrapper>
        )}
      </form.Field>

      <form.Field name={`${language}.article`}>
        {(field: any) => (
          <FieldWrapper label={l.article} hint={l.articleHint}>
            <Textarea
              rows={6}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e: any) => field.handleChange(e.target.value)}
            />
          </FieldWrapper>
        )}
      </form.Field>

      <form.Field name={`${language}.location`}>
        {(field: any) => (
          <FieldWrapper label={l.location}>
            <Input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e: any) => field.handleChange(e.target.value)}
            />
          </FieldWrapper>
        )}
      </form.Field>
    </Section>
  );
};

interface GeneralSectionProps {
  form: FormInstance;
}

const GeneralSection = ({ form }: GeneralSectionProps) => (
  <Section title="Generelt">
    <TwoColumn
      left={
        <form.Field name="startTime">
          {(field: any) => (
            <FieldWrapper label="Starttid">
              <Input
                type="datetime-local"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e: any) => field.handleChange(e.target.value)}
              />
            </FieldWrapper>
          )}
        </form.Field>
      }
      right={
        <form.Field name="endTime">
          {(field: any) => (
            <FieldWrapper label="Slutttid">
              <Input
                type="datetime-local"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e: any) => field.handleChange(e.target.value)}
              />
            </FieldWrapper>
          )}
        </form.Field>
      }
    />

    <form.Field name="locationLink">
      {(field: any) => (
        <FieldWrapper label="Sted (kartlenke)" hint="Gjør sted-feltet klikkbart dersom lenke er satt.">
          <Input
            type="url"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e: any) => field.handleChange(e.target.value)}
          />
        </FieldWrapper>
      )}
    </form.Field>

    <form.Field name="facebookUrl">
      {(field: any) => (
        <FieldWrapper label="Lenke til event på Facebook">
          <Input
            type="url"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e: any) => field.handleChange(e.target.value)}
          />
        </FieldWrapper>
      )}
    </form.Field>

    <form.Field name="price">
      {(field: any) => (
        <FieldWrapper label="Pris">
          <Input
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e: any) => field.handleChange(e.target.value)}
          />
        </FieldWrapper>
      )}
    </form.Field>

    <form.Field name="ticketsUrl">
      {(field: any) => (
        <FieldWrapper label="Lenke til nettside eller billettkjøp">
          <Input
            type="url"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e: any) => field.handleChange(e.target.value)}
          />
        </FieldWrapper>
      )}
    </form.Field>

    <form.Field name="image">
      {(field: any) => (
        <FieldWrapper label="Bilde">
          <Input
            type="file"
            onBlur={field.handleBlur}
            onChange={(e: any) => field.handleChange(e.target.value)}
          />
        </FieldWrapper>
      )}
    </form.Field>
  </Section>
);

interface EventPreviewProps {
  event: EventFormValues;
  language: Language;
}

const EventPreview = ({ event, language }: EventPreviewProps) => {
  const content = event[language];
  const displayName = content.name || event.name || "Arrangement";
  const hasDate = event.startTime || event.endTime;

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString(language === "no" ? "nb-NO" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">
        {event.image ? (
          <span className="text-sm">Bilde valgt</span>
        ) : (
          <span className="text-sm">Ingen bilde</span>
        )}
      </div>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold">{displayName}</h3>
          {content.imageCaption && (
            <p className="text-sm text-muted-foreground">{content.imageCaption}</p>
          )}
        </div>

        {hasDate && (
          <div className="text-sm text-muted-foreground">
            {event.startTime && <p>{formatDateTime(event.startTime)}</p>}
            {event.endTime && <p className="text-xs">til {formatDateTime(event.endTime)}</p>}
          </div>
        )}

        {content.location && (
          <p className="text-sm">
            <span className="font-medium">{language === "no" ? "Sted:" : "Location:"}</span> {content.location}
          </p>
        )}

        {event.price && (
          <p className="text-sm">
            <span className="font-medium">{language === "no" ? "Pris:" : "Price:"}</span> {event.price}
          </p>
        )}

        {content.intro && (
          <p className="text-sm font-medium">{content.intro}</p>
        )}

        {content.article && (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {content.article}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          {event.ticketsUrl && (
            <Button size="sm" variant="default">
              {language === "no" ? "Kjøp billetter" : "Get tickets"}
            </Button>
          )}
          {event.facebookUrl && (
            <Button size="sm" variant="outline">
              Facebook
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default App;
