import Link from "next/link";
import { BarChart3, Link2, ShieldCheck, Zap } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

const features = [
  {
    title: "Instant short links",
    description:
      "Create short links in seconds and share them anywhere with a clean, reliable URL.",
    icon: Link2,
  },
  {
    title: "Built-in analytics",
    description:
      "Track clicks and engagement so you can understand what links perform best.",
    icon: BarChart3,
  },
  {
    title: "Secure access",
    description:
      "Your dashboard is protected, keeping link management and metrics private.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 justify-center px-6 py-16">
      <div className="w-full max-w-5xl space-y-16">
        <section className="space-y-6 text-center">
          <p className="inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Fast, simple link management
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Shorten links and measure impact in one place
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Link Shortener helps you create memorable URLs, monitor performance,
            and manage everything from a single dashboard.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
              Open dashboard
            </Link>
          </div>
        </section>

        <section id="features" className="grid gap-4 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h2 className="mb-2 text-lg font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-muted/40 p-8 text-center">
          <div className="mx-auto max-w-2xl space-y-3">
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="size-4 text-primary" aria-hidden="true" />
              Built for speed
            </p>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Start shortening your next link now
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Sign up with Clerk and begin managing all your links from a secure,
              streamlined dashboard.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
