"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ARENAS, MODES, PREPS } from "@/lib/options";

type Props = {
  a: { slug: string; version: string };
  b: { slug: string; version: string };
  arena: string;
  mode: string;
  prep: string;
};

// Same two fighters, different conditions. Already-judged setups open instantly.
export function Rematch({ a, b, arena, mode, prep }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(next: { arena?: string; mode?: string; prep?: string }, label: string) {
    setBusy(label);
    setError(null);
    try {
      const res = await fetch("/api/matchups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ a, b, arena: next.arena ?? arena, mode: next.mode ?? mode, prep: next.prep ?? prep }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't book that rematch.");
      router.push(`/m/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(null);
    }
  }

  return (
    <section className="rematch" aria-label="Rematch">
      <h2>Run it back</h2>
      <p className="rematch-note">Same fighters, different conditions.</p>
      <div className="rematch-groups">
        <div className="chips">
          {ARENAS.filter((x) => x.key !== arena).map((x) => (
            <button key={x.key} type="button" className="chip" disabled={Boolean(busy)} onClick={() => go({ arena: x.key }, x.label)}>
              {busy === x.label ? "Judging…" : x.label}
            </button>
          ))}
        </div>
        <div className="chips">
          {MODES.filter((x) => x.key !== mode).map((x) => (
            <button key={x.key} type="button" className="chip alt" disabled={Boolean(busy)} onClick={() => go({ mode: x.key }, x.label)}>
              {busy === x.label ? "Judging…" : x.label}
            </button>
          ))}
          {PREPS.filter((x) => x.key !== prep).map((x) => (
            <button key={x.key} type="button" className="chip alt" disabled={Boolean(busy)} onClick={() => go({ prep: x.key }, x.label)}>
              {busy === x.label ? "Judging…" : x.label}
            </button>
          ))}
        </div>
      </div>
      {busy && <p className="form-note" role="status">New conditions take up to a minute to judge the first time.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>
  );
}
