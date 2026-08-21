import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, QrCode, Search, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trackBooking } from "@/lib/bookings.functions";
import { submitRating } from "@/lib/customer.functions";
import { STATUSES } from "@/lib/booking-types";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "অর্ডার ট্র্যাকিং | শুশ্রূষা হোম নার্সিং" },
      {
        name: "description",
        content: "ট্র্যাকিং আইডি দিয়ে আপনার হোম নার্সিং বুকিংয়ের লাইভ স্ট্যাটাস দেখুন ও নার্সকে রেটিং দিন।",
      },
      { property: "og:title", content: "অর্ডার ট্র্যাকিং | শুশ্রূষা" },
      { property: "og:description", content: "বুকিং স্ট্যাটাস, নার্স তথ্য ও সার্ভিস রেটিং।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

type Result = Awaited<ReturnType<typeof trackBooking>>;

/** Patient QR — the nurse scans this to mark the visit complete. */
function PatientQR({ trackingId }: { trackingId: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    void import("qrcode").then(async (m) => {
      const url = await m.default.toDataURL(`SHUSHRUSHA:${trackingId}`, { width: 320, margin: 1 });
      if (alive) setSrc(url);
    });
    return () => {
      alive = false;
    };
  }, [trackingId]);
  return (
    <div className="mt-6 rounded-2xl border border-primary/20 bg-secondary p-5 text-center">
      <h2 className="flex items-center justify-center gap-2 text-base font-bold text-foreground">
        <QrCode className="size-5 text-primary" /> পেশেন্ট QR কোড
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        সেবা শেষে নার্স এই QR কোডটি স্ক্যান করলেই অর্ডারটি “Completed” হবে।
      </p>
      {src ? (
        <img src={src} alt={`ট্র্যাকিং ${trackingId} এর QR কোড`} className="mx-auto mt-4 size-48 rounded-xl bg-white p-2" />
      ) : (
        <Loader2 className="mx-auto mt-4 animate-spin text-primary" />
      )}
    </div>
  );
}

function TrackPage() {
  const track = useServerFn(trackBooking);
  const rate = useServerFn(submitRating);
  const [id, setId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [res, setRes] = useState<Result>(null);
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState("");
  const [rated, setRated] = useState(false);

  async function search() {
    if (id.trim().length < 3) return setError("ট্র্যাকিং আইডি লিখুন");
    setBusy(true);
    setError("");
    setRated(false);
    try {
      const r = await track({ data: { trackingId: id.trim() } });
      if (!r) setError("এই আইডিতে কোনো বুকিং পাওয়া যায়নি।");
      setRes(r);
      setStars(r?.rating ?? 0);
    } catch {
      setError("খোঁজা যায়নি — আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  async function sendRating() {
    if (!res || stars < 1) return;
    const body: { trackingId: string; rating: number; review?: string } = {
      trackingId: res.trackingId,
      rating: stars,
    };
    if (review.trim()) body.review = review.trim();
    await rate({ data: body });
    setRated(true);
  }

  const activeIdx = res ? STATUSES.indexOf(res.status as (typeof STATUSES)[number]) : -1;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">অর্ডার ট্র্যাকিং</h1>
        <p className="mt-2 text-muted-foreground">আপনার ট্র্যাকিং আইডি (যেমন #SHU-8024) দিন।</p>

        <div className="mt-6 flex gap-2">
          <Input value={id} maxLength={30} placeholder="#SHU-0000" onChange={(e) => setId(e.target.value)} />
          <Button variant="hero" disabled={busy} onClick={search}>
            {busy ? <Loader2 className="animate-spin" /> : <Search />} খুঁজুন
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        {res && (
          <div className="card-elevated mt-8 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">ট্র্যাকিং আইডি</p>
                <p className="text-xl font-bold text-primary">#{res.trackingId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">সার্ভিস</p>
                <p className="text-sm font-medium text-foreground">{res.service}</p>
              </div>
            </div>

            <ol className="mt-6 space-y-3">
              {STATUSES.map((s, i) => {
                const reached = i <= activeIdx;
                return (
                  <li key={s} className="flex items-center gap-3">
                    <span
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                        reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {reached ? <Check className="size-4" /> : i + 1}
                    </span>
                    <span className={reached ? "font-medium text-foreground" : "text-muted-foreground"}>{s}</span>
                  </li>
                );
              })}
            </ol>

            <dl className="mt-6 grid gap-2 border-t border-border pt-4 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">মূল্য</dt>
                <dd className="font-medium">{res.total ? `৳${res.total}` : res.price || "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">পেমেন্ট</dt>
                <dd className="font-medium">{res.paymentStatus}</dd>
              </div>
              {res.nurse && (
                <div className="flex justify-between gap-2 sm:col-span-2">
                  <dt className="text-muted-foreground">নিযুক্ত নার্স</dt>
                  <dd className="font-medium">
                    {res.nurse.name} (#{res.nurse.nurse_code}) ⭐ {res.nurse.rating}
                  </dd>
                </div>
              )}
            </dl>

            {res.status !== "Completed" && res.status !== "Cancelled" && <PatientQR trackingId={res.trackingId} />}

            {res.status === "Completed" && (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-secondary p-5">
                <h2 className="text-base font-bold text-foreground">সেবার রেটিং দিন</h2>
                {rated || res.rating ? (
                  <p className="mt-2 text-sm text-primary">
                    ধন্যবাদ! আপনার রেটিং: {"★".repeat(stars || res.rating || 0)}
                  </p>
                ) : (
                  <>
                    <div className="mt-3 flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" aria-label={`${n} star`} onClick={() => setStars(n)}>
                          <Star
                            className={`size-8 ${n <= stars ? "fill-accent text-accent" : "text-muted-foreground"}`}
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      className="mt-3"
                      maxLength={600}
                      placeholder="আপনার মতামত লিখুন (ঐচ্ছিক)"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    />
                    <Button className="mt-3 w-full" variant="hero" disabled={stars < 1} onClick={sendRating}>
                      রেটিং জমা দিন
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
