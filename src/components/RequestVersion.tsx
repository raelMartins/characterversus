"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Fans can ask for a version we haven't built yet (one of the suggestions, or their own).
export function RequestVersion({ slug, name, suggestions }: { slug: string; name: string; suggestions: string[] }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function request(wanted: string) {
    const clean = wanted.trim();
    if (clean.length < 2) return;
    setBusy(clean);
    setError(null);
    try {
      const res = await fetch(`/api/characters/${slug}/versions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: clean }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't add that version.");
      setLabel("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="request-version">
      <h3>Want another version of {name}?</h3>
      {suggestions.length > 0 && (
        <div className="chips">
          {suggestions.map((s) => (
            <button key={s} type="button" className="chip" disabled={Boolean(busy)} onClick={() => request(s)}>
              + {s}
            </button>
          ))}
        </div>
      )}
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          request(label);
        }}
      >
        <label htmlFor="version-label" className="sr-only">
          Version name
        </label>
        <input id="version-label" placeholder="Name a version, e.g. a form, era or power-up" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} />
        <button type="submit" disabled={Boolean(busy) || label.trim().length < 2}>
          Request
        </button>
      </form>
      {busy && (
        <p className="build-status" role="status">
          <span className="spinner" aria-hidden="true" />
          Researching &ldquo;{busy}&rdquo;. This takes about a minute.
        </p>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
