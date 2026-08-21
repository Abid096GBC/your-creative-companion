import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminDeletePromo, adminListExtras, adminSavePromo } from "@/lib/admin-extra.functions";
import type { LeadRow, PromoRow } from "@/lib/booking-types";

type Form = {
  id?: string;
  code: string;
  discount_type: "flat" | "percent";
  value: number;
  expiry_date: string;
  usage_limit: number;
  active: boolean;
};

const EMPTY: Form = { code: "", discount_type: "flat", value: 50, expiry_date: "", usage_limit: 0, active: true };

export function PromoManager({ password }: { password: string }) {
  const listFn = useServerFn(adminListExtras);
  const saveFn = useServerFn(adminSavePromo);
  const delFn = useServerFn(adminDeletePromo);

  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await listFn({ data: { password } });
    setPromos(res.promos);
    setLeads(res.leads);
  }, [listFn, password]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (form.code.trim().length < 2) return;
    setBusy(true);
    try {
      await saveFn({
        data: {
          password,
          ...form,
          expiry_date: form.expiry_date || undefined,
          usage_limit: form.usage_limit || undefined,
        },
      });
      setForm(EMPTY);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card-elevated overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">কোড</th>
                <th className="px-4 py-3">ছাড়</th>
                <th className="px-4 py-3">ব্যবহার</th>
                <th className="px-4 py-3">মেয়াদ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="font-semibold text-primary"
                      onClick={() =>
                        setForm({
                          id: p.id,
                          code: p.code,
                          discount_type: p.discount_type as Form["discount_type"],
                          value: Number(p.value),
                          expiry_date: p.expiry_date ?? "",
                          usage_limit: p.usage_limit ?? 0,
                          active: p.active,
                        })
                      }
                    >
                      {p.code}
                    </button>
                    <p className="text-xs text-muted-foreground">{p.active ? "Active" : "Disabled"}</p>
                  </td>
                  <td className="px-4 py-3">
                    {p.discount_type === "percent" ? `${Number(p.value)}%` : `৳${Number(p.value)}`}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {p.used_count}/{p.usage_limit ?? "∞"}
                  </td>
                  <td className="px-4 py-3 text-xs">{p.expiry_date ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="icon"
                      variant="softOutline"
                      aria-label="ডিলিট"
                      onClick={() => void delFn({ data: { password, id: p.id } }).then(load)}
                    >
                      <Trash2 />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-elevated space-y-3 p-5">
          <h3 className="font-semibold text-foreground">{form.id ? "প্রমো আপডেট" : "নতুন প্রমো কোড"}</h3>
          <div>
            <Label>কোড</Label>
            <Input className="mt-1" value={form.code} placeholder="ROHIM50" onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["flat", "percent"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, discount_type: t })}
                className={`rounded-md border px-3 py-1.5 text-xs ${
                  form.discount_type === t ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                {t === "flat" ? "ফ্ল্যাট ৳" : "পার্সেন্ট %"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>ভ্যালু</Label>
              <Input className="mt-1" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
            <div>
              <Label>ইউজ লিমিট</Label>
              <Input className="mt-1" type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>মেয়াদ শেষ</Label>
            <Input className="mt-1" type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          </div>
          <button type="button" className="text-xs text-primary" onClick={() => setForm({ ...form, active: !form.active })}>
            {form.active ? "☑ চালু" : "☐ বন্ধ"}
          </button>
          <div className="flex gap-2">
            <Button variant="hero" className="flex-1" disabled={busy} onClick={() => void save()}>
              {busy && <Loader2 className="animate-spin" />} সেভ করুন
            </Button>
            {form.id && (
              <Button variant="softOutline" onClick={() => setForm(EMPTY)}>
                নতুন
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="card-elevated p-5">
        <h3 className="font-semibold text-foreground">লিড ডেটাবেজ ({leads.length})</h3>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {leads.slice(0, 40).map((l) => (
            <li key={l.id} className="rounded-lg border border-border px-3 py-2">
              <span className="font-medium text-foreground">{l.name ?? "—"}</span>{" "}
              <span className="text-muted-foreground">{l.phone}</span>
              <p className="text-xs text-muted-foreground">{l.last_service ?? l.source}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
