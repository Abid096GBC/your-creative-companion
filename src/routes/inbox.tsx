import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Inbox as InboxIcon } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { PromotionList } from "@/components/inbox/PromotionList";
import { NotificationList } from "@/components/inbox/NotificationList";
import { PatientOrderChats } from "@/components/chat/PatientOrderChats";
import { useUnreadInbox } from "@/lib/inbox-store";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "ইনবক্স | অফার, হেলথ টিপস ও নার্স চ্যাট — শুশ্রূষা" },
      {
        name: "description",
        content:
          "শুশ্রূষা ইনবক্স — চলমান ডিসকাউন্ট ও সিজনাল কেয়ার প্যাকেজ দেখুন, হেলথ ব্লগ পড়ুন এবং আপনার নিযুক্ত নার্সের ফলো-আপ মেসেজের উত্তর দিন।",
      },
      { property: "og:title", content: "Inbox | শুশ্রূষা" },
      {
        property: "og:description",
        content: "প্রমোশন, হেলথ টিপস ও নার্স-রোগী চ্যাট — সব এক ইনবক্সে।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  const [tab, setTab] = useState<"promo" | "alerts">("promo");
  const unread = useUnreadInbox();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <header className="flex min-w-0 items-center gap-3">
          <span className="gradient-primary grid size-11 shrink-0 place-items-center rounded-2xl text-primary-foreground shadow-glow">
            <InboxIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">Inbox</h1>
            <p className="truncate text-xs font-medium text-accent">ইনবক্স — অফার ও নার্স চ্যাট</p>
          </div>
        </header>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-card">
          <button
            type="button"
            onClick={() => setTab("promo")}
            className={`min-h-11 rounded-xl px-3 text-sm font-semibold transition-colors ${
              tab === "promo" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            📢 প্রমোশন ও টিপস
          </button>
          <button
            type="button"
            onClick={() => setTab("alerts")}
            className={`relative min-h-11 rounded-xl px-3 text-sm font-semibold transition-colors ${
              tab === "alerts" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            🔔 নোটিফিকেশন ও চ্যাট
            {unread > 0 && (
              <span className="ml-1.5 inline-grid size-5 place-items-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground">
                {unread}
              </span>
            )}
          </button>
        </div>

        <div className="mt-5">{tab === "promo" ? <PromotionList /> : <><PatientOrderChats /><NotificationList /></>}</div>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
