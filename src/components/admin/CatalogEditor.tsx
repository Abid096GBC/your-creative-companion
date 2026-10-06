import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fileToCompressedDataUrl } from "@/lib/image-compress";
import { adminDeleteCatalog, adminListCatalog, adminSaveCatalog, type CatalogTable } from "@/lib/catalog.functions";

type Field = { key: string; label: string; type: "text" | "number" | "textarea" | "bool" | "image" };
type Row = Record<string, unknown>;

export const CATALOG_CONFIG: Record<CatalogTable, { title: string; fields: Field[]; summary: (r: Row) => string }> = {
  doctors: {
    title: "ডাক্তার",
    summary: (r) => `${r["specialty"]} • ৳${r["consultation_fee"]} • ★${r["rating"]}`,
    fields: [
      { key: "name", label: "নাম", type: "text" },
      { key: "name_en", label: "Name (EN)", type: "text" },
      { key: "specialty", label: "স্পেশালিটি (medicine, cardiology, neurology, pediatrics, gynecology, orthopedics, dermatology, ent)", type: "text" },
      { key: "degrees", label: "ডিগ্রি", type: "text" },
      { key: "chamber_address", label: "চেম্বার ঠিকানা", type: "text" },
      { key: "consultation_fee", label: "ফি (৳)", type: "number" },
      { key: "rating", label: "রেটিং", type: "number" },
      { key: "available_slots", label: "সময়সূচি", type: "text" },
      { key: "photo_url", label: "ছবি", type: "image" },
      { key: "active", label: "সক্রিয়", type: "bool" },
    ],
  },
  lab_tests: {
    title: "ল্যাব টেস্ট",
    summary: (r) => `৳${r["price"]} • ${r["partner"]}`,
    fields: [
      { key: "name", label: "টেস্টের নাম", type: "text" },
      { key: "name_en", label: "Name (EN)", type: "text" },
      { key: "price", label: "দাম (৳)", type: "number" },
      { key: "partner", label: "ডায়াগনস্টিক পার্টনার", type: "text" },
      { key: "instructions", label: "রোগীর নির্দেশনা", type: "textarea" },
      { key: "active", label: "সক্রিয়", type: "bool" },
    ],
  },
  hero_banners: {
    title: "হিরো ব্যানার",
    summary: (r) => `${r["discount_text"]} • ক্রম ${r["sort_order"]}`,
    fields: [
      { key: "title", label: "প্রোমো টাইটেল", type: "text" },
      { key: "subtitle", label: "সাবটাইটেল", type: "text" },
      { key: "discount_text", label: "ছাড়ের লেখা", type: "text" },
      { key: "link_url", label: "লিংক (যেমন /booking/nursing)", type: "text" },
      { key: "sort_order", label: "ক্রম", type: "number" },
      { key: "image_url", label: "ব্যানার ছবি", type: "image" },
      { key: "active", label: "সক্রিয়", type: "bool" },
    ],
  },
  services: {
    title: "সার্ভিস ও চার্জ",
    summary: (r) => `${r["service_key"]} • ৳${r["price"]}`,
    fields: [
      { key: "service_key", label: "কী (injection, dressing, saline, vitals, nebulizer, suturing, postop, elderly, physio)", type: "text" },
      { key: "name", label: "নাম", type: "text" },
      { key: "name_en", label: "Name (EN)", type: "text" },
      { key: "description", label: "বিবরণ", type: "text" },
      { key: "price", label: "চার্জ (৳)", type: "number" },
      { key: "active", label: "সক্রিয়", type: "bool" },
    ],
  },
};

export function CatalogEditor({ password, table }: { password: string; table: CatalogTable }) {
  const cfg = CATALOG_CONFIG[table];
  const list = useServerFn(adminListCatalog);
  const save = useServerFn(adminSaveCatalog);
  const del = useServerFn(adminDeleteCatalog);
  const [rows, setRows] = useState<Row[]>([]);
  const [edit, setEdit] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setRows((await list({ data: { password, table } })) as Row[]);
  }
  useEffect(() => {
    setEdit(null);
    void load().catch(() => toast.error("লোড করা যায়নি"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  function blank(): Row {
    return Object.fromEntries(cfg.fields.map((f) => [f.key, f.type === "bool" ? true : f.type === "number" ? 0 : ""]));
  }

  async function submit() {
    if (!edit) return;
    setBusy(true);
    const row: Record<string, string | number | boolean | null> = {};
    for (const f of cfg.fields) {
      const v = edit[f.key];
      row[f.key] = f.type === "number" ? Number(v ?? 0) : f.type === "bool" ? Boolean(v) : v === "" || v == null ? (f.type === "image" || f.key === "link_url" ? null : "") : String(v);
    }
    try {
      await save({ data: { password, table, ...(edit["id"] ? { id: String(edit["id"]) } : {}), row } });
      toast.success("সেভ হয়েছে");
      setEdit(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "সেভ করা যায়নি");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("মুছে ফেলবেন?")) return;
    await del({ data: { password, table, id } });
    await load();
  }

  return (
    <div className="card-elevated space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">{cfg.title} ({rows.length})</h2>
        <Button size="sm" variant="hero" onClick={() => setEdit(blank())}>
          <Plus /> নতুন যোগ
        </Button>
      </div>

      {edit && (
        <div className="grid gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:grid-cols-2">
          {cfg.fields.map((f) => (
            <div key={f.key} className={`space-y-1 ${f.type === "textarea" || f.type === "image" ? "sm:col-span-2" : ""}`}>
              <Label className="text-xs">{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea value={String(edit[f.key] ?? "")} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })} />
              ) : f.type === "bool" ? (
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input type="checkbox" className="size-5" checked={Boolean(edit[f.key])} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.checked })} />
                  চালু
                </label>
              ) : f.type === "image" ? (
                <div className="flex items-center gap-3">
                  {edit[f.key] ? <img src={String(edit[f.key])} alt="" className="size-16 rounded-lg object-cover" /> : null}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) setEdit({ ...edit, [f.key]: await fileToCompressedDataUrl(file) });
                    }}
                  />
                </div>
              ) : (
                <Input
                  type={f.type === "number" ? "number" : "text"}
                  value={String(edit[f.key] ?? "")}
                  onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })}
                />
              )}
            </div>
          ))}
          <div className="flex gap-2 sm:col-span-2">
            <Button variant="hero" disabled={busy} onClick={() => void submit()}>
              {busy && <Loader2 className="animate-spin" />} সেভ করুন
            </Button>
            <Button variant="outline" onClick={() => setEdit(null)}>বাতিল</Button>
          </div>
        </div>
      )}

      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={String(r["id"])} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {String(r["name"] ?? r["title"] ?? "")} {r["active"] === false && <span className="text-xs text-destructive">(বন্ধ)</span>}
              </p>
              <p className="truncate text-xs text-muted-foreground">{cfg.summary(r)}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button size="icon" variant="softOutline" aria-label="এডিট" onClick={() => setEdit(r)}>
                <Pencil />
              </Button>
              <Button size="icon" variant="outline" aria-label="মুছুন" onClick={() => void remove(String(r["id"]))}>
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
