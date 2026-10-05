import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MonitoredChat } from "@/components/chat/MonitoredChat";
import { adminListThreads, adminSaveSetting, adminSendMessage } from "@/lib/catalog.functions";

type Thread = Awaited<ReturnType<typeof adminListThreads>>[number];

export function ChatMonitor({ password }: { password: string }) {
  const list = useServerFn(adminListThreads);
  const send = useServerFn(adminSendMessage);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread | null>(null);

  async function load() {
    setThreads(await list({ data: { password } }));
  }
  useEffect(() => {
    void load();
    const ch = supabase
      .channel("admin-threads")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card-elevated grid min-h-[560px] overflow-hidden md:grid-cols-[300px_1fr]">
      <aside className="border-b border-border md:border-r md:border-b-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <h2 className="text-sm font-bold text-foreground">লাইভ নার্স–রোগী চ্যাট ({threads.length})</h2>
          <Button size="icon" variant="ghost" aria-label="রিফ্রেশ" onClick={() => void load()}>
            <RefreshCw />
          </Button>
        </div>
        <ul className="max-h-[480px] overflow-y-auto">
          {threads.length === 0 && <li className="p-4 text-sm text-muted-foreground">কোনো চ্যাট নেই।</li>}
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setActive(t)}
                className={`block min-h-14 w-full border-b border-border p-3 text-left ${active?.id === t.id ? "bg-secondary" : "hover:bg-secondary/50"}`}
              >
                <p className="truncate text-sm font-semibold text-foreground">
                  #{t.tracking_id} • {t.patient_name || "রোগী"} ↔ {t.nurse_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{t.last_message || "—"}</p>
                <p className="text-[11px] text-muted-foreground">{new Date(t.last_at).toLocaleString("bn-BD")}</p>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="flex min-h-[480px] flex-col">
        {active ? (
          <>
            <div className="border-b border-border p-3 text-sm font-semibold text-foreground">
              #{active.tracking_id} — {active.service} <span className="text-xs font-normal text-accent">(Join &amp; Intervene)</span>
            </div>
            <div className="min-h-0 flex-1">
              <MonitoredChat
                threadId={active.id}
                me="admin"
                onSend={async (m) => {
                  await send({ data: { password, threadId: active.id, ...m } });
                }}
              />
            </div>
          </>
        ) : (
          <p className="m-auto text-sm text-muted-foreground">একটি চ্যাট নির্বাচন করুন</p>
        )}
      </section>
    </div>
  );
}

export function BkashSettings({ password }: { password: string }) {
  const save = useServerFn(adminSaveSetting);
  const [link, setLink] = useState("");
  useEffect(() => {
    void supabase
      .from("app_settings")
      .select("value")
      .eq("key", "bkash_payment_link")
      .maybeSingle()
      .then(({ data }) => setLink(data?.value ?? ""));
  }, []);
  return (
    <div className="card-elevated space-y-3 p-5">
      <h2 className="text-base font-bold text-foreground">বিকাশ মার্চেন্ট পেমেন্ট লিংক</h2>
      <p className="text-xs text-muted-foreground">
        লিংক দিলে চেকআউটে "সরাসরি বিকাশ মার্চেন্ট লিংকে পেমেন্ট করুন" অপশন দেখাবে। খালি রাখলে শুধু ডেমো চেকআউট চলবে।
      </p>
      <Input className="min-h-11" placeholder="https://shop.bkash.com/..." value={link} onChange={(e) => setLink(e.target.value)} />
      <Button
        variant="hero"
        onClick={() =>
          void save({ data: { password, key: "bkash_payment_link", value: link.trim() } })
            .then(() => toast.success("সেভ হয়েছে"))
            .catch(() => toast.error("সেভ করা যায়নি"))
        }
      >
        সেভ করুন
      </Button>
    </div>
  );
}
