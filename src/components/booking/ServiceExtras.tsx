import { useMemo, useState } from "react";
import { Minus, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { INJECTIONS, type InjectionItem } from "@/lib/injections";

/* ---------- Medicine autocomplete ---------- */

export function MedicineSearch({
  value,
  onChange,
}: {
  value: InjectionItem | null;
  onChange: (m: InjectionItem | null) => void;
}) {
  const [q, setQ] = useState(value ? `${value.brand} ${value.strength}` : "");
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return INJECTIONS.filter(
      (i) => i.brand.toLowerCase().includes(s) || i.generic.toLowerCase().includes(s) || i.company.toLowerCase().includes(s),
    ).slice(0, 8);
  }, [q]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
      <Input
        className="min-h-11 pl-9"
        value={q}
        placeholder="ওষুধের নাম লিখুন (যেমন: Cef...)"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
      />
      {open && hits.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-popover shadow-card">
          {hits.map((h) => (
            <li key={`${h.brand}-${h.strength}`}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-secondary"
                onClick={() => {
                  onChange(h);
                  setQ(`${h.brand} ${h.strength}`);
                  setOpen(false);
                }}
              >
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">
                    {h.brand} <span className="font-normal text-muted-foreground">{h.strength}</span>
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {h.generic} • {h.company}
                  </span>
                </span>
                <span className="shrink-0 font-bold text-primary">৳{h.price}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Body-part selector ---------- */

export const BODY_PARTS = [
  { id: "head", label: "মাথা / মুখ", x: 50, y: 9, r: 8 },
  { id: "chest", label: "বুক", x: 50, y: 30, r: 10 },
  { id: "abdomen", label: "পেট", x: 50, y: 46, r: 9 },
  { id: "l-arm", label: "বাম হাত", x: 24, y: 40, r: 7 },
  { id: "r-arm", label: "ডান হাত", x: 76, y: 40, r: 7 },
  { id: "l-leg", label: "বাম পা", x: 40, y: 78, r: 8 },
  { id: "r-leg", label: "ডান পা", x: 60, y: 78, r: 8 },
  { id: "back", label: "পিঠ", x: 50, y: 62, r: 7 },
] as const;

export function BodyPartSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const sel = BODY_PARTS.find((p) => p.id === value);
  return (
    <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
      <svg
        viewBox="0 0 100 100"
        className="mx-auto h-64 w-44 transition-transform duration-500"
        style={sel ? { transform: "scale(1.15)", transformOrigin: `${sel.x}% ${sel.y}%` } : undefined}
        aria-label="শরীরের অংশ নির্বাচন"
      >
        <g className="fill-secondary stroke-border" strokeWidth="0.8">
          <circle cx="50" cy="9" r="7" />
          <rect x="38" y="18" width="24" height="38" rx="6" />
          <rect x="22" y="20" width="9" height="34" rx="4" />
          <rect x="69" y="20" width="9" height="34" rx="4" />
          <rect x="38" y="56" width="10" height="40" rx="4" />
          <rect x="52" y="56" width="10" height="40" rx="4" />
        </g>
        {BODY_PARTS.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.r / 2}
            role="button"
            aria-label={p.label}
            onClick={() => onChange(p.id)}
            className={`cursor-pointer transition-all ${value === p.id ? "fill-destructive/70 animate-pulse" : "fill-primary/30 hover:fill-primary/60"}`}
          />
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-2 self-center">
        {BODY_PARTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`min-h-11 rounded-lg border px-2 text-xs font-medium transition-colors ${
              value === p.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StitchCounter({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button type="button" aria-label="কমান" onClick={() => onChange(Math.max(0, value - 1))} className="grid size-11 place-items-center rounded-full border border-border bg-background">
        <Minus className="size-4" />
      </button>
      <span key={value} className="w-16 animate-in zoom-in-75 text-center text-3xl font-bold text-primary duration-200">
        {value}
      </span>
      <button type="button" aria-label="বাড়ান" onClick={() => onChange(Math.min(200, value + 1))} className="grid size-11 place-items-center rounded-full border border-border bg-background">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/* ---------- Multi-dose schedule ---------- */

export type Dose = { date: string; slot: string };
export const DOSE_OPTIONS = [1, 2, 3, 7, 10];

export function DoseScheduler({
  doses,
  onChange,
  slots,
}: {
  doses: Dose[];
  onChange: (d: Dose[]) => void;
  slots: { id: string; label: string }[];
}) {
  function setCount(n: number) {
    const base = doses[0] ?? { date: "", slot: "" };
    onChange(
      Array.from({ length: n }, (_, i) => {
        if (doses[i]) return doses[i]!;
        if (!base.date) return { date: "", slot: base.slot };
        const d = new Date(base.date);
        d.setDate(d.getDate() + i);
        return { date: d.toISOString().slice(0, 10), slot: base.slot };
      }),
    );
  }
  function update(i: number, patch: Partial<Dose>) {
    onChange(doses.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  }
  function applyAll() {
    const first = doses[0];
    if (!first?.date) return;
    onChange(
      doses.map((_, i) => {
        const d = new Date(first.date);
        d.setDate(d.getDate() + i);
        return { date: d.toISOString().slice(0, 10), slot: first.slot };
      }),
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {DOSE_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCount(n)}
            className={`min-h-11 min-w-11 rounded-full border px-3 text-sm font-semibold ${
              doses.length === n ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"
            }`}
          >
            {n} ডোজ
          </button>
        ))}
      </div>
      {doses.map((d, i) => (
        <div key={i} className="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
          <Input type="date" className="min-h-11" value={d.date} onChange={(e) => update(i, { date: e.target.value })} />
          <select
            className="min-h-11 rounded-md border border-input bg-background px-2 text-sm"
            value={d.slot}
            onChange={(e) => update(i, { slot: e.target.value })}
          >
            <option value="">সময়</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      {doses.length > 1 && (
        <button type="button" onClick={applyAll} className="text-xs font-semibold text-primary underline-offset-2 hover:underline">
          প্রথম ডোজের সময় অনুযায়ী প্রতিদিন একই স্লট প্রয়োগ করুন
        </button>
      )}
    </div>
  );
}
