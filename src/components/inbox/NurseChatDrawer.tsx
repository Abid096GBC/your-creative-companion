import { useEffect, useRef, useState } from "react";
import { ImagePlus, Phone, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { fileToCompressedDataUrl } from "@/lib/image-compress";
import { appendMessage, loadMessages, type ChatMessage, type InboxNotification } from "@/lib/inbox-store";
import { SITE, waLink } from "@/lib/site";

function initials(name: string) {
  return name.trim().slice(0, 1);
}

export function NurseChatDrawer({
  thread,
  onClose,
}: {
  thread: InboxNotification | null;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!thread) return;
    setMessages(loadMessages(thread.threadId));
    setText("");
    setPhoto("");
  }, [thread]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, photo]);

  function send() {
    if (!thread) return;
    if (!text.trim() && !photo) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      from: "patient",
      ...(text.trim() ? { text: text.trim() } : {}),
      ...(photo ? { photo } : {}),
      at: new Date().toISOString(),
    };
    appendMessage(thread.threadId, msg);
    setMessages((rows) => [...rows, msg]);
    setText("");
    setPhoto("");
    toast.success("মেসেজ পাঠানো হয়েছে");
  }

  async function pickPhoto(file?: File) {
    if (!file) return;
    try {
      setPhoto(await fileToCompressedDataUrl(file));
    } catch {
      toast.error("ছবি আপলোড করা যায়নি");
    }
  }

  return (
    <Sheet open={Boolean(thread)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="gradient-primary grid size-11 shrink-0 place-items-center rounded-full text-base font-bold text-primary-foreground">
                {initials(thread?.nurseName ?? "")}
              </span>
              <div className="min-w-0 text-left">
                <SheetTitle className="truncate text-base">{thread?.nurseName}</SheetTitle>
                <p className="truncate text-xs text-muted-foreground">{thread?.nurseRole}</p>
              </div>
            </div>
            <Button asChild variant="softOutline" size="sm" className="min-h-11 shrink-0">
              <a href={`tel:${SITE.phone}`} aria-label="কল করুন">
                <Phone />
              </a>
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-card p-3 shadow-card">
            <p className="text-sm leading-relaxed text-foreground">{thread?.followUp}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{thread?.time}</p>
          </div>

          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.from === "patient"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary p-3 text-primary-foreground"
                  : "max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-card p-3 shadow-card"
              }
            >
              {m.photo && (
                <img
                  src={m.photo}
                  alt="রোগীর অগ্রগতির ছবি"
                  className="mb-2 max-h-48 w-full rounded-xl object-cover"
                />
              )}
              {m.text && <p className="text-sm leading-relaxed">{m.text}</p>}
              <p className={`mt-1 text-[11px] ${m.from === "patient" ? "opacity-80" : "text-muted-foreground"}`}>
                {new Date(m.at).toLocaleString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border bg-card p-3">
          {photo && (
            <div className="relative mb-2 w-24">
              <img src={photo} alt="আপলোড প্রিভিউ" className="h-24 w-24 rounded-xl object-cover" />
              <button
                type="button"
                aria-label="ছবি বাদ দিন"
                onClick={() => setPhoto("")}
                className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void pickPhoto(e.target.files?.[0])}
            />
            <Button
              variant="softOutline"
              size="icon"
              className="size-11 shrink-0"
              aria-label="ছবি যুক্ত করুন"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus />
            </Button>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="উত্তর লিখুন..."
              className="min-h-11 flex-1"
              aria-label="মেসেজ"
            />
            <Button className="min-h-11 shrink-0" onClick={send} aria-label="পাঠান">
              <Send />
            </Button>
          </div>
          <a
            href={waLink(`Hello Shushrusha, I want to reach nurse ${thread?.nurseName ?? ""}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-center text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            জরুরি প্রয়োজনে WhatsApp-এ যোগাযোগ করুন
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
