import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Briefcase,
  ChevronRight,
  FileText,
  Gamepad2,
  Gift,
  Heart,
  HelpCircle,
  MessageCircle,
  ScrollText,
  Shield,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserProfileCard } from "@/components/more/UserProfileCard";
import { WalletBanner } from "@/components/more/WalletBanner";
import { PatientSelectorModal } from "@/components/booking/PatientSelectorModal";
import { loadPatients, removePatient, type Patient } from "@/lib/orders-store";
import { loadReferral } from "@/lib/account-store";
import { SITE, waLink } from "@/lib/site";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "অ্যাকাউন্ট ও সেটিংস | রোগী, ওয়ালেট ও রিওয়ার্ড — শুশ্রূষা" },
      {
        name: "description",
        content:
          "শুশ্রূষা অ্যাকাউন্ট হাব — প্রোফাইল ও রোগী ম্যানেজমেন্ট, শুশ্রূষা ক্যাশ ওয়ালেট, রেফার করে আয়, MedGamer রিওয়ার্ড, ক্যারিয়ার আবেদন ও সাপোর্ট।",
      },
      { property: "og:title", content: "Account & More | শুশ্রূষা" },
      { property: "og:description", content: "প্রোফাইল, ওয়ালেট, রিওয়ার্ড, ক্যারিয়ার ও সাপোর্ট এক জায়গায়।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MorePage,
});

type Dlg = null | "patients" | "vitals" | "wishlist" | "referral" | "rate" | "faq" | "terms" | "privacy";

function MorePage() {
  const [dlg, setDlg] = useState<Dlg>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 pb-24">
        <UserProfileCard />
        <WalletBanner />

        <Group title="👤 অ্যাকাউন্ট ও স্বাস্থ্য">
          <Row icon={Users} label="রোগী ম্যানেজমেন্ট" hint="Self, Father, Mother…" onClick={() => setDlg("patients")} />
          <Row icon={Activity} label="রোগ ও ভাইটাল হিস্ট্রি লগ" onClick={() => setDlg("vitals")} />
          <Row icon={Heart} label="আমার উইশলিস্ট ও প্রি-অর্ডার" onClick={() => setDlg("wishlist")} />
        </Group>

        <Group title="🎮 আর্ন ও রিওয়ার্ড">
          <RowLink icon={Gamepad2} label="MedGamer — হেলথ কুইজ ও ডেইলি রিওয়ার্ড" to="/med-gamer" />
          <Row icon={Gift} label="রেফার করে আয় করুন" onClick={() => setDlg("referral")} />
        </Group>

        <Group title="💼 আমাদের সাথে কাজ করুন">
          <RowLink icon={Briefcase} label="ক্যারিয়ার — নার্স / কেয়ারগিভার হিসেবে যোগ দিন" to="/career" />
        </Group>

        <Group title="📜 সাপোর্ট ও লিগ্যাল">
          <a
            href={waLink("Hello Shushrusha, I need support.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 items-center gap-3 px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <MessageCircle className="size-5 text-primary" />
            <span className="flex-1">💬 সাপোর্ট ও হেল্প (WhatsApp)</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </a>
          <Row icon={Star} label="⭐ আমাদের রেট করুন" onClick={() => setDlg("rate")} />
          <Row icon={HelpCircle} label="📋 সাধারণ জিজ্ঞাসা (FAQ)" onClick={() => setDlg("faq")} />
          <Row icon={ScrollText} label="শর্তাবলী (Terms & Conditions)" onClick={() => setDlg("terms")} />
          <Row icon={Shield} label="প্রাইভেসি পলিসি" onClick={() => setDlg("privacy")} />
        </Group>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          {SITE.nameEn} • {SITE.phoneDisplay}
        </p>
      </main>

      <PatientsDialog open={dlg === "patients"} onClose={() => setDlg(null)} />
      <VitalsDialog open={dlg === "vitals"} onClose={() => setDlg(null)} />
      <ReferralDialog open={dlg === "referral"} onClose={() => setDlg(null)} />
      <RateDialog open={dlg === "rate"} onClose={() => setDlg(null)} />

      <InfoDialog
        open={dlg === "wishlist"}
        onClose={() => setDlg(null)}
        title="উইশলিস্ট ও প্রি-অর্ডার"
        body="আপনার সেভ করা কোনো প্রোডাক্ট বা প্রি-অর্ডার নেই। সার্জিক্যাল স্টোর থেকে পণ্য দেখে সেভ করুন।"
      />
      <InfoDialog
        open={dlg === "faq"}
        onClose={() => setDlg(null)}
        title="সাধারণ জিজ্ঞাসা (FAQ)"
        body="• কত দ্রুত নার্স আসবে? — সাধারণত বুকিংয়ের ১–২ ঘণ্টার মধ্যে।
• পেমেন্ট কীভাবে? — সার্ভিস শেষে ক্যাশ অথবা শুশ্রূষা ক্যাশ ওয়ালেট।
• কনভিনিয়েন্স চার্জ কত? — দূরত্ব অনুযায়ী সর্বনিম্ন ৳৫০।
• সার্ভিস এরিয়া? — ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও চট্টগ্রাম।"
      />
      <InfoDialog
        open={dlg === "terms"}
        onClose={() => setDlg(null)}
        title="শর্তাবলী (Terms & Conditions)"
        body="শুশ্রূষা একটি হোম কেয়ার সার্ভিস প্ল্যাটফর্ম। আমাদের নার্সরা ডাক্তারের প্রেসক্রিপশন অনুযায়ী সেবা দেন; কোনো ওষুধ বা ডোজ নিজে থেকে পরিবর্তন করেন না। বুকিং বাতিল করতে হলে নির্ধারিত সময়ের অন্তত ১ ঘণ্টা আগে জানাতে হবে। জরুরি অবস্থায় নিকটস্থ হাসপাতালে যোগাযোগ করুন।"
      />
      <InfoDialog
        open={dlg === "privacy"}
        onClose={() => setDlg(null)}
        title="প্রাইভেসি পলিসি"
        body="আপনার নাম, ফোন, ঠিকানা ও স্বাস্থ্য তথ্য শুধুমাত্র সেবা প্রদানের জন্য ব্যবহার করা হয়। রোগীর তথ্য এই ডিভাইসেই সংরক্ষিত থাকে এবং আপনার অনুমতি ছাড়া তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।"
      />

      <Footer />
      <WhatsAppFab />
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="px-1 pb-2 text-sm font-semibold text-muted-foreground">{title}</h2>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {children}
      </div>
    </section>
  );
}

function Row({
  icon: Icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 px-4 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      <Icon className="size-5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">
        {label}
        {hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function RowLink({ icon: Icon, label, to }: { icon: React.ElementType; label: string; to: "/med-gamer" | "/career" }) {
  return (
    <Link
      to={to}
      className="flex min-h-14 items-center gap-3 px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      <Icon className="size-5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">{label}</span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function InfoDialog({
  open,
  onClose,
  title,
  body,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{body}</p>
      </DialogContent>
    </Dialog>
  );
}

function PatientsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rows, setRows] = useState<Patient[]>([]);
  useEffect(() => {
    if (open) setRows(loadPatients());
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>রোগী ম্যানেজমেন্ট</DialogTitle>
          <DialogDescription>সেভ করা রোগীরা বুকিংয়ের সময় স্বয়ংক্রিয়ভাবে দেখাবে।</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {rows.length === 0 && <p className="text-sm text-muted-foreground">কোনো রোগী সেভ করা নেই।</p>}
          {rows.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {p.relation} — {p.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {[p.age && `${p.age} বছর`, p.gender, p.conditions].filter(Boolean).join(" • ")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="রোগী মুছুন"
                className="min-h-11 min-w-11 text-destructive"
                onClick={() => {
                  removePatient(p.id);
                  setRows(loadPatients());
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <PatientSelectorModal onSaved={() => setRows(loadPatients())} />
      </DialogContent>
    </Dialog>
  );
}

function VitalsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [v, setV] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem("shushrusha:vitals");
      setV(raw ? (JSON.parse(raw) as Record<string, string>) : null);
    } catch {
      setV(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(x) => !x && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>রোগ ও ভাইটাল হিস্ট্রি লগ</DialogTitle>
          <DialogDescription>হোমপেজের ভাইটাল উইজেটে সর্বশেষ সেভ করা রিডিং।</DialogDescription>
        </DialogHeader>
        {v ? (
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between rounded-lg bg-secondary px-3 py-2">
              <span className="text-muted-foreground">Blood Pressure</span>
              <span className="font-semibold text-foreground">{v.sys || "—"}/{v.dia || "—"} mmHg</span>
            </li>
            <li className="flex justify-between rounded-lg bg-secondary px-3 py-2">
              <span className="text-muted-foreground">Blood Sugar</span>
              <span className="font-semibold text-foreground">{v.sugar || "—"} mmol/L</span>
            </li>
            <li className="flex justify-between rounded-lg bg-secondary px-3 py-2">
              <span className="text-muted-foreground">Pulse Rate</span>
              <span className="font-semibold text-foreground">{v.pulse || "—"} bpm</span>
            </li>
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">এখনো কোনো ভাইটাল রিডিং সেভ করা হয়নি।</p>
        )}
        <Button asChild variant="softOutline" className="min-h-11 w-full">
          <Link to="/">হোমপেজে ভাইটাল আপডেট করুন</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function ReferralDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [code, setCode] = useState("SHU-XXXXXX");
  useEffect(() => {
    if (open) setCode(loadReferral());
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>রেফার করে আয় করুন</DialogTitle>
          <DialogDescription>বন্ধুর প্রথম বুকিং সম্পন্ন হলে আপনি ৳৫০ শুশ্রূষা ক্যাশ পাবেন।</DialogDescription>
        </DialogHeader>
        <code className="block rounded-xl border border-dashed border-primary/40 bg-secondary px-4 py-3 text-center text-lg font-bold tracking-widest text-primary">
          {code}
        </code>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="softOutline"
            className="min-h-11"
            onClick={() => {
              void navigator.clipboard?.writeText(code);
              toast.success("কোড কপি হয়েছে");
            }}
          >
            কপি করুন
          </Button>
          <Button asChild variant="whatsapp" className="min-h-11">
            <a
              href={waLink(`শুশ্রূষা হোম কেয়ার ব্যবহার করুন! আমার রেফারেল কোড: ${code}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp শেয়ার
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stars, setStars] = useState(5);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>আমাদের রেট করুন</DialogTitle>
          <DialogDescription>আপনার মতামত সেবার মান বাড়াতে সাহায্য করে।</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`${s} স্টার`}
              onClick={() => setStars(s)}
              className="grid size-11 place-items-center"
            >
              <Star className={`size-7 ${s <= stars ? "fill-warning text-warning" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <Button
          variant="hero"
          className="min-h-11 w-full"
          onClick={() => {
            toast.success(`ধন্যবাদ! আপনি ${stars} স্টার দিয়েছেন।`);
            onClose();
          }}
        >
          রেটিং পাঠান
        </Button>
        <Button asChild variant="softOutline" className="min-h-11 w-full">
          <a href={waLink("Hello Shushrusha, I want to share feedback.")} target="_blank" rel="noopener noreferrer">
            <FileText /> বিস্তারিত ফিডব্যাক দিন
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
