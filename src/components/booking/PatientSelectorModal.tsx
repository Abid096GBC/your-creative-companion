import { useState } from "react";
import { UserPlus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { savePatient, type Patient, type Relation } from "@/lib/orders-store";

const RELATIONS: Relation[] = ["Self", "Father", "Mother", "Spouse", "Other"];
const GENDERS = ["Male", "Female", "Other"] as const;

export function PatientSelectorModal({ onSaved }: { onSaved: (p: Patient) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<Relation>("Self");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Patient["gender"]>("Male");
  const [conditions, setConditions] = useState("");

  function submit() {
    if (!name.trim()) return;
    const p: Patient = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      relation,
      age: age.trim(),
      gender,
      conditions: conditions.trim(),
    };
    savePatient(p);
    onSaved(p);
    setOpen(false);
    setName("");
    setAge("");
    setConditions("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="softOutline" className="min-h-11 w-full">
          <UserPlus /> নতুন রোগী যোগ করুন
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>নতুন রোগী (Add New Patient)</DialogTitle>
          <DialogDescription>তথ্য সেভ থাকবে — পরের বুকিংয়ে আবার লিখতে হবে না।</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">নাম / Name</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="MD Rahim" />
          </div>
          <div className="space-y-2">
            <Label>সম্পর্ক / Relation</Label>
            <div className="flex flex-wrap gap-2">
              {RELATIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRelation(r)}
                  className={`min-h-11 rounded-full border px-4 text-sm transition-colors ${
                    relation === r
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="p-age">বয়স / Age</Label>
              <Input id="p-age" value={age} onChange={(e) => setAge(e.target.value)} placeholder="62" inputMode="numeric" />
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
                      gender === g
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-cond">রোগ / বিশেষ নোট</Label>
            <Textarea
              id="p-cond"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="ডায়াবেটিস, উচ্চ রক্তচাপ..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="hero" className="min-h-11 w-full" onClick={submit} disabled={!name.trim()}>
            রোগী সেভ করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
