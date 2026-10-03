import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const BKASH = "#D12053";

export function newTrxId() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  return "BK" + Array.from({ length: 8 }, () => c[Math.floor(Math.random() * c.length)]).join("");
}

export function BkashLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-extrabold tracking-tight ${className}`} style={{ color: BKASH }}>
      <span className="grid size-5 place-items-center rounded bg-[#D12053] text-[10px] text-primary-foreground">ব</span>
      bKash
    </span>
  );
}

/** Featured payment option button (pink bKash branding). */
export function BkashOption({ selected, onClick }: { selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[56px] items-center gap-2 rounded-xl border-2 px-3 text-left text-sm font-semibold transition-colors"
      style={{ borderColor: selected ? BKASH : "hsl(var(--border))", background: selected ? "#D1205310" : undefined }}
    >
      <BkashLogo /> <span className="text-foreground">অনলাইন পেমেন্ট</span>
    </button>
  );
}

type Step = "account" | "otp" | "pin" | "processing" | "done";

export function BkashCheckout({
  open,
  amount,
  onClose,
  onSuccess,
}: {
  open: boolean;
  amount: number;
  onClose: () => void;
  onSuccess: (trxId: string) => void;
}) {
  const [step, setStep] = useState<Step>("account");
  const [acc, setAcc] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [trx, setTrx] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("account");
    setAcc("");
    setOtp("");
    setPin("");
    setErr("");
    void supabase
      .from("app_settings")
      .select("value")
      .eq("key", "bkash_payment_link")
      .maybeSingle()
      .then(({ data }) => setLink(data?.value ?? ""));
  }, [open]);

  function next() {
    setErr("");
    if (step === "account") {
      if (!/^01[3-9]\d{8}$/.test(acc)) return setErr("সঠিক ১১ সংখ্যার বিকাশ নম্বর দিন");
      setStep("otp");
    } else if (step === "otp") {
      if (otp !== "123456") return setErr("ভুল OTP (ডেমো: 123456)");
      setStep("pin");
    } else if (step === "pin") {
      if (pin !== "1234") return setErr("ভুল PIN (ডেমো: 1234)");
      setStep("processing");
      const id = newTrxId();
      setTimeout(() => {
        setTrx(id);
        setStep("done");
      }, 1200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && step !== "processing" && onClose()}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-sm">
        <div className="p-4 text-primary-foreground" style={{ background: BKASH }}>
          <DialogTitle className="text-lg font-extrabold">bKash Payment</DialogTitle>
          <div className="mt-2 flex items-end justify-between text-sm">
            <span>
              Merchant: <b>Shushrusha Care</b>
            </span>
            <span className="text-xl font-bold">৳{amount}</span>
          </div>
        </div>

        <div className="space-y-3 p-5">
          {step === "account" && (
            <>
              <p className="text-sm font-medium text-foreground">আপনার বিকাশ অ্যাকাউন্ট নম্বর</p>
              <Input className="min-h-11 text-center text-lg tracking-widest" inputMode="numeric" maxLength={11} placeholder="01XXXXXXXXX" value={acc} onChange={(e) => setAcc(e.target.value.replace(/\D/g, ""))} />
              {link && (
                <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-xs font-semibold underline" style={{ color: BKASH }}>
                  <ExternalLink className="size-3.5" /> সরাসরি বিকাশ মার্চেন্ট লিংকে পেমেন্ট করুন
                </a>
              )}
            </>
          )}
          {step === "otp" && (
            <>
              <p className="text-sm text-foreground">{acc} নম্বরে পাঠানো ৬ সংখ্যার কোড দিন</p>
              <Input className="min-h-11 text-center text-lg tracking-[0.5em]" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
              <p className="text-center text-[11px] text-muted-foreground">ডেমো OTP: 123456</p>
            </>
          )}
          {step === "pin" && (
            <>
              <p className="text-sm text-foreground">বিকাশ PIN দিন</p>
              <Input type="password" className="min-h-11 text-center text-lg tracking-[0.5em]" inputMode="numeric" maxLength={5} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
              <p className="text-center text-[11px] text-muted-foreground">ডেমো PIN: 1234</p>
            </>
          )}
          {step === "processing" && (
            <div className="grid place-items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-8 animate-spin" style={{ color: BKASH }} /> পেমেন্ট প্রসেস হচ্ছে...
            </div>
          )}
          {step === "done" && (
            <div className="grid place-items-center gap-2 py-3 text-center">
              <CheckCircle2 className="size-16 animate-in zoom-in-50 text-success duration-500" />
              <p className="text-lg font-bold text-foreground">পেমেন্ট সফল হয়েছে!</p>
              <p className="text-sm text-muted-foreground">৳{amount} • Shushrusha Care</p>
              <p className="rounded-lg bg-secondary px-3 py-1 font-mono text-sm font-bold text-foreground">TrxID: {trx}</p>
            </div>
          )}

          {err && <p className="text-center text-sm text-destructive">{err}</p>}

          {step === "done" ? (
            <Button className="min-h-11 w-full" onClick={() => onSuccess(trx)} style={{ background: BKASH }}>
              সম্পন্ন করুন
            </Button>
          ) : step !== "processing" ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="min-h-11" onClick={onClose}>বাতিল</Button>
              <Button className="min-h-11 text-primary-foreground" style={{ background: BKASH }} onClick={next}>
                {step === "pin" ? "পেমেন্ট করুন" : "পরবর্তী"}
              </Button>
            </div>
          ) : null}
          <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5" /> নিরাপদ বিকাশ চেকআউট
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Green "PAID via bKash" badge. */
export function PaidBadge({ trxId }: { trxId?: string | null | undefined }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
      <CheckCircle2 className="size-3.5" /> PAID via bKash{trxId ? ` • ${trxId}` : ""}
    </span>
  );
}
