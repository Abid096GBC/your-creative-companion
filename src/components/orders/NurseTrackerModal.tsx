import { Check, MessageCircle, Phone, Siren, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SITE, waLink } from "@/lib/site";
import { TIMELINE, timelineIndex, type LocalOrder } from "@/lib/orders-store";

export function NurseTrackerModal({
  order,
  open,
  onOpenChange,
}: {
  order: LocalOrder | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const active = order ? timelineIndex(order.status) : 0;
  const nurse = order?.nurse;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>লাইভ ট্র্যাকিং • #{order?.id}</DialogTitle>
          <DialogDescription>{order?.serviceName}</DialogDescription>
        </DialogHeader>

        {nurse && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {nurse.name.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{nurse.name}</p>
              <p className="truncate text-xs text-muted-foreground">{nurse.qualification}</p>
              <span className="mt-1 inline-block rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                Assigned • নিযুক্ত
              </span>
            </div>
          </div>
        )}

        {nurse?.eta && (
          <p className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">
            <Timer className="size-4 text-primary" /> আনুমানিক পৌঁছানোর সময়: <b>{nurse.eta}</b>
          </p>
        )}

        <ol className="space-y-2">
          {TIMELINE.map((t, i) => (
            <li key={t} className="flex items-center gap-2 text-sm">
              <span
                className={`flex size-6 items-center justify-center rounded-full text-[11px] ${
                  i <= active ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground"
                }`}
              >
                {i <= active ? <Check className="size-3" /> : i + 1}
              </span>
              <span className={i <= active ? "font-medium text-foreground" : "text-muted-foreground"}>{t}</span>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="call" className="min-h-11">
            <a href={`tel:${nurse?.phone ?? SITE.phone}`}>
              <Phone /> কল
            </a>
          </Button>
          <Button asChild variant="whatsapp" className="min-h-11">
            <a href={waLink(`Order #${order?.id} সম্পর্কে জানতে চাই।`)} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> WhatsApp
            </a>
          </Button>
        </div>
        <Button asChild variant="destructive" className="min-h-11 w-full">
          <a href={`tel:${SITE.phone}`}>
            <Siren /> জরুরি সহায়তা
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
