import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  ImageUp,
  MapPin,
  Stethoscope,
  Trash2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fileToCompressedDataUrl } from "@/lib/image-compress";
import { CONVENIENCE_FEE } from "@/lib/site";
import { PatientSelectorModal } from "@/components/booking/PatientSelectorModal";
import { toNursingService } from "@/lib/booking-links";
import {
  loadPatients,
  newTrackingId,
  removePatient,
  saveOrder,
  savedLocation,
  type LocalOrder,
  type Patient,
} from "@/lib/orders-store";

type Item = { id: string; title: string; en: string; price: number; duration: string };

const SERVICES: Item[] = [
  { id: "dressing", title: "ড্রেসিং", en: "Wound Dressing", price: 300, duration: "≈ ৩০ মিনিট" },
  { id: "injection", title: "ইনজেকশন / ক্যানুলা", en: "Injection / Cannula", price: 300, duration: "≈ ২০ মিনিট" },
  { id: "postop", title: "পোস্ট-সার্জারি কেয়ার", en: "Post-Surgery Care", price: 800, duration: "≈ ১ ঘন্টা" },
  { id: "elderly", title: "বয়স্ক সেবা", en: "Elderly Care", price: 1200, duration: "≈ ৪ ঘন্টা শিফট" },
  { id: "physio", title: "ফিজিওথেরাপি", en: "Physiotherapy", price: 700, duration: "≈ ৪৫ মিনিট" },
  { id: "saline", title: "স্যালাইন পুশ / IV সেটআপ", en: "Saline & IV Setup", price: 600, duration: "≈ ১ ঘন্টা" },
  { id: "suturing", title: "সেলাই ও সেলাই কাটা", en: "Suturing / Stitch Removal", price: 300, duration: "≈ ৪৫ মিনিট" },
  { id: "nebulizer", title: "নেবুলাইজার সেবা", en: "Nebulizer", price: 100, duration: "≈ ২০ মিনিট" },
  { id: "vitals", title: "ভাইটাল চেক", en: "Health Vitals Check", price: 100, duration: "≈ ১৫ মিনিট" },
];

const SLOTS = [
  { id: "morning", label: "সকাল / Morning", time: "৮টা – ১২টা" },
  { id: "afternoon", label: "দুপুর / Afternoon", time: "১২টা – ৫টা" },
  { id: "evening", label: "সন্ধ্যা / Evening", time: "৫টা – ১০টা" },
];

const STEPS = ["সার্ভিস", "রোগী", "সময়", "নোট", "পেমেন্ট"];

export function NursingBookingWizard({ initialService }: { initialService?: string | undefined }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>(
    initialService ? [toNursingService(initialService)] : [],
  );
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [payment, setPayment] = useState<"cash" | "wallet">("cash");
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");

  useEffect(() => {
    setPatients(loadPatients());
    setAddress(savedLocation());
  }, []);

  const chosen = useMemo(() => SERVICES.filter((s) => picked.includes(s.id)), [picked]);
  const serviceTotal = chosen.reduce((n, s) => n + s.price, 0);
  const walletDiscount = payment === "wallet" ? Math.round(serviceTotal * 0.05) : 0;
  const total = Math.max(0, serviceTotal + CONVENIENCE_FEE - walletDiscount - applied);
  const patient = patients.find((p) => p.id === patientId);

  const canNext = [
    picked.length > 0,
    Boolean(patientId),
    Boolean(date && slot && address.trim()),
    true,
    true,
  ][step];

  function toggle(id: string) {
    setPicked((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  }

  function applyPromo() {
    const code = promo.trim().toUpperCase();
    if (code === "SHUSHRUSHA50") {
      setApplied(50);
      setPromoMsg("৳৫০ ছাড় প্রয়োগ হয়েছে।");
    } else if (code === "CARE10") {
      setApplied(Math.round(serviceTotal * 0.1));
      setPromoMsg("১০% ছাড় প্রয়োগ হয়েছে।");
    } else {
      setApplied(0);
      setPromoMsg("কোডটি সঠিক নয়।");
    }
  }

  async function onFile(file?: File) {
    if (!file) return;
    setPrescription(await fileToCompressedDataUrl(file));
  }

  function confirm() {
    if (!patient) return;
    const order: LocalOrder = {
      id: newTrackingId(),
      category: "nursing",
      serviceName: chosen.map((s) => s.title).join(", "),
      date,
      slot: SLOTS.find((s) => s.id === slot)?.label ?? slot,
      status: "Assigned",
      patientName: patient.name,
      patientRelation: patient.relation,
      address,
      notes,
      prescription,
      payment: payment === "cash" ? "Cash on Service" : "Shushrusha Wallet",
      amount: total,
      nurse: {
        name: "সুমাইয়া আক্তার",
        qualification: "Senior B.Sc Nurse",
        phone: "+8801628402283",
        eta: "৪৫ মিনিটের মধ্যে",
      },
      createdAt: new Date().toISOString(),
    };
    saveOrder(order);
    void navigate({ to: "/orders" });
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <ol className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={`text-[11px] ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
        {step === 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">সার্ভিস নির্বাচন করুন</h2>
            {SERVICES.map((s) => {
              const on = picked.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${
                    on ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-foreground">{s.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {s.en} • {s.duration}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-primary">৳{s.price}</span>
                </button>
              );
            })}
            <p className="text-xs text-muted-foreground">
              কনভিনিয়েন্স / ট্রাভেল চার্জ ৳{CONVENIENCE_FEE} আলাদাভাবে যুক্ত হবে।
            </p>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">রোগী নির্বাচন করুন</h2>
            {patients.length === 0 && (
              <p className="text-sm text-muted-foreground">কোনো সেভ করা রোগী নেই — নতুন যোগ করুন।</p>
            )}
            {patients.map((p) => (
              <div
                key={p.id}
                className={`flex min-h-[56px] items-center gap-3 rounded-xl border p-3 ${
                  patientId === p.id ? "border-primary bg-primary/5" : "border-border bg-background"
                }`}
              >
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setPatientId(p.id)}>
                  <span className="block font-semibold text-foreground">
                    {p.relation} — {p.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {p.age ? `${p.age} বছর • ` : ""}
                    {p.gender}
                    {p.conditions ? ` • ${p.conditions}` : ""}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="মুছুন"
                  className="flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    removePatient(p.id);
                    setPatients(loadPatients());
                    if (patientId === p.id) setPatientId("");
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <PatientSelectorModal
              onSaved={(p) => {
                setPatients(loadPatients());
                setPatientId(p.id);
              }}
            />
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">তারিখ, সময় ও ঠিকানা</h2>
            <div className="space-y-2">
              <Label htmlFor="b-date">তারিখ / Date</Label>
              <Input id="b-date" type="date" className="min-h-11" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>
                <Clock className="mr-1 inline size-4" /> টাইম স্লট
              </Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {SLOTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSlot(s.id)}
                    className={`min-h-[56px] rounded-xl border px-3 text-sm transition-colors ${
                      slot === s.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    <span className="block font-semibold">{s.label}</span>
                    <span className="block text-xs">{s.time}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-addr">
                <MapPin className="mr-1 inline size-4" /> সার্ভিস ঠিকানা
              </Label>
              <Textarea id="b-addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="বাসা / রোড / এলাকা" />
              <p className="text-xs text-muted-foreground">সেভ করা লোকেশন থেকে অটো-ফিল — এই বুকিংয়ের জন্য বদলাতে পারেন।</p>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">মেডিকেল নোট ও প্রেসক্রিপশন</h2>
            <div className="space-y-2">
              <Label htmlFor="b-notes">বিশেষ নির্দেশনা</Label>
              <Textarea
                id="b-notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="যেমন: রোগী ডায়াবেটিক, ড্রেসিং সাবধানে করতে হবে।"
              />
            </div>
            <label className="flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
              <ImageUp className="size-6 text-primary" />
              <span className="text-sm font-medium text-foreground">প্রেসক্রিপশন ছবি আপলোড (ঐচ্ছিক)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void onFile(e.target.files?.[0])}
              />
            </label>
            {prescription && (
              <img src={prescription} alt="আপলোড করা প্রেসক্রিপশন" className="max-h-48 rounded-xl border border-border" />
            )}
          </section>
        )}

        {step === 4 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">সারসংক্ষেপ ও পেমেন্ট</h2>
            <div className="space-y-1 rounded-xl border border-border bg-secondary/40 p-3 text-sm">
              {chosen.map((s) => (
                <div key={s.id} className="flex justify-between">
                  <span className="text-muted-foreground">{s.title}</span>
                  <span className="font-medium text-foreground">৳{s.price}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-muted-foreground">ট্রাভেল / ইমার্জেন্সি চার্জ</span>
                <span className="font-medium text-foreground">৳{CONVENIENCE_FEE}</span>
              </div>
              {walletDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>ওয়ালেট ছাড় (৫%)</span>
                  <span>-৳{walletDiscount}</span>
                </div>
              )}
              {applied > 0 && (
                <div className="flex justify-between text-success">
                  <span>প্রোমো ছাড়</span>
                  <span>-৳{applied}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold text-primary">
                <span>মোট</span>
                <span>৳{total}</span>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  { id: "cash", label: "ক্যাশ অন সার্ভিস", icon: Stethoscope },
                  { id: "wallet", label: "শুশ্রূষা ক্যাশ / ওয়ালেট", icon: Wallet },
                ] as const
              ).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setPayment(o.id)}
                  className={`flex min-h-[56px] items-center gap-2 rounded-xl border px-3 text-sm transition-colors ${
                    payment === o.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <o.icon className="size-4" /> {o.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                className="min-h-11"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="ডিসকাউন্ট কোড (CARE10)"
              />
              <Button variant="softOutline" className="min-h-11" onClick={applyPromo}>
                প্রয়োগ
              </Button>
            </div>
            {promoMsg && <p className="text-xs text-muted-foreground">{promoMsg}</p>}

            <Button variant="hero" size="lg" className="min-h-12 w-full" onClick={confirm}>
              বুকিং নিশ্চিত করুন • ৳{total}
            </Button>
          </section>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft /> পেছনে
        </Button>
        {step < STEPS.length - 1 && (
          <Button variant="hero" className="min-h-11" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
            পরবর্তী <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
