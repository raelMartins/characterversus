import Link from "next/link";
import { Figure } from "@/components/Figure";
import type { MatchupView } from "@/lib/matchups";
import { tierInfo } from "@/lib/options";
import { arenaLabelOf, firstName, settingLine, statRows } from "./shared";

export function BroadcastView({ v }: { v: MatchupView }) {
  const verdict = v.verdict;
  // Score each beat 10-9 for whoever drove it; trades go 10-10.
  const rounds = verdict.beats.map((b) => ({ ...b, sa: b.who === "b" ? 9 : 10, sb: b.who === "a" ? 9 : 10 }));
  const ta = rounds.reduce((n, r) => n + r.sa, 0);
  const tb = rounds.reduce((n, r) => n + r.sb, 0);
  const winName = verdict.winner === "draw" ? "Draw" : `${v[verdict.winner].character.name} wins`;
  const list = (items: string[]) => (
    <ul>
      {items.slice(0, 4).map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );

  return (
    <article className="bc">
      <section className="bc-poster" aria-label="Fight poster">
        <div className="bc-corner r">
          <span className="bc-tag">Red corner</span>
          <Figure look={v.a.character.look} label={v.a.character.name} />
        </div>
        <div className="bc-center">
          <span className="bc-belt">Main event</span>
          <h1 className="bc-billing">
            <Link href={`/c/${v.a.character.slug}`} className="r">
              {v.a.character.name}
            </Link>
            <span className="v">vs</span>
            <Link href={`/c/${v.b.character.slug}`} className="b">
              {v.b.character.name}
            </Link>
          </h1>
          <span className="bc-meta">{settingLine(v)}</span>
          <span className="bc-meta">
            {v.a.version.label} vs {v.b.version.label}
          </span>
        </div>
        <div className="bc-corner b">
          <span className="bc-tag">Blue corner</span>
          <Figure look={v.b.character.look} label={v.b.character.name} flip />
        </div>
      </section>

      <section className="bc-lower" aria-label="Decision">
        <span className="bc-flag">Decision</span>
        <div className="bc-main">
          <span className="bc-eyebrow">
            {arenaLabelOf(v)} · Verdict v{v.verdictVersion}
          </span>
          <div className="bc-win">{winName}</div>
          <div className="bc-how">
            {verdict.method}. {verdict.summary}
          </div>
        </div>
        <div className="bc-odds">
          <b>{verdict.confidence}%</b>
          <span>Confidence</span>
        </div>
      </section>

      <section className="bc-tape" aria-label="Tale of the tape">
        <div className="bc-tape-h">
          <span className="r">{firstName(v.a.character.name)}</span>
          <h2>Tale of the tape</h2>
          <span className="b">{firstName(v.b.character.name)}</span>
        </div>
        <div className="bc-row">
          <div className="vl">
            <b>{tierInfo(v.a.version.tier).name}</b>
          </div>
          <span className="k">Tier</span>
          <div className="vr">
            <b>{tierInfo(v.b.version.tier).name}</b>
          </div>
        </div>
        {statRows(v).map((r) => (
          <div className="bc-row" key={r.key}>
            <div className="vl">
              {r.a > r.b && <span className="edge">EDGE</span>}
              <span className="meter" aria-hidden="true">
                <i style={{ width: `${r.a * 10}%` }} />
              </span>
              <span className="num">{r.a.toFixed(1)}</span>
            </div>
            <span className="k">{r.label}</span>
            <div className="vr">
              <span className="num">{r.b.toFixed(1)}</span>
              <span className="meter" aria-hidden="true">
                <i style={{ width: `${r.b * 10}%` }} />
              </span>
              {r.b > r.a && <span className="edge">EDGE</span>}
            </div>
          </div>
        ))}
        <div className="bc-row text">
          <div className="vl">{list(v.a.version.feats)}</div>
          <span className="k">Key feats</span>
          <div className="vr">{list(v.b.version.feats)}</div>
        </div>
        <div className="bc-row text">
          <div className="vl">{list(v.a.version.weaknesses)}</div>
          <span className="k">Weaknesses</span>
          <div className="vr">{list(v.b.version.weaknesses)}</div>
        </div>
      </section>

      <section aria-label="Round by round">
        <div className="bc-sc-head">
          <h2>Round by round</h2>
          <p>
            Cards read {ta}-{tb} before the finish. A stoppage overrides the cards.
          </p>
        </div>
        <div className="bc-rounds">
          {rounds.map((r, i) => (
            <article key={i} className="bc-round" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="rn">
                Round<b>{i + 1}</b>
              </div>
              <div>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
              <div className="score" aria-label={`Round ${i + 1}: ${firstName(v.a.character.name)} ${r.sa}, ${firstName(v.b.character.name)} ${r.sb}`}>
                <span className={r.sa > r.sb ? "w r" : ""}>{r.sa}</span>
                <span className={r.sb > r.sa ? "w b" : ""}>{r.sb}</span>
                <small>
                  {firstName(v.a.character.name)} · {firstName(v.b.character.name)}
                </small>
              </div>
            </article>
          ))}
          <article className="bc-round finish">
            <div className="rn">
              End<b>{verdict.winner === "draw" ? "=" : "KO"}</b>
            </div>
            <div>
              <h3>{verdict.method}</h3>
              <p>{verdict.finish}</p>
            </div>
            <div />
          </article>
        </div>
        <div className="bc-factors">
          <h3>Judges&rsquo; notes</h3>
          <ul>
            {verdict.keyFactors.map((k, i) => (
              <li key={i} className={`f-${k.side}`}>
                <b>{k.side === "neutral" ? "Both" : firstName(v[k.side].character.name)}</b> {k.text}
              </li>
            ))}
          </ul>
          <p>
            <b>Rematch clause:</b> {verdict.flip}
          </p>
        </div>
      </section>
    </article>
  );
}
