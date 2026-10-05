import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminApproveApplication, adminListApplications, adminRejectApplication } from "@/lib/catalog.functions";

type App = Awaited<ReturnType<typeof adminListApplications>>[number];

export function ApplicationsManager({ password, onApproved }: { password: string; onApproved: () => void }) {
  const list = useServerFn(adminListApplications);
  const approve = useServerFn(adminApproveApplication);
  const reject = useServerFn(adminRejectApplication);
  const [rows, setRows] = useState<App[]>([]);
  const [target, setTarget] = useState<App | null>(null);
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setRows(await list({ data: { password } }));
  }
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openApprove(a: App) {
    setTarget(a);
    setCode(`SH-${Math.floor(1000 + Math.random() * 9000)}`);
    setPin(String(Math.floor(100000 + Math.random() * 900000)));
  }

  async function doApprove() {
    if (!target) return;
    setBusy(true);
    try {
      await approve({ data: { password, id: target.id, nurseCode: code, pin } });
      toast.success(`অনুমোদিত! Nurse ID: ${code.toUpperCase()} • Password: ${pin}`);
      setTarget(null);
      await load();
      onApproved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "অনুমোদন করা যায়নি");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-elevated space-y-3 p-5">
      <h2 className="text-base font-bold text-foreground">নার্স / কেয়ারগিভার আবেদন ({rows.length})</h2>
      {rows.length === 0 && <p className="text-sm text-muted-foreground">এখনো কোনো আবেদন নেই।</p>}
      <ul className="divide-y divide-border">
        {rows.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {a.name} <span className="text-xs text-muted-foreground">• {a.phone}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {a.qualification} • {a.experience} • {a.area}
              </p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  a.status === "Approved" ? "bg-success/10 text-success" : a.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary"
                }`}
              >
                {a.status}
              </span>
            </div>
            {a.status === "Pending" && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => void reject({ data: { password, id: a.id } }).then(load)}>
                  বাতিল
                </Button>
                <Button size="sm" variant="hero" onClick={() => openApprove(a)}>
                  <KeyRound /> Approve &amp; Generate Credentials
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Dialog open={Boolean(target)} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{target?.name} — লগইন তৈরি</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nurse ID</Label>
              <Input className="min-h-11 uppercase" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Password / PIN</Label>
              <Input className="min-h-11" value={pin} onChange={(e) => setPin(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">এই আইডি ও পাসওয়ার্ড নার্সকে জানান — তিনি নার্স ড্যাশবোর্ডে লগইন করবেন।</p>
            <Button variant="hero" className="min-h-11 w-full" disabled={busy || code.length < 2 || pin.length < 4} onClick={() => void doApprove()}>
              {busy && <Loader2 className="animate-spin" />} অনুমোদন করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
