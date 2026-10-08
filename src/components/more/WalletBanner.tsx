import { Link } from "@tanstack/react-router";
import { Gift, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_GAMER, loadGamer, loadWallet, useAccountStore, type GamerState } from "@/lib/account-store";

export function WalletBanner() {
  const balance = useAccountStore<number>(loadWallet, 50);
  const gamer = useAccountStore<GamerState>(loadGamer, DEFAULT_GAMER);

  return (
    <section className="gradient-primary rounded-2xl p-4 text-primary-foreground shadow-glow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-medium opacity-90">
            <Wallet className="size-4" /> শুশ্রূষা ক্যাশ
          </p>
          <p className="mt-1 text-3xl font-extrabold">৳{balance + Math.floor(gamer.points / 100) * 10}</p>
          <p className="text-[11px] opacity-90">ওয়ালেট ৳{balance} • কুইজ পয়েন্ট {gamer.points}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold">
            <Gift className="size-3.5" /> রেফার করে আয় করুন
          </span>
        </div>
        <Button asChild variant="secondary" size="sm" className="min-h-11">
          <Link to="/wallet">Redeem Cash</Link>
        </Button>
      </div>
    </section>
  );
}
