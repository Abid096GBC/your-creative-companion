import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Gift, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Button } from "@/components/ui/button";
import { loadReferral, loadWallet, useAccountStore } from "@/lib/account-store";
import { waLink } from "@/lib/site";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "শুশ্রূষা ক্যাশ ওয়ালেট | ব্যালেন্স ও রেফারেল — শুশ্রূষা" },
      {
        name: "description",
        content: "আপনার শুশ্রূষা ক্যাশ ব্যালেন্স দেখুন, রেফারেল কোড শেয়ার করুন এবং বুকিংয়ে ক্যাশ ব্যবহার করুন।",
      },
      { property: "og:title", content: "Shushrusha Cash Wallet" },
      { property: "og:description", content: "ব্যালেন্স, রেফারেল কোড ও রিডিম অপশন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const balance = useAccountStore<number>(loadWallet, 50);
  const code = useAccountStore<string>(loadReferral, "SHU-XXXXXX");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <section className="gradient-primary rounded-2xl p-5 text-primary-foreground shadow-glow">
          <p className="flex items-center gap-2 text-xs font-medium opacity-90">
            <WalletIcon className="size-4" /> শুশ্রূষা ক্যাশ ব্যালেন্স
          </p>
          <p className="mt-1 text-4xl font-extrabold">৳{balance}</p>
          <p className="mt-2 text-xs opacity-90">নার্সিং বুকিংয়ে পেমেন্টের সময় ওয়ালেট বেছে নিলে ক্যাশ ব্যবহার হবে।</p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Gift className="size-4" /> রেফার করে আয় করুন
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            বন্ধুকে কোডটি দিন — তার প্রথম বুকিং শেষ হলে আপনি ৳৫০ ক্যাশ পাবেন।
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="rounded-lg border border-dashed border-primary/40 bg-secondary px-4 py-2 text-base font-bold tracking-wider text-primary">
              {code}
            </code>
            <Button
              variant="softOutline"
              size="sm"
              className="min-h-11"
              onClick={() => {
                void navigator.clipboard?.writeText(code);
                toast.success("রেফারেল কোড কপি হয়েছে");
              }}
            >
              কপি করুন
            </Button>
            <Button asChild variant="whatsapp" size="sm" className="min-h-11">
              <a
                href={waLink(`শুশ্রূষা হোম কেয়ার ব্যবহার করুন! আমার রেফারেল কোড: ${code}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp শেয়ার
              </a>
            </Button>
          </div>
        </section>

        <Button asChild variant="softOutline" className="min-h-12 w-full">
          <Link to="/quiz">
            <Gamepad2 /> MedGamer খেলে আরও পয়েন্ট জিতুন
          </Link>
        </Button>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
