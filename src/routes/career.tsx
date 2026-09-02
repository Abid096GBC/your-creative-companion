import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { NurseApplicationForm } from "@/components/career/NurseApplicationForm";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "ক্যারিয়ার | নার্স ও কেয়ারগিভার নিয়োগ — শুশ্রূষা" },
      {
        name: "description",
        content:
          "শুশ্রূষা কেয়ার নেটওয়ার্কে নার্স, কেয়ারগিভার বা ফিজিওথেরাপিস্ট হিসেবে যোগ দিন। অনলাইনে আবেদন করুন — NID, লাইসেন্স ও সিভি আপলোড করে সহজে।",
      },
      { property: "og:title", content: "Join Shushrusha Care Network" },
      { property: "og:description", content: "নার্স, কেয়ারগিভার ও ফিজিওথেরাপিস্ট নিয়োগ — অনলাইন আবেদন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareerPage,
});

function CareerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <header className="flex items-start gap-3">
          <span className="gradient-primary grid size-11 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-glow">
            <HeartHandshake className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Join Shushrusha Care Network</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              শুশ্রূষায় নার্স / কেয়ারগিভার হিসেবে যোগ দিন — নমনীয় সময়, সম্মানজনক পারিশ্রমিক।
            </p>
          </div>
        </header>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <NurseApplicationForm />
        </div>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
