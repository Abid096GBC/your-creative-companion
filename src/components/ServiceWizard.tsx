import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BodyDiagram, StitchLine } from "@/components/BodyDiagram";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { BILLING_NOTE, DRESSING_KIT_PRICE, PRICES, SERVICES } from "@/lib/site";
import { searchInjections } from "@/lib/injections";

function MedicineSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  const results = searchInjections(value);
  return (
    <div className="relative">
      <Input
        value={value}
        maxLength={120}
        placeholder="টাইপ করুন — যেমন: ax, Ceftron, Meropenem"
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 150)}
        onChange={(e) => onChange(e.target.value)}
      />
      {focused && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
          {results.map((r) => (
            <li key={`${r.brand}-${r.strength}`}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-secondary"
                onClick={() => onChange(`${r.brand} ${r.strength}`)}
              >
                <span className="font-medium text-foreground">
                  {r.brand} {r.strength}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {r.generic} • {r.company} • ৳{r.price}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
import { createBooking } from "@/lib/bookings.functions";
import { nebulizerAvailability, validatePromo } from "@/lib/customer.functions";

type Value = string | number | boolean;
type State = Record<string, Value>;
type Step = {
  title: string;
  render: (s: State, set: (patch: State) => void) => ReactNode;
  validate?: (s: State) => string | null;
};

const chip = (active: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
    active
      ? "border-primary bg-secondary text-primary"
      : "border-border bg-background text-foreground hover:bg-secondary/60"
  }`;

function Choice({
  options,
  value,
  onSelect,
}: {
  options: { value: string; label: string; hint?: string }[];
  value: Value | undefined;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((o) => (
        <button key={o.value} type="button" className={chip(value === o.value)} onClick={() => onSelect(o.value)}>
          {o.label}
          {o.hint && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

function MultiChoice({
  options,
  state,
  set,
}: {
  options: { key: string; label: string }[];
  state: State;
  set: (p: State) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          className={chip(state[o.key] === true)}
          onClick={() => set({ [o.key]: !state[o.key] })}
        >
          <span className="mr-2">{state[o.key] === true ? "☑" : "☐"}</span>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Counter({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-5">
      <Button type="button" variant="softOutline" size="lg" onClick={() => onChange(Math.max(0, value - 1))}>
        −
      </Button>
      <span className="min-w-14 text-center text-3xl font-bold text-primary">{value}</span>
      <Button type="button" variant="softOutline" size="lg" onClick={() => onChange(Math.min(60, value + 1))}>
        +
      </Button>
    </div>
  );
}

/** Split time slots — customers can book several broken slots (e.g. one per dose/session). */
function SlotPicker({
  state,
  set,
  label,
}: {
  state: State;
  set: (p: State) => void;
  label: string;
}) {
  const raw = String(state["split_slots"] ?? "");
  const slots = raw ? raw.split(" | ") : [];
  const [draft, setDraft] = useState("");
  const save = (list: string[]) => set({ split_slots: list.join(" | ") });
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex gap-2">
        <Input
          value={draft}
          maxLength={40}
          placeholder="যেমন: আজ সকাল ৯টা"
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button
          type="button"
          variant="softOutline"
          onClick={() => {
            if (!draft.trim()) return;
            save([...slots, draft.trim()]);
            setDraft("");
          }}
        >
          যোগ
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {["আজ সকাল ৮টা", "আজ দুপুর ২টা", "আজ সন্ধ্যা ৭টা", "আজ রাত ১০টা", "আগামীকাল সকাল ৯টা"].map((q) => (
          <button
            key={q}
            type="button"
            className="rounded-full border border-border px-3 py-1 text-xs hover:bg-secondary"
            onClick={() => !slots.includes(q) && save([...slots, q])}
          >
            + {q}
          </button>
        ))}
      </div>
      {slots.length > 0 && (
        <ul className="space-y-2">
          {slots.map((s, i) => (
            <li
              key={`${s}-${i}`}
              className="flex items-center justify-between rounded-xl border border-primary/25 bg-secondary px-3 py-2 text-sm"
            >
              <span className="font-medium text-primary">
                স্লট {i + 1}: {s}
              </span>
              <button
                type="button"
                className="text-xs text-destructive"
                onClick={() => save(slots.filter((_, idx) => idx !== i))}
              >
                মুছুন
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NebAvailability() {
  const load = useServerFn(nebulizerAvailability);
  const [info, setInfo] = useState<{ total: number; available: number } | null>(null);
  useEffect(() => {
    void load({}).then(setInfo).catch(() => setInfo(null));
  }, [load]);
  if (!info) return null;
  const ok = info.available > 0;
  return (
    <div
      className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
        ok ? "border-accent/40 bg-accent/10 text-accent-foreground" : "border-destructive/40 bg-destructive/10 text-destructive"
      }`}
    >
      <span className={`size-2 rounded-full ${ok ? "animate-pulse bg-accent" : "bg-destructive"}`} />
      {ok ? `${info.available} টি মেশিন এখন available (মোট ${info.total})` : "এই মুহূর্তে সব মেশিন ভাড়ায় আছে — ওয়েটলিস্টে যুক্ত হবেন"}
    </div>
  );
}


function stepsFor(id: string): Step[] {
  switch (id) {
    case "injection":
      return [
        {
          title: "ইনজেকশন / ওষুধের নাম",
          validate: (s) => (String(s["medicine"] ?? "").trim().length < 2 ? "ওষুধের নাম লিখুন" : null),
          render: (s, set) => (
            <MedicineSearch value={String(s["medicine"] ?? "")} onChange={(v) => set({ medicine: v })} />
          ),
        },
        {
          title: "রোগীর ক্যাটাগরি",
          validate: (s) => (s["category"] ? null : "ক্যাটাগরি নির্বাচন করুন"),
          render: (s, set) => (
            <Choice
              value={s["category"]}
              onSelect={(v) => set({ category: v })}
              options={[
                { value: "বড় / Adult", label: "বড় / Adult" },
                { value: "বাচ্চা / Child", label: "বাচ্চা / Child" },
              ]}
            />
          ),
        },
        {
          title: "ইনজেকশন রুট",
          validate: (s) => (s["route"] ? null : "রুট নির্বাচন করুন"),
          render: (s, set) => (
            <Choice
              value={s["route"]}
              onSelect={(v) => set({ route: v })}
              options={[
                { value: "IV", label: "IV — ইন্ট্রাভেনাস" },
                { value: "IM", label: "IM — ইন্ট্রামাসকুলার" },
              ]}
            />
          ),
        },
        {
          title: "ডোজ নির্বাচন",
          validate: (s) =>
            s["dose"] && Number(s["dose_count"] ?? 0) > 0 ? null : "ডোজ ও ডোজ সংখ্যা নির্বাচন করুন",
          render: (s, set) => (
            <div className="space-y-4">
              <Choice
                value={s["dose"]}
                onSelect={(v) => set({ dose: v })}
                options={[
                  { value: "250 mg", label: "250 mg" },
                  { value: "500 mg", label: "500 mg" },
                  { value: "1 gm", label: "1 gm" },
                  { value: "2 gm", label: "2 gm" },
                  { value: "কাস্টম ডোজ", label: "অন্যান্য / কাস্টম ডোজ" },
                ]}
              />
              {s["dose"] === "কাস্টম ডোজ" && (
                <Input
                  value={String(s["dose_custom"] ?? "")}
                  maxLength={40}
                  placeholder="ডোজ লিখুন — যেমন: 40 mg / 1.5 gm"
                  onChange={(e) => set({ dose_custom: e.target.value })}
                />
              )}
              <div>
                <Label>মোট কতটি ডোজ?</Label>
                <div className="mt-2">
                  <Counter
                    value={Number(s["dose_count"] ?? 1)}
                    onChange={(n) => set({ dose_count: Math.max(1, n) })}
                  />
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "ডোজের সময় (স্প্লিট টাইম স্লট)",
          validate: (s) =>
            String(s["split_slots"] ?? "").trim() ? null : "কমপক্ষে একটি সময় স্লট যোগ করুন",
          render: (s, set) => (
            <SlotPicker
              state={s}
              set={set}
              label="প্রতিটি ডোজের জন্য আলাদা সময় দিন — নার্স সেই অনুযায়ী ভিজিট করবেন।"
            />
          ),
        },
      ];

    case "suturing":
      return [
        {
          title: "শরীরের কোন অংশে?",
          validate: (s) => (s["body_region"] ? null : "শরীরের অংশ নির্বাচন করুন"),
          render: (s, set) => (
            <BodyDiagram value={String(s["body_region"] ?? "")} onChange={(v) => set({ body_region: v })} />
          ),
        },
        {
          title: "সেবার ধরন",
          validate: (s) => (s["suture_type"] ? null : "ধরন নির্বাচন করুন"),
          render: (s, set) => (
            <Choice
              value={s["suture_type"]}
              onSelect={(v) => set({ suture_type: v })}
              options={[
                { value: "সেলাই করা / Suturing", label: "সেলাই করা (Suturing)" },
                { value: "সেলাই কাটা / Stitch Removal", label: "সেলাই কাটা (Stitch Removal)" },
              ]}
            />
          ),
        },
        {
          title: "সেলাই সংখ্যা",
          validate: (s) => (Number(s["stitch_count"] ?? 0) > 0 ? null : "সেলাই সংখ্যা দিন"),
          render: (s, set) => (
            <div>
              <Counter value={Number(s["stitch_count"] ?? 0)} onChange={(n) => set({ stitch_count: n })} />
              <StitchLine count={Number(s["stitch_count"] ?? 0)} />
            </div>
          ),
        },
      ];
    case "dressing":
      return [
        {
          title: "ক্ষতের ধরন / সিভিয়ারিটি",
          validate: (s) => (s["severity"] ? null : "ক্ষতের ধরন নির্বাচন করুন"),
          render: (s, set) => (
            <Choice
              value={s["severity"]}
              onSelect={(v) => set({ severity: v })}
              options={[
                { value: "ছোট কাটা / ছোলা (Small)", label: "ছোট কাটা / ছোলা", hint: "৳৩০০ থেকে" },
                { value: "সেলাই ড্রেসিং (Medium)", label: "সেলাই ড্রেসিং", hint: "৳৪০০ থেকে" },
                { value: "বড় / পোড়া ক্ষত (Large)", label: "বড় / পোড়া ক্ষত", hint: "৳৬০০ থেকে" },
              ]}
            />
          ),
        },
        {
          title: "ড্রেসিং কিট যুক্ত করবেন?",
          render: (s, set) => (
            <button type="button" className={chip(s["dressing_kit"] === true)} onClick={() => set({ dressing_kit: !s["dressing_kit"] })}>
              <span className="mr-2">{s["dressing_kit"] === true ? "☑" : "☐"}</span>
              এই অর্ডারে ড্রেসিং কিট যোগ করুন (৳{DRESSING_KIT_PRICE})
              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                গজ, ব্যান্ডেজ, মাইক্রোপোর টেপ ও অ্যান্টিসেপটিক
              </span>
            </button>
          ),
        },
      ];
    case "saline":
      return [
        {
          title: "কোন সেবাটি প্রয়োজন?",
          validate: (s) => (s["saline_mode"] ? null : "একটি অপশন নির্বাচন করুন"),
          render: (s, set) => (
            <Choice
              value={s["saline_mode"]}
              onSelect={(v) => set({ saline_mode: v })}
              options={[
                { value: "স্যালাইন সেটআপ (ক্যানুলা আছে)", label: "স্যালাইন সেটআপ", hint: "ক্যানুলা আগে থেকেই আছে — ৳৩০০" },
                { value: "ক্যানুলা + স্যালাইন পুশ", label: "ক্যানুলা + স্যালাইন পুশ", hint: "৳৬০০" },
              ]}
            />
          ),
        },
        {
          title: "স্যালাইনের ধরন",
          validate: (s) => (s["saline_type"] ? null : "স্যালাইনের ধরন নির্বাচন করুন"),
          render: (s, set) => (
            <Choice
              value={s["saline_type"]}
              onSelect={(v) => set({ saline_type: v })}
              options={[
                { value: "Normal Saline (NS)", label: "Normal Saline (NS)" },
                { value: "DNS", label: "DNS" },
                { value: "Cholera Saline", label: "কলেরা স্যালাইন (Cholera Saline)" },
              ]}
            />
          ),
        },
        {
          title: "স্যালাইন / ওষুধের নাম ও রোগীর তথ্য",
          validate: (s) =>
            String(s["saline_product"] ?? "").trim().length < 2
              ? "স্যালাইন বা ওষুধের নাম লিখুন"
              : s["category"]
                ? null
                : "রোগীর ক্যাটাগরি নির্বাচন করুন",
          render: (s, set) => (
            <div className="space-y-4">
              <div>
                <Label>স্যালাইন / সঙ্গে দেওয়া ওষুধের নাম</Label>
                <div className="mt-1.5">
                  <MedicineSearch
                    value={String(s["saline_product"] ?? "")}
                    onChange={(v) => set({ saline_product: v })}
                  />
                </div>
              </div>
              <div>
                <Label>ব্যাগ সংখ্যা</Label>
                <div className="mt-2">
                  <Counter value={Number(s["bag_count"] ?? 1)} onChange={(n) => set({ bag_count: Math.max(1, n) })} />
                </div>
              </div>
              <div>
                <Label>রোগীর ক্যাটাগরি</Label>
                <div className="mt-1.5">
                  <Choice
                    value={s["category"]}
                    onSelect={(v) => set({ category: v })}
                    options={[
                      { value: "বড় / Adult", label: "বড় / Adult" },
                      { value: "বাচ্চা / Child", label: "বাচ্চা / Child" },
                    ]}
                  />
                </div>
              </div>
            </div>
          ),
        },
      ];
    case "nebulizer":
      return [
        {
          title: "সেবার মোড",
          validate: (s) => (s["mode"] ? null : "মোড নির্বাচন করুন"),
          render: (s, set) => (
            <div>
              <Choice
                value={s["mode"]}
                onSelect={(v) => set({ mode: v })}
                options={[
                  { value: "এক সেশন (ওষুধ ছাড়া)", label: "এক সেশন — ওষুধ ছাড়া", hint: "৳৫০" },
                  { value: "এক সেশন (ওষুধসহ)", label: "এক সেশন — ওষুধসহ", hint: "৳১০০" },
                  { value: "মেশিন রেন্ট ৭ দিন", label: "৭ দিনের মেশিন রেন্ট", hint: "৳৫০০ (ওষুধ আলাদা)" },
                ]}
              />
              {String(s["mode"] ?? "").includes("রেন্ট") && <NebAvailability />}
            </div>
          ),
        },
        {
          title: "সেশনের সময় (স্প্লিট টাইম স্লট)",
          validate: (s) =>
            String(s["split_slots"] ?? "").trim() ? null : "কমপক্ষে একটি সময় স্লট যোগ করুন",
          render: (s, set) => (
            <SlotPicker
              state={s}
              set={set}
              label={
                String(s["mode"] ?? "").includes("রেন্ট")
                  ? "মেশিন ডেলিভারি ও ফেরত নেওয়ার সময় যোগ করুন।"
                  : "প্রতিটি নেবুলাইজেশন সেশনের জন্য আলাদা সময় দিন।"
              }
            />
          ),
        },
      ];

    case "vitals":
      return [
        {
          title: "কোন কোন পরীক্ষা দরকার?",
          validate: (s) =>
            s["bp"] || s["glucose"] || s["spo2"] ? null : "কমপক্ষে একটি পরীক্ষা নির্বাচন করুন",
          render: (s, set) => (
            <MultiChoice
              state={s}
              set={set}
              options={[
                { key: "bp", label: "রক্তচাপ (BP)" },
                { key: "glucose", label: "ব্লাড সুগার (Glucose)" },
                { key: "spo2", label: "অক্সিজেন স্যাচুরেশন (SpO2)" },
              ]}
            />
          ),
        },
      ];
    case "caregiving":
    case "post-surgery":
      return [
        {
          title: "কী ধরনের সহায়তা প্রয়োজন?",
          validate: (s) =>
            s["need_postop"] || s["need_stroke"] || s["need_tube"] || s["need_daily"]
              ? null
              : "কমপক্ষে একটি নির্বাচন করুন",
          render: (s, set) => (
            <MultiChoice
              state={s}
              set={set}
              options={[
                { key: "need_postop", label: "অপারেশন পরবর্তী যত্ন" },
                { key: "need_stroke", label: "স্ট্রোক রোগীর যত্ন" },
                { key: "need_tube", label: "ক্যাথেটার / রাইলস টিউব কেয়ার" },
                { key: "need_daily", label: "দৈনন্দিন সহায়তা (খাওয়ানো, গোসল, চলাফেরা)" },
              ]}
            />
          ),
        },
        {
          title: "সেবার সময়কাল",
          validate: (s) => (s["duration"] ? null : "সময়কাল নির্বাচন করুন"),
          render: (s, set) => (
            <Choice
              value={s["duration"]}
              onSelect={(v) => set({ duration: v })}
              options={[
                { value: "৬ ঘণ্টা শিফট", label: "৬ ঘণ্টা শিফট" },
                { value: "১২ ঘণ্টা শিফট", label: "১২ ঘণ্টা শিফট" },
                { value: "২৪ ঘণ্টা / সার্বক্ষণিক", label: "২৪ ঘণ্টা / সার্বক্ষণিক" },
                { value: "মাসিক প্যাকেজ", label: "মাসিক প্যাকেজ" },
              ]}
            />
          ),
        },
      ];
    case "translator":
      return [
        {
          title: "কী অনুবাদ করাতে চান?",
          validate: (s) =>
            String(s["terms"] ?? "").trim().length > 1 || s["has_photo"] === true
              ? null
              : "মেডিকেল টার্ম লিখুন অথবা ছবি পাঠানোর অপশন নির্বাচন করুন",
          render: (s, set) => (
            <div className="space-y-3">
              <Textarea
                value={String(s["terms"] ?? "")}
                maxLength={600}
                placeholder="প্রেসক্রিপশনের ওষুধ বা মেডিকেল টার্ম লিখুন"
                onChange={(e) => set({ terms: e.target.value })}
              />
              <button type="button" className={chip(s["has_photo"] === true)} onClick={() => set({ has_photo: !s["has_photo"] })}>
                <span className="mr-2">{s["has_photo"] === true ? "☑" : "☐"}</span>
                আমি প্রেসক্রিপশন / রিপোর্টের ছবি পাঠাতে চাই
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  টিকিট তৈরি হলে আমাদের টিম আপনাকে কল/মেসেজ দিয়ে ছবি সংগ্রহ করবে।
                </span>
              </button>
            </div>
          ),
        },
        {
          title: "উত্তর কীভাবে চান?",
          validate: (s) => (s["reply_pref"] ? null : "একটি অপশন নির্বাচন করুন"),
          render: (s, set) => (
            <Choice
              value={s["reply_pref"]}
              onSelect={(v) => set({ reply_pref: v })}
              options={[
                { value: "ভয়েস নোট", label: "🎙️ ভয়েস নোট" },
                { value: "বাংলা টেক্সট", label: "📝 বাংলা টেক্সট" },
              ]}
            />
          ),
        },
      ];
    case "product":
      return [
        {
          title: "পরিমাণ নির্বাচন করুন",
          validate: (s) => (Number(s["qty"] ?? 1) > 0 ? null : "পরিমাণ দিন"),
          render: (s, set) => (
            <div>
              <Counter value={Number(s["qty"] ?? 1)} onChange={(n) => set({ qty: Math.max(1, n) })} />
              <p className="mt-3 text-center text-sm text-muted-foreground">
                {String(s["product"] ?? "")} — একক মূল্য ৳{Number(s["unit_price"] ?? 0)}
              </p>
            </div>
          ),
        },
      ];
    default:
      return [
        {
          title: "আপনার প্রয়োজন লিখুন",
          validate: (s) => (String(s["requirement"] ?? "").trim().length > 3 ? null : "সংক্ষেপে লিখুন"),
          render: (s, set) => (
            <Textarea
              value={String(s["requirement"] ?? "")}
              maxLength={500}
              placeholder="আপনার প্রয়োজন সংক্ষেপে লিখুন"
              onChange={(e) => set({ requirement: e.target.value })}
            />
          ),
        },
      ];
  }
}

function bn(n: number) {
  return `৳${n.toLocaleString("en-US")}`;
}

function estimate(id: string, s: State): { label: string; amount?: number } {
  const P = PRICES;
  switch (id) {
    case "injection": {
      const per = s["category"] === "বাচ্চা / Child" ? P.injectionChild : P.injectionAdult;
      const doses = Math.max(1, Number(s["dose_count"] ?? 1));
      const amount = per * doses;
      return { label: doses > 1 ? `${bn(amount)} (${doses} × ${bn(per)})` : bn(amount), amount };
    }
    case "suturing": {
      const n = Number(s["stitch_count"] ?? 0);
      const rate = s["suture_type"] === "সেলাই কাটা / Stitch Removal" ? P.stitchRemovalPerStitch : P.suturingPerStitch;
      const amount = n * rate;
      return { label: `${bn(amount)} (${n} × ${bn(rate)})`, amount };
    }
    case "dressing": {
      const amount = P.dressing + (s["dressing_kit"] === true ? DRESSING_KIT_PRICE : 0);
      return { label: bn(amount), amount };
    }
    case "nebulizer": {
      const mode = String(s["mode"] ?? "");
      const amount = mode.includes("রেন্ট") ? P.nebRent : mode.includes("ওষুধসহ") ? P.nebWithMed : P.nebNoMed;
      return { label: bn(amount), amount };
    }
    case "vitals": {
      const n = [s["bp"], s["glucose"], s["spo2"]].filter(Boolean).length;
      const amount = n >= 3 ? P.vitals3 : n === 2 ? P.vitals2 : P.vitals1;
      return { label: bn(amount), amount };
    }
    case "saline": {
      const mode = String(s["saline_mode"] ?? "");
      const per = mode.includes("ক্যানুলা + স্যালাইন") ? P.cannulaSaline : P.salineOnly;
      const bags = Math.max(1, Number(s["bag_count"] ?? 1));
      const amount = per * bags;
      return { label: bags > 1 ? `${bn(amount)} (${bags} × ${bn(per)})` : bn(amount), amount };
    }
    case "translator":
      return { label: "সম্পূর্ণ ফ্রি", amount: 0 };
    case "product": {
      const amount = Number(s["unit_price"] ?? 0) * Number(s["qty"] ?? 1);
      return { label: bn(amount), amount };
    }
    default:
      return { label: "কাস্টম প্যাকেজ" };
  }
}

const contactSchema = z.object({
  customer_name: z.string().trim().min(2, "রোগীর নাম লিখুন").max(80),
  phone: z.string().trim().regex(/^[0-9+\-\s]{6,20}$/, "সঠিক ফোন নম্বর লিখুন"),
  address: z.string().trim().min(4, "ঠিকানা লিখুন").max(240),
});

export function ServiceWizard({
  serviceId,
  children,
  extraTitle,
  presetDetails,
}: {
  serviceId: string;
  children: ReactNode;
  extraTitle?: string;
  presetDetails?: State;
}) {
  const service = SERVICES.find((s) => s.id === serviceId);
  const serviceLabel = extraTitle ?? `${service?.title ?? serviceId} (${service?.titleEn ?? ""})`.trim();
  const submit = useServerFn(createBooking);
  const checkPromo = useServerFn(validatePromo);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<State>(presetDetails ?? {});
  const [contact, setContact] = useState({ name: "", phone: "", address: "", referral: "", notes: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tracking, setTracking] = useState("");
  const [slot, setSlot] = useState("");
  const [pay, setPay] = useState<"Cash" | "bKash">("Cash");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");

  const custom = stepsFor(serviceId);
  const total = custom.length + 1;
  const est = estimate(serviceId, state);
  const price = est.label;

  function set(patch: State) {
    setState((prev) => ({ ...prev, ...patch }));
    setError("");
  }

  function reset() {
    setStep(0);
    setState(presetDetails ?? {});
    setContact({ name: "", phone: "", address: "", referral: "", notes: "" });
    setError("");
    setTracking("");
    setBusy(false);
    setSlot("");
    setPay("Cash");
    setDiscount(0);
    setPromoMsg("");
  }

  async function applyPromo() {
    const code = contact.referral.trim();
    const subtotal = est.amount ?? 0;
    if (!code || subtotal <= 0) return;
    const res = await checkPromo({ data: { code, subtotal } });
    if (res.ok) {
      setDiscount(res.discount);
      setPromoMsg(`✅ ${res.label} প্রয়োগ হয়েছে`);
    } else {
      setDiscount(0);
      setPromoMsg(`⚠️ ${res.message}`);
    }
  }

  async function finish() {
    const parsed = contactSchema.safeParse({
      customer_name: contact.name,
      phone: contact.phone,
      address: contact.address,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "তথ্য পূরণ করুন");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const details: State = {};
      for (const [k, v] of Object.entries(state)) if (v !== "" && v !== false) details[k] = v;
      const res = await submit({
        data: {
          service: serviceLabel,
          customer_name: parsed.data.customer_name,
          phone: parsed.data.phone,
          address: parsed.data.address,
          details,
          body_region: state["body_region"] ? String(state["body_region"]) : undefined,
          stitch_count: state["stitch_count"] ? Number(state["stitch_count"]) : undefined,
          referral_code: contact.referral.trim() || undefined,
          price_estimate: price,
          amount: est.amount,
          notes: contact.notes.trim() || undefined,
          time_slot: slot.trim() || undefined,
          payment_method: pay,
          promo_code: contact.referral.trim() || undefined,
          discount,
        },
      });
      setTracking(res.trackingId);
    } catch {
      setError("অনুরোধ পাঠানো যায়নি — আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (step < custom.length) {
      const v = custom[step]?.validate?.(state) ?? null;
      if (v) return setError(v);
      setError("");
      return setStep(step + 1);
    }
    void finish();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {tracking ? (
          <div className="py-4 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
              <CheckCircle2 className="size-9" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-foreground">অনুরোধ সফলভাবে জমা হয়েছে!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              আমাদের কেয়ার টিম ৩০ মিনিটের মধ্যে আপনাকে কল করে নিশ্চিত করবে।
            </p>
            <div className="mt-5 rounded-2xl border border-primary/25 bg-secondary px-5 py-4">
              <p className="text-xs font-medium text-muted-foreground">আপনার ট্র্যাকিং আইডি</p>
              <p className="mt-1 text-2xl font-bold tracking-wide text-primary">#{tracking}</p>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Copy className="size-3.5" /> আইডিটি সংরক্ষণ করুন — স্ট্যাটাস জানতে কাজে লাগবে।
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              স্ট্যাটাস: <span className="text-accent">Pending — নিশ্চিতকরণের অপেক্ষায়</span>
            </p>
            <Button className="mt-5 w-full" variant="hero" onClick={() => setOpen(false)}>
              ঠিক আছে
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-lg">
                <AnimatedIcon id={serviceId} className="size-10" />
                {service?.title ?? "সেবা বুকিং"}
              </DialogTitle>
              <DialogDescription>
                ধাপ {step + 1} / {total} — {step < custom.length ? custom[step]?.title : "আপনার তথ্য"}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: total }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>

            <div className="space-y-4">
              {step < custom.length ? (
                custom[step]?.render(state, set)
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="w-name">রোগীর নাম</Label>
                    <Input
                      id="w-name"
                      className="mt-1.5"
                      maxLength={80}
                      value={contact.name}
                      placeholder="আপনার নাম"
                      onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="w-phone">ফোন নম্বর</Label>
                      <Input
                        id="w-phone"
                        className="mt-1.5"
                        inputMode="tel"
                        maxLength={20}
                        value={contact.phone}
                        placeholder="01XXXXXXXXX"
                        onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="w-ref">রেফারাল / প্রমো কোড (যদি থাকে)</Label>
                      <Input
                        id="w-ref"
                        className="mt-1.5"
                        maxLength={40}
                        value={contact.referral}
                        placeholder="e.g., ROHIM50"
                        onChange={(e) => setContact((c) => ({ ...c, referral: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="w-address">ঠিকানা / এলাকা</Label>
                    <Input
                      id="w-address"
                      className="mt-1.5"
                      maxLength={240}
                      value={contact.address}
                      placeholder="বাসা, রোড, এলাকা"
                      onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="w-notes">বিশেষ নোট</Label>
                    <Textarea
                      id="w-notes"
                      className="mt-1.5"
                      maxLength={600}
                      value={contact.notes}
                      placeholder="রোগীর অবস্থা বা পছন্দের সময় লিখুন"
                      onChange={(e) => setContact((c) => ({ ...c, notes: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {step === custom.length && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="w-slot">পছন্দের সময়</Label>
                    <Input
                      id="w-slot"
                      className="mt-1.5"
                      maxLength={60}
                      value={slot}
                      placeholder="যেমন: আজ রাত ৮টা / আগামীকাল সকাল ১০টা"
                      onChange={(e) => setSlot(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>পেমেন্ট পদ্ধতি</Label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      {(["Cash", "bKash"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPay(m)}
                          className={chip(pay === m)}
                        >
                          {m === "Cash" ? "ক্যাশ (সার্ভিসের পর)" : "বিকাশ"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {contact.referral.trim() && (
                    <Button type="button" variant="softOutline" className="w-full" onClick={applyPromo}>
                      প্রমো কোড যাচাই করুন
                    </Button>
                  )}
                  {promoMsg && <p className="text-xs text-muted-foreground">{promoMsg}</p>}
                </div>
              )}

              <div className="rounded-xl border border-primary/20 bg-secondary px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">আনুমানিক মূল্য</span>
                  <span className="text-sm font-medium text-foreground">{price}</span>
                </div>
                {discount > 0 && (
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">ছাড়</span>
                    <span className="font-medium text-accent">−৳{discount}</span>
                  </div>
                )}
                <div className="mt-1 flex items-center justify-between border-t border-primary/15 pt-1">
                  <span className="text-sm text-muted-foreground">সর্বমোট</span>
                  <span className="text-lg font-bold text-primary">
                    {est.amount === undefined ? price : `৳${Math.max(0, (est.amount ?? 0) - discount)}`}
                  </span>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
                {BILLING_NOTE}
              </p>

              <div className="flex gap-2">
                {step > 0 && (
                  <Button type="button" variant="softOutline" className="flex-1" onClick={() => setStep(step - 1)}>
                    পেছনে
                  </Button>
                )}
                <Button type="button" variant="hero" className="flex-1" disabled={busy} onClick={next}>
                  {busy && <Loader2 className="animate-spin" />}
                  {step < custom.length ? "পরবর্তী ধাপ" : "বুকিং কনফার্ম করুন"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
