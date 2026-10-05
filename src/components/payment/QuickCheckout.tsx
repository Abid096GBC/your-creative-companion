import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createBooking } from "@/lib/bookings.functions";
import { recordBkashPayment } from "@/lib/catalog.functions";
import { newTrackingId, saveOrder, type LocalOrder } from "@/lib/orders-store";
import { BkashCheckout, BkashOption } from "@/components/payment/BkashCheckout";

type Draft = Omit<LocalOrder, "id" | "payment" | "createdAt" | "status"> & { phone: string };

/** Payment picker (Cash / bKash) + submit that records the order on the server and in the order list. */
export function QuickCheckout({
  draft,
  disabled,
  label,
  onDone,
}: {
  draft: Draft;
  disabled?: boolean;
  label: string;
  onDone: (id: string) => void;
}) {
  const [pay, setPay] = useState<"cash" | "bkash">("cash");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const book = useServerFn(createBooking);
  const record = useServerFn(recordBkashPayment);

  async function submit(trxId?: string) {
    setBusy(true);
    let id = newTrackingId();
    try {
      const res = await book({
        data: {
          service: draft.serviceName.slice(0, 120),
          customer_name: draft.patientName.length >= 2 ? draft.patientName : "Patient",
          phone: draft.phone.length >= 6 ? draft.phone : "01000000000",
          address: draft.address.length >= 4 ? draft.address : "Dhaka",
          amount: draft.amount,
          time_slot: `${draft.date} ${draft.slot}`.slice(0, 60),
          payment_method: pay === "bkash" ? "bKash" : "Cash",
          ...(draft.notes ? { notes: draft.notes.slice(0, 600) } : {}),
        },
      });
      id = res.trackingId;
      if (trxId) await record({ data: { trackingId: id, trxId } });
    } catch {
      toast.error("সার্ভারে সেভ করা যায়নি — লোকালি সেভ হয়েছে");
    }
    const { phone: _phone, ...rest } = draft;
    saveOrder({
      ...rest,
      id,
      status: "Pending",
      payment: pay === "bkash" ? "bKash PGW" : "Cash on Service",
      ...(trxId ? { paymentStatus: "Paid" as const, paymentMethod: "bKash PGW", trxId } : {}),
      createdAt: new Date().toISOString(),
    });
    setBusy(false);
    toast.success(`অর্ডার নিশ্চিত হয়েছে #${id}`);
    onDone(id);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <BkashOption selected={pay === "bkash"} onClick={() => setPay("bkash")} />
        <button
          type="button"
          onClick={() => setPay("cash")}
          className={`flex min-h-[56px] items-center gap-2 rounded-xl border px-3 text-sm ${
            pay === "cash" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
          }`}
        >
          <Stethoscope className="size-4" /> ক্যাশ অন সার্ভিস
        </button>
      </div>
      <Button
        variant="hero"
        className="min-h-12 w-full"
        disabled={disabled || busy}
        onClick={() => (pay === "bkash" ? setOpen(true) : void submit())}
      >
        {busy && <Loader2 className="animate-spin" />} {label} • ৳{draft.amount}
      </Button>
      <BkashCheckout
        open={open}
        amount={draft.amount}
        onClose={() => setOpen(false)}
        onSuccess={(trx) => {
          setOpen(false);
          void submit(trx);
        }}
      />
    </div>
  );
}
