import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Minus, Plus, ShoppingCart, Tag } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { listStore, placeStoreOrder, validatePromo } from "@/lib/customer.functions";
import { netPrice, type CatalogRow } from "@/lib/booking-types";
import { BILLING_NOTE } from "@/lib/site";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "সার্জিক্যাল স্টোর | শুশ্রূষা মেডিকেল প্রোডাক্ট" },
      {
        name: "description",
        content: "গজ, ব্যান্ডেজ, হেক্সিসল, বিপি মনিটরসহ সার্জিক্যাল ও মেডিকেল সামগ্রী অর্ডার করুন — ঘরে ডেলিভারি।",
      },
      { property: "og:title", content: "সার্জিক্যাল স্টোর | শুশ্রূষা" },
      { property: "og:description", content: "ডিসকাউন্ট সহ মেডিকেল সামগ্রীর অনলাইন স্টোর।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const load = useServerFn(listStore);
  const checkPromo = useServerFn(validatePromo);
  const order = useServerFn(placeStoreOrder);

  const { data, isLoading } = useQuery({ queryKey: ["store"], queryFn: () => load({}) });
  const items = useMemo(() => (data?.items ?? []) as CatalogRow[], [data]);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [pay, setPay] = useState<"Cash" | "bKash">("Cash");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const lines = items
    .filter((i) => cart[i.id])
    .map((i) => ({ item: i, qty: cart[i.id] ?? 0, unit: netPrice(Number(i.price), Number(i.discount_pct)) }));
  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
  const total = Math.max(0, subtotal - discount);
  const count = lines.reduce((n, l) => n + l.qty, 0);

  function add(id: string, delta: number) {
    setCart((c) => {
      const next = Math.max(0, (c[id] ?? 0) + delta);
      const copy = { ...c };
      if (next === 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
    setDiscount(0);
    setPromoMsg("");
    if (delta > 0) setCartOpen(true);
  }

  async function applyPromo() {
    if (!promo.trim() || subtotal <= 0) return;
    const res = await checkPromo({ data: { code: promo.trim(), subtotal } });
    if (res.ok) {
      setDiscount(res.discount);
      setPromoMsg(`✅ ${res.label} প্রয়োগ হয়েছে`);
    } else {
      setDiscount(0);
      setPromoMsg(`⚠️ ${res.message}`);
    }
  }

  async function checkout() {
    if (!lines.length) return setError("কার্ট খালি");
    if (form.name.trim().length < 2 || form.phone.trim().length < 6 || form.address.trim().length < 4)
      return setError("নাম, ফোন ও ঠিকানা পূরণ করুন");
    setBusy(true);
    setError("");
    try {
      const res = await order({
        data: {
          customer_name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          payment_method: pay,
          promo_code: promo.trim() || undefined,
          items: lines.map((l) => ({ id: l.item.id, qty: l.qty })),
        },
      });
      setDone(res.trackingId);
      setCart({});
    } catch {
      setError("অর্ডার পাঠানো যায়নি — আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">সার্জিক্যাল ও মেডিকেল স্টোর</h1>
        <p className="mt-2 text-muted-foreground">
          প্রয়োজনীয় মেডিকেল সামগ্রী অর্ডার করুন — নার্স ভিজিটের সাথেই পৌঁছে যাবে।
        </p>

        {done ? (
          <div className="card-elevated mx-auto mt-10 max-w-md p-8 text-center">
            <CheckCircle2 className="mx-auto size-12 text-primary" />
            <h2 className="mt-4 text-xl font-bold text-foreground">অর্ডার সফল হয়েছে!</h2>
            <p className="mt-3 text-2xl font-bold text-primary">#{done}</p>
            <Button asChild className="mt-6 w-full" variant="hero">
              <Link to="/track">অর্ডার ট্র্যাক করুন</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8">
            <div>
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="animate-spin" /> লোড হচ্ছে…
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((p) => {
                    const dis = Number(p.discount_pct) > 0;
                    const net = netPrice(Number(p.price), Number(p.discount_pct));
                    return (
                      <article key={p.id} className="card-elevated flex flex-col overflow-hidden">
                        <div className="relative">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            loading="lazy"
                            className="h-36 w-full bg-secondary object-cover"
                            onError={(e) => {
                              const el = e.currentTarget;
                              el.style.display = "none";
                              const fb = el.parentElement?.querySelector<HTMLElement>("[data-fallback]");
                              if (fb) fb.style.display = "flex";
                            }}
                          />
                        ) : (
                          <div className="flex h-36 w-full items-center justify-center bg-secondary text-primary">
                            <ShoppingCart className="size-8" />
                          </div>
                        )}
                        {p.image_url && (
                          <div
                            data-fallback
                            style={{ display: "none" }}
                            className="h-36 w-full items-center justify-center bg-secondary text-primary"
                          >
                            <ShoppingCart className="size-8" />
                          </div>
                        )}
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="text-sm font-semibold text-foreground">{p.name}</h2>
                            {dis && (
                              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-bold text-accent">
                                {Number(p.discount_pct)}% OFF
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{p.name_en}</p>
                          {p.description && (
                            <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                          )}
                          <p className="mt-3 text-lg font-bold text-primary">
                            {dis && <s className="mr-2 text-sm font-medium text-muted-foreground">৳{p.price}</s>}৳{net}
                            <span className="ml-1 text-xs font-medium text-muted-foreground">/ {p.unit}</span>
                          </p>
                          <div className="mt-4 flex items-center gap-2">
                            {cart[p.id] ? (
                              <>
                                <Button size="icon" variant="softOutline" onClick={() => add(p.id, -1)}>
                                  <Minus />
                                </Button>
                                <span className="min-w-8 text-center font-semibold">{cart[p.id]}</span>
                                <Button size="icon" variant="softOutline" onClick={() => add(p.id, 1)}>
                                  <Plus />
                                </Button>
                              </>
                            ) : (
                              <Button variant="softOutline" className="w-full" onClick={() => add(p.id, 1)}>
                                <ShoppingCart /> কার্টে যোগ করুন
                              </Button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="কার্ট খুলুন"
                  className="fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lg transition hover:scale-105"
                >
                  <ShoppingCart className="size-5" />
                  কার্ট
                  {count > 0 && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                      {count}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <ShoppingCart className="size-5 text-primary" /> আপনার কার্ট
                </SheetTitle>
              </SheetHeader>
              {lines.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">কার্ট খালি আছে।</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {lines.map((l) => (
                    <li key={l.item.id} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">
                        {l.item.name} × {l.qty}
                      </span>
                      <span className="font-medium text-foreground">৳{l.unit * l.qty}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 space-y-2">
                <Label htmlFor="promo">প্রমো কোড</Label>
                <div className="flex gap-2">
                  <Input id="promo" value={promo} maxLength={40} placeholder="e.g., ROHIM50" onChange={(e) => setPromo(e.target.value)} />
                  <Button variant="softOutline" onClick={applyPromo}>
                    <Tag /> প্রয়োগ
                  </Button>
                </div>
                {promoMsg && <p className="text-xs text-muted-foreground">{promoMsg}</p>}
              </div>

              <dl className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">সাবটোটাল</dt>
                  <dd>৳{subtotal}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ছাড়</dt>
                  <dd className="text-accent">−৳{discount}</dd>
                </div>
                <div className="flex justify-between text-base font-bold text-primary">
                  <dt>সর্বমোট</dt>
                  <dd>৳{total}</dd>
                </div>
              </dl>

              <div className="mt-4 space-y-3">
                <Input placeholder="আপনার নাম" maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="ফোন নম্বর" inputMode="tel" maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input placeholder="ডেলিভারি ঠিকানা" maxLength={240} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  {(["Cash", "bKash"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPay(m)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                        pay === m ? "border-primary bg-secondary text-primary" : "border-border text-foreground"
                      }`}
                    >
                      {m === "Cash" ? "ক্যাশ অন ডেলিভারি" : "বিকাশ"}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
              <p className="mt-3 text-xs leading-relaxed" style={{ color: "#64748B" }}>
                {BILLING_NOTE}
              </p>
              <Button className="mt-3 w-full" variant="hero" disabled={busy} onClick={checkout}>
                {busy && <Loader2 className="animate-spin" />} অর্ডার কনফার্ম করুন
              </Button>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
