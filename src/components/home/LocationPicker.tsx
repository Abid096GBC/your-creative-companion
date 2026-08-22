import { useEffect, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE } from "@/lib/site";

const KEY = "shushrusha:location";

export function LocationPicker() {
  const [saved, setSaved] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState(SITE.areas[0]);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const v = localStorage.getItem(KEY);
    if (v) setSaved(v);
  }, []);

  function save() {
    const value = [address.trim(), area].filter(Boolean).join(", ");
    if (!value) return;
    localStorage.setItem(KEY, value);
    setSaved(value);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex min-h-11 min-w-0 max-w-full items-center gap-1.5 rounded-full border border-primary/20 bg-card px-3 py-2 text-sm font-medium text-foreground shadow-card transition-colors hover:border-primary/50 hover:text-primary"
        >
          <MapPin className="size-4 shrink-0 text-primary" />
          <span className="truncate">{saved || "Select Location"}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>সার্ভিস লোকেশন নির্বাচন করুন</DialogTitle>
          <DialogDescription>
            আপনার ঠিকানা সেভ করা থাকবে — পরের বার আর লিখতে হবে না।
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>এলাকা / শহর</Label>
            <div className="flex flex-wrap gap-2">
              {SITE.areas.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  className={`min-h-10 rounded-full border px-3 text-sm transition-colors ${
                    area === a
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="home-address">বাসার ঠিকানা</Label>
            <Input
              id="home-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="বাসা / রোড / এলাকা"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="hero" onClick={save} className="w-full">
            ঠিকানা সেভ করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
