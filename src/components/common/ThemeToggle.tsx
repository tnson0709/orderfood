/**
 * components/common/ThemeToggle.tsx
 * Purpose: Dark mode toggle that toggles "dark" class on documentElement.
 */

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * ThemeToggle: a button to switch light/dark mode and persist in localStorage.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme_dark");
    if (saved != null) return saved === "1";
    // system preference
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? true
      : false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme_dark", "1");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme_dark", "0");
    }
  }, [dark]);

  return (
    <button
      className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 transition-colors"
      onClick={() => setDark((v) => !v)}
      title={dark ? "Chuyển Light mode" : "Chuyển Dark mode"}
    >
      {dark ? <Moon size={16} /> : <Sun size={16} />}
      <span>{dark ? "Dark" : "Light"}</span>
    </button>
  );
}

