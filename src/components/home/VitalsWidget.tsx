import { useEffect, useState } from "react";
import { Activity, Droplets, HeartPulse, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { readLocal, writeLocal } from "@/lib/local-storage";

const KEY = "shushrusha_vitals";

type Vitals = { sys: string; dia: string; sugar: string; pulse: string };
const EMPTY: Vitals = { sys: "", dia: "", sugar: "", pulse: "" };

type Trend = { label: string; cls: string };

function trendOf(v: Vitals): Trend | null {
  const sys = Number(v.sys);
  const dia = Number(v.dia);
  const sugar = Number(v.sugar);
  const pulse = Number(v.pulse);
  if (!sys && !sugar && !pulse) return null;

  const red =
    (sys && (sys >= 160 || sys < 90)) ||
    (dia && (dia >= 100 || dia < 55)) ||
    (sugar && (sugar >= 16 || sugar < 3.5)) ||
    (pulse && (pulse > 120 || pulse < 45));
  if (red) return { label: "ঝুঁকিপূর্ণ — দ্রুত পরামর্শ নিন", cls: "bg-destructive text-destructive-foreground" };

  const yellow =
    (sys && sys >= 140) || (dia && dia >= 90) || (sugar && sugar >= 11) || (pulse && pulse > 100);
  if (yellow) return { label: "সতর্ক — নজরে রাখুন", cls: "bg-warning text-warning-foreground" };

  return { label: "স্বাভাবিক", cls: "bg-success text-success-foreground" };
}

export function VitalsWidget() {
  const [v, setV] = useState<Vitals>(EMPTY);
  const [draft, setDraft] = useState<Vitals>(EMPTY);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = readLocal(KEY);
    if (raw) {
      try {
        const parsed = { ...EMPTY, ...JSON.parse(raw) } as Vitals;
        setV(parsed);
        setDraft(parsed);
      } catch {
        /* ignore malformed cache */
      }
    }
    setReady(true);
  }, []);

  function save() {
    writeLocal(KEY, JSON.stringify(draft));
    setV(draft);
    setOpen(false);
  }

  const trend = ready ? trendOf(v) : null;

  const tiles = [
    {
      icon: HeartPulse,
      label: "Blood Pressure",
      labelBn: "রক্তচাপ",
      value: v.sys && v.dia ? `${v.sys}/${v.dia}` : "—",
      unit: "mmHg",
    },
    {
      icon: Droplets,
      label: "Blood Sugar",
      labelBn: "ব্লাড সুগার",
      value: v.sugar || "—",
      unit: "mmol/L",
    },
    {
      icon: Activity,
      label: "Pulse Rate",
      labelBn: "পালস রেট",
      value: v.pulse || "—",
      unit: "bpm",
    },
  ];

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-card sm:p-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-foreground">Today&apos;s Patient Vitals</h2>
          <p className="truncate text-xs text-muted-foreground">আজকের ভাইটাল সামারি</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            trend ? trend.cls : "bg-secondary text-secondary-foreground"
          }`}
        >
          {trend ? trend.label : "ডেটা নেই"}
        </span>
      </header>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="min-w-0 rounded-2xl bg-secondary/60 p-4">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <t.icon className="size-4 shrink-0 text-primary" />
              <span className="truncate">{t.labelBn}</span>
            </span>
            <p className="mt-2 truncate text-2xl font-bold text-foreground">{t.value}</p>
            <p className="text-[11px] text-muted-foreground">
              {t.label} • {t.unit}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="softOutline" size="sm">
              <Save /> ভাইটাল আপডেট করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>আজকের ভাইটাল লিখুন</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="v-sys">সিস্টোলিক</Label>
                <Input id="v-sys" inputMode="numeric" value={draft.sys} onChange={(e) => setDraft({ ...draft, sys: e.target.value })} placeholder="120" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-dia">ডায়াস্টোলিক</Label>
                <Input id="v-dia" inputMode="numeric" value={draft.dia} onChange={(e) => setDraft({ ...draft, dia: e.target.value })} placeholder="80" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-sugar">ব্লাড সুগার</Label>
                <Input id="v-sugar" inputMode="decimal" value={draft.sugar} onChange={(e) => setDraft({ ...draft, sugar: e.target.value })} placeholder="6.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-pulse">পালস</Label>
                <Input id="v-pulse" inputMode="numeric" value={draft.pulse} onChange={(e) => setDraft({ ...draft, pulse: e.target.value })} placeholder="78" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="hero" className="w-full" onClick={save}>
                সেভ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button asChild variant="hero" size="sm" className="min-h-11">
          <Link to="/booking/nursing" search={{ service: "vitals" }}>
            নার্স দিয়ে চেক করান
          </Link>
        </Button>
      </div>
    </div>
  );
}
