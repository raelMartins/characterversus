import type { MatchupView } from "@/lib/matchups";
import { arenaLabel, modeLabel, prepLabel } from "@/lib/options";
import { STAT_KEYS, STAT_LABELS } from "@/lib/schemas";

export function firstName(name: string) {
  return name.split(" ")[0];
}

export function winnerLabel(v: MatchupView, short = true) {
  if (v.verdict.winner === "draw") return "Draw";
  const f = v.verdict.winner === "a" ? v.a : v.b;
  return `${short ? firstName(f.character.name) : f.character.name} wins`;
}

export function settingLine(v: MatchupView) {
  return `${arenaLabel(v.arena)} · ${modeLabel(v.mode)} · ${prepLabel(v.prep)}`;
}

export function arenaLabelOf(v: MatchupView) {
  return arenaLabel(v.arena);
}

export function statRows(v: MatchupView) {
  return STAT_KEYS.map((k) => ({ key: k, label: STAT_LABELS[k], a: v.a.version.stats[k], b: v.b.version.stats[k] }));
}

// Comic grid spans (out of 6 columns) for n panels, so every row is full.
export function panelSpans(n: number): number[] {
  const rows: Record<number, number[]> = {
    2: [4, 2],
    3: [4, 2, 6],
    4: [4, 2, 3, 3],
    5: [4, 2, 3, 3, 6],
    6: [4, 2, 2, 4, 3, 3],
    7: [4, 2, 2, 4, 2, 2, 2],
    8: [4, 2, 2, 4, 3, 3, 3, 3],
    9: [4, 2, 2, 4, 2, 2, 2, 3, 3],
  };
  return rows[n] ?? Array.from({ length: n }, () => 3);
}

export function Sources({ v }: { v: MatchupView }) {
  const all = [...v.a.profile.sources, ...v.b.profile.sources];
  if (!all.length) return null;
  return (
    <p className="sources">
      Sources:{" "}
      {all.map((s, i) => (
        <span key={s.url + i}>
          {i > 0 && " · "}
          <a href={s.url} target="_blank" rel="noopener noreferrer">
            {s.title}
          </a>
        </span>
      ))}{" "}
      (CC BY-SA)
    </p>
  );
}
