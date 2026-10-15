"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CharacterSummary } from "@/lib/characters";
import { ARENAS, MODES, PREPS, type ArenaKey, type ModeKey, type PrepKey } from "@/lib/options";
import type { Look } from "@/lib/schemas";
import { Figure } from "./Figure";
import { FighterField } from "./FighterField";
import { JudgingOverlay } from "./JudgingOverlay";

export const MYSTERY: Look = {
  skin: "#9c98a6",
  top: "#7d7988",
  bottom: "#5d5a66",
  hair: "#5d5a66",
  accent: "#9c98a6",
  hairStyle: "none",
  build: "average",
  prop: "none",
  aura: "none",
  cape: false,
};

type Pick = { c: CharacterSummary | null; v: string | null };

export function Picker({ initialA, initialB }: { initialA: CharacterSummary | null; initialB: CharacterSummary | null }) {
  const router = useRouter();
  const [a, setA] = useState<Pick>({ c: initialA, v: initialA?.defaultVersionKey ?? null });
  const [b, setB] = useState<Pick>({ c: initialB, v: initialB?.defaultVersionKey ?? null });
  const [arena, setArena] = useState<ArenaKey>("neutral");
  const [mode, setMode] = useState<ModeKey>("character");
  const [prep, setPrep] = useState<PrepKey>("none");
  const [judging, setJudging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = Boolean(a.c && b.c);

  async function fight() {
    if (!a.c || !b.c) {
      setError("Pick two fighters first.");
      return;
    }
    setError(null);
    setJudging(true);
    try {
      const res = await fetch("/api/matchups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ a: { slug: a.c.slug, version: a.v }, b: { slug: b.c.slug, version: b.v }, arena, mode, prep }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "The judges couldn't settle this one.");
      router.push(`/m/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The judges couldn't settle this one.");
      setJudging(false);
    }
  }

  return (
    <section className="picker" aria-label="Pick a matchup">
      <div className="stage">
        <div className="slot slot-a">
          <span className="slot-name">{a.c ? a.c.name : "Fighter one"}</span>
          <Figure look={a.c?.look ?? MYSTERY} label={a.c?.name ?? "Unknown fighter"} />
        </div>
        <div className="slot slot-b">
          <span className="slot-name">{b.c ? b.c.name : "Fighter two"}</span>
          <Figure look={b.c?.look ?? MYSTERY} label={b.c?.name ?? "Unknown fighter"} flip />
        </div>
        <div className="vs-badge" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <polygon points="50,2 60,30 90,14 72,42 98,52 70,60 84,90 56,72 46,98 40,70 10,86 28,58 2,46 30,38 14,10 42,28" />
          </svg>
          <span>VS</span>
        </div>
      </div>

      <div className="picker-body">
        <div className="pick-row">
          <FighterField side="a" label="Fighter one" value={a.c} version={a.v} onChange={(c, v) => setA({ c, v })} />
          <span className="pick-vs" aria-hidden="true">
            VS
          </span>
          <FighterField side="b" label="Fighter two" value={b.c} version={b.v} onChange={(c, v) => setB({ c, v })} />
        </div>

        <div className="opts">
          <fieldset className="opt-group">
            <legend>Where do they fight?</legend>
            <div className="chips">
              {ARENAS.map((x) => (
                <button key={x.key} type="button" className="chip" aria-pressed={arena === x.key} onClick={() => setArena(x.key)} title={x.note}>
                  {x.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="opt-group">
            <legend>How do they fight?</legend>
            <div className="seg">
              {MODES.map((x) => (
                <button key={x.key} type="button" aria-pressed={mode === x.key} onClick={() => setMode(x.key)} title={x.note}>
                  {x.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="opt-group">
            <legend>Prep time</legend>
            <div className="seg">
              {PREPS.map((x) => (
                <button key={x.key} type="button" aria-pressed={prep === x.key} onClick={() => setPrep(x.key)} title={x.note}>
                  {x.label}
                </button>
              ))}
            </div>
          </fieldset>
          <button type="button" className="fight-btn" onClick={fight} disabled={judging} aria-disabled={!ready}>
            FIGHT!
          </button>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
      {judging && a.c && b.c && <JudgingOverlay a={a.c} b={b.c} />}
    </section>
  );
}
