import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminDeleteProduct, adminListProducts, adminSaveProduct } from "@/lib/admin-extra.functions";
import { fileToCompressedDataUrl } from "@/lib/image-compress";
import { netPrice, type CatalogRow } from "@/lib/booking-types";

type Form = {
  id?: string;
  item_key: string;
  name: string;
  name_en: string;
  description: string;
  unit: string;
  price: number;
  discount_pct: number;
  image_url: string;
  active: boolean;
};

const EMPTY: Form = {
  item_key: "",
  name: "",
  name_en: "",
  description: "",
  unit: "pc",
  price: 0,
  discount_pct: 0,
  image_url: "",
  active: true,
};

export function StoreManager({ password }: { password: string }) {
  const listFn = useServerFn(adminListProducts);
  const saveFn = useServerFn(adminSaveProduct);
  const delFn = useServerFn(adminDeleteProduct);

  const [items, setItems] = useState<CatalogRow[]>([]);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await listFn({ data: { password } });
    setItems(res.items);
  }, [listFn, password]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (form.name.trim().length < 2 || form.item_key.trim().length < 2) {
      setMsg("আইটেম কী ও নাম দিন");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const payload = { password, ...form, image_url: form.image_url || undefined };
      await saveFn({ data: payload });
      setForm(EMPTY);
      await load();
    } catch {
      setMsg("সেভ করা যায়নি");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="card-elevated overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">প্রোডাক্ট</th>
              <th className="px-4 py-3">মূল্য</th>
              <th className="px-4 py-3">ছাড়</th>
              <th className="px-4 py-3">স্ট্যাটাস</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-left font-medium text-primary"
                    onClick={() =>
                      setForm({
                        id: c.id,
                        item_key: c.item_key,
                        name: c.name,
                        name_en: c.name_en,
                        description: c.description ?? "",
                        unit: c.unit,
                        price: Number(c.price),
                        discount_pct: Number(c.discount_pct),
                        image_url: c.image_url ?? "",
                        active: c.active,
                      })
                    }
                  >
                    {c.name}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {c.name_en} • {c.unit}
                  </p>
                </td>
                <td className="px-4 py-3">
                  ৳{netPrice(Number(c.price), Number(c.discount_pct))}
                  {Number(c.discount_pct) > 0 && (
                    <s className="ml-1 text-xs text-muted-foreground">৳{Number(c.price)}</s>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{Number(c.discount_pct)}%</td>
                <td className="px-4 py-3 text-xs">{c.active ? "Active" : "Hidden"}</td>
                <td className="px-4 py-3">
                  <Button
                    size="icon"
                    variant="softOutline"
                    aria-label="ডিলিট"
                    onClick={() => void delFn({ data: { password, id: c.id } }).then(load)}
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
        <h3 className="font-semibold text-foreground">{form.id ? "প্রোডাক্ট আপডেট" : "নতুন প্রোডাক্ট"}</h3>
        <div>
          <Label>আইটেম কী</Label>
          <Input className="mt-1" value={form.item_key} placeholder="gauze-roll" onChange={(e) => setForm({ ...form, item_key: e.target.value })} />
        </div>
        <div>
          <Label>নাম (বাংলা)</Label>
          <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label>নাম (English)</Label>
          <Input className="mt-1" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
        </div>
        <div>
          <Label>বিবরণ</Label>
          <Textarea className="mt-1" value={form.description} maxLength={400} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>মূল্য</Label>
            <Input className="mt-1" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div>
            <Label>ছাড় %</Label>
            <Input className="mt-1" type="number" value={form.discount_pct} onChange={(e) => setForm({ ...form, discount_pct: Number(e.target.value) })} />
          </div>
          <div>
            <Label>একক</Label>
            <Input className="mt-1" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>প্রোডাক্ট ছবি</Label>
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-xs"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void fileToCompressedDataUrl(file).then((url) => setForm((f) => ({ ...f, image_url: url })));
            }}
          />
          {form.image_url && (
            <img src={form.image_url} alt="প্রিভিউ" className="mt-2 size-24 rounded-lg object-cover" />
          )}
        </div>
        <button
          type="button"
          className="text-xs text-primary"
          onClick={() => setForm({ ...form, active: !form.active })}
        >
          {form.active ? "☑ স্টোরে দেখানো হচ্ছে" : "☐ লুকানো"}
        </button>
        {msg && <p className="text-xs text-destructive">{msg}</p>}
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
  );
}
