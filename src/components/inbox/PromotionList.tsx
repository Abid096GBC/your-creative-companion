import { useState } from "react";
import { BookOpen, Gift, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PROMOTIONS, type Promotion } from "@/lib/inbox-store";
import { waLink } from "@/lib/site";

const ICON = { offer: Gift, blog: BookOpen, package: Sparkles } as const;

export function PromotionList() {
  const [blog, setBlog] = useState<Promotion | null>(null);
  const [copied, setCopied] = useState("");

  function claim(p: Promotion) {
    if (!p.code) return;
    navigator.clipboard?.writeText(p.code).catch(() => undefined);
    setCopied(p.code);
    toast.success(`প্রমো কোড ${p.code} কপি হয়েছে`, {
      description: "বুকিংয়ের সময় প্রমো বক্সে পেস্ট করুন।",
    });
    window.setTimeout(() => setCopied(""), 2500);
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {PROMOTIONS.map((p) => {
          const Icon = ICON[p.kind];
          return (
            <article key={p.id} className="card-elevated flex flex-col p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    p.kind === "blog"
                      ? "border-border bg-secondary text-secondary-foreground"
                      : "border-accent/30 bg-accent/10 text-accent-foreground"
                  }`}
                >
                  {p.badge}
                </span>
              </div>

              <div className="mt-4">
                {p.kind === "blog" ? (
                  <Button variant="softOutline" className="min-h-11 w-full" onClick={() => setBlog(p)}>
                    <BookOpen /> ব্লগ পড়ুন
                  </Button>
                ) : p.code ? (
                  <Button variant="hero" className="min-h-11 w-full" onClick={() => claim(p)}>
                    {copied === p.code ? <Check /> : <Copy />}
                    {copied === p.code ? "কোড কপি হয়েছে" : `অফার নিন • ${p.code}`}
                  </Button>
                ) : (
                  <Button asChild variant="hero" className="min-h-11 w-full">
                    <a href={waLink(p.waMessage ?? p.title)} target="_blank" rel="noopener noreferrer">
                      <Gift /> অফার নিন
                    </a>
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={Boolean(blog)} onOpenChange={(o) => !o && setBlog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-left text-base">{blog?.title}</DialogTitle>
            <DialogDescription className="text-left">{blog?.desc}</DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-foreground">{blog?.body}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
