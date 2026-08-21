export const SITE = {
  name: "শুশ্রূষা",
  nameEn: "Shushrusha",
  phone: "+8801628402283",
  phoneDisplay: "+880 1628-402283",
  whatsapp: "8801628402283",
  email: "mdadhassan123@gmail.com",
  areas: ["ঢাকা", "নারায়ণগঞ্জ", "গাজীপুর", "চট্টগ্রাম"],
  conveyance: "গাড়ির ভাড়া / কনভিনিয়েন্স চার্জ: দূরত্বভেদে ৳৫০ থেকে শুরু।",
  conveyanceShort: "কনভিনিয়েন্স চার্জ: দূরত্ব অনুযায়ী সর্বনিম্ন ৳৫০+ যুক্ত হবে।",
};

export const BILLING_NOTE =
  "ℹ️ * সার্ভিস লোকেশন ও দূরত্বের ওপর ভিত্তি করে কনভিনিয়েন্স চার্জ (সর্বনিম্ন ৳৫০) ও নাইট চার্জ (রাত ১০টার পর ৳৩০০) যুক্ত হতে পারে।";

export const NIGHT_FEE = 300;
export const CONVENIENCE_FEE = 50;

export const PRICES = {
  injectionAdult: 300,
  injectionChild: 500,
  salineOnly: 300,
  cannulaOnly: 500,
  cannulaSaline: 600,
  dressing: 300,
  stitchRemovalPerStitch: 100,
  suturingPerStitch: 300,
  nebNoMed: 50,
  nebWithMed: 100,
  nebRent: 500,
  vitals1: 100,
  vitals2: 150,
  vitals3: 200,
};

export type Service = {
  id: string;
  title: string;
  titleEn: string;
  desc: string;
  price: string;
  priceNote?: string;
  primary?: boolean;
};

export const SERVICES: Service[] = [
  {
    id: "injection",
    title: "ইনজেকশন পুশ",
    titleEn: "Injection Push (IV / IM)",
    desc: "প্রশিক্ষিত নার্সের মাধ্যমে ঘরে বসেই নিরাপদ ইনজেকশন পুশ।",
    price: "৳৩০০ থেকে শুরু",
    priceNote: "বড়: ৳৩০০ (IV/IM) • বাচ্চা: ৳৫০০ (IV/IM)",
    primary: true,
  },
  {
    id: "suturing",
    title: "সেলাই করা ও সেলাই কাটা",
    titleEn: "Wound Suturing & Stitch Removal",
    desc: "শরীরের অংশ ও সেলাই সংখ্যা অনুযায়ী মূল্য নির্ধারিত হয়।",
    price: "সেলাই কাটা ৳১০০ / সেলাই",
    priceNote: "নতুন সেলাই: ৳৩০০ প্রতি সেলাই (সুচার ম্যাটেরিয়াল আলাদা)",
    primary: true,
  },
  {
    id: "dressing",
    title: "ড্রেসিং সেবা",
    titleEn: "Wound Dressing",
    desc: "শুধু সার্ভিস চার্জ — ওষুধ ও ড্রেসিং সামগ্রী আলাদা।",
    price: "৳৩০০",
    primary: true,
  },
  {
    id: "nebulizer",
    title: "নেবুলাইজার সেবা",
    titleEn: "Nebulizer",
    desc: "শ্বাসকষ্টে দ্রুত নেবুলাইজেশন সাপোর্ট, মেশিন রেন্টসহ।",
    price: "৳৫০ থেকে শুরু",
    priceNote: "ওষুধসহ ৳১০০ • ৭ দিনের মেশিন রেন্ট ৳৫০০",
    primary: true,
  },
  {
    id: "saline",
    title: "স্যালাইন ক্যানুলা ও IV সেটআপ",
    titleEn: "Saline & Cannula Setup",
    desc: "ক্যানুলা স্থাপন, স্যালাইন ও IV ফ্লুইড সেটআপ ঘরেই।",
    price: "৳৩০০ থেকে শুরু",
    priceNote: "স্যালাইন সেটআপ ৳৩০০ • ক্যানুলা + স্যালাইন ৳৬০০",
    primary: true,
  },
  {
    id: "vitals",
    title: "রক্তচাপ, ডায়াবেটিস ও অক্সিজেন পালস চেক",
    titleEn: "Health Vitals Check",
    desc: "প্রেসার, ব্লাড সুগার ও অক্সিজেন স্যাচুরেশন পরীক্ষা।",
    price: "৳১০০ থেকে",
    priceNote: "২টি ৳১৫০ • ফুল কম্বো ৳২০০",
    primary: true,
  },
  {
    id: "post-surgery",
    title: "অপারেশন পরবর্তী বিশেষ প্যাকেজ",
    titleEn: "Post-Surgery Package",
    desc: "সেলাই ড্রেসিং, ভাইটাল মনিটরিং ও রিকভারি কেয়ার প্যাকেজ।",
    price: "কাস্টম প্যাকেজ",
    primary: true,
  },
  {
    id: "translator",
    title: "ফ্রি মেডিকেল ট্রান্সলেটর",
    titleEn: "Free Medical Translator",
    desc: "প্রেসক্রিপশন বা রিপোর্টের ছবি পাঠান — বাংলায় বুঝিয়ে দেব।",
    price: "সম্পূর্ণ ফ্রি",
  },
  {
    id: "caregiving",
    title: "প্রবীণদের সার্বক্ষণিক যত্ন",
    titleEn: "Caregiving / Elderly Care",
    desc: "দীর্ঘমেয়াদী কেয়ারগিভিং সেবা (সেকেন্ডারি অপশন)।",
    price: "দৈনিক / মাসিক ভিত্তিতে",
  },
];

export function waLink(message: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export type Product = {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  unit: string;
};

export const PRODUCTS: Product[] = [
  { id: "gauze", name: "স্টেরাইল গজ", nameEn: "Sterile Gauze", price: 10, unit: "পিস" },
  { id: "gauze-pack", name: "স্টেরাইল গজ (প্যাক)", nameEn: "Sterile Gauze Pack", price: 35, unit: "প্যাক" },
  { id: "bandage", name: "ব্যান্ডেজ", nameEn: "Bandage", price: 10, unit: "পিস" },
  { id: "roll-bandage-2", name: 'রোল ব্যান্ডেজ ২"', nameEn: 'Roll Bandage 2"', price: 10, unit: "পিস" },
  { id: "roll-bandage-4", name: 'রোল ব্যান্ডেজ ৪"', nameEn: 'Roll Bandage 4"', price: 15, unit: "পিস" },
  { id: "roll-bandage-6", name: 'রোল ব্যান্ডেজ ৬"', nameEn: 'Roll Bandage 6"', price: 20, unit: "পিস" },
  { id: "povisep-30", name: "পভিসেপ ৩০ মি.লি.", nameEn: "Povisep 30ml", price: 55, unit: "বোতল" },
  { id: "povisep-100", name: "পভিসেপ ১০০ মি.লি.", nameEn: "Povisep 100ml", price: 120, unit: "বোতল" },
  { id: "hexisol-50", name: "হেক্সিসল ৫০ মি.লি.", nameEn: "Hexisol 50ml", price: 55, unit: "বোতল" },
  { id: "hexisol-250", name: "হেক্সিসল ২৫০ মি.লি.", nameEn: "Hexisol 250ml", price: 130, unit: "বোতল" },
  { id: "gloves", name: "সার্জিক্যাল গ্লাভস", nameEn: "Surgical Gloves", price: 20, unit: "জোড়া" },
  { id: "mask", name: "সার্জিক্যাল মাস্ক", nameEn: "Surgical Mask", price: 10, unit: "পিস" },
  { id: "micropore", name: 'মাইক্রোপোর টেপ ১"', nameEn: 'Micro-pore Tape 1"', price: 50, unit: "রোল" },
  { id: "dressing-kit", name: "ডিসপোজেবল ড্রেসিং কিট", nameEn: "Disposable Dressing Kit", price: 90, unit: "কিট" },
  { id: "catgut", name: "ক্যাটগাট / সুচার থ্রেড", nameEn: "Catgut / Suture Thread", price: 400, unit: "পিস" },
  { id: "thermo-digital", name: "ডিজিটাল থার্মোমিটার", nameEn: "Digital Thermometer", price: 200, unit: "পিস" },
  { id: "thermo-analog", name: "অ্যানালগ থার্মোমিটার", nameEn: "Analog Thermometer", price: 100, unit: "পিস" },
  { id: "bp-monitor", name: "ডিজিটাল বিপি মনিটর", nameEn: "Digital BP Monitor", price: 2200, unit: "ইউনিট" },
  { id: "gluco-strips", name: "গ্লুকোমিটার স্ট্রিপ (৫০)", nameEn: "Glucometer Strips (50s)", price: 800, unit: "বক্স" },
  { id: "neb-mask", name: "নেবুলাইজার মাস্ক সেট", nameEn: "Nebulizer Mask Set", price: 120, unit: "সেট" },
  { id: "windel-plus", name: "উইন্ডেল প্লাস নেবুলাইজার সলিউশন", nameEn: "Windel Plus (Incepta)", price: 150, unit: "প্যাক (৬ অ্যাম্পুল)" },
  { id: "budicort", name: "বুডিকর্ট ০.২৫ নেবুলাইজার", nameEn: "Budicort 0.25 (Incepta)", price: 25, unit: "অ্যাম্পুল" },
  { id: "sultolin", name: "সালটোলিন ২০ মি.লি.", nameEn: "Sultolin 20ml (Square)", price: 121, unit: "বোতল" },
  { id: "iprex", name: "আইপ্রেক্স ২০ মি.লি.", nameEn: "Iprex 20ml (Square)", price: 131, unit: "বোতল" },
];

export const DRESSING_KIT_PRICE = 90;

/** Total nebulizer machines owned by Shushrusha (used for the availability indicator). */
export const NEB_MACHINE_STOCK = 6;

/** Nurse commission share: 60% base, +1% per 0.1 rating above 4.0 (max 70%). */
export function nurseSharePct(rating: number) {
  const bonus = rating > 4 ? Math.round((rating - 4) * 10) : 0;
  return Math.min(70, 60 + bonus);
}

export function splitPayout(amount: number, rating: number) {
  const pct = nurseSharePct(rating);
  const nurse = Math.round((amount * pct) / 100);
  return { pct, nurse, platform: amount - nurse };
}
