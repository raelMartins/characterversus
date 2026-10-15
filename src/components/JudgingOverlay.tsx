"use client";

import { useEffect, useState } from "react";
import type { CharacterSummary } from "@/lib/characters";
import { Figure } from "./Figure";

const LINES = [
  "Comparing feats",
  "Checking who counters who",
  "Reading the arena",
  "Running the fight",
  "Writing it up",
];

export function JudgingOverlay({ a, b }: { a: CharacterSummary; b: CharacterSummary }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, LINES.length - 1)), 7000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="judging" role="status" aria-live="polite">
      <div className="judging-card">
        <div className="judging-figs">
          <Figure look={a.look} label={a.name} />
          <span className="judging-vs">VS</span>
          <Figure look={b.look} label={b.name} flip />
        </div>
        <p className="judging-title">The judges are deliberating</p>
        <p className="judging-step">{LINES[i]}…</p>
        <p className="judging-note">New matchups take up to a minute. Once judged, everyone gets the same answer instantly.</p>
      </div>
    </div>
  );
}
