import { useState } from "react";
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

interface EventFormState {
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

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

interface FieldWrapperProps {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}

interface InputFieldProps {
  id: string;
  label: string;
  name?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  value?: string;
  onChange?: (value: string) => void;
}

interface TextareaFieldProps {
  id: string;
  label: string;
  name?: string;
  rows?: number;
  hint?: string;
  value?: string;
  onChange?: (value: string) => void;
}

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

interface SelectOption {
  readonly id: number | string;
  readonly name: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  placeholder: string;
  options: readonly SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
}

interface DatalistFieldProps {
  id: string;
  label: string;
  placeholder: string;
  options: readonly { readonly id: number; readonly name: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

interface LanguageToggleProps {
  value: Language;
  onChange: (lang: Language) => void;
}

interface LanguageSectionProps {
  language: Language;
  content: LanguageContent;
  onChange: (content: LanguageContent) => void;
}

interface EventPreviewProps {
  event: EventFormState;
  language: Language;
}

// Initial state
const initialLanguageContent: LanguageContent = {
  available: true,
  name: "",
  imageCaption: "",
  intro: "",
  article: "",
  location: "",
};

const initialFormState: EventFormState = {
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
  const [formState, setFormState] = useState<EventFormState>(initialFormState);
  const [editingLanguage, setEditingLanguage] = useState<Language>("no");

  const updateField = <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const updateLanguageContent = (lang: Language, content: LanguageContent) => {
    setFormState(prev => ({ ...prev, [lang]: content }));
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Legg til nytt arrangement</CardTitle>
          </CardHeader>
          <CardContent>
            <EventForm
              formState={formState}
              editingLanguage={editingLanguage}
              onEditingLanguageChange={setEditingLanguage}
              onFieldChange={updateField}
              onLanguageContentChange={updateLanguageContent}
            />
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <EventPreview event={formState} language={editingLanguage} />
        </div>
      </div>
    </div>
  );
};

interface EventFormProps {
  formState: EventFormState;
  editingLanguage: Language;
  onEditingLanguageChange: (lang: Language) => void;
  onFieldChange: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
  onLanguageContentChange: (lang: Language, content: LanguageContent) => void;
}

const EventForm = ({
  formState,
  editingLanguage,
  onEditingLanguageChange,
  onFieldChange,
  onLanguageContentChange,
}: EventFormProps) => (
  <form className="space-y-10">
    <BasicsSection formState={formState} onFieldChange={onFieldChange} />

    <LanguageToggle value={editingLanguage} onChange={onEditingLanguageChange} />

    <LanguageSection
      language={editingLanguage}
      content={formState[editingLanguage]}
      onChange={(content) => onLanguageContentChange(editingLanguage, content)}
    />

    <GeneralSection formState={formState} onFieldChange={onFieldChange} />

    <div className="flex justify-end">
      <Button type="submit">Publiser arrangementet</Button>
    </div>
  </form>
);

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

const Section = ({ title, children }: SectionProps) => (
  <section className="space-y-6">
    <h2 className="text-lg font-semibold">{title}</h2>
    {children}
  </section>
);

const FieldWrapper = ({ id, label, hint, children }: FieldWrapperProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
  </div>
);

const InputField = ({ id, label, name, type = "text", placeholder, required, hint, value, onChange }: InputFieldProps) => (
  <FieldWrapper id={id} label={label} hint={hint}>
    <Input
      id={id}
      name={name ?? id}
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
    />
  </FieldWrapper>
);

const TextareaField = ({ id, label, name, rows = 6, hint, value, onChange }: TextareaFieldProps) => (
  <FieldWrapper id={id} label={label} hint={hint}>
    <Textarea
      id={id}
      name={name ?? id}
      rows={rows}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
    />
  </FieldWrapper>
);

const CheckboxField = ({ id, label, checked, onChange }: CheckboxFieldProps) => (
  <div className="flex items-center gap-3">
    <Input
      id={id}
      name={id}
      type="checkbox"
      className="h-4 w-4"
      checked={checked}
      onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
    />
    <Label htmlFor={id}>{label}</Label>
  </div>
);

const SelectField = ({ id, label, placeholder, options, value, onChange }: SelectFieldProps) => (
  <FieldWrapper id={id} label={label}>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FieldWrapper>
);

const DatalistField = ({ id, label, placeholder, options, value, onChange }: DatalistFieldProps) => (
  <FieldWrapper id={id} label={label}>
    <Input
      id={id}
      name={id}
      placeholder={placeholder}
      list={`${id}-options`}
      type="text"
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
    />
    <datalist id={`${id}-options`}>
      {options.map(option => (
        <option key={option.id} value={`${option.name} (${option.id})`} />
      ))}
    </datalist>
  </FieldWrapper>
);

const TwoColumn = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {left}
    {right}
  </div>
);

interface BasicsSectionProps {
  formState: EventFormState;
  onFieldChange: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
}

const BasicsSection = ({ formState, onFieldChange }: BasicsSectionProps) => (
  <section className="space-y-6">
    <InputField
      id="name"
      label="Navn"
      value={formState.name}
      onChange={(v) => onFieldChange("name", v)}
    />
    <SelectField
      id="category"
      label="Kategori"
      placeholder="Velg kategori"
      options={categoryOptions}
      value={formState.category}
      onChange={(v) => onFieldChange("category", v)}
    />
    <DatalistField
      id="subCategories"
      label="Andre kategorier"
      placeholder="Skriv inn flere kategorier, separert med komma"
      options={subCategoryOptions}
      value={formState.subCategories}
      onChange={(v) => onFieldChange("subCategories", v)}
    />
    <DatalistField
      id="eventByExtra"
      label="Andre arrangører"
      placeholder="Søk eller skriv inn arrangører"
      options={organizerOptions}
      value={formState.eventByExtra}
      onChange={(v) => onFieldChange("eventByExtra", v)}
    />
  </section>
);

const LanguageSection = ({ language, content, onChange }: LanguageSectionProps) => {
  const updateContent = <K extends keyof LanguageContent>(key: K, value: LanguageContent[K]) => {
    onChange({ ...content, [key]: value });
  };

  const labels = {
    no: {
      publish: "Publiser på norsk",
      name: "Navn",
      imageCaption: "Bildetekst for hovedbilde",
      intro: "Ingress (kort oppsummering)",
      article: "Tekst om arrangementet",
      articleHint: "Bruk overskrift 3. Ikke bruk fet skrift til mellomoverskrifter.",
      location: "Sted (adresse eller møteplass)",
    },
    en: {
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
    <Section title={language === "no" ? "Norsk innhold" : "English content"}>
      <CheckboxField
        id={`${language}-available`}
        label={l.publish}
        checked={content.available}
        onChange={(v) => updateContent("available", v)}
      />
      <InputField
        id={`${language}-name`}
        label={l.name}
        value={content.name}
        onChange={(v) => updateContent("name", v)}
      />
      <InputField
        id={`${language}-imageCaption`}
        label={l.imageCaption}
        value={content.imageCaption}
        onChange={(v) => updateContent("imageCaption", v)}
      />
      <InputField
        id={`${language}-intro`}
        label={l.intro}
        value={content.intro}
        onChange={(v) => updateContent("intro", v)}
        required={language === "no"}
      />
      <TextareaField
        id={`${language}-article`}
        label={l.article}
        value={content.article}
        onChange={(v) => updateContent("article", v)}
        hint={l.articleHint}
      />
      <InputField
        id={`${language}-location`}
        label={l.location}
        value={content.location}
        onChange={(v) => updateContent("location", v)}
      />
    </Section>
  );
};

interface GeneralSectionProps {
  formState: EventFormState;
  onFieldChange: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
}

const GeneralSection = ({ formState, onFieldChange }: GeneralSectionProps) => (
  <Section title="Generelt">
    <TwoColumn
      left={
        <InputField
          id="startTime"
          label="Starttid"
          type="datetime-local"
          required
          value={formState.startTime}
          onChange={(v) => onFieldChange("startTime", v)}
        />
      }
      right={
        <InputField
          id="endTime"
          label="Slutttid"
          type="datetime-local"
          required
          value={formState.endTime}
          onChange={(v) => onFieldChange("endTime", v)}
        />
      }
    />
    <InputField
      id="locationLink"
      label="Sted (kartlenke)"
      type="url"
      hint="Gjør sted-feltet klikkbart dersom lenke er satt."
      value={formState.locationLink}
      onChange={(v) => onFieldChange("locationLink", v)}
    />
    <InputField
      id="facebookUrl"
      label="Lenke til event på Facebook"
      type="url"
      value={formState.facebookUrl}
      onChange={(v) => onFieldChange("facebookUrl", v)}
    />
    <InputField
      id="price"
      label="Pris"
      value={formState.price}
      onChange={(v) => onFieldChange("price", v)}
    />
    <InputField
      id="ticketsUrl"
      label="Lenke til nettside eller billettkjøp"
      type="url"
      value={formState.ticketsUrl}
      onChange={(v) => onFieldChange("ticketsUrl", v)}
    />
    <InputField id="image" label="Bilde" type="file" />
  </Section>
);

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
