/** Local-first inbox store: promotions, notifications, read state & nurse chat (localStorage). */
import { useEffect, useState } from "react";

export type Promotion = {
  id: string;
  kind: "offer" | "blog" | "package";
  title: string;
  desc: string;
  badge: string;
  code?: string;
  body?: string;
  waMessage?: string;
};

export type InboxNotification = {
  id: string;
  threadId: string;
  nurseName: string;
  nurseRole: string;
  message: string;
  followUp: string;
  time: string;
};

export type ChatMessage = {
  id: string;
  from: "nurse" | "patient";
  text?: string;
  photo?: string;
  at: string;
};

export const PROMOTIONS: Promotion[] = [
  {
    id: "care10",
    kind: "offer",
    title: "সব নার্সিং সেবায় ১০% ছাড়",
    desc: "ড্রেসিং, ইনজেকশন, স্যালাইন — যেকোনো হোম নার্সিং বুকিংয়ে CARE10 কোডে ১০% ছাড়।",
    badge: "১০% ছাড়",
    code: "CARE10",
  },
  {
    id: "first50",
    kind: "offer",
    title: "প্রথম অর্ডারে ৳৫০ ছাড়",
    desc: "নতুন গ্রাহকদের জন্য প্রথম সার্ভিস বুকিংয়ে SHUSHRUSHA50 কোডে ৳৫০ পর্যন্ত ছাড়।",
    badge: "নতুন গ্রাহক",
    code: "SHUSHRUSHA50",
  },
  {
    id: "winter-elder",
    kind: "package",
    title: "শীতকালীন এল্ডার কেয়ার প্যাকেজ",
    desc: "প্রবীণদের জন্য সাপ্তাহিক ভাইটাল চেক + ড্রেসিং কম্বো প্যাকেজ বিশেষ মূল্যে।",
    badge: "সিজনাল প্যাকেজ",
    waMessage: "Hello Shushrusha, I am interested in the Winter Elder Care Package.",
  },
  {
    id: "fullbody20",
    kind: "offer",
    title: "ফুল বডি চেকআপে ২০% ছাড়",
    desc: "ঘরে বসেই স্যাম্পল কালেকশন — ফুল বডি চেকআপ প্যাকেজে এই সপ্তাহে ২০% ছাড়।",
    badge: "এই সপ্তাহ",
    waMessage: "Hello Shushrusha, I want to book the Full Body Checkup package with the 20% discount.",
  },
  {
    id: "blog-wound",
    kind: "blog",
    title: "ডায়াবেটিক রোগীর ক্ষত যত্নে ৫টি টিপস",
    desc: "ডায়াবেটিস থাকলে ক্ষত শুকাতে দেরি হয় — ঘরে যত্ন নেওয়ার জরুরি নিয়মগুলো জানুন।",
    badge: "হেলথ ব্লগ",
    body: "১) প্রতিদিন একই সময়ে ক্ষত পরীক্ষা করুন। ২) ড্রেসিং পরিবর্তনের আগে হাত পরিষ্কার করুন। ৩) ব্লাড সুগার নিয়ন্ত্রণে রাখুন — উচ্চ সুগার ক্ষত শুকাতে বাধা দেয়। ৪) ক্ষতের চারপাশে লালচে ভাব, ফোলা বা দুর্গন্ধ দেখা দিলে দ্রুত নার্স/ডাক্তারের পরামর্শ নিন। ৫) নির্ধারিত সময়ে প্রফেশনাল ড্রেসিং করান — নিজে নিজে ক্ষত খুলে রাখবেন না।",
  },
  {
    id: "blog-bp",
    kind: "blog",
    title: "ব্লাড প্রেসার মাপার সঠিক নিয়ম",
    desc: "ঘরে বিপি মনিটর দিয়ে সঠিক রিডিং পেতে যে ভুলগুলো সবচেয়ে বেশি হয়।",
    badge: "হেলথ ব্লগ",
    body: "মাপার ৩০ মিনিট আগে চা, কফি বা ধূমপান থেকে দূরে থাকুন। ৫ মিনিট শান্তভাবে বসে থাকুন, হাত বুকের সমান উচ্চতায় রাখুন। কাপ হাতের ভেতরের শিরার ওপরে আঁটসাঁট করে পরুন। মাপার সময় কথা বলবেন না। একই হাতে, একই সময়ে প্রতিদিন মাপলে তুলনা করা সহজ হয়।",
  },
];

export const NOTIFICATIONS: InboxNotification[] = [
  {
    id: "n1",
    threadId: "t-anowar",
    nurseName: "আনোয়ার হোসেন",
    nurseRole: "Senior B.Sc Nurse",
    message: "আপনার বাবার ড্রেসিং সম্পর্কে একটি ফলো-আপ মেসেজ পাঠিয়েছেন।",
    followUp: "আসসালামু আলাইকুম! আজ ক্ষতের অবস্থা কেমন আছে? ডাক্তারের দেওয়া ওষুধ কি নিয়মিত খাওয়ানো হচ্ছে? প্রয়োজনে ক্ষতের ছবি পাঠাতে পারেন।",
    time: "১০ মিনিট আগে",
  },
  {
    id: "n2",
    threadId: "t-sharmin",
    nurseName: "শারমিন আক্তার",
    nurseRole: "Staff Nurse",
    message: "আগামীকালের ভাইটাল চেক অ্যাপয়েন্টমেন্ট কনফার্ম হয়েছে (সকাল ১০টা)।",
    followUp: "আগামীকাল সকাল ১০টায় ভাইটাল চেকের জন্য আসছি। মাপার আগে ৩০ মিনিট চা/নাশতা না করলে রিডিং আরও নির্ভুল হবে।",
    time: "২ ঘণ্টা আগে",
  },
  {
    id: "n3",
    threadId: "t-rakib",
    nurseName: "রাকিবুল ইসলাম",
    nurseRole: "Physiotherapy Assistant",
    message: "আপনার ফিজিওথেরাপি সেশনের হোম এক্সারসাইজ চার্ট পাঠিয়েছেন।",
    followUp: "গত সেশনের এক্সারসাইজগুলো নিয়মিত করছেন তো? কোনো ব্যথা বাড়লে জানাবেন — পরের সেশনে এক্সারসাইজ অ্যাডজাস্ট করে দেব।",
    time: "গতকাল",
  },
];

const READ_KEY = "shushrusha:inbox-read";
const CHAT_PREFIX = "shushrusha:chat:";
const EVENT = "shushrusha:inbox";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function emit() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function loadReadIds(): string[] {
  return readJson<string[]>(READ_KEY, []);
}

export function markRead(id: string) {
  const ids = loadReadIds();
  if (ids.includes(id)) return;
  localStorage.setItem(READ_KEY, JSON.stringify([...ids, id]));
  emit();
}

export function isRead(id: string) {
  return loadReadIds().includes(id);
}

export function unreadCount() {
  const read = loadReadIds();
  return NOTIFICATIONS.filter((n) => !read.includes(n.id)).length;
}

export function loadMessages(threadId: string): ChatMessage[] {
  return readJson<ChatMessage[]>(CHAT_PREFIX + threadId, []);
}

export function appendMessage(threadId: string, msg: ChatMessage) {
  const rows = loadMessages(threadId);
  localStorage.setItem(CHAT_PREFIX + threadId, JSON.stringify([...rows, msg]));
  emit();
}

/** React hook: live unread notification count (SSR-safe, updates on storage events). */
export function useUnreadInbox() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(unreadCount());
    update();
    window.addEventListener(EVENT, update);
    return () => window.removeEventListener(EVENT, update);
  }, []);
  return count;
}
