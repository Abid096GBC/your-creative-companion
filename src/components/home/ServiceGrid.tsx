import { FlaskConical, Package, Sparkles, Stethoscope, UserRound } from "lucide-react";
import { ServiceWizard } from "@/components/ServiceWizard";
import { waLink } from "@/lib/site";

const CARDS = [
  {
    id: "lab",
    icon: FlaskConical,
    title: "Lab Tests",
    titleBn: "ল্যাব টেস্ট",
    sub: "Home Sample Collection",
    href: waLink("Hello Shushrusha, I need a home lab test sample collection."),
    external: true,
  },
  {
    id: "store",
    icon: Package,
    title: "Medical Store",
    titleBn: "মেডিকেল স্টোর",
    sub: "Buy & Rent Medical Equipment",
    href: "/store",
    external: false,
  },
] as const;

export function ServiceGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {/* Featured: Home Nursing & Care */}
      <ServiceWizard serviceId="injection">
        <button
          type="button"
          className="gradient-primary col-span-2 flex min-w-0 flex-col items-start gap-2 rounded-2xl p-5 text-left text-primary-foreground shadow-glow transition-transform hover:-translate-y-1 lg:col-span-2"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/20 px-2.5 py-1 text-[11px] font-semibold">
            <Sparkles className="size-3.5" /> আমাদের প্রধান সেবা
          </span>
          <span className="grid size-11 place-items-center rounded-xl bg-background/20">
            <Stethoscope className="size-6" />
          </span>
          <span className="text-lg font-bold leading-tight">Home Nursing &amp; Care</span>
          <span className="text-sm font-medium opacity-90">হোম নার্সিং ও কেয়ার</span>
          <span className="text-xs leading-relaxed opacity-85">
            Dressing • Injection • Post-Surgery • Elderly Care • Physiotherapy
          </span>
        </button>
      </ServiceWizard>

      {/* Doctor consultation */}
      <a
        href={waLink("Hello Shushrusha, I would like a specialist doctor consultation.")}
        target="_blank"
        rel="noopener noreferrer"
        className="card-elevated flex min-w-0 flex-col items-start gap-2 p-5"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
          <UserRound className="size-6" />
        </span>
        <span className="text-base font-semibold text-foreground">Doctor Consultation</span>
        <span className="text-xs font-medium text-accent">ডাক্তার কনসালটেশন</span>
        <span className="text-xs leading-relaxed text-muted-foreground">
          Specialist Doctor Appointments
        </span>
      </a>

      {CARDS.map((c) => {
        const inner = (
          <>
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
              <c.icon className="size-6" />
            </span>
            <span className="text-base font-semibold text-foreground">{c.title}</span>
            <span className="text-xs font-medium text-accent">{c.titleBn}</span>
            <span className="text-xs leading-relaxed text-muted-foreground">{c.sub}</span>
          </>
        );
        return (
          <a
            key={c.id}
            href={c.href}
            {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="card-elevated flex min-w-0 flex-col items-start gap-2 p-5"
          >
            {inner}
          </a>
        );
      })}
    </div>
  );
}
