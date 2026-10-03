import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Send, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { fileToCompressedDataUrl } from "@/lib/image-compress";
import { readLocalJSON } from "@/lib/local-storage";

export type ChatRow = {
  id: string;
  thread_id: string;
  sender: string;
  sender_name: string;
  text: string;
  photo: string | null;
  created_at: string;
};

export const MONITOR_WARNING =
  "⚠️ এই চ্যাটটি অ্যাডমিন টিম দ্বারা সার্বক্ষণিক মনিটর করা হচ্ছে। অ্যাপের বাইরে ব্যক্তিগত যোগাযোগ, নম্বর আদান-প্রদান বা লেনদেন করা কঠোরভাবে নিষিদ্ধ।";

const CACHE_KEY = "shushrusha_chats";

function cacheGet(threadId: string): ChatRow[] {
  const all = readLocalJSON<Record<string, ChatRow[]>>(CACHE_KEY, {});
  return all[threadId] ?? [];
}
function cacheSet(threadId: string, rows: ChatRow[]) {
  try {
    const all = readLocalJSON<Record<string, ChatRow[]>>(CACHE_KEY, {});
    // Drop photos from cache to stay within storage limits.
    all[threadId] = rows.slice(-100).map((r) => ({ ...r, photo: r.photo && r.photo.length < 200_000 ? r.photo : null }));
    localStorage.setItem(CACHE_KEY, JSON.stringify(all));
  } catch {
    /* quota — ignore */
  }
}

export function MonitoredChat({
  threadId,
  me,
  templates = [],
  onSend,
}: {
  threadId: string | null;
  /** Which sender bubbles render on the right. */
  me: "patient" | "nurse" | "admin";
  templates?: string[];
  onSend: (msg: { text: string; photo?: string }) => Promise<void>;
}) {
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!threadId) return;
    setRows(cacheGet(threadId));
    let alive = true;
    void supabase
      .from("chat_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!alive || !data) return;
        setRows(data as ChatRow[]);
        cacheSet(threadId, data as ChatRow[]);
      });
    const channel = supabase
      .channel(`chat-${threadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `thread_id=eq.${threadId}` },
        (payload) => {
          const row = payload.new as ChatRow;
          setRows((prev) => {
            if (prev.some((r) => r.id === row.id)) return prev;
            const next = [...prev, row];
            cacheSet(threadId, next);
            return next;
          });
        },
      )
      .subscribe();
    return () => {
      alive = false;
      void supabase.removeChannel(channel);
    };
  }, [threadId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [rows, photo]);

  async function send(t = text) {
    if (!t.trim() && !photo) return;
    setBusy(true);
    try {
      await onSend({ text: t.trim(), ...(photo ? { photo } : {}) });
      setText("");
      setPhoto("");
    } catch {
      toast.error("মেসেজ পাঠানো যায়নি");
    } finally {
      setBusy(false);
    }
  }

  async function pick(file?: File) {
    if (!file) return;
    try {
      setPhoto(await fileToCompressedDataUrl(file));
    } catch {
      toast.error("ছবি আপলোড করা যায়নি");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start gap-2 border-b border-destructive/30 bg-destructive/10 p-3 text-xs font-medium leading-relaxed text-destructive">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" /> {MONITOR_WARNING.replace("⚠️ ", "")}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
        {!threadId && <Loader2 className="mx-auto animate-spin text-muted-foreground" />}
        {threadId && rows.length === 0 && (
          <p className="text-center text-xs text-muted-foreground">এখনো কোনো মেসেজ নেই — কথোপকথন শুরু করুন।</p>
        )}
        {rows.map((m) => {
          const mine = m.sender === me;
          const support = m.sender === "admin";
          return (
            <div
              key={m.id}
              className={
                mine
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary p-3 text-primary-foreground"
                  : support
                    ? "mx-auto max-w-[90%] rounded-2xl border border-accent/40 bg-accent/10 p-3"
                    : "max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-card p-3 shadow-card"
              }
            >
              {!mine && <p className="mb-1 text-[11px] font-semibold text-accent">{m.sender_name}</p>}
              {m.photo && <img src={m.photo} alt="চ্যাট ছবি" className="mb-2 max-h-48 w-full rounded-xl object-cover" />}
              {m.text && <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>}
              <p className={`mt-1 text-[11px] ${mine ? "opacity-80" : "text-muted-foreground"}`}>
                {new Date(m.created_at).toLocaleString("bn-BD", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
              </p>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border bg-card p-3">
        {templates.length > 0 && (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {templates.map((t) => (
              <button
                key={t}
                type="button"
                disabled={busy || !threadId}
                onClick={() => void send(t)}
                className="min-h-9 shrink-0 rounded-full border border-primary/30 bg-secondary px-3 text-xs font-medium text-primary"
              >
                {t}
              </button>
            ))}
          </div>
        )}
        {photo && (
          <div className="relative mb-2 w-24">
            <img src={photo} alt="আপলোড প্রিভিউ" className="h-24 w-24 rounded-xl object-cover" />
            <button type="button" aria-label="ছবি বাদ দিন" onClick={() => setPhoto("")} className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-destructive text-destructive-foreground">
              <X className="size-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
          <Button variant="softOutline" size="icon" className="size-11 shrink-0" aria-label="ছবি যুক্ত করুন" onClick={() => fileRef.current?.click()}>
            <ImagePlus />
          </Button>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void send()}
            placeholder="মেসেজ লিখুন..."
            className="min-h-11 flex-1"
            aria-label="মেসেজ"
          />
          <Button className="min-h-11 shrink-0" disabled={busy || !threadId} onClick={() => void send()} aria-label="পাঠান">
            {busy ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </div>
    </div>
  );
}
