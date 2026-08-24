import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { NursingBookingWizard } from "@/components/booking/NursingBookingWizard";

export const Route = createFileRoute("/booking/nursing")({
  head: () => ({
    meta: [
      { title: "হোম নার্সিং বুকিং | শুশ্রূষা" },
      {
        name: "description",
        content:
          "৫ ধাপে ঘরে বসে নার্সিং সেবা বুক করুন — সার্ভিস, রোগী, সময়, মেডিকেল নোট ও পেমেন্ট নিশ্চিত করুন।",
      },
      { property: "og:title", content: "হোম নার্সিং বুকিং | শুশ্রূষা" },
      { property: "og:description", content: "ড্রেসিং, ইনজেকশন, পোস্ট-সার্জারি ও বয়স্ক সেবার সহজ বুকিং।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookingNursingPage,
});

function BookingNursingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-5">
          <h1 className="text-2xl font-bold text-foreground">হোম নার্সিং বুকিং</h1>
          <p className="text-sm text-muted-foreground">Home Nursing & Care — step by step booking</p>
        </header>
        <NursingBookingWizard />
      </main>
      <WhatsAppFab />
      <Footer />
    </div>
  );
}
