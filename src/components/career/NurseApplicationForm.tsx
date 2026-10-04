import { useState } from "react";
import { CheckCircle2, FileText, IdCard, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { fileToCompressedDataUrl } from "@/lib/image-compress";
import { useServerFn } from "@tanstack/react-start";
import { submitApplication } from "@/lib/catalog.functions";
import { saveApplication, type CareerApplication } from "@/lib/account-store";

const ROLES = ["Senior B.Sc Nurse", "Diploma Nurse", "Caregiver", "Physiotherapist"];
const GENDERS: CareerApplication["gender"][] = ["Male", "Female", "Other"];

export function NurseApplicationForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<CareerApplication["gender"]>("Female");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState(ROLES[0]!);
  const [experience, setExperience] = useState(2);
  const [nid, setNid] = useState<string>();
  const [license, setLicense] = useState<string>();
  const [cvName, setCvName] = useState<string>();
  const [done, setDone] = useState(false);

  const submitFn = useServerFn(submitApplication);
  const valid = name.trim().length > 1 && phone.trim().length > 8;

  function submit() {
    if (!valid) return;
    saveApplication({
      id: `job-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      gender,
      address: address.trim(),
      role,
      experience,
      nid,
      license,
      cvName,
      createdAt: new Date().toISOString(),
    });
    void submitFn({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        tier: role === "Caregiver" ? "caregiver" : "nurse",
        qualification: role,
        experience: `${experience} বছর`,
        area: address.trim(),
        note: `Gender: ${gender}${cvName ? `, CV: ${cvName}` : ""}`,
      },
    }).catch(() => undefined);
    setDone(true);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="c-name">পুরো নাম / Full Name</Label>
          <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Anowara Begum" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-phone">ফোন নম্বর / Phone</Label>
          <Input id="c-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-email">ইমেইল / Email</Label>
          <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <div className="space-y-2">
          <Label>লিঙ্গ / Gender</Label>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`min-h-11 flex-1 rounded-lg border text-xs transition-colors ${
                  gender === g ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="c-addr">বর্তমান ঠিকানা / Present Address</Label>
        <Textarea id="c-addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="বাসা, রোড, এলাকা, শহর" />
      </div>

      <div className="space-y-2">
        <Label>পদ / Role</Label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`min-h-11 rounded-full border px-4 text-sm transition-colors ${
                role === r ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>অভিজ্ঞতা / Experience — <span className="font-bold text-primary">{experience} বছর</span></Label>
        <Slider value={[experience]} onValueChange={(v) => setExperience(v[0] ?? 0)} min={0} max={20} step={1} className="py-3" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <UploadBox
          icon={<IdCard className="size-5" />}
          label="NID কার্ডের ছবি"
          done={!!nid}
          accept="image/*"
          onFile={async (f) => setNid(await fileToCompressedDataUrl(f))}
        />
        <UploadBox
          icon={<Stethoscope className="size-5" />}
          label="নার্সিং লাইসেন্স / সার্টিফিকেট"
          done={!!license}
          accept="image/*"
          onFile={async (f) => setLicense(await fileToCompressedDataUrl(f))}
        />
        <UploadBox
          icon={<FileText className="size-5" />}
          label={cvName ?? "CV / Resume ফাইল"}
          done={!!cvName}
          accept=".pdf,.doc,.docx,image/*"
          onFile={async (f) => setCvName(f.name)}
        />
      </div>

      <Button variant="hero" className="min-h-12 w-full" disabled={!valid} onClick={submit}>
        আবেদন জমা দিন / Submit Application
      </Button>

      <Dialog open={done} onOpenChange={setDone}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-success" /> আবেদন জমা হয়েছে!
            </DialogTitle>
            <DialogDescription>
              ধন্যবাদ {name.trim()}। আমাদের টিম যাচাই শেষে ২-৩ কর্মদিবসের মধ্যে আপনার সাথে যোগাযোগ করবে।
            </DialogDescription>
          </DialogHeader>
          <Button variant="hero" className="min-h-11 w-full" onClick={() => setDone(false)}>
            ঠিক আছে
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UploadBox({
  icon,
  label,
  done,
  accept,
  onFile,
}: {
  icon: React.ReactNode;
  label: string;
  done: boolean;
  accept: string;
  onFile: (f: File) => void | Promise<void>;
}) {
  return (
    <label
      className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-3 text-center text-xs transition-colors ${
        done ? "border-success/50 bg-success/10 text-success" : "border-border bg-card text-muted-foreground hover:border-primary/50"
      }`}
    >
      {done ? <CheckCircle2 className="size-5" /> : icon}
      <span className="line-clamp-2">{done ? `${label} ✓` : label}</span>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
        }}
      />
    </label>
  );
}
