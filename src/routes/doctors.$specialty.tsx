import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarCheck, MapPin, Star, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { loadProfile } from "@/lib/account-store";
import { savedLocation } from "@/lib/orders-store";
import { QuickCheckout } from "@/components/payment/QuickCheckout";

const SPECIALTIES: Record<string, string> = {
  all: "সব ডাক্তার",
  medicine: "মেডিসিন",
  cardiology: "কার্ডিওলজি",
  neurology: "নিউরোলজি",
  pediatrics: "শিশু রোগ",
  gynecology: "গাইনি",
  orthopedics: "অর্থোপেডিক্স",
  dermatology: "চর্মরোগ",
  ent: "নাক-কান-গলা",
};

type Doctor = {
  id: string;
  name: string;
  name_en: string;
  photo_url: string | null;
  specialty: string;
  degrees: string;
  chamber_address: string;
  consultation_fee: number;
  rating: number;
  rating_count: number;
  available_slots: string;
};

export const Route = createFileRoute("/doctors/$specialty")({
  head: ({ params }) => {
    const label = SPECIALTIES[params.specialty] ?? "বিশেষজ্ঞ";
    return {
      meta: [
        { title: `${label} ডাক্তার অ্যাপয়েন্টমেন্ট | শুশ্রূষা` },
        { name: "description", content: `${label} বিশেষজ্ঞ ডাক্তারদের চেম্বার, ফি ও রেটিং দেখে অ্যাপয়েন্টমেন্ট বুক করুন।` },
        { property: "og:title", content: `${label} ডাক্তার | শুশ্রূষা` },
        { property: "og:description", content: "রেটিং অনুযায়ী সাজানো বিশেষজ্ঞ ডাক্তার ও সহজ অ্যাপয়েন্টমেন্ট।" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: DoctorsPage,
});

const SLOTS = ["সকাল ১০-১২", "দুপুর ২-৪", "সন্ধ্যা ৬-৮", "রাত ৮-১০"];

function DoctorsPage() {
  const { specialty } = Route.useParams();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Doctor[] | null>(null);
  const [rateFor, setRateFor] = useState<Doctor | null>(null);
  const [bookFor, setBookFor] = useState<Doctor | null>(null);

  async function load() {
    let q = supabase.from("doctors").select("*").order("rating", { ascending: false });
    if (specialty !== "all") q = q.eq("specialty", specialty);
    const { data } = await q;
    setDocs((data ?? []) as unknown as Doctor[]);
  }
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialty]);

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground">{SPECIALTIES[specialty] ?? specialty} ডাক্তার</h1>
        <p className="text-sm text-muted-foreground">রেটিং অনুযায়ী সাজানো • অ্যাপ থেকেই অ্যাপয়েন্টমেন্ট</p>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {Object.entries(SPECIALTIES).map(([id, label]) => (
            <Link
              key={id}
              to="/doctors/$specialty"
              params={{ specialty: id }}
              className={`min-h-11 shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium ${
                id === specialty ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {docs === null && <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>}
          {docs?.length === 0 && <p className="text-sm text-muted-foreground">এই বিভাগে এখনো কোনো ডাক্তার যুক্ত হয়নি।</p>}
          {docs?.map((d) => (
            <article key={d.id} className="card-elevated flex flex-col gap-3 p-4">
              <div className="flex gap-3">
                {d.photo_url ? (
                  <img src={d.photo_url} alt={d.name} className="size-16 shrink-0 rounded-2xl object-cover" />
                ) : (
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
                    <UserRound className="size-8" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{d.name}</p>
                  <p className="text-xs text-accent">{d.degrees}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3.5 fill-accent text-accent" /> {Number(d.rating).toFixed(1)} ({d.rating_count})
                  </p>
                </div>
              </div>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" /> {d.chamber_address}
              </p>
              <p className="text-xs text-muted-foreground">⏰ {d.available_slots}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">৳{d.consultation_fee}</span>
                <div className="flex gap-2">
                  <Button variant="softOutline" className="min-h-11" onClick={() => setRateFor(d)}>
                    <Star /> রেট করুন
                  </Button>
                  <Button variant="hero" className="min-h-11" onClick={() => setBookFor(d)}>
                    <CalendarCheck /> বুক করুন
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />

      <RateDialog doctor={rateFor} onClose={() => setRateFor(null)} onSaved={() => void load()} />
      <AppointmentDialog
        doctor={bookFor}
        onClose={() => setBookFor(null)}
        onDone={() => {
          setBookFor(null);
          void navigate({ to: "/orders" });
        }}
      />
    </div>
  );
}

function RateDialog({ doctor, onClose, onSaved }: { doctor: Doctor | null; onClose: () => void; onSaved: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!doctor) return;
    setBusy(true);
    const { error } = await supabase
      .from("doctor_reviews")
      .insert({ doctor_id: doctor.id, rating, comment: comment.trim().slice(0, 500), patient_name: loadProfile().name });
    setBusy(false);
    if (error) return toast.error("রিভিউ সেভ করা যায়নি");
    toast.success("ধন্যবাদ! আপনার রেটিং যুক্ত হয়েছে");
    setComment("");
    onSaved();
    onClose();
  }

  return (
    <Dialog open={Boolean(doctor)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{doctor?.name} — রেটিং দিন</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} স্টার`} onClick={() => setRating(n)} className="grid size-11 place-items-center">
              <Star className={`size-8 ${n <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="আপনার অভিজ্ঞতা লিখুন (ঐচ্ছিক)" maxLength={500} />
        <Button variant="hero" className="min-h-11" disabled={busy} onClick={() => void save()}>
          রিভিউ জমা দিন
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function AppointmentDialog({ doctor, onClose, onDone }: { doctor: Doctor | null; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");

  useEffect(() => {
    if (!doctor) return;
    const p = loadProfile();
    setName(p.name);
    setPhone(p.phone);
  }, [doctor]);

  const valid = name.trim().length > 1 && phone.trim().length > 8 && date && slot;

  return (
    <Dialog open={Boolean(doctor)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>অ্যাপয়েন্টমেন্ট — {doctor?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>রোগীর নাম</Label>
            <Input className="min-h-11" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>ফোন</Label>
            <Input className="min-h-11" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>তারিখ</Label>
            <Input className="min-h-11" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={`min-h-11 rounded-xl border text-sm ${slot === s ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
              >
                {s}
              </button>
            ))}
          </div>
          {doctor && (
            <QuickCheckout
              disabled={!valid}
              label="অ্যাপয়েন্টমেন্ট নিশ্চিত করুন"
              onDone={onDone}
              draft={{
                category: "doctor",
                serviceName: `${doctor.name} (${SPECIALTIES[doctor.specialty] ?? doctor.specialty})`,
                date,
                slot,
                patientName: name.trim(),
                patientRelation: "Self",
                address: doctor.chamber_address || savedLocation(),
                amount: Number(doctor.consultation_fee),
                phone: phone.trim(),
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
