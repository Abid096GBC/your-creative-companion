import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Coins, Loader2, Trophy, XCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_GAMER, loadGamer, saveGamer, todayKey, useAccountStore, type GamerState } from "@/lib/account-store";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "শুশ্রূষা ক্যাশ কুইজ | মেডিকেল ভর্তি ও BCS হেলথ প্রশ্ন" },
      {
        name: "description",
        content: "মেডিকেল ভর্তি ও BCS স্বাস্থ্য প্রশ্নের কুইজ খেলুন — সঠিক উত্তরে শুশ্রূষা ক্যাশ জিতুন, ভুলে নেগেটিভ মার্কিং।",
      },
      { property: "og:title", content: "Shushrusha Cash Medical Quiz" },
      { property: "og:description", content: "খেলুন, শিখুন, শুশ্রূষা ক্যাশ জিতে বুকিংয়ে ছাড় নিন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizPage,
});

type Q = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct: string;
  reward: number;
  penalty: number;
  category: string;
};
const KEYS = ["a", "b", "c", "d"] as const;

function QuizPage() {
  const gamer = useAccountStore<GamerState>(loadGamer, DEFAULT_GAMER);
  const [qs, setQs] = useState<Q[] | null>(null);
  const [cat, setCat] = useState("all");
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [session, setSession] = useState(0);

  useEffect(() => {
    void supabase
      .from("quiz_questions")
      .select("id, question, option_a, option_b, option_c, option_d, correct, reward, penalty, category")
      .then(({ data }) => setQs(((data ?? []) as Q[]).sort(() => Math.random() - 0.5)));
  }, []);

  const cats = useMemo(() => Array.from(new Set((qs ?? []).map((q) => q.category))), [qs]);
  const list = useMemo(() => (qs ?? []).filter((q) => cat === "all" || q.category === cat), [qs, cat]);
  const q = list[idx];

  function choose(k: string) {
    if (!q || picked) return;
    setPicked(k);
    const delta = k === q.correct.toLowerCase() ? q.reward : -q.penalty;
    setSession((v) => v + delta);
    const g = loadGamer();
    const today = todayKey();
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    saveGamer({
      points: Math.max(0, g.points + delta),
      streak: g.lastPlayed === today ? g.streak : g.lastPlayed === yesterday ? g.streak + 1 : 1,
      lastPlayed: today,
    });
  }

  function next() {
    setPicked(null);
    setIdx((i) => i + 1);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6 pb-24">
        <section className="gradient-primary rounded-2xl p-5 text-primary-foreground shadow-glow">
          <p className="flex items-center gap-2 text-sm font-semibold opacity-90">
            <Coins className="size-4" /> শুশ্রূষা ক্যাশ কুইজ
          </p>
          <p className="mt-1 text-3xl font-extrabold">{gamer.points} পয়েন্ট</p>
          <p className="text-xs opacity-90">
            ১০০ পয়েন্ট = ৳১০ • চেকআউটে ছাড় হিসেবে ব্যবহার করুন • এই সেশনে {session >= 0 ? "+" : ""}
            {session}
          </p>
        </section>

        {cats.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {["all", ...cats].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCat(c);
                  setIdx(0);
                  setPicked(null);
                }}
                className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                  cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                }`}
              >
                {c === "all" ? "সব" : c}
              </button>
            ))}
          </div>
        )}

        {!qs ? (
          <Loader2 className="mx-auto size-6 animate-spin text-primary" />
        ) : !q ? (
          <div className="card-elevated space-y-3 p-6 text-center">
            <Trophy className="mx-auto size-10 text-primary" />
            <p className="font-bold text-foreground">সব প্রশ্ন শেষ! এই সেশনে {session} পয়েন্ট।</p>
            <div className="flex justify-center gap-2">
              <Button variant="softOutline" className="min-h-11" onClick={() => { setIdx(0); setSession(0); setPicked(null); }}>
                আবার খেলুন
              </Button>
              <Button asChild variant="hero" className="min-h-11">
                <Link to="/booking/nursing">ক্যাশ দিয়ে বুক করুন</Link>
              </Button>
            </div>
          </div>
        ) : (
          <article className="card-elevated space-y-4 p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{q.category}</span>
              <span>
                {idx + 1}/{list.length} • +{q.reward} / -{q.penalty}
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground">{q.question}</h2>
            <div className="space-y-2">
              {KEYS.map((k) => {
                const text = q[`option_${k}`];
                if (!text) return null;
                const isRight = k === q.correct.toLowerCase();
                const state = !picked ? "" : isRight ? "right" : picked === k ? "wrong" : "";
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={Boolean(picked)}
                    onClick={() => choose(k)}
                    className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-xl border px-4 text-left text-sm ${
                      state === "right"
                        ? "border-success bg-success/10 text-foreground"
                        : state === "wrong"
                          ? "border-destructive bg-destructive/10 text-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                    }`}
                  >
                    <span>
                      <b className="mr-2 uppercase">{k}.</b>
                      {text}
                    </span>
                    {state === "right" && <CheckCircle2 className="size-5 text-success" />}
                    {state === "wrong" && <XCircle className="size-5 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {picked && (
              <div className="flex items-center justify-between gap-3">
                <p className={`text-sm font-semibold ${picked === q.correct.toLowerCase() ? "text-success" : "text-destructive"}`}>
                  {picked === q.correct.toLowerCase() ? `সঠিক! +${q.reward} পয়েন্ট` : `ভুল! -${q.penalty} পয়েন্ট`}
                </p>
                <Button variant="hero" className="min-h-11" onClick={next}>
                  পরের প্রশ্ন
                </Button>
              </div>
            )}
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
