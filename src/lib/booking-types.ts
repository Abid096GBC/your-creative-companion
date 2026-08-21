export type BookingRow = {
  id: string;
  tracking_id: string;
  service: string;
  customer_name: string;
  phone: string;
  address: string;
  details: Record<string, string | number | boolean>;
  body_region: string | null;
  stitch_count: number | null;
  referral_code: string | null;
  price_estimate: string | null;
  notes: string | null;
  status: string;
  nurse_id: string | null;
  payment_status: string;
  amount: number | null;
  nurse_share: number | null;
  platform_share: number | null;
  created_at: string;
  time_slot: string | null;
  payment_method: string | null;
  promo_code: string | null;
  discount: number;
  total: number | null;
  tier: string;
  rating: number | null;
  review: string | null;
};

export type NurseRow = {
  id: string;
  nurse_code: string;
  name: string;
  phone: string;
  rating: number;
  completed_visits: number;
  status: string;
  specialties: string[];
  area: string | null;
  tier: string;
  active: boolean;
  login_pin: string;
};

export type CatalogRow = {
  id: string;
  item_key: string;
  kind: string;
  name: string;
  name_en: string;
  unit: string;
  price: number;
  active: boolean;
  description: string;
  image_url: string | null;
  discount_pct: number;
};

export type PromoRow = {
  id: string;
  code: string;
  discount_type: string;
  value: number;
  expiry_date: string | null;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
};

export type LeadRow = {
  id: string;
  phone: string;
  name: string | null;
  source: string;
  last_service: string | null;
  created_at: string;
};

export const STATUSES = [
  "Pending",
  "Confirmed",
  "Nurse Assigned",
  "In Transit",
  "Service Active",
  "Completed",
] as const;
export const PAYMENT_STATUSES = ["Unpaid", "Paid via bKash", "Cash Collected by Nurse"] as const;
export const NURSE_STATUSES = ["Available", "On-Duty", "Off-Duty"] as const;
export const TIERS = ["worker", "nurse"] as const;

export const TIER_LABEL: Record<string, string> = {
  worker: "Tier A — হেলথ ওয়ার্কার / প্যারামেডিক",
  nurse: "Tier B — রেজিস্টার্ড নার্স",
};

/** Tier A tasks can be handled by health workers; everything else needs a registered nurse. */
export function serviceTier(service: string): "worker" | "nurse" {
  const s = service.toLowerCase();
  const tierA = ["ভাইটাল", "রক্তচাপ", "নেবুলাইজার", "ইনসুলিন", "insulin", "vitals", "nebuli"];
  if (tierA.some((k) => s.includes(k))) return "worker";
  return "nurse";
}

export function netPrice(price: number, discountPct: number) {
  return Math.round(price * (1 - (discountPct || 0) / 100));
}
