import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Search } from "lucide-react";
import { PRODUCTS, SERVICES } from "@/lib/site";

type Hit = { id: string; label: string; sub: string; href: string };

const EXTRA: Hit[] = [
  { id: "doctor", label: "Doctor Consultation", sub: "স্পেশালিস্ট ডাক্তার অ্যাপয়েন্টমেন্ট", href: "/#services" },
  { id: "lab", label: "Lab Tests", sub: "হোম স্যাম্পল কালেকশন", href: "/#services" },
  { id: "store", label: "Medical Store", sub: "মেডিকেল ইকুইপমেন্ট কিনুন ও ভাড়া নিন", href: "/store" },
];

export function HomeSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    setMicOk(Boolean(w["SpeechRecognition"] || w["webkitSpeechRecognition"]));
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const index = useMemo<Hit[]>(
    () => [
      ...SERVICES.map((s) => ({ id: s.id, label: s.title, sub: s.titleEn, href: "/#services" })),
      ...PRODUCTS.map((p) => ({ id: p.id, label: p.name, sub: p.nameEn, href: "/store" })),
      ...EXTRA,
    ],
    [],
  );

  const hits = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return index
      .filter((h) => h.label.toLowerCase().includes(term) || h.sub.toLowerCase().includes(term))
      .slice(0, 6);
  }, [q, index]);

  function startVoice() {
    const w = window as unknown as Record<string, any>;
    const Ctor = w["SpeechRecognition"] || w["webkitSpeechRecognition"];
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "bn-BD";
    rec.interimResults = false;
    rec.onresult = (ev: any) => {
      const text = ev?.results?.[0]?.[0]?.transcript ?? "";
      setQ(text);
      setOpen(true);
    };
    rec.start();
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-border bg-card px-3 shadow-card focus-within:border-primary/60">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          aria-label="সার্চ"
          placeholder="Search Nursing Services, Doctors, Lab Tests, Equipment..."
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {micOk && (
          <button
            type="button"
            onClick={startVoice}
            aria-label="ভয়েস সার্চ"
            className="grid size-9 shrink-0 place-items-center rounded-full text-primary transition-colors hover:bg-secondary"
          >
            <Mic className="size-5" />
          </button>
        )}
      </div>

      {open && hits.length > 0 && (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-glow">
          {hits.map((h) => (
            <li key={`${h.href}-${h.id}`}>
              <a
                href={h.href}
                className="flex min-w-0 flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-secondary"
              >
                <span className="truncate text-sm font-medium text-foreground">{h.label}</span>
                <span className="truncate text-xs text-muted-foreground">{h.sub}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
