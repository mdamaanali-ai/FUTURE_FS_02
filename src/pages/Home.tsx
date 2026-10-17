import { trpc } from "@/providers/trpc";
import {
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
  type LeadSource,
} from "@contracts/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";

const services = [
  {
    n: "01",
    title: "Websites",
    desc: "Marketing sites and portfolios that load fast and read well.",
  },
  {
    n: "02",
    title: "Web apps",
    desc: "Dashboards, booking systems and internal tools.",
  },
  {
    n: "03",
    title: "E-commerce",
    desc: "Stores with clean checkout flows and admin control.",
  },
];

export default function Home() {
  const submit = trpc.leads.submit.useMutation();
  const [sent, setSent] = useState(false);
  const [source, setSource] = useState<LeadSource>("website");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
  }>({});

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();

    const errors: typeof fieldErrors = {};
    if (!name) errors.name = "Please tell us your name.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Please enter a valid email address.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    submit.mutate(
      {
        name,
        email,
        phone: String(data.get("phone") || "").trim() || undefined,
        company: String(data.get("company") || "").trim() || undefined,
        message: String(data.get("message") || "").trim() || undefined,
        source,
      },
      {
        onSuccess: () => {
          setSent(true);
          form.reset();
          setSource("website");
        },
      },
    );
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      {/* Top bar */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center bg-cobalt font-mono text-sm font-semibold text-white">
              A
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Atlas Web Studio
            </span>
          </div>
          <Link
            to="/admin"
            className="inline-flex min-h-11 items-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden /> Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-24">
          <div>
            <p className="micro-label text-cobalt">Independent web studio</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              We build websites that bring you clients.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Atlas is a two-person studio designing and developing sites for
              small businesses. Tell us about your project — every inquiry
              lands in our CRM and gets a reply within one business day.
            </p>
            <a
              href="#contact"
              className="mt-8 inline-flex min-h-11 items-center gap-2 bg-cobalt px-6 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-cobalt-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Start a project <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <div className="hidden flex-col justify-end border-l border-border pl-10 md:flex">
            <div className="space-y-8">
              <div>
                <p className="font-mono text-4xl font-semibold">120+</p>
                <p className="micro-label mt-1 text-muted-foreground">
                  Projects shipped
                </p>
              </div>
              <div>
                <p className="font-mono text-4xl font-semibold">24h</p>
                <p className="micro-label mt-1 text-muted-foreground">
                  Response time
                </p>
              </div>
              <div>
                <p className="font-mono text-4xl font-semibold">9 yrs</p>
                <p className="micro-label mt-1 text-muted-foreground">
                  In business
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl md:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.n}
              className="border-b border-border px-4 py-8 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:py-12 md:last:border-r-0"
            >
              <p className="font-mono text-xs text-cobalt">{s.n}</p>
              <h2 className="mt-3 text-lg font-semibold tracking-tight">
                {s.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact form */}
      <section id="contact" className="scroll-mt-8">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-8 md:py-24">
          <div>
            <p className="micro-label text-cobalt">Contact</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Tell us what you're building.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Fill in the form and your message goes straight into our lead
              pipeline. We'll review it and get back to you within one
              business day.
            </p>
          </div>

          <div className="border border-border bg-white p-6 md:p-8">
            {sent ? (
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden />
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  Message received
                </h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Thanks — your inquiry is in our system. We'll reply within one
                  business day.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setSent(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      className="h-11"
                      autoComplete="name"
                      aria-invalid={!!fieldErrors.name}
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-destructive" role="alert">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className="h-11"
                      autoComplete="email"
                      aria-invalid={!!fieldErrors.email}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-destructive" role="alert">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="h-11"
                      autoComplete="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      className="h-11"
                      autoComplete="organization"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="source">How did you hear about us?</Label>
                    <Select
                      value={source}
                      onValueChange={(v) => setSource(v as LeadSource)}
                    >
                      <SelectTrigger id="source" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_SOURCES.map((so) => (
                          <SelectItem key={so} value={so}>
                            {LEAD_SOURCE_LABELS[so]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="message">Project details</Label>
                    <Textarea
                      id="message"
                      name="message"
                      className="min-h-28"
                      placeholder="What are you building, what's the timeline, and what's the rough budget?"
                    />
                  </div>
                </div>
                {submit.isError && (
                  <p className="mt-4 text-sm text-destructive" role="alert">
                    Something went wrong sending your message. Please try
                    again.
                  </p>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 w-full min-h-11 sm:w-auto"
                  disabled={submit.isPending}
                >
                  {submit.isPending ? "Sending…" : "Send message"}
                  {!submit.isPending && (
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 md:px-8">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} Atlas Web Studio
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Powered by LeadDesk CRM
          </p>
        </div>
      </footer>
    </div>
  );
}
