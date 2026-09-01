import { useState } from "react";
import { Pencil, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fileToCompressedDataUrl } from "@/lib/image-compress";
import { loadProfile, saveProfile, useAccountStore, DEFAULT_PROFILE, type UserProfile } from "@/lib/account-store";

export function UserProfileCard() {
  const profile = useAccountStore<UserProfile>(loadProfile, DEFAULT_PROFILE);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(DEFAULT_PROFILE);

  function start(next: boolean) {
    if (next) setDraft(profile);
    setOpen(next);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-primary">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="size-full object-cover" />
          ) : (
            <User className="size-7" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-foreground">{profile.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {profile.phone || "ফোন নম্বর যোগ করুন"}
          </p>
        </div>
        <Dialog open={open} onOpenChange={start}>
          <DialogTrigger asChild>
            <Button variant="softOutline" size="sm" className="min-h-11">
              <Pencil /> এডিট
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>প্রোফাইল এডিট করুন</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pf-name">নাম / Name</Label>
                <Input id="pf-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-phone">ফোন / Phone</Label>
                <Input
                  id="pf-phone"
                  inputMode="tel"
                  value={draft.phone}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-avatar">ছবি / Photo</Label>
                <Input
                  id="pf-avatar"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) setDraft({ ...draft, avatar: await fileToCompressedDataUrl(f, 240) });
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="hero"
                className="min-h-11 w-full"
                onClick={() => {
                  saveProfile({ ...draft, name: draft.name.trim() || DEFAULT_PROFILE.name });
                  setOpen(false);
                }}
              >
                সেভ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
