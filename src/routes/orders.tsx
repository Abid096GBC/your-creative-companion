import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PackageSearch, Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderTabs } from "@/components/orders/OrderTabs";
import { NurseTrackerModal } from "@/components/orders/NurseTrackerModal";
import {
  ACTIVE_STATUSES,
  loadOrders,
  type LocalOrder,
  type OrderCategory,
} from "@/lib/orders-store";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "আমার অর্ডার | শুশ্রূষা হোম নার্সিং" },
      {
        name: "description",
        content:
          "নার্সিং কেয়ার, ডাক্তার অ্যাপয়েন্টমেন্ট, ল্যাব টেস্ট ও মেডিকেল স্টোর অর্ডারের লাইভ স্ট্যাটাস ও নার্স ট্র্যাকিং।",
      },
      { property: "og:title", content: "আমার অর্ডার | শুশ্রূষা" },
      { property: "og:description", content: "অ্যাক্টিভ ও পুরনো অর্ডার, লাইভ নার্স ট্র্যাকিং এক জায়গায়।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [cat, setCat] = useState<OrderCategory>("nursing");
  const [view, setView] = useState<"active" | "past">("active");
  const [tracking, setTracking] = useState<LocalOrder | null>(null);

  useEffect(() => {
    const sync = () => setOrders(loadOrders());
    sync();
    window.addEventListener("shushrusha:store", sync);
    return () => window.removeEventListener("shushrusha:store", sync);
  }, []);

  const counts = useMemo(() => {
    const base: Record<OrderCategory, number> = { nursing: 0, doctor: 0, lab: 0, store: 0 };
    for (const o of orders) base[o.category] += 1;
    return base;
  }, [orders]);

  const rows = orders.filter(
    (o) =>
      o.category === cat &&
      (view === "active" ? ACTIVE_STATUSES.includes(o.status) : !ACTIVE_STATUSES.includes(o.status)),
  );

  function download(o: LocalOrder) {
    const text = [
      `শুশ্রূষা — Service Summary`,
      `Order: #${o.id}`,
      `Service: ${o.serviceName}`,
      `Patient: ${o.patientRelation} - ${o.patientName}`,
      `Date: ${o.date} ${o.slot}`,
      `Address: ${o.address}`,
      `Payment: ${o.payment}`,
      `Total: BDT ${o.amount}`,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `shushrusha-${o.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">আমার অর্ডার</h1>
            <p className="text-sm text-muted-foreground">My Orders & Service History</p>
          </div>
          <Button variant="hero" className="min-h-11" onClick={() => void navigate({ to: "/booking/nursing" })}>
            <Plus /> নতুন বুকিং
          </Button>
        </header>

        <OrderTabs value={cat} counts={counts} onChange={setCat} />

        <div className="mt-4 flex gap-2 rounded-full border border-border bg-card p-1">
          {(
            [
              { id: "active", label: "চলমান অর্ডার" },
              { id: "past", label: "পুরনো হিস্ট্রি" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setView(f.id)}
              className={`min-h-11 flex-1 rounded-full text-sm font-medium transition-colors ${
                view === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <section className="mt-4 space-y-3">
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <PackageSearch className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">এই ট্যাবে কোনো অর্ডার নেই।</p>
              <Button
                variant="softOutline"
                className="mt-3 min-h-11"
                onClick={() => void navigate({ to: "/booking/nursing" })}
              >
                হোম নার্সিং বুক করুন
              </Button>
            </div>
          ) : (
            rows.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onTrack={setTracking}
                onRebook={() => void navigate({ to: "/booking/nursing" })}
                onDownload={download}
              />
            ))
          )}
        </section>
      </main>
      <NurseTrackerModal order={tracking} open={Boolean(tracking)} onOpenChange={(v) => !v && setTracking(null)} />
      <WhatsAppFab />
      <Footer />
    </div>
  );
}
