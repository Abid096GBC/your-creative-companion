import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { toNursingService } from "@/lib/booking-links";
import { waLink } from "@/lib/site";
import {
  newTrackingId,
  saveOrder,
  savedLocation,
  type OrderCategory,
} from "@/lib/orders-store";
import { loadProfile } from "@/lib/account-store";
import { toast } from "sonner";

export type CategoryAction =
  | { type: "wizard"; serviceId: string }
  | { type: "wa"; message: string }
  | { type: "link"; href: string };

export type CategoryItem = {
  id: string;
  icon: LucideIcon;
  name: string;
  nameEn: string;
  sub?: string;
  action: CategoryAction;
  /** When set, tapping an enquiry also records it in the unified order list. */
  logCategory?: OrderCategory;
};

export function SpecialtyCard({ item }: { item: CategoryItem }) {
  const inner = (
    <>
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
        <item.icon className="size-6" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold text-foreground">{item.name}</span>
        <span className="block truncate text-xs font-medium text-accent">{item.nameEn}</span>
        {item.sub && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.sub}</span>}
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </>
  );

  const cls = "card-elevated flex min-h-14 w-full items-center gap-3 p-4";

  // Every nursing action funnels into the single /booking/nursing wizard.
  if (item.action.type === "wizard") {
    return (
      <Link to="/booking/nursing" search={{ service: toNursingService(item.action.serviceId) }} className={cls}>
        {inner}
      </Link>
    );
  }

  if (item.action.type === "wa") {
    const logEnquiry = () => {
      if (!item.logCategory) return;
      saveOrder({
        id: newTrackingId(),
        category: item.logCategory,
        serviceName: `${item.name} (${item.nameEn})`,
        date: new Date().toISOString().slice(0, 10),
        slot: "টিম কল করে সময় নিশ্চিত করবে",
        status: "Pending",
        patientName: loadProfile().name,
        patientRelation: "Self",
        address: savedLocation(),
        payment: "সার্ভিসের সময় পেমেন্ট",
        amount: 0,
        createdAt: new Date().toISOString(),
      });
      toast.success("এনকোয়ারি সেভ হয়েছে — 'অর্ডার' পেজে দেখুন");
    };
    return (
      <a
        href={waLink(item.action.message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={logEnquiry}
        className={cls}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link to={item.action.href as "/store"} className={cls}>
      {inner}
    </Link>
  );
}
