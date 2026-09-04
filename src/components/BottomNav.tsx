import { Link } from "@tanstack/react-router";
import { Grid2x2, Home, Inbox, Menu, Package } from "lucide-react";
import { useUnreadInbox } from "@/lib/inbox-store";
import { useActiveOrderCount } from "@/lib/orders-store";

const ITEMS = [
  { to: "/", label: "হোম", icon: Home, badge: "none" },
  { to: "/categories", label: "ক্যাটাগরি", icon: Grid2x2, badge: "none" },
  { to: "/orders", label: "অর্ডার", icon: Package, badge: "orders" },
  { to: "/inbox", label: "ইনবক্স", icon: Inbox, badge: "inbox" },
  { to: "/more", label: "মোর", icon: Menu, badge: "none" },
] as const;

export function BottomNav() {
  const unread = useUnreadInbox();
  const activeOrders = useActiveOrderCount();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map(({ to, label, icon: Icon, badge }) => {
          const count = badge === "inbox" ? unread : badge === "orders" ? activeOrders : 0;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="relative flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors"
              >
                <Icon className="size-5" />
                {label}
                {count > 0 && (
                  <span className="absolute right-1/4 top-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
