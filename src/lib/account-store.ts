/** Local-first account store: profile, wallet, points, referral, career application. */
import { useEffect, useState } from "react";

export type UserProfile = {
  name: string;
  phone: string;
  avatar?: string;
};

export type CareerApplication = {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  role: string;
  experience: number;
  nid?: string;
  license?: string;
  cvName?: string;
  createdAt: string;
};

export type GamerState = {
  points: number;
  streak: number;
  lastPlayed: string; // yyyy-mm-dd
};

const PROFILE_KEY = "shushrusha:profile";
const WALLET_KEY = "shushrusha:wallet";
const GAMER_KEY = "shushrusha:gamer";
const REFERRAL_KEY = "shushrusha:referral";
const CAREER_KEY = "shushrusha:career";

const EVENT = "shushrusha:account";

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT));
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

export const DEFAULT_PROFILE: UserProfile = { name: "শুশ্রূষা গ্রাহক", phone: "" };

export const loadProfile = () => readJson<UserProfile>(PROFILE_KEY, DEFAULT_PROFILE);
export const saveProfile = (p: UserProfile) => writeJson(PROFILE_KEY, p);

export const loadWallet = () => readJson<number>(WALLET_KEY, 50);
export const saveWallet = (v: number) => writeJson(WALLET_KEY, Math.max(0, Math.round(v)));

export const DEFAULT_GAMER: GamerState = { points: 0, streak: 0, lastPlayed: "" };
export const loadGamer = () => readJson<GamerState>(GAMER_KEY, DEFAULT_GAMER);
export const saveGamer = (g: GamerState) => writeJson(GAMER_KEY, g);

export function loadReferral() {
  if (typeof window === "undefined") return "SHU-XXXXXX";
  let code = localStorage.getItem(REFERRAL_KEY);
  if (!code) {
    code = `SHU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    localStorage.setItem(REFERRAL_KEY, code);
  }
  return code;
}

export const loadApplications = () => readJson<CareerApplication[]>(CAREER_KEY, []);
export function saveApplication(a: CareerApplication) {
  writeJson(CAREER_KEY, [a, ...loadApplications()]);
}

/** Re-render on any account change (profile, wallet, points). */
export function useAccountStore<T>(selector: () => T, initial: T): T {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    const sync = () => setValue(selector());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const POINTS_PER_TAKA = 10; // 100 points -> ৳10
