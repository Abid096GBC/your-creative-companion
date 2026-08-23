import { Bot, ScanLine } from "lucide-react";

export function OshudShonggiCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-5 shadow-card sm:p-7">
      <span className="gradient-gold absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground shadow-glow">
        Coming Soon
      </span>
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
        <span className="gradient-primary grid size-14 shrink-0 place-items-center rounded-2xl text-primary-foreground shadow-glow">
          <Bot className="size-7" />
        </span>
        <div className="min-w-0 pr-16 sm:pr-24">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            OshudShonggi (ওষুধসঙ্গী) — AI Health &amp; Medicine Assistant
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your smart AI prescription scanner &amp; medicine reminder is arriving soon!
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
            <ScanLine className="size-4" /> প্রেসক্রিপশন স্ক্যান • ওষুধের রিমাইন্ডার • ডোজ ট্র্যাকিং
          </p>
        </div>
      </div>
    </div>
  );
}
