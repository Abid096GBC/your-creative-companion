import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, MessagesSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MonitoredChat } from "@/components/chat/MonitoredChat";
import { openChatThread, patientSendMessage } from "@/lib/catalog.functions";
import { ACTIVE_STATUSES, useOrders, type LocalOrder } from "@/lib/orders-store";

/** Live, admin-monitored chat with the nurse assigned to each active nursing order. */
export function PatientOrderChats() {
  const orders = useOrders().filter((o) => o.category === "nursing" && ACTIVE_STATUSES.includes(o.status));
  const open = useServerFn(openChatThread);
  const send = useServerFn(patientSendMessage);
  const [order, setOrder] = useState<LocalOrder | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  async function start(o: LocalOrder) {
    setOrder(o);
    setThreadId(null);
    try {
      const t = await open({ data: { trackingId: o.id } });
      setThreadId(t.id);
    } catch {
      setThreadId(null);
    }
  }

  if (!orders.length) return null;

  return (
    <section className="mb-5">
      <h2 className="mb-2 text-sm font-bold text-foreground">চলমান অর্ডারের নার্স চ্যাট</h2>
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id}>
            <button type="button" onClick={() => void start(o)} className="card-elevated flex min-h-14 w-full items-center gap-3 p-4 text-left">
              <span className="gradient-primary grid size-11 shrink-0 place-items-center rounded-full text-primary-foreground">
                <MessagesSquare className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{o.nurse?.name ?? "অ্যাসাইনড নার্স"}</span>
                <span className="block truncate text-xs text-muted-foreground">#{o.id} • {o.serviceName}</span>
              </span>
              <ChevronRight className="size-5 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>

      <Sheet open={Boolean(order)} onOpenChange={(v) => !v && setOrder(null)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border p-4 text-left">
            <SheetTitle className="text-base">{order?.nurse?.name ?? "নার্স চ্যাট"}</SheetTitle>
            <p className="text-xs text-muted-foreground">অর্ডার #{order?.id}</p>
          </SheetHeader>
          <div className="min-h-0 flex-1">
            <MonitoredChat
              threadId={threadId}
              me="patient"
              onSend={async (m) => {
                if (!order) return;
                await send({ data: { trackingId: order.id, name: order.patientName, ...m } });
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
