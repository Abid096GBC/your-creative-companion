import { useState } from "react";
import { HeartPulse, Menu, Phone, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, waLink } from "@/lib/site";
import { TrackOrder } from "@/components/TrackOrder";

const LINKS = [
  { href: "/", label: "হোম" },
  { href: "/#services", label: "সেবাসমূহ" },
  { href: "/store", label: "সার্জিক্যাল স্টোর" },
  { href: "/track", label: "অর্ডার ট্র্যাকিং" },
  { href: "/#contact", label: "যোগাযোগ" },
  { href: "/worker", label: "নার্স পোর্টাল" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="/" className="flex items-center gap-2">
          <span className="gradient-primary flex size-9 items-center justify-center rounded-xl text-primary-foreground shadow-glow">
            <HeartPulse className="size-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-primary">{SITE.name}</span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <TrackOrder />
          <Button asChild variant="whatsapp" size="sm">
            <a href={waLink("Hello Shushrusha, I would like to book a service.")} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> WhatsApp Booking
            </a>
          </Button>
          <Button asChild variant="softOutline" size="sm">
            <a href={`tel:${SITE.phone}`}>
              <Phone /> Call Now
            </a>
          </Button>
        </div>

        <button
          type="button"
          aria-label="মেনু"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-border p-2 text-primary lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-card px-4 py-4 lg:hidden">
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3"><TrackOrder /></div>
          <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
            <Button asChild variant="whatsapp" size="sm">
              <a href={waLink("Hello Shushrusha, I would like to book a service.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="softOutline" size="sm">
              <a href={`tel:${SITE.phone}`}>
                <Phone /> Call Now
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
