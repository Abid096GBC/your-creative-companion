import {
  Activity,
  Bandage,
  Droplets,
  HeartHandshake,
  ScanLine,
  Scissors,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  injection: Syringe,
  suturing: Scissors,
  dressing: Bandage,
  nebulizer: Wind,
  saline: Droplets,
  vitals: Activity,
  translator: ScanLine,
  "post-surgery": ShieldCheck,
  caregiving: HeartHandshake,
};

const FX: Record<string, string> = {
  injection: "fx-injection",
  suturing: "fx-suture",
  dressing: "fx-dressing",
  nebulizer: "fx-nebulizer",
  saline: "fx-saline",
  vitals: "fx-vitals",
  translator: "fx-translator",
};

export function AnimatedIcon({ id, className = "" }: { id: string; className?: string }) {
  const Icon = ICONS[id] ?? Stethoscope;
  const fx = FX[id] ?? "fx-default";
  return (
    <span
      className={`icon-fx ${fx} relative flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary ${className}`}
    >
      <Icon className="icon-fx-core size-6" />
      <span className="icon-fx-particles" aria-hidden>
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}
