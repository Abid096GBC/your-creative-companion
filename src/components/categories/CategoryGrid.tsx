import {
  Activity,
  Accessibility,
  Baby,
  BedDouble,
  Bandage,
  Brain,
  Droplets,
  Dumbbell,
  FlaskConical,
  Gauge,
  HeartPulse,
  Wind,
  Stethoscope,
  Syringe,
  UserRound,
  Package,
  ShieldPlus,
  TestTube,
} from "lucide-react";
import { SpecialtyCard, type CategoryItem } from "./SpecialtyCard";

export type CategorySection = {
  id: string;
  emoji: string;
  title: string;
  titleEn: string;
  items: CategoryItem[];
};

export const CATEGORY_SECTIONS: CategorySection[] = [
  {
    id: "nursing",
    emoji: "🩺",
    title: "হোম নার্সিং প্যাকেজ",
    titleEn: "Home Nursing Packages",
    items: [
      {
        id: "dressing",
        icon: Bandage,
        name: "ক্ষত ড্রেসিং",
        nameEn: "Wound Dressing",
        sub: "প্রশিক্ষিত নার্সের ড্রেসিং সেবা",
        action: { type: "wizard", serviceId: "dressing" },
      },
      {
        id: "elderly",
        icon: UserRound,
        name: "প্রবীণ যত্ন",
        nameEn: "Elderly Care",
        sub: "দৈনিক / মাসিক কেয়ারগিভিং",
        action: { type: "wizard", serviceId: "caregiving" },
      },
      {
        id: "post-op",
        icon: ShieldPlus,
        name: "অপারেশন পরবর্তী যত্ন",
        nameEn: "Post-Op Care",
        sub: "সেলাই, ড্রেসিং ও রিকভারি প্যাকেজ",
        action: { type: "wizard", serviceId: "post-surgery" },
      },
      {
        id: "injection",
        icon: Syringe,
        name: "ইনজেকশন / IV কেয়ার",
        nameEn: "Injection & IV Care",
        sub: "IV / IM পুশ ও ক্যানুলা সেটআপ",
        action: { type: "wizard", serviceId: "injection" },
      },
      {
        id: "physio",
        icon: Dumbbell,
        name: "ফিজিওথেরাপি",
        nameEn: "Physiotherapy",
        sub: "ঘরে বসে থেরাপি সেশন",
        action: { type: "wa", message: "Hello Shushrusha, I need home physiotherapy sessions." },
      },
    ],
  },
  {
    id: "doctor",
    emoji: "👨‍⚕️",
    title: "ডাক্তার স্পেশালিটি",
    titleEn: "Doctor Specialties",
    items: [
      {
        id: "gp",
        icon: Stethoscope,
        name: "জেনারেল ফিজিশিয়ান",
        nameEn: "General Physician",
        action: { type: "link", href: "/doctors/medicine" },
      },
      {
        id: "cardio",
        icon: HeartPulse,
        name: "কার্ডিওলজিস্ট",
        nameEn: "Cardiologist",
        action: { type: "link", href: "/doctors/cardiology" },
      },
      {
        id: "neuro",
        icon: Brain,
        name: "নিউরোলজিস্ট",
        nameEn: "Neurologist",
        action: { type: "link", href: "/doctors/neurology" },
      },
      {
        id: "pedia",
        icon: Baby,
        name: "শিশু বিশেষজ্ঞ",
        nameEn: "Pediatrician",
        action: { type: "link", href: "/doctors/pediatrics" },
      },
      {
        id: "gyn",
        icon: UserRound,
        name: "গাইনোকোলজিস্ট",
        nameEn: "Gynecologist",
        action: { type: "link", href: "/doctors/gynecology" },
      },
      {
        id: "diabeto",
        icon: Droplets,
        name: "ডায়াবেটোলজিস্ট",
        nameEn: "Diabetologist",
        action: { type: "link", href: "/doctors/medicine" },
      },
    ],
  },
  {
    id: "lab",
    emoji: "🧪",
    title: "ল্যাব টেস্ট প্যাকেজ",
    titleEn: "Lab Test Packages",
    items: [
      {
        id: "full-body",
        icon: FlaskConical,
        name: "ফুল বডি চেকআপ",
        nameEn: "Full Body Checkup",
        sub: "হোম স্যাম্পল কালেকশন",
        action: { type: "link", href: "/lab-tests" },
      },
      {
        id: "diabetes",
        icon: Droplets,
        name: "ডায়াবেটিস প্রোফাইল",
        nameEn: "Diabetes Profile",
        sub: "FBS, 2hABF, HbA1c",
        action: { type: "link", href: "/lab-tests" },
      },
      {
        id: "cardiac",
        icon: HeartPulse,
        name: "কার্ডিয়াক প্রোফাইল",
        nameEn: "Cardiac Profile",
        sub: "লিপিড প্রোফাইল, ECG সাপোর্ট",
        action: { type: "link", href: "/lab-tests" },
      },
      {
        id: "kidney-liver",
        icon: TestTube,
        name: "কিডনি ও লিভার টেস্ট",
        nameEn: "Kidney & Liver Tests",
        sub: "S. Creatinine, SGPT, SGOT",
        action: { type: "link", href: "/lab-tests" },
      },
    ],
  },
  {
    id: "equipment",
    emoji: "📦",
    title: "মেডিকেল ইকুইপমেন্ট",
    titleEn: "Medical Equipment Types",
    items: [
      {
        id: "vitals-monitor",
        icon: Gauge,
        name: "ভাইটাল মনিটর",
        nameEn: "Vital Monitors (BP / Oximeter)",
        sub: "স্টোরে কিনুন",
        action: { type: "link", href: "/store" },
      },
      {
        id: "mobility",
        icon: Accessibility,
        name: "মোবিলিটি এইড",
        nameEn: "Wheelchairs / Crutches",
        sub: "কেনা ও ভাড়া",
        action: { type: "wa", message: "Hello Shushrusha, I want to buy/rent mobility aids (wheelchair/crutches)." },
      },
      {
        id: "oxygen",
        icon: Wind,
        name: "অক্সিজেন সাপ্লাই",
        nameEn: "Oxygen Supplies",
        sub: "সিলিন্ডার ও কনসেনট্রেটর",
        action: { type: "wa", message: "Hello Shushrusha, I need oxygen cylinder/concentrator supply." },
      },
      {
        id: "beds",
        icon: BedDouble,
        name: "হসপিটাল বেড",
        nameEn: "Hospital Beds",
        sub: "মাসিক ভাড়া",
        action: { type: "wa", message: "Hello Shushrusha, I want to rent a hospital bed for home care." },
      },
      {
        id: "neb-machine",
        icon: Activity,
        name: "নেবুলাইজার মেশিন",
        nameEn: "Nebulizer Machine",
        sub: "৭ দিনের রেন্ট ৳৫০০",
        action: { type: "wizard", serviceId: "nebulizer" },
      },
      {
        id: "consumables",
        icon: Package,
        name: "সার্জিক্যাল সামগ্রী",
        nameEn: "Surgical Consumables",
        sub: "গজ, ব্যান্ডেজ, গ্লাভস",
        action: { type: "link", href: "/store" },
      },
    ],
  },
];

export function CategoryGrid({ sections }: { sections: CategorySection[] }) {
  if (sections.length === 0) {
    return (
      <p className="card-elevated p-8 text-center text-sm text-muted-foreground">
        কোনো ক্যাটাগরি খুঁজে পাওয়া যায়নি — অন্য কিছু লিখে দেখুন।
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((sec) => (
        <section key={sec.id} id={sec.id} className="scroll-mt-28">
          <div className="mb-3 flex min-w-0 items-center gap-2">
            <span aria-hidden className="text-xl">
              {sec.emoji}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-foreground">{sec.title}</h2>
              <p className="truncate text-xs font-medium text-accent">{sec.titleEn}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sec.items.map((item) => (
              <SpecialtyCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
