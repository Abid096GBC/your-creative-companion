import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { HeartPulse, Menu, Phone, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, waLink } from "@/lib/site";
import { useUnreadInbox } from "@/lib/inbox-store";
import { useActiveOrderCount } from "@/lib/orders-store";

const LINKS = [
  { to: "/", label: "হোম" },
  { to: "/categories", label: "ক্যাটাগরি" },
  { to: "/booking/nursing", label: "নার্সিং বুকিং" },
  { to: "/orders", label: "আমার অর্ডার", badge: "orders" },
  { to: "/inbox", label: "ইনবক্স", badge: "inbox" },
  { to: "/store", label: "সার্জিক্যাল স্টোর" },
  { to: "/worker", label: "নার্স পোর্টাল" },
  { to: "/more", label: "অ্যাকাউন্ট" },
] as const;

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
      {count}
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const unread = useUnreadInbox();
  const activeOrders = useActiveOrderCount();
  const countFor = (badge?: string) => (badge === "inbox" ? unread : badge === "orders" ? activeOrders : 0);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex min-h-11 items-center gap-2">
          <span className="gradient-primary flex size-9 items-center justify-center rounded-xl text-primary-foreground shadow-glow">
            <HeartPulse className="size-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-primary">{SITE.name}</span>
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary"
              >
                {l.label}
                <Badge count={countFor("badge" in l ? l.badge : undefined)} />
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="softOutline" size="sm">
            <Link to="/orders">অর্ডার ট্র্যাক করুন</Link>
          </Button>
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
          className="grid size-11 place-items-center rounded-lg border border-border text-primary lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-card px-4 py-4 lg:hidden">
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {l.label}
                  <Badge count={countFor("badge" in l ? l.badge : undefined)} />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
            <Button asChild variant="whatsapp" size="sm" className="min-h-11">
              <a href={waLink("Hello Shushrusha, I would like to book a service.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="softOutline" size="sm" className="min-h-11">
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
