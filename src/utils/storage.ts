/**
 * utils/storage.ts
 * Purpose: Safe JSON localStorage helpers with error handling.
 */

/**
 * getJson: Safely parse JSON from localStorage by key.
 */
export function getJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * setJson: Safely stringify JSON to localStorage by key.
 */
export function setJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota or serialization errors
  }
}

