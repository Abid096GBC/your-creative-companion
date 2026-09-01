import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { ServiceWizard } from "@/components/ServiceWizard";
import { waLink } from "@/lib/site";

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

  const cls = "card-elevated flex min-h-11 w-full items-center gap-3 p-4";

  if (item.action.type === "wizard") {
    return (
      <ServiceWizard serviceId={item.action.serviceId}>
        <button type="button" className={cls}>
          {inner}
        </button>
      </ServiceWizard>
    );
  }

  if (item.action.type === "wa") {
    return (
      <a href={waLink(item.action.message)} target="_blank" rel="noopener noreferrer" className={cls}>
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
