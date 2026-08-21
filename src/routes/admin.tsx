import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Loader2, LockKeyhole, RefreshCw, Sparkles, Star, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminAiAssistant,
  adminAssignNurse,
  adminListBookings,
  adminSaveNurse,
  adminSetPayment,
  adminUpdatePrice,
  adminUpdateStatus,
} from "@/lib/bookings.functions";
import {
  NURSE_STATUSES,
  PAYMENT_STATUSES,
  STATUSES,
  type BookingRow,
  type CatalogRow,
  type NurseRow,
} from "@/lib/booking-types";
import { nurseSharePct } from "@/lib/site";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন ড্যাশবোর্ড | শুশ্রূষা বুকিং ম্যানেজমেন্ট" },
      {
        name: "description",
        content: "শুশ্রূষা অ্যাডমিন প্যানেল — বুকিং, নার্স ডিসপ্যাচ, প্রাইসিং ও AI অপারেশন অ্যাসিস্ট্যান্ট।",
      },
      { property: "og:title", content: "শুশ্রূষা অ্যাডমিন ড্যাশবোর্ড" },
      { property: "og:description", content: "বুকিং, নার্স ডিসপ্যাচ ও প্রাইসিং ম্যানেজমেন্ট প্যানেল।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const STATUS_STYLE: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground",
  Confirmed: "bg-secondary text-primary",
  "Nurse Assigned": "bg-accent/20 text-accent-foreground",
  "In Transit": "bg-primary/15 text-primary",
  Completed: "bg-whatsapp/20 text-foreground",
};

const TABS = [
  { id: "bookings", label: "বুকিং ও ডিসপ্যাচ" },
  { id: "nurses", label: "নার্স ডেটাবেজ" },
  { id: "pricing", label: "প্রোডাক্ট ও প্রাইসিং" },
  { id: "ai", label: "AI অ্যাসিস্ট্যান্ট" },
] as const;

function serviceKey(service: string) {
  const s = service.toLowerCase();
  if (s.includes("ইনজেকশন")) return "injection";
  if (s.includes("সেলাই")) return "suturing";
  if (s.includes("ড্রেসিং")) return "dressing";
  if (s.includes("নেবুলাইজার")) return "nebulizer";
  if (s.includes("স্যালাইন")) return "saline";
  if (s.includes("ভাইটাল") || s.includes("রক্তচাপ")) return "vitals";
  if (s.includes("অপারেশন")) return "post-surgery";
  return "other";
}

function recommendNurse(booking: BookingRow, nurses: NurseRow[]): NurseRow | undefined {
  const key = serviceKey(booking.service);
  const scored = nurses
    .filter((n) => n.status !== "Off-Duty")
    .map((n) => {
      let score = Number(n.rating) * 2;
      if (n.specialties?.includes(key)) score += 4;
      if (n.status === "Available") score += 2;
      if (n.area && booking.address.includes(n.area.split(" - ").pop() ?? "###")) score += 3;
      return { n, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.n;
}

function AdminPage() {
  const list = useServerFn(adminListBookings);
  const updateStatus = useServerFn(adminUpdateStatus);
  const assign = useServerFn(adminAssignNurse);
  const setPay = useServerFn(adminSetPayment);
  const saveNurse = useServerFn(adminSaveNurse);
  const updatePrice = useServerFn(adminUpdatePrice);
  const ai = useServerFn(adminAiAssistant);

  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("bookings");
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [nurses, setNurses] = useState<NurseRow[]>([]);
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dispatchFor, setDispatchFor] = useState<BookingRow | null>(null);
  const [aiOut, setAiOut] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const nurseById = useMemo(() => new Map(nurses.map((n) => [n.id, n])), [nurses]);

  async function load(pwd: string) {
    setBusy(true);
    setError("");
    try {
      const data = await list({ data: { password: pwd } });
      setRows(data.bookings);
      setNurses(data.nurses);
      setCatalog(data.catalog);
      setAuthed(true);
    } catch {
      setError("❌ ভুল পাসওয়ার্ড — সঠিক সিকিউরিটি কোড দিন।");
      setAuthed(false);
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await updateStatus({ data: { password, id, status } });
    } catch {
      setError("স্ট্যাটাস আপডেট করা যায়নি।");
    }
  }

  async function doAssign(bookingId: string, nurseId: string) {
    try {
      await assign({ data: { password, id: bookingId, nurseId } });
      setDispatchFor(null);
      await load(password);
    } catch {
      setError("নার্স অ্যাসাইন করা যায়নি।");
    }
  }

  async function doPayment(booking: BookingRow, payment: string, amount: number) {
    try {
      await setPay({ data: { password, id: booking.id, payment, amount } });
      await load(password);
    } catch {
      setError("পেমেন্ট আপডেট করা যায়নি।");
    }
  }

  async function runAi(mode: "summary" | "dispatch" | "chat" | "ocr", extra: Record<string, unknown> = {}) {
    setAiBusy(true);
    setAiOut("");
    try {
      const res = await ai({ data: { password, mode, ...extra } });
      setAiOut(res.text);
    } catch {
      setAiOut("AI রেসপন্স পাওয়া যায়নি — আবার চেষ্টা করুন।");
    } finally {
      setAiBusy(false);
    }
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="card-elevated w-full max-w-sm p-7">
          <span className="gradient-primary flex size-12 items-center justify-center rounded-2xl text-primary-foreground">
            <LockKeyhole className="size-6" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-foreground">অ্যাডমিন লগইন</h1>
          <p className="mt-1 text-sm text-muted-foreground">সিকিউরিটি কোড দিয়ে ড্যাশবোর্ডে প্রবেশ করুন।</p>
          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void load(password);
            }}
          >
            <div>
              <Label htmlFor="pw">পাসওয়ার্ড</Label>
              <Input
                id="pw"
                type="password"
                inputMode="numeric"
                className="mt-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" variant="hero" className="w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} প্রবেশ করুন
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">শুশ্রূষা কন্ট্রোল প্যানেল</h1>
            <p className="text-sm text-muted-foreground">
              {rows.length} বুকিং • {nurses.length} নার্স
            </p>
          </div>
          <Button variant="softOutline" onClick={() => void load(password)} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <RefreshCw />} রিফ্রেশ
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        {tab === "bookings" && (
          <div className="card-elevated mt-6 overflow-x-auto p-0">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Service / Details</th>
                  <th className="px-4 py-3">Nurse</th>
                  <th className="px-4 py-3">Payment & Split</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const nurse = r.nurse_id ? nurseById.get(r.nurse_id) : undefined;
                  return (
                    <tr key={r.id} className="border-t border-border align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-primary">#{r.tracking_id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleString("en-GB")}
                        </p>
                        {r.referral_code && (
                          <p className="mt-1 text-xs font-medium text-accent">Ref: {r.referral_code}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{r.customer_name}</p>
                        <a href={`tel:${r.phone}`} className="text-xs text-accent">
                          {r.phone}
                        </a>
                        <p className="text-xs text-muted-foreground">{r.address}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{r.service}</p>
                        <p className="text-xs text-muted-foreground">
                          {Object.entries(r.details ?? {})
                            .map(([k, v]) => `${k}: ${String(v)}`)
                            .join(" • ")}
                        </p>
                        {r.price_estimate && (
                          <p className="text-xs font-semibold text-primary">{r.price_estimate}</p>
                        )}
                        {r.body_region && (
                          <p className="text-xs text-muted-foreground">
                            {r.body_region}
                            {r.stitch_count ? ` • ${r.stitch_count} সেলাই` : ""}
                          </p>
                        )}
                        {r.notes && <p className="text-xs text-muted-foreground">📝 {r.notes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {nurse ? (
                          <div className="text-xs">
                            <p className="font-semibold text-foreground">{nurse.name}</p>
                            <p className="text-muted-foreground">
                              #{nurse.nurse_code} • ⭐ {Number(nurse.rating).toFixed(1)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">অ্যাসাইন করা হয়নি</p>
                        )}
                        <Button size="sm" variant="softOutline" className="mt-2" onClick={() => setDispatchFor(r)}>
                          <UserPlus /> {nurse ? "রিঅ্যাসাইন" : "Assign Nurse"}
                        </Button>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-medium text-foreground">{r.payment_status}</p>
                        <p className="text-muted-foreground">
                          বিল: ৳{Number(r.amount ?? 0)} • নার্স ৳{Number(r.nurse_share ?? 0)} • প্ল্যাটফর্ম ৳
                          {Number(r.platform_share ?? 0)}
                        </p>
                        <input
                          type="number"
                          defaultValue={Number(r.amount ?? 0)}
                          className="mt-2 w-24 rounded-md border border-border bg-background px-2 py-1"
                          onBlur={(e) => void doPayment(r, r.payment_status, Number(e.target.value))}
                        />
                        <div className="mt-2 flex flex-wrap gap-1">
                          {PAYMENT_STATUSES.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => void doPayment(r, p, Number(r.amount ?? 0))}
                              className={`rounded-md border px-2 py-1 text-[11px] ${
                                r.payment_status === p
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border hover:bg-secondary"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                            STATUS_STYLE[r.status] ?? "bg-muted"
                          }`}
                        >
                          {r.status}
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => void setStatus(r.id, s)}
                              className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                                r.status === s
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border hover:bg-secondary"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="softOutline"
                          className="mt-2"
                          onClick={() => {
                            setTab("ai");
                            void runAi("dispatch", { bookingId: r.id });
                          }}
                        >
                          <Bot /> WhatsApp টেমপ্লেট
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      এখনো কোনো বুকিং নেই।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "nurses" && (
          <NursesTab
            nurses={nurses}
            onSave={async (n) => {
              try {
                await saveNurse({ data: { password, ...n } });
                await load(password);
              } catch {
                setError("নার্স সেভ করা যায়নি।");
              }
            }}
          />
        )}

        {tab === "pricing" && (
          <div className="card-elevated mt-6 overflow-x-auto p-0">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">আইটেম</th>
                  <th className="px-4 py-3">ধরন</th>
                  <th className="px-4 py-3">একক</th>
                  <th className="px-4 py-3">মূল্য (৳)</th>
                </tr>
              </thead>
              <tbody>
                {catalog.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.name_en}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.kind}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.unit}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue={Number(c.price)}
                        className="w-28 rounded-md border border-border bg-background px-2 py-1"
                        onBlur={(e) => {
                          const price = Number(e.target.value);
                          if (price === Number(c.price)) return;
                          void updatePrice({ data: { password, id: c.id, price } }).then(() => load(password));
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "ai" && (
          <div className="card-elevated mt-6 space-y-4 p-5">
            <div className="flex flex-wrap gap-2">
              <Button variant="hero" size="sm" disabled={aiBusy} onClick={() => void runAi("summary")}>
                <Sparkles /> দৈনিক সামারি
              </Button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                📷 প্রেসক্রিপশন OCR
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => void runAi("ocr", { imageData: String(reader.result) });
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <Input
                value={aiPrompt}
                placeholder="Gemini-কে যেকোনো অপারেশনাল প্রশ্ন করুন"
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <Button variant="softOutline" disabled={aiBusy} onClick={() => void runAi("chat", { prompt: aiPrompt })}>
                পাঠান
              </Button>
            </div>
            <div className="min-h-40 whitespace-pre-wrap rounded-xl border border-border bg-secondary/40 p-4 text-sm text-foreground">
              {aiBusy ? "AI লিখছে…" : aiOut || "এখানে AI-এর উত্তর দেখা যাবে।"}
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!dispatchFor} onOpenChange={(v) => !v && setDispatchFor(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>নার্স ডিসপ্যাচ</DialogTitle>
            <DialogDescription>
              {dispatchFor ? `#${dispatchFor.tracking_id} — ${dispatchFor.service}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {dispatchFor &&
              (() => {
                const best = recommendNurse(dispatchFor, nurses);
                return nurses.map((n) => {
                  const pct = nurseSharePct(Number(n.rating));
                  return (
                    <button
                      key={n.id}
                      type="button"
                      disabled={n.status === "Off-Duty"}
                      onClick={() => void doAssign(dispatchFor.id, n.id)}
                      className="w-full rounded-xl border border-border p-3 text-left transition-colors hover:bg-secondary disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">
                          {n.name}{" "}
                          <span className="text-xs font-normal text-muted-foreground">#{n.nurse_code}</span>
                        </span>
                        {best?.id === n.id && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                            ✨ AI Recommended
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <Star className="mr-1 inline size-3 text-accent" />
                        {Number(n.rating).toFixed(1)} • {n.completed_visits} ভিজিট • {n.status} • {n.area ?? "—"}
                      </p>
                      <p className="text-xs text-primary">কমিশন: নার্স {pct}% / প্ল্যাটফর্ম {100 - pct}%</p>
                    </button>
                  );
                });
              })()}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

type NurseForm = {
  id?: string;
  nurse_code: string;
  name: string;
  phone: string;
  rating: number;
  completed_visits: number;
  status: (typeof NURSE_STATUSES)[number];
  area: string;
  specialties: string[];
};

const EMPTY: NurseForm = {
  nurse_code: "",
  name: "",
  phone: "",
  rating: 4,
  completed_visits: 0,
  status: "Available",
  area: "",
  specialties: [],
};

function NursesTab({ nurses, onSave }: { nurses: NurseRow[]; onSave: (n: NurseForm) => Promise<void> }) {
  const [form, setForm] = useState<NurseForm>(EMPTY);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="card-elevated overflow-x-auto p-0">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nurse</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Visits</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Split</th>
            </tr>
          </thead>
          <tbody>
            {nurses.map((n) => (
              <tr key={n.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-left font-medium text-primary"
                    onClick={() =>
                      setForm({
                        id: n.id,
                        nurse_code: n.nurse_code,
                        name: n.name,
                        phone: n.phone,
                        rating: Number(n.rating),
                        completed_visits: n.completed_visits,
                        status: n.status as NurseForm["status"],
                        area: n.area ?? "",
                        specialties: n.specialties ?? [],
                      })
                    }
                  >
                    {n.name}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    #{n.nurse_code} • {n.phone} • {n.area ?? "—"}
                  </p>
                </td>
                <td className="px-4 py-3">⭐ {Number(n.rating).toFixed(1)}</td>
                <td className="px-4 py-3">{n.completed_visits}</td>
                <td className="px-4 py-3 text-xs">{n.status}</td>
                <td className="px-4 py-3 text-xs text-primary">
                  {nurseSharePct(Number(n.rating))}% / {100 - nurseSharePct(Number(n.rating))}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        className="card-elevated space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void onSave(form).then(() => setForm(EMPTY));
        }}
      >
        <h3 className="font-semibold text-foreground">{form.id ? "নার্স আপডেট" : "নতুন নার্স"}</h3>
        <div>
          <Label>Nurse ID</Label>
          <Input
            className="mt-1"
            value={form.nurse_code}
            placeholder="NUR-106"
            onChange={(e) => setForm({ ...form, nurse_code: e.target.value })}
          />
        </div>
        <div>
          <Label>নাম</Label>
          <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label>ফোন</Label>
          <Input className="mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>রেটিং</Label>
            <Input
              className="mt-1"
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>ভিজিট</Label>
            <Input
              className="mt-1"
              type="number"
              value={form.completed_visits}
              onChange={(e) => setForm({ ...form, completed_visits: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <Label>এলাকা</Label>
          <Input className="mt-1" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
        </div>
        <div>
          <Label>স্পেশালিটি (কমা দিয়ে)</Label>
          <Textarea
            className="mt-1"
            value={form.specialties.join(", ")}
            placeholder="injection, saline, dressing"
            onChange={(e) =>
              setForm({
                ...form,
                specialties: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {NURSE_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm({ ...form, status: s })}
              className={`rounded-md border px-3 py-1.5 text-xs ${
                form.status === s ? "border-primary bg-primary text-primary-foreground" : "border-border"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="hero" className="flex-1">
            সেভ করুন
          </Button>
          {form.id && (
            <Button type="button" variant="softOutline" onClick={() => setForm(EMPTY)}>
              নতুন
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
