import Link from "next/link";
import { Figure } from "@/components/Figure";
import type { MatchupView } from "@/lib/matchups";
import { tierInfo } from "@/lib/options";
import { firstName, panelSpans, settingLine, statRows, winnerLabel } from "./shared";

const SCENE: Record<string, string> = {
  ocean: "sea",
  desert: "dune",
  city: "roof",
  forest: "woods",
  volcano: "lava",
  arctic: "snow",
  space: "space",
  neutral: "field",
};

export function ComicView({ v }: { v: MatchupView }) {
  const verdict = v.verdict;
  const spans = panelSpans(verdict.beats.length + 1);
  const scene = SCENE[v.arena] ?? "field";
  const issueNo = parseInt(v.id.replace(/[^0-9a-f]/g, "").slice(0, 4) || "1", 16) % 9000 + 1000;
  const win = winnerLabel(v).toUpperCase() + (verdict.winner === "draw" ? "!" : "!");

  return (
    <article className="cm">
      <section className="cm-cover" aria-label="Matchup">
        <div className="cm-cover-top">
          <div className="cm-issue">
            <b>No. {issueNo.toLocaleString()}</b>
            <span>{settingLine(v)}</span>
          </div>
          <div className="cm-price">FREE</div>
        </div>
        <div className="cm-art">
          {(["a", "b"] as const).map((s) => {
            const f = v[s];
            return (
              <div key={s} className={`cm-side ${s}`}>
                <Link href={`/c/${f.character.slug}`} className="cm-tag">
                  {f.character.name.toUpperCase()}
                  <small>{f.version.label}</small>
                </Link>
                <Figure look={f.character.look} label={f.character.name} flip={s === "b"} />
              </div>
            );
          })}
          <div className="vs-badge" aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <polygon points="50,2 60,30 90,14 72,42 98,52 70,60 84,90 56,72 46,98 40,70 10,86 28,58 2,46 30,38 14,10 42,28" />
            </svg>
            <span>VS</span>
          </div>
        </div>
      </section>

      <section className="cm-verdict" aria-label="Verdict">
        <div className="cm-verdict-box">
          <span className="cm-kicker">The verdict{v.verdictVersion > 1 ? ` · revised v${v.verdictVersion}` : ""}</span>
          <h1 className="cm-winner">{win}</h1>
          <div className="cm-pills">
            <span>{verdict.method}</span>
            <span>{verdict.confidence}% confident</span>
          </div>
          <div className="cm-conf" role="img" aria-label={`${verdict.confidence}% confident`}>
            <i style={{ width: `${verdict.confidence}%` }} />
          </div>
          <p className="cm-summary">{verdict.summary}</p>
          <ul className="cm-factors">
            {verdict.keyFactors.map((k, i) => (
              <li key={i} className={`f-${k.side}`}>
                <b>{k.side === "neutral" ? "Both" : firstName(v[k.side].character.name)}:</b> {k.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="cm-tape">
          <h2>Tale of the tape</h2>
          <div className="cm-tape-head">
            <span>{firstName(v.a.character.name)}</span>
            <span>{firstName(v.b.character.name)}</span>
          </div>
          <div className="cm-tier">
            <span>{tierInfo(v.a.version.tier).name}</span>
            <em>Tier</em>
            <span>{tierInfo(v.b.version.tier).name}</span>
          </div>
          {statRows(v).map((r) => (
            <div className="cm-row" key={r.key}>
              <div className="cm-bar l" role="img" aria-label={`${v.a.character.name} ${r.label} ${r.a} of 10`}>
                <i style={{ width: `${r.a * 10}%` }} />
              </div>
              <span className="cm-lbl">{r.label}</span>
              <div className="cm-bar r" role="img" aria-label={`${v.b.character.name} ${r.label} ${r.b} of 10`}>
                <i style={{ width: `${r.b * 10}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="The fight">
        <div className="cm-section-title">
          <h2>How it went down</h2>
          <p>{verdict.beats.length} beats. Closer fights get more panels.</p>
        </div>
        <div className="cm-pages">
          {verdict.beats.map((b, i) => (
            <article key={i} className="cm-panel" style={{ ["--span" as string]: spans[i], animationDelay: `${i * 70}ms` }}>
              <div className="cm-cap">
                <b>{i + 1}.</b>
                {b.title}. {b.text}
              </div>
              <div className={`cm-scene ${scene}`}>
                <span className={`cm-sfx ${i % 2 ? "right" : "left"}`}>{b.sfx}</span>
                {(b.who === "a" || b.who === "both") && <Figure look={v.a.character.look} label={v.a.character.name} noAura={b.who === "both"} />}
                {(b.who === "b" || b.who === "both") && <Figure look={v.b.character.look} label={v.b.character.name} noAura={b.who === "both"} flip />}
              </div>
            </article>
          ))}
          <article className="cm-panel final" style={{ ["--span" as string]: spans[verdict.beats.length], animationDelay: `${verdict.beats.length * 70}ms` }}>
            <div className="cm-cap">
              <b>END.</b>
              {verdict.method}
            </div>
            <div className="cm-final">
              <span className="cm-final-big">{win}</span>
              <p>{verdict.finish}</p>
            </div>
          </article>
        </div>
        <p className="cm-flip">
          <b>What would flip it?</b> {verdict.flip}
        </p>
      </section>
    </article>
  );
}
