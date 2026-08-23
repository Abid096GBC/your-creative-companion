import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

type Slide = {
  id: string;
  badge: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
  bg: string;
};

const SLIDES: Slide[] = [
  {
    id: "nursing",
    badge: "নার্সিং অফার",
    title: "ঘরে বসেই ইনজেকশন ও ড্রেসিং",
    desc: "প্রশিক্ষিত নার্স ৬০ মিনিটেই আপনার দরজায় — ৳৩০০ থেকে শুরু।",
    cta: "সেবা দেখুন",
    href: "/#services",
    bg: "gradient-offer-a",
  },
  {
    id: "vitals",
    badge: "কম্বো প্যাক",
    title: "ভাইটাল চেক কম্বো ৳২০০",
    desc: "প্রেসার + ব্লাড সুগার + অক্সিজেন পালস — এক ভিজিটেই সব।",
    cta: "বুক করুন",
    href: "/#services",
    bg: "gradient-offer-b",
  },
  {
    id: "store",
    badge: "স্টোর ডিসকাউন্ট",
    title: "মেডিকেল ইকুইপমেন্ট ও সার্জিক্যাল সামগ্রী",
    desc: "নেবুলাইজার রেন্ট ৳৫০০ • ড্রেসিং কিট ৳৯০ থেকে।",
    cta: "স্টোরে যান",
    href: "/store",
    bg: "gradient-offer-c",
  },
];

export function PromoCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border/60 shadow-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {SLIDES.map((s) => (
          <article
            key={s.id}
            className={`${s.bg} w-full shrink-0 px-5 py-7 text-primary-foreground sm:px-8 sm:py-10`}
          >
            <span className="inline-flex rounded-full bg-background/20 px-3 py-1 text-xs font-semibold">
              {s.badge}
            </span>
            <h2 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">{s.title}</h2>
            <p className="mt-2 max-w-lg text-sm opacity-90">{s.desc}</p>
            <a
              href={s.href}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-background/95 px-4 text-sm font-semibold text-primary transition-transform hover:scale-105"
            >
              {s.cta} <ArrowRight className="size-4" />
            </a>
          </article>
        ))}
      </div>

      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            aria-label={`স্লাইড ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-1.5 rounded-full bg-background transition-all ${
              idx === i ? "w-6 opacity-100" : "w-1.5 opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
