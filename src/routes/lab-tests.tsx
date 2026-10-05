import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, FlaskConical } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { loadProfile } from "@/lib/account-store";
import { savedLocation } from "@/lib/orders-store";
import { QuickCheckout } from "@/components/payment/QuickCheckout";

type LabTest = { id: string; name: string; name_en: string; price: number; partner: string; instructions: string };

export const Route = createFileRoute("/lab-tests")({
  head: () => ({
    meta: [
      { title: "ঘরে বসে ল্যাব টেস্ট | শুশ্রূষা" },
      { name: "description", content: "ল্যাব টেস্ট বেছে নিন, ঘরে বসে স্যাম্পল কালেকশন বুক করুন — বিকাশ বা ক্যাশে পেমেন্ট।" },
      { property: "og:title", content: "ঘরে বসে ল্যাব টেস্ট | শুশ্রূষা" },
      { property: "og:description", content: "বিশ্বস্ত ডায়াগনস্টিক পার্টনারের সাথে হোম স্যাম্পল কালেকশন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LabTestsPage,
});

const SLOTS = ["সকাল ৭-৯", "সকাল ৯-১১", "দুপুর ১২-২", "বিকাল ৩-৫"];

function LabTestsPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<LabTest[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");

  useEffect(() => {
    void supabase
      .from("lab_tests")
      .select("*")
      .order("price")
      .then(({ data }) => setTests((data ?? []) as unknown as LabTest[]));
    const p = loadProfile();
    setName(p.name);
    setPhone(p.phone);
    setAddress(savedLocation());
  }, []);

  const chosen = (tests ?? []).filter((t) => picked.includes(t.id));
  const total = chosen.reduce((n, t) => n + Number(t.price), 0);
  const valid = chosen.length > 0 && name.trim().length > 1 && phone.trim().length > 8 && address.trim().length > 3 && date && slot;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Navbar />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <section>
          <h1 className="text-2xl font-bold text-foreground">ল্যাব টেস্ট — হোম স্যাম্পল কালেকশন</h1>
          <p className="text-sm text-muted-foreground">এক বা একাধিক টেস্ট বেছে নিন</p>
          <ul className="mt-4 space-y-2">
            {tests === null && <li className="text-sm text-muted-foreground">লোড হচ্ছে...</li>}
            {tests?.map((t) => {
              const on = picked.includes(t.id);
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setPicked((v) => (on ? v.filter((x) => x !== t.id) : [...v, t.id]))}
                    className={`flex min-h-14 w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                      on ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                      {on ? <Check className="size-4" /> : <FlaskConical className="size-3.5 text-muted-foreground" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">{t.name_en} • {t.partner}</span>
                      {t.instructions && <span className="mt-1 block text-xs text-accent">ℹ️ {t.instructions}</span>}
                    </span>
                    <span className="shrink-0 font-bold text-primary">৳{t.price}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="card-elevated h-fit space-y-3 p-4 lg:sticky lg:top-20">
          <h2 className="font-bold text-foreground">স্যাম্পল কালেকশন</h2>
          <p className="text-sm text-muted-foreground">{chosen.length} টি টেস্ট • মোট ৳{total}</p>
          <div className="space-y-1.5">
            <Label>রোগীর নাম</Label>
            <Input className="min-h-11" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>ফোন</Label>
            <Input className="min-h-11" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>ঠিকানা</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>তারিখ</Label>
            <Input className="min-h-11" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SLOTS.map((s) => (
              <button key={s} type="button" onClick={() => setSlot(s)} className={`min-h-11 rounded-xl border text-sm ${slot === s ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
          <QuickCheckout
            disabled={!valid}
            label="বুকিং নিশ্চিত করুন"
            onDone={() => void navigate({ to: "/orders" })}
            draft={{
              category: "lab",
              serviceName: chosen.map((t) => t.name).join(", ") || "Lab test",
              date,
              slot,
              patientName: name.trim(),
              patientRelation: "Self",
              address: address.trim(),
              amount: total,
              phone: phone.trim(),
            }}
          />
        </aside>
      </main>
      <Footer />
    </div>
  );
}
