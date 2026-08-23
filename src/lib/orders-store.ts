/** Local-first store for patients and orders (localStorage, no backend yet). */

export type Relation = "Self" | "Father" | "Mother" | "Spouse" | "Other";

export type Patient = {
  id: string;
  name: string;
  relation: Relation;
  age: string;
  gender: "Male" | "Female" | "Other";
  conditions: string;
};

export type OrderCategory = "nursing" | "doctor" | "lab" | "store";

export type OrderStatus = "Pending" | "Assigned" | "En Route" | "Completed" | "Cancelled";

export type NurseInfo = {
  name: string;
  qualification: string;
  phone: string;
  avatar?: string;
  eta?: string;
};

export type LocalOrder = {
  id: string;
  category: OrderCategory;
  serviceName: string;
  date: string;
  slot: string;
  status: OrderStatus;
  patientName: string;
  patientRelation: string;
  address: string;
  notes?: string;
  prescription?: string;
  payment: string;
  amount: number;
  nurse?: NurseInfo;
  createdAt: string;
};

const PATIENTS_KEY = "shushrusha:patients";
const ORDERS_KEY = "shushrusha:orders";
export const LOCATION_KEY = "shushrusha:location";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, rows: T[]) {
  localStorage.setItem(key, JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent("shushrusha:store"));
}

export const loadPatients = () => read<Patient>(PATIENTS_KEY);
export function savePatient(p: Patient) {
  const rows = loadPatients().filter((r) => r.id !== p.id);
  write(PATIENTS_KEY, [p, ...rows]);
}
export function removePatient(id: string) {
  write(
    PATIENTS_KEY,
    loadPatients().filter((r) => r.id !== id),
  );
}

export const loadOrders = () => read<LocalOrder>(ORDERS_KEY);
export function saveOrder(o: LocalOrder) {
  const rows = loadOrders().filter((r) => r.id !== o.id);
  write(ORDERS_KEY, [o, ...rows]);
}

export function newTrackingId() {
  return `SHU-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function savedLocation() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LOCATION_KEY) ?? "";
}

export const ACTIVE_STATUSES: OrderStatus[] = ["Pending", "Assigned", "En Route"];

export const STATUS_STYLE: Record<OrderStatus, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  Assigned: "bg-primary/10 text-primary border-primary/30",
  "En Route": "bg-purple-500/10 text-purple-600 border-purple-500/30",
  Completed: "bg-success/15 text-success border-success/30",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  Pending: "Pending • অপেক্ষমান",
  Assigned: "Assigned • নার্স নিযুক্ত",
  "En Route": "En Route • পথে আছেন",
  Completed: "Completed • সম্পন্ন",
  Cancelled: "Cancelled • বাতিল",
};

export const CATEGORY_LABEL: Record<OrderCategory, string> = {
  nursing: "🩺 Nursing Care",
  doctor: "👨‍⚕️ Doctor Appointments",
  lab: "🧪 Lab Tests",
  store: "📦 Medical Store",
};

export const TIMELINE = [
  "Booking Received",
  "Nurse Assigned",
  "En Route",
  "Service Started",
  "Completed",
] as const;

export function timelineIndex(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return 0;
    case "Assigned":
      return 1;
    case "En Route":
      return 2;
    case "Completed":
      return 4;
    default:
      return 0;
  }
}
