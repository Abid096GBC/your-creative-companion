import { createFileRoute } from "@tanstack/react-router";
import { Coins, Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Button } from "@/components/ui/button";
import { DailyQuizCard } from "@/components/medgamer/DailyQuizCard";
import {
  DEFAULT_GAMER,
  loadGamer,
  loadWallet,
  saveGamer,
  saveWallet,
  useAccountStore,
  type GamerState,
} from "@/lib/account-store";

export const Route = createFileRoute("/med-gamer")({
  head: () => ({
    meta: [
      { title: "MedGamer | হেলথ কুইজ ও ডেইলি রিওয়ার্ড — শুশ্রূষা" },
      {
        name: "description",
        content:
          "প্রতিদিন হেলথ কুইজ খেলে পয়েন্ট জিতুন, স্ট্রিক গড়ুন এবং ১০০ পয়েন্ট = ৳১০ শুশ্রূষা ক্যাশে রূপান্তর করুন।",
      },
      { property: "og:title", content: "MedGamer — Health Quiz & Rewards" },
      { property: "og:description", content: "ডেইলি হেলথ কুইজ, স্ট্রিক ও পয়েন্ট থেকে শুশ্রূষা ক্যাশ।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MedGamerPage,
});

function MedGamerPage() {
  const gamer = useAccountStore<GamerState>(loadGamer, DEFAULT_GAMER);
  const wallet = useAccountStore<number>(loadWallet, 50);
  const convertible = Math.floor(gamer.points / 100);

  function convert() {
    if (convertible < 1) return;
    saveGamer({ ...gamer, points: gamer.points - convertible * 100 });
    saveWallet(wallet + convertible * 10);
    toast.success(`৳${convertible * 10} শুশ্রূষা ক্যাশ যোগ হয়েছে!`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <header className="gradient-primary flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5 text-primary-foreground shadow-glow">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium opacity-90">
              <Sparkles className="size-4" /> MedGamer
            </p>
            <p className="mt-1 text-2xl font-extrabold">
              {gamer.streak} Day Streak <Flame className="inline size-6" />
            </p>
          </div>
          <div className="rounded-xl bg-white/20 px-4 py-3 text-center">
            <p className="text-2xl font-extrabold">{gamer.points}</p>
            <p className="text-[11px] font-semibold">Points</p>
          </div>
        </header>

        <DailyQuizCard />

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Coins className="size-4" /> রিওয়ার্ড কনভার্শন
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            ১০০ পয়েন্ট = ৳১০ শুশ্রূষা ক্যাশ। বর্তমান ব্যালেন্স ৳{wallet}।
          </p>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-secondary p-4">
            <span className="text-sm font-semibold text-foreground">
              কনভার্ট করা যাবে: ৳{convertible * 10}
            </span>
            <Button variant="hero" size="sm" className="min-h-11" disabled={convertible < 1} onClick={convert}>
              কনভার্ট করুন
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
