import Link from "next/link";
import type { MatchupCard } from "@/lib/matchups";
import { arenaLabel, modeLabel } from "@/lib/options";
import { Figure } from "./Figure";

export function MatchupCards({ items, empty }: { items: MatchupCard[]; empty: string }) {
  if (!items.length) return <p className="empty-note">{empty}</p>;
  return (
    <ul className="cards">
      {items.map((m) => {
        const result = m.winner === "draw" ? "Draw" : `${(m.winner === "a" ? m.a : m.b).name.split(" ")[0]} wins`;
        return (
          <li key={m.id}>
            <Link href={`/m/${m.id}`} className="card">
              <div className="card-figs">
                <Figure look={m.a.look} label={m.a.name} noAura className={`fig ${m.winner === "b" ? "lost" : ""}`} />
                <span className="card-vs">VS</span>
                <Figure look={m.b.look} label={m.b.name} noAura flip className={`fig ${m.winner === "a" ? "lost" : ""}`} />
              </div>
              <div className="card-body">
                <strong className="card-title">
                  {m.a.name} <span>vs</span> {m.b.name}
                </strong>
                <span className="card-meta">
                  {arenaLabel(m.arena)} · {modeLabel(m.mode)}
                </span>
                <span className="card-result">
                  {result} · {m.method}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
