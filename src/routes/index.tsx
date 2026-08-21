import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  Camera,
  Check,
  Clock,
  Gift,
  MessageCircle,
  Phone,
  Syringe,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ServiceWizard } from "@/components/ServiceWizard";
import { StoreSection } from "@/components/StoreSection";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { SERVICES, SITE, waLink } from "@/lib/site";
import heroImage from "@/assets/hero-care.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "শুশ্রূষা | ইনজেকশন, সেলাই, ড্রেসিং ও নেবুলাইজার হোম সার্ভিস" },
      {
        name: "description",
        content:
          "শুশ্রূষা (Shushrusha) — ঘরে বসে ইনজেকশন পুশ (৳৩০০ থেকে), সেলাই ও সেলাই কাটা, ড্রেসিং, নেবুলাইজার, স্যালাইন ক্যানুলা ও ভাইটাল চেক। ইন-ওয়েবসাইট বুকিং, ট্র্যাকিং আইডি ও ফ্রি মেডিকেল ট্রান্সলেটর।",
      },
      { property: "og:title", content: "শুশ্রূষা | ইনস্ট্যান্ট হোম নার্সিং প্রসিডিউর সার্ভিস" },
      {
        property: "og:description",
        content:
          "ইনজেকশন, সেলাই, ড্রেসিং, নেবুলাইজার, IV ক্যানুলা ও ভাইটাল চেক — স্বচ্ছ মূল্যে আপনার দরজায়, অনলাইন বুকিং ট্র্যাকিংসহ।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const TRUST = [
  { icon: BadgeCheck, title: "যাচাইকৃত ও দক্ষ নার্স", desc: "প্রতিটি নার্স সার্টিফায়েড, অভিজ্ঞ ও ব্যাকগ্রাউন্ড ভেরিফায়েড।" },
  { icon: Clock, title: "২৪/৭ দ্রুত ডোরস্টেপ সেবা", desc: "কল করার ৬০ মিনিটের মধ্যে সেবা পৌঁছে দেওয়ার লক্ষ্য।" },
  { icon: Wallet, title: "সাশ্রয়ী ও স্বচ্ছ খরচ", desc: "কোনো লুকানো চার্জ নেই — আগেই জানবেন সম্পূর্ণ খরচ।" },
];

const PRESCRIPTION_MSG =
  "Hello Shushrusha, I need FREE prescription guidance. I am sending a photo of my prescription/medicine.";

function Home() {
  const primary = SERVICES.filter((s) => s.primary);
  const secondary = SERVICES.filter((s) => !s.primary);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section id="home" className="gradient-soft border-b border-border/60">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1 text-xs font-semibold text-primary">
                <Syringe className="size-4" /> ইনস্ট্যান্ট অন-ডিমান্ড নার্সিং প্রসিডিউর
              </span>
              <h1 className="mt-5 text-3xl leading-tight font-bold text-foreground sm:text-4xl lg:text-5xl">
                ঘরে বসেই <span className="text-primary">ইনজেকশন, সেলাই ও ড্রেসিং</span> সেবা
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                প্রশিক্ষিত নার্সের মাধ্যমে দ্রুত ও নিরাপদ মেডিকেল প্রসিডিউর — ওয়েবসাইট থেকেই বুক করুন,
                সাথে সাথেই ট্র্যাকিং আইডি পান।
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ServiceWizard serviceId="injection">
                  <Button variant="hero" size="lg">
                    <Syringe /> ইনজেকশন পুশ বুক করুন
                  </Button>
                </ServiceWizard>
                <Button asChild variant="whatsapp" size="lg">
                  <a href={waLink("Hello Shushrusha, I would like to book a service.")} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> WhatsApp Chat
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="বাসায় রোগীকে ইনজেকশন ও নার্সিং সেবা দিচ্ছেন একজন প্রশিক্ষিত নার্স"
                width={1280}
                height={1024}
                className="w-full rounded-3xl border border-border object-cover shadow-glow"
              />
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="mx-auto max-w-6xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">সেবা ও নির্ধারিত মূল্য</h2>
            <p className="mt-3 text-muted-foreground">
              প্রতিটি সেবার জন্য ধাপে ধাপে বুকিং উইজার্ড — মূল্য আগেই দেখে নিন।
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {primary.map((s) => (
              <article key={s.id} className="card-elevated flex flex-col p-6">
                <AnimatedIcon id={s.id} />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="text-xs font-medium tracking-wide text-accent">{s.titleEn}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <p className="mt-4 text-xl font-bold text-primary">{s.price}</p>
                {s.priceNote && <p className="mt-1 text-xs text-muted-foreground">{s.priceNote}</p>}
                <div className="mt-5">
                  <ServiceWizard serviceId={s.id}>
                    <Button variant={s.id === "injection" ? "hero" : "softOutline"} className="w-full">
                      বুক করুন
                    </Button>
                  </ServiceWizard>
                </div>
              </article>
            ))}
          </div>

          {secondary.length > 0 && (
            <div className="mt-8 grid gap-5">
              {secondary.map((s) => (
                <article
                  key={s.id}
                  className="card-elevated flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <AnimatedIcon id={s.id} />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                      <p className="text-xs font-medium tracking-wide text-accent">{s.titleEn}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                      <p className="mt-1 text-sm font-semibold text-primary">{s.price}</p>
                    </div>
                  </div>
                  <ServiceWizard serviceId={s.id}>
                    <Button variant="softOutline">
                      {s.id === "translator" ? "ফ্রি রিকোয়েস্ট করুন" : "বুক করুন"}
                    </Button>
                  </ServiceWizard>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Store */}
        <StoreSection />

        {/* Free prescription guidance */}
        <section id="packages" className="mx-auto max-w-6xl px-4 py-16">
          <div className="card-elevated relative overflow-hidden p-8 md:p-10">
            <span className="gradient-primary absolute -top-3 left-8 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground">
              সম্পূর্ণ ফ্রি
            </span>
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                  <Gift className="size-6 text-accent" /> ফ্রি প্রেসক্রিপশন গাইডেন্স
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  ডাক্তারের প্রেসক্রিপশন বুঝতে সমস্যা হচ্ছে? ওষুধের ছবি তুলুন এবং আমাদের ওয়াটসঅ্যাপে
                  পাঠান—আমাদের টিম সম্পূর্ণ বিনামূল্যে আপনাকে বিস্তারিত বুঝিয়ে দেবে।
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0">
                <Button asChild variant="whatsapp" size="lg">
                  <a href={waLink(PRESCRIPTION_MSG)} target="_blank" rel="noopener noreferrer">
                    <Camera /> প্রেসক্রিপশন পাঠান (WhatsApp)
                  </a>
                </Button>
                <ServiceWizard serviceId="translator">
                  <Button variant="softOutline" size="lg">
                    ট্রান্সলেটর টিকিট তৈরি করুন
                  </Button>
                </ServiceWizard>
              </div>
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section id="about" className="mx-auto max-w-6xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">কেন শুশ্রূষা?</h2>
            <p className="mt-3 text-muted-foreground">
              আমরা পরিবারের মতো যত্ন নিই — পেশাদারিত্ব ও মমতার সমন্বয়ে।
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TRUST.map((t) => (
              <article key={t.title} className="card-elevated p-7 text-center">
                <span className="gradient-primary mx-auto flex size-14 items-center justify-center rounded-2xl text-primary-foreground shadow-glow">
                  <t.icon className="size-7" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
              </article>
            ))}
          </div>

          <div className="card-elevated mt-12 flex flex-col items-center gap-5 p-8 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h3 className="text-xl font-bold text-foreground">জরুরি প্রয়োজনে এখনই কল করুন</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                আমাদের কেয়ার টিম ২৪ ঘণ্টা আপনার পাশে আছে।
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="hero" size="lg">
                <a href={`tel:${SITE.phone}`}>
                  <Phone /> {SITE.phoneDisplay}
                </a>
              </Button>
              <ServiceWizard serviceId="injection">
                <Button variant="softOutline" size="lg">
                  <Check /> ইনজেকশন পুশ রিকোয়েস্ট
                </Button>
              </ServiceWizard>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
