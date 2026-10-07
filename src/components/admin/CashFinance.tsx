import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Banknote } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { adminListCash, adminSaveSetting } from "@/lib/catalog.functions";

type Cash = Awaited<ReturnType<typeof adminListCash>>[number];

export function CashFinance({ password }: { password: string }) {
  const list = useServerFn(adminListCash);
  const save = useServerFn(adminSaveSetting);
  const [rows, setRows] = useState<Cash[]>([]);
  const [fees, setFees] = useState({ visit_charge: "200", cannula_fee: "150" });

  useEffect(() => {
    void list({ data: { password } }).then(setRows).catch(() => toast.error("লোড করা যায়নি"));
    void supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["visit_charge", "cannula_fee"])
      .then(({ data }) => {
        const m = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
        setFees((f) => ({ ...f, ...m }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayTotal = rows.filter((r) => r.created_at.slice(0, 10) === today).reduce((s, r) => s + r.amount, 0);

  async function saveFees() {
    try {
      await Promise.all(
        (["visit_charge", "cannula_fee"] as const).map((key) =>
          save({ data: { password, key, value: String(Number(fees[key]) || 0) } }),
        ),
      );
      toast.success("ফি সেভ হয়েছে");
    } catch {
      toast.error("সেভ করা যায়নি");
    }
  }

  return (
    <div className="space-y-4">
      <div className="card-elevated grid gap-3 p-5 sm:grid-cols-3">
        <div className="space-y-1">
          <Label>ভিজিট / ডেলিভারি চার্জ (৳)</Label>
          <Input className="min-h-11" type="number" value={fees.visit_charge} onChange={(e) => setFees({ ...fees, visit_charge: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>ক্যানুলা কিট ফি (৳)</Label>
          <Input className="min-h-11" type="number" value={fees.cannula_fee} onChange={(e) => setFees({ ...fees, cannula_fee: e.target.value })} />
        </div>
        <Button variant="hero" className="min-h-11 self-end" onClick={() => void saveFees()}>
          ফি সেভ করুন
        </Button>
      </div>

      <div className="card-elevated space-y-3 p-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Banknote className="size-5 text-primary" /> নগদ সংগ্রহ (Cash QR)
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-secondary p-3">
            <p className="text-xs text-muted-foreground">আজ</p>
            <p className="text-lg font-bold text-foreground">৳{todayTotal}</p>
          </div>
          <div className="rounded-xl bg-secondary p-3">
            <p className="text-xs text-muted-foreground">মোট</p>
            <p className="text-lg font-bold text-foreground">৳{total}</p>
          </div>
        </div>
        {rows.length === 0 && <p className="text-sm text-muted-foreground">এখনো কোনো নগদ সংগ্রহ নেই।</p>}
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0 truncate">
                <span className="font-semibold text-foreground">{r.tracking_id}</span>{" "}
                <span className="text-muted-foreground">• {r.nurse_name}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="font-bold text-foreground">৳{r.amount}</span>
                <span className="block text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleString("bn-BD")}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
