/** Shared localStorage helpers: standardized `shushrusha_*` keys + one-time legacy migration. */

/** Converts a legacy `shushrusha:foo` key to the standard `shushrusha_foo` key. */
export function stdKey(name: string) {
  return `shushrusha_${name}`;
}

/** Moves any value stored under the old colon-style key onto the standard key. */
export function migrateLegacyKey(key: string) {
  if (typeof window === "undefined") return;
  const legacy = key.replace(/^shushrusha_/, "shushrusha:");
  if (legacy === key) return;
  try {
    const old = localStorage.getItem(legacy);
    if (old !== null) {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, old);
      localStorage.removeItem(legacy);
    }
  } catch {
    /* storage unavailable */
  }
}

export function readLocal(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    migrateLegacyKey(key);
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function readLocalJSON<T>(key: string, fallback: T): T {
  const raw = readLocal(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLocal(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}
