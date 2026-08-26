import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { CATEGORY_SECTIONS, CategoryGrid } from "@/components/categories/CategoryGrid";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "সেবা ক্যাটাগরি | শুশ্রূষা হোম হেলথকেয়ার" },
      {
        name: "description",
        content:
          "হোম নার্সিং প্যাকেজ, ডাক্তার স্পেশালিটি, ল্যাব টেস্ট প্যাকেজ ও মেডিকেল ইকুইপমেন্ট — শুশ্রূষার সব হেলথকেয়ার ক্যাটাগরি এক জায়গায় ব্রাউজ করুন ও সরাসরি বুক করুন।",
      },
      { property: "og:title", content: "Healthcare Categories | শুশ্রূষা" },
      {
        property: "og:description",
        content:
          "ড্রেসিং, এল্ডার কেয়ার, ফিজিওথেরাপি, স্পেশালিস্ট ডাক্তার, ল্যাব প্যাকেজ ও মেডিকেল ইকুইপমেন্ট — ক্যাটাগরি অনুযায়ী খুঁজুন।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState("all");

  const sections = useMemo(() => {
    const term = q.trim().toLowerCase();
    return CATEGORY_SECTIONS.filter((s) => active === "all" || s.id === active)
      .map((s) => ({
        ...s,
        items: term
          ? s.items.filter(
              (i) =>
                i.name.toLowerCase().includes(term) ||
                i.nameEn.toLowerCase().includes(term) ||
                (i.sub ?? "").toLowerCase().includes(term),
            )
          : s.items,
      }))
      .filter((s) => s.items.length > 0);
  }, [q, active]);

  const tabs = [{ id: "all", emoji: "✨", title: "সব" }, ...CATEGORY_SECTIONS];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="gradient-primary grid size-11 shrink-0 place-items-center rounded-2xl text-primary-foreground shadow-glow">
              <LayoutGrid className="size-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">Healthcare Categories</h1>
              <p className="truncate text-xs font-medium text-accent">সেবা ক্যাটাগরি</p>
            </div>
          </div>
        </header>

        <div className="mt-4 flex min-h-12 items-center gap-2 rounded-2xl border border-border bg-card px-3 shadow-card focus-within:border-primary/60">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="ক্যাটাগরি সার্চ"
            placeholder="সেবা, স্পেশালিটি বা ইকুইপমেন্ট খুঁজুন..."
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-1">
          <div className="flex w-max gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
                  active === t.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                <span aria-hidden className="mr-1.5">
                  {t.emoji}
                </span>
                {t.title}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <CategoryGrid sections={sections} />
        </div>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
