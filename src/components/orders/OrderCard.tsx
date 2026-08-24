import { CalendarDays, Download, MapPin, Navigation, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACTIVE_STATUSES,
  CATEGORY_LABEL,
  STATUS_LABEL,
  STATUS_STYLE,
  type LocalOrder,
} from "@/lib/orders-store";

export function OrderCard({
  order,
  onTrack,
  onRebook,
  onDownload,
}: {
  order: LocalOrder;
  onTrack: (o: LocalOrder) => void;
  onRebook: (o: LocalOrder) => void;
  onDownload: (o: LocalOrder) => void;
}) {
  const isActive = ACTIVE_STATUSES.includes(order.status);

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-primary">#{order.id}</p>
          <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[order.category]}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </header>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="size-3.5" /> {order.date || "—"} • {order.slot || "—"}
      </p>

      <div className="mt-3 space-y-1 rounded-xl bg-secondary/40 p-3 text-sm">
        <p className="flex items-center gap-1.5 text-foreground">
          <User className="size-3.5 text-primary" />
          <span className="font-medium">
            {order.patientRelation === "Self" ? "Self" : `${order.patientRelation} - ${order.patientName}`}
          </span>
        </p>
        <p className="text-muted-foreground">{order.serviceName}</p>
        {order.address && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" /> {order.address}
          </p>
        )}
        <p className="pt-1 text-base font-bold text-primary">৳{order.amount}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {isActive && order.category === "nursing" ? (
          <Button variant="hero" className="min-h-11 flex-1" onClick={() => onTrack(order)}>
            <Navigation /> সার্ভিস ও নার্স ট্র্যাক করুন
          </Button>
        ) : order.status === "Completed" ? (
          <>
            <Button variant="softOutline" className="min-h-11 flex-1" onClick={() => onDownload(order)}>
              <Download /> সামারি
            </Button>
            <Button variant="hero" className="min-h-11 flex-1" onClick={() => onRebook(order)}>
              <RefreshCw /> আবার বুক করুন
            </Button>
          </>
        ) : (
          <Button variant="softOutline" className="min-h-11 flex-1" onClick={() => onRebook(order)}>
            <RefreshCw /> আবার বুক করুন
          </Button>
        )}
      </div>
    </article>
  );
}
