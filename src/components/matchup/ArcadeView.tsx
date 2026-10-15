"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Figure } from "@/components/Figure";
import type { MatchupView } from "@/lib/matchups";
import { arenaLabel, modeLabel, prepLabel, tierInfo } from "@/lib/options";
import { STAT_KEYS, STAT_LABELS } from "@/lib/schemas";

function firstName(n: string) {
  return n.split(" ")[0];
}

// Health model: the loser ends at 0, the winner keeps more health the more one-sided the fight was.
function timeline(v: MatchupView) {
  const { winner, confidence, beats } = v.verdict;
  const left = Math.round((confidence - 50) * 2);
  const end = winner === "draw" ? { a: 0, b: 0 } : winner === "a" ? { a: left, b: 0 } : { a: 0, b: left };
  const hits = { a: 0, b: 0 };
  beats.forEach((b) => {
    if (b.who !== "b") hits.b++;
    if (b.who !== "a") hits.a++;
  });
  const per = { a: (100 - end.a) / (hits.a || 1), b: (100 - end.b) / (hits.b || 1) };
  const hp = { a: 100, b: 100 };
  const steps = beats.map((b) => {
    if (b.who !== "b") hp.b -= per.b;
    if (b.who !== "a") hp.a -= per.a;
    return { a: Math.max(0, Math.round(hp.a)), b: Math.max(0, Math.round(hp.b)) };
  });
  return { end, steps };
}

export function ArcadeView({ v }: { v: MatchupView }) {
  const verdict = v.verdict;
  const { end, steps } = useMemo(() => timeline(v), [v]);
  const [hp, setHp] = useState(end);
  const [step, setStep] = useState<number | null>(null); // null = final state
  const [playing, setPlaying] = useState(false);
  const [hit, setHit] = useState<{ a: number; b: number }>({ a: 0, b: 0 });
  const [koKey, setKoKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => stop, []);

  const play = useCallback(() => {
    stop();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gap = reduce ? 300 : 1400;
    setPlaying(true);
    setHp({ a: 100, b: 100 });
    setStep(-1);
    verdict.beats.forEach((b, i) => {
      timers.current.push(
        setTimeout(() => {
          setStep(i);
          setHp(steps[i]);
          setHit((h) => ({ a: b.who !== "a" ? h.a + 1 : h.a, b: b.who !== "b" ? h.b + 1 : h.b }));
        }, 400 + i * gap),
      );
    });
    timers.current.push(
      setTimeout(() => {
        setStep(null);
        setHp(end);
        setPlaying(false);
        setKoKey((k) => k + 1);
      }, 400 + verdict.beats.length * gap),
    );
  }, [verdict.beats, steps, end]);

  const final = step === null;
  const downA = final && (verdict.winner === "b" || verdict.winner === "draw");
  const downB = final && (verdict.winner === "a" || verdict.winner === "draw");
  const call = final ? verdict.method.toUpperCase() : step !== null && step >= 0 ? `${verdict.beats[step].sfx.toUpperCase()}  ${verdict.beats[step].title.toUpperCase()}` : "READY?";
  const timer = final ? "KO" : step !== null && step >= 0 ? String(Math.max(1, 99 - (step + 1) * 13)).padStart(2, "0") : "99";
  const winText = verdict.winner === "draw" ? "DRAW" : `${firstName(v[verdict.winner].character.name).toUpperCase()} WINS`;

  return (
    <article className="ar">
      <section className="ar-select" aria-label="Fighters">
        {(["a", "b"] as const).map((s) => {
          const f = v[s];
          const t = tierInfo(f.version.tier);
          return (
            <div key={s} className={`ar-slot p${s === "a" ? 1 : 2}`}>
              <span className="ar-who">PLAYER {s === "a" ? 1 : 2}</span>
              <div className="ar-portrait">
                <Figure look={f.character.look} label={f.character.name} flip={s === "b"} />
              </div>
              <div>
                <Link href={`/c/${f.character.slug}`} className="ar-name">
                  {f.character.name}
                </Link>
                <div className="ar-from">{f.character.franchise}</div>
                <div className="ar-form">
                  {f.version.label} · Tier {f.version.tier} {t.name}
                </div>
              </div>
            </div>
          );
        })}
        <div className="ar-stage-info">
          <span className="label">Stage</span>
          <strong>{arenaLabel(v.arena)}</strong>
          <span className="label">Rules</span>
          <strong>
            {modeLabel(v.mode)} · {prepLabel(v.prep)}
          </strong>
          <div className="ar-stats">
            {STAT_KEYS.map((k) => (
              <div key={k} className="ar-stat">
                <span className="n">{v.a.version.stats[k]}</span>
                <span className="k">{STAT_LABELS[k]}</span>
                <span className="n">{v.b.version.stats[k]}</span>
                <i className="l" style={{ width: `${v.a.version.stats[k] * 5}%` }} />
                <i className="r" style={{ width: `${v.b.version.stats[k] * 5}%` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ar-hud" aria-label="Fight">
        <div className="ar-bars">
          <div className="ar-hp l">
            <div className="nm">
              <span>{firstName(v.a.character.name).toUpperCase()}</span>
              <span className="num">{hp.a}</span>
            </div>
            <div className="track">
              <i className="ghost" style={{ width: `${hp.a}%` }} />
              <i className="fill" style={{ width: `${hp.a}%` }} />
            </div>
          </div>
          <div className="ar-timer">
            {timer}
            <small>{final ? "FINAL" : step !== null && step >= 0 ? `HIT ${step + 1}` : "ROUND 1"}</small>
          </div>
          <div className="ar-hp r">
            <div className="nm">
              <span>{firstName(v.b.character.name).toUpperCase()}</span>
              <span className="num">{hp.b}</span>
            </div>
            <div className="track">
              <i className="ghost" style={{ width: `${hp.b}%` }} />
              <i className="fill" style={{ width: `${hp.b}%` }} />
            </div>
          </div>
        </div>

        <div className={`ar-stagebox arena-${v.arena}`}>
          <div className={`ar-fighter a ${downA ? "down" : ""}`} key={`a${hit.a}`} data-hit={hit.a > 0 && !final ? "" : undefined}>
            <Figure look={v.a.character.look} label={v.a.character.name} noAura />
          </div>
          <div className={`ar-fighter b ${downB ? "down" : ""}`} key={`b${hit.b}`} data-hit={hit.b > 0 && !final ? "" : undefined}>
            <Figure look={v.b.character.look} label={v.b.character.name} noAura flip />
          </div>
          <span className="ar-call">{call}</span>
          {final && (
            <div className="ar-ko" key={koKey} data-slam={koKey > 0 ? "" : undefined}>
              {verdict.winner === "draw" ? "DOUBLE K.O." : "K.O."}
            </div>
          )}
        </div>

        <div className="ar-result">
          <div className="ar-res-card">
            <span className="label">Verdict v{v.verdictVersion}</span>
            <h1 className={`ar-win ${verdict.winner}`}>{winText}</h1>
            <div className="ar-chips">
              {[verdict.method, `${verdict.confidence}% confident`].map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <p>{verdict.summary}</p>
            <button type="button" className="ar-replay" onClick={play} disabled={playing}>
              {playing ? "FIGHTING…" : "▶ REPLAY FIGHT"}
            </button>
          </div>
          <ol className="ar-log">
            {verdict.beats.map((b, i) => {
              const who = b.who === "a" ? "var(--side-a)" : b.who === "b" ? "var(--side-b)" : "var(--gold)";
              const lead = b.who === "both" ? "TRADE" : firstName(v[b.who].character.name).toUpperCase();
              const state = step === null ? "" : i === step ? "now" : i > step ? "pending" : "";
              return (
                <li key={i} className={state} style={{ ["--who" as string]: who }}>
                  <span className="hitn">
                    HIT {i + 1}
                    <span>{lead}</span>
                  </span>
                  <div>
                    <b>{b.title}</b>
                    <p>{b.text}</p>
                  </div>
                </li>
              );
            })}
            <li className={`finish ${final ? "" : "pending"}`} style={{ ["--who" as string]: "var(--gold)" }}>
              <span className="hitn">
                KO
                <span>{verdict.method.toUpperCase()}</span>
              </span>
              <div>
                <b>{winText}</b>
                <p>{verdict.finish}</p>
              </div>
            </li>
          </ol>
        </div>
        <ul className="ar-factors">
          {verdict.keyFactors.map((k, i) => (
            <li key={i} className={`f-${k.side}`}>
              <b>{k.side === "neutral" ? "BOTH" : firstName(v[k.side].character.name).toUpperCase()}</b> {k.text}
            </li>
          ))}
        </ul>
        <p className="ar-flip">
          <b>COUNTER-PICK:</b> {verdict.flip}
        </p>
      </section>
    </article>
  );
}
