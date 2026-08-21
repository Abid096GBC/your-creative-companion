import { useMemo } from "react";

type Region = {
  id: string;
  label: string;
  cx: number;
  cy: number;
};

export const BODY_REGIONS: Region[] = [
  { id: "মাথা / Head", label: "মাথা", cx: 100, cy: 28 },
  { id: "বুক / Chest", label: "বুক", cx: 100, cy: 82 },
  { id: "পিঠ / Back", label: "পিঠ", cx: 100, cy: 118 },
  { id: "হাত / Arm", label: "হাত", cx: 48, cy: 95 },
  { id: "কব্জি / Hand", label: "কব্জি", cx: 34, cy: 150 },
  { id: "পা / Leg", label: "পা", cx: 79, cy: 205 },
  { id: "পায়ের পাতা / Foot", label: "পায়ের পাতা", cx: 79, cy: 268 },
];

export function BodyDiagram({
  value,
  onChange,
}: {
  value: string;
  onChange: (region: string) => void;
}) {
  const active = useMemo(() => BODY_REGIONS.find((r) => r.id === value), [value]);
  const viewBox = active
    ? `${active.cx - 45} ${active.cy - 45} 90 90`
    : "0 0 200 290";

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-border bg-secondary/40">
        <svg
          viewBox={viewBox}
          className="mx-auto h-64 w-full transition-[view-box] duration-500 ease-out"
          style={{ transition: "all 500ms cubic-bezier(0.22,1,0.36,1)" }}
          role="img"
          aria-label="শরীরের অংশ নির্বাচন করুন"
        >
          <g fill="currentColor" className="text-primary/15">
            <circle cx="100" cy="28" r="20" />
            <rect x="78" y="50" width="44" height="76" rx="16" />
            <rect x="36" y="56" width="20" height="90" rx="10" />
            <rect x="144" y="56" width="20" height="90" rx="10" />
            <circle cx="34" cy="152" r="10" />
            <circle cx="166" cy="152" r="10" />
            <rect x="82" y="126" width="36" height="18" rx="8" />
            <rect x="68" y="144" width="22" height="118" rx="11" />
            <rect x="110" y="144" width="22" height="118" rx="11" />
            <ellipse cx="79" cy="270" rx="14" ry="9" />
            <ellipse cx="121" cy="270" rx="14" ry="9" />
          </g>
          {BODY_REGIONS.map((r) => {
            const isActive = r.id === value;
            return (
              <g key={r.id} onClick={() => onChange(r.id)} className="cursor-pointer">
                <circle
                  cx={r.cx}
                  cy={r.cy}
                  r={isActive ? 11 : 9}
                  className={
                    isActive
                      ? "fill-primary stroke-primary-foreground"
                      : "fill-card stroke-primary/50 hover:fill-secondary"
                  }
                  strokeWidth="2"
                />
                {isActive && (
                  <circle
                    cx={r.cx}
                    cy={r.cy}
                    r="18"
                    className="fill-none stroke-primary/50 pin-ping"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-2">
        {BODY_REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onChange(r.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              value === r.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-secondary"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs font-medium text-muted-foreground underline"
        >
          পুরো শরীর দেখুন (জুম আউট)
        </button>
      )}
    </div>
  );
}

export function StitchLine({ count }: { count: number }) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-secondary/30 p-4">
      <div className="relative flex h-14 items-center justify-center">
        <div className="absolute h-1 w-full rounded-full bg-destructive/50" />
        <div className="relative flex w-full flex-wrap items-center justify-center gap-1.5">
          {Array.from({ length: Math.min(count, 40) }).map((_, i) => (
            <span
              key={i}
              className="stitch-mark text-sm leading-none"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              ❌
            </span>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {count > 0 ? `${count} টি সেলাই চিহ্নিত হয়েছে` : "সেলাই সংখ্যা নির্বাচন করুন"}
      </p>
    </div>
  );
}
