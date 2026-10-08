import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

type Slide = {
  id: string;
  badge: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
  bg: string;
  image?: string | null;
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

const BGS = ["gradient-offer-a", "gradient-offer-b", "gradient-offer-c"];

export function PromoCarousel() {
  const [slides, setSlides] = useState<Slide[]>(SLIDES);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    void supabase
      .from("hero_banners")
      .select("id, title, subtitle, discount_text, image_url, link_url, sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!data?.length) return;
        setSlides(
          data.map((b, n) => ({
            id: b.id,
            badge: b.discount_text || "অফার",
            title: b.title,
            desc: b.subtitle,
            cta: "বিস্তারিত",
            href: b.link_url || "/booking/nursing",
            bg: BGS[n % BGS.length]!,
            image: b.image_url,
          })),
        );
        setI(0);
      });
  }, []);

  const count = slides.length;
  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % count), 4500);
    return () => clearInterval(t);
  }, [paused, count]);

  return (
    <div
      className="relative touch-pan-y overflow-hidden rounded-3xl border border-border/60 shadow-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        setPaused(false);
        if (start == null || end == null) return;
        const dx = end - start;
        if (Math.abs(dx) < 40) return;
        setI((v) => (dx < 0 ? (v + 1) % count : (v - 1 + count) % count));
      }}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {slides.map((s) => (
          <article
            key={s.id}
            className={`${s.bg} relative w-full shrink-0 overflow-hidden px-5 py-7 text-primary-foreground sm:px-8 sm:py-10`}
          >
            {s.image && (
              <>
                <img src={s.image} alt="" className="absolute inset-0 size-full object-cover" draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/10" />
              </>
            )}
            <div className="relative">
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
            </div>
          </article>
        ))}
      </div>

      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {slides.map((s, idx) => (
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
