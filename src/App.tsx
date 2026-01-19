import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categoryOptions, organizerOptions, subCategoryOptions } from "@/data/studentbergen-form";
import "./index.css";

export const App = () => (
  <div className="container mx-auto p-6 md:p-10">
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl">Legg til nytt arrangement</CardTitle>
        <CardDescription>Skjemaet er inspirert av StudentBergen sitt arrangementsskjema.</CardDescription>
      </CardHeader>
      <CardContent>{renderForm()}</CardContent>
    </Card>
  </div>
);

const renderForm = () => (
  <form className="space-y-10">
    <BasicsSection />
    <LanguageSection title="Norsk" prefix="" publishLabel="Publiser på norsk" />
    <LanguageSection title="Engelsk" prefix="_en" publishLabel="Publiser på engelsk" />
    <GeneralSection />
    <div className="flex justify-end">
      <Button type="submit">Publiser arrangementet</Button>
    </div>
  </form>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-6">
    <h2 className="text-lg font-semibold">{title}</h2>
    {children}
  </section>
);

const FieldWrapper = ({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
  </div>
);

const InputField = ({
  id,
  label,
  name,
  type = "text",
  placeholder,
  required,
  hint,
}: {
  id: string;
  label: string;
  name?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) => (
  <FieldWrapper id={id} label={label} hint={hint}>
    <Input id={id} name={name ?? id} type={type} placeholder={placeholder} required={required} />
  </FieldWrapper>
);

const TextareaField = ({
  id,
  label,
  name,
  rows = 6,
  hint,
}: {
  id: string;
  label: string;
  name?: string;
  rows?: number;
  hint?: string;
}) => (
  <FieldWrapper id={id} label={label} hint={hint}>
    <Textarea id={id} name={name ?? id} rows={rows} />
  </FieldWrapper>
);

const CheckboxField = ({ id, label }: { id: string; label: string }) => (
  <div className="flex items-center gap-3">
    <Input id={id} name={id} type="checkbox" className="h-4 w-4" />
    <Label htmlFor={id}>{label}</Label>
  </div>
);

const SelectField = ({
  id,
  label,
  placeholder,
  options,
}: {
  id: string;
  label: string;
  placeholder: string;
  options: Array<{ id: number | string; name: string }>;
}) => (
  <FieldWrapper id={id} label={label}>
    <Select>
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

const DatalistField = ({
  id,
  label,
  placeholder,
  options,
}: {
  id: string;
  label: string;
  placeholder: string;
  options: Array<{ id: number; name: string }>;
}) => (
  <FieldWrapper id={id} label={label}>
    <Input id={id} name={id} placeholder={placeholder} list={`${id}-options`} type="text" />
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

const BasicsSection = () => (
  <section className="space-y-6">
    <InputField id="name" label="Navn" />
    <SelectField id="category" label="Kategori" placeholder="Velg kategori" options={categoryOptions} />
    <DatalistField
      id="subCategories"
      label="Andre kategorier"
      placeholder="Skriv inn flere kategorier, separert med komma"
      options={subCategoryOptions}
    />
    <DatalistField
      id="eventByExtra"
      label="Andre arrangører"
      placeholder="Søk eller skriv inn arrangører"
      options={organizerOptions}
    />
  </section>
);

const LanguageSection = ({
  title,
  prefix,
  publishLabel,
}: {
  title: string;
  prefix: "" | "_en";
  publishLabel: string;
}) => {
  const prefixName = prefix ? prefix.replace("_", "") : "";
  const name = (base: string) => (prefixName ? `${base}_${prefixName}` : base);

  return (
    <Section title={title}>
      <CheckboxField id={name("available")} label={publishLabel} />
      <InputField id={name("name")} label="Navn" name={name("name")} />
      <InputField id={name("imageCaption")} label="Bildetekst for hovedbilde" name={name("imageCaption")} />
      <InputField id={name("intro")} label="Ingress (kort oppsummering)" name={name("intro")} required={prefix === ""} />
      <TextareaField
        id={name("article")}
        label="Tekst om arrangementet"
        name={name("article")}
        hint={prefix === "" ? "Bruk overskrift 3. Ikke bruk fet skrift til mellomoverskrifter." : undefined}
      />
      <InputField
        id={prefix === "" ? "location" : "place_en"}
        label="Sted (adresse eller møteplass)"
        name={prefix === "" ? "location" : "place_en"}
      />
    </Section>
  );
};

const GeneralSection = () => (
  <Section title="Generelt">
    <TwoColumn
      left={<InputField id="startTime" label="Starttid" type="datetime-local" required />}
      right={<InputField id="endTime" label="Slutttid" type="datetime-local" required />}
    />
    <InputField
      id="locationLink"
      label="Sted (kartlenke)"
      type="url"
      hint="Gjør sted-feltet klikkbart dersom lenke er satt."
    />
    <InputField id="facebookUrl" label="Lenke til event på Facebook" type="url" />
    <InputField id="price" label="Pris" />
    <InputField id="ticketsUrl" label="Lenke til nettside eller billettkjøp" type="url" />
    <InputField id="image" label="Bilde" type="file" />
  </Section>
);

export default App;
