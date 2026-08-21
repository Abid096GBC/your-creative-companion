import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trackBooking } from "@/lib/bookings.functions";
import { STATUSES } from "@/lib/booking-types";

type Result = Awaited<ReturnType<typeof trackBooking>>;

export function TrackOrder() {
  const track = useServerFn(trackBooking);
  const [id, setId] = useState("");
  const [res, setRes] = useState<Result>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    setError("");
    setRes(null);
    try {
      const r = await track({ data: { trackingId: id } });
      if (!r) setError("এই ট্র্যাকিং আইডি পাওয়া যায়নি।");
      setRes(r);
    } catch {
      setError("ট্র্যাক করা যায়নি — আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  const activeIndex = res ? STATUSES.indexOf(res.status as (typeof STATUSES)[number]) : -1;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="softOutline" size="sm">
          <PackageSearch /> অর্ডার ট্র্যাক করুন
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>অর্ডার ট্র্যাক করুন</DialogTitle>
          <DialogDescription>বুকিংয়ের সময় পাওয়া ট্র্যাকিং আইডি লিখুন (যেমন #SHU-8024)।</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input value={id} placeholder="SHU-8024" onChange={(e) => setId(e.target.value)} />
          <Button variant="hero" disabled={busy || id.trim().length < 3} onClick={() => void run()}>
            {busy ? <Loader2 className="animate-spin" /> : "খুঁজুন"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {res && (
          <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
            <p className="text-sm font-semibold text-primary">#{res.trackingId}</p>
            <p className="text-sm text-foreground">{res.service}</p>
            <ol className="space-y-2">
              {STATUSES.map((s, i) => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[11px] ${
                      i <= activeIndex ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground"
                    }`}
                  >
                    {i <= activeIndex ? "✓" : i + 1}
                  </span>
                  <span className={i <= activeIndex ? "font-medium text-foreground" : "text-muted-foreground"}>
                    {s}
                  </span>
                </li>
              ))}
            </ol>
            {res.nurse && (
              <p className="text-sm text-foreground">
                নার্স: <span className="font-semibold">{res.nurse.name}</span> (#{res.nurse.nurse_code}) • ⭐{" "}
                {res.nurse.rating.toFixed(1)}
              </p>
            )}
            {res.price && <p className="text-sm text-muted-foreground">আনুমানিক মূল্য: {res.price}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
