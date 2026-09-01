import { useState } from "react";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadGamer, saveGamer, todayKey, useAccountStore, DEFAULT_GAMER, type GamerState } from "@/lib/account-store";

type Quiz = { q: string; options: string[]; answer: number; explain: string };

const QUIZZES: Quiz[] = [
  {
    q: "স্বাভাবিক রেস্টিং ব্লাড প্রেশারের রেঞ্জ কোনটি?",
    options: ["90/60 – 120/80 mmHg", "140/90 – 160/100 mmHg", "70/40 – 85/55 mmHg", "160/110 mmHg এর উপরে"],
    answer: 0,
    explain: "প্রাপ্তবয়স্কদের স্বাভাবিক রক্তচাপ প্রায় 90/60 থেকে 120/80 mmHg।",
  },
  {
    q: "প্রাপ্তবয়স্কের স্বাভাবিক পালস রেট কত?",
    options: ["40–55 bpm", "60–100 bpm", "110–130 bpm", "140–160 bpm"],
    answer: 1,
    explain: "বিশ্রামে স্বাভাবিক পালস রেট মিনিটে ৬০–১০০ বার।",
  },
  {
    q: "খালি পেটে স্বাভাবিক ব্লাড সুগার কত হওয়া উচিত?",
    options: ["3.0 mmol/L এর নিচে", "4.0 – 6.1 mmol/L", "8 – 10 mmol/L", "12 mmol/L এর উপরে"],
    answer: 1,
    explain: "ফাস্টিং ব্লাড গ্লুকোজ ৪.০–৬.১ mmol/L স্বাভাবিক ধরা হয়।",
  },
];

const REWARD = 20;

export function DailyQuizCard() {
  const gamer = useAccountStore<GamerState>(loadGamer, DEFAULT_GAMER);
  const [picked, setPicked] = useState<number | null>(null);
  const today = todayKey();
  const playedToday = gamer.lastPlayed === today;
  const quiz = QUIZZES[new Date().getDate() % QUIZZES.length]!;

  function choose(i: number) {
    if (picked !== null || playedToday) return;
    setPicked(i);
    if (i !== quiz.answer) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    saveGamer({
      points: gamer.points + REWARD,
      streak: gamer.lastPlayed === yesterday ? gamer.streak + 1 : 1,
      lastPlayed: today,
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="flex items-center gap-2 text-sm font-semibold text-primary">
        <HelpCircle className="size-4" /> আজকের হেলথ কুইজ
      </p>
      <h2 className="mt-2 text-lg font-bold text-foreground">{quiz.q}</h2>

      <div className="mt-4 space-y-2">
        {quiz.options.map((o, i) => {
          const isAnswer = i === quiz.answer;
          const shown = picked !== null || playedToday;
          return (
            <button
              key={o}
              type="button"
              disabled={shown}
              onClick={() => choose(i)}
              className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 text-left text-sm transition-colors ${
                shown && isAnswer
                  ? "border-success/50 bg-success/10 text-success"
                  : shown && picked === i
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-border bg-background text-foreground hover:border-primary/50"
              }`}
            >
              <span>{o}</span>
              {shown && isAnswer && <CheckCircle2 className="size-4 shrink-0" />}
              {shown && picked === i && !isAnswer && <XCircle className="size-4 shrink-0" />}
            </button>
          );
        })}
      </div>

      {(picked !== null || playedToday) && (
        <div className="mt-4 rounded-xl bg-secondary p-3 text-sm text-muted-foreground">
          {picked === quiz.answer && <p className="mb-1 font-semibold text-success">সঠিক! +{REWARD} পয়েন্ট 🎉</p>}
          {playedToday && picked === null && <p className="mb-1 font-semibold text-primary">আজকের কুইজ ইতিমধ্যে সম্পন্ন — কাল আবার আসুন।</p>}
          {quiz.explain}
        </div>
      )}

      {picked !== null && (
        <Button variant="softOutline" className="mt-3 min-h-11 w-full" onClick={() => setPicked(null)}>
          বন্ধ করুন
        </Button>
      )}
    </section>
  );
}
