"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SKINS, type SkinKey } from "@/lib/options";

const YEAR = 60 * 60 * 24 * 365;

// Preferences live on <html> (for CSS) and in a cookie (so the server renders the same way next time).
function savePref(name: "skin" | "theme", value: string) {
  document.documentElement.dataset[name] = value;
  document.cookie = `${name}=${value}; path=/; max-age=${YEAR}; samesite=lax`;
}

export function HeaderControls({ skin }: { skin: SkinKey }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState(skin);
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setDark(root.dataset.theme ? root.dataset.theme === "dark" : media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  function chooseSkin(next: SkinKey) {
    if (next === current) return;
    setCurrent(next);
    savePref("skin", next);
    // Server components pick a different layout per skin, so re-render them.
    startTransition(() => router.refresh());
  }

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    savePref("theme", next);
    setDark(!dark);
  }

  return (
    <div className="hdr-controls">
      <div className="skin-switch" role="radiogroup" aria-label="Page style" data-pending={pending || undefined}>
        {SKINS.map((s) => (
          <button key={s.key} type="button" role="radio" aria-checked={current === s.key} onClick={() => chooseSkin(s.key)} title={`${s.label} style`}>
            <SkinIcon skin={s.key} />
            <span className="skin-label">{s.label}</span>
          </button>
        ))}
      </div>
      <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
        {dark ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
          </svg>
        )}
      </button>
    </div>
  );
}

function SkinIcon({ skin }: { skin: SkinKey }) {
  if (skin === "comic")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="10" height="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="15" y="3" width="6" height="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="13" width="18" height="8" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  if (skin === "arcade")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="5" width="9" height="3" fill="currentColor" />
        <rect x="13" y="5" width="9" height="3" fill="currentColor" opacity=".5" />
        <circle cx="7" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20V9M10 20V4M16 20v-8M22 20H2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
