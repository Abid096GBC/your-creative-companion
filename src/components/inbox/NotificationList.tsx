import { useEffect, useState } from "react";
import { ChevronRight, MessageSquare } from "lucide-react";
import { NurseChatDrawer } from "./NurseChatDrawer";
import { NOTIFICATIONS, loadReadIds, markRead, type InboxNotification } from "@/lib/inbox-store";

export function NotificationList() {
  const [readIds, setReadIds] = useState<string[]>([]);
  const [thread, setThread] = useState<InboxNotification | null>(null);

  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  function open(n: InboxNotification) {
    markRead(n.id);
    setReadIds(loadReadIds());
    setThread(n);
  }

  return (
    <>
      <ul className="space-y-3">
        {NOTIFICATIONS.map((n) => {
          const unread = !readIds.includes(n.id);
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => open(n)}
                className="card-elevated flex min-h-11 w-full items-start gap-3 p-4 text-left"
              >
                <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                  <MessageSquare className="size-5" />
                  {unread && (
                    <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-destructive ring-2 ring-card" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{n.nurseName}</span>
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                      {n.nurseRole}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{n.message}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">{n.time}</span>
                </span>
                <ChevronRight className="mt-3 size-5 shrink-0 text-muted-foreground" />
              </button>
            </li>
          );
        })}
      </ul>

      <NurseChatDrawer thread={thread} onClose={() => setThread(null)} />
    </>
  );
}
