import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArcadeView } from "@/components/matchup/ArcadeView";
import { BroadcastView } from "@/components/matchup/BroadcastView";
import { ComicView } from "@/components/matchup/ComicView";
import { Community } from "@/components/matchup/Community";
import { Rematch } from "@/components/matchup/Rematch";
import { Sources, winnerLabel } from "@/components/matchup/shared";
import { bumpViews, getMatchupView } from "@/lib/matchups";
import { readPrefs } from "@/lib/prefs";
import { readVoterId } from "@/lib/voter";

export async function generateMetadata({ params }: PageProps<"/m/[id]">): Promise<Metadata> {
  const { id } = await params;
  const v = await getMatchupView(id, null);
  if (!v) return { title: "Fight not found" };
  return {
    title: `${v.a.character.name} vs ${v.b.character.name}`,
    description: `${winnerLabel(v, false)}. ${v.verdict.summary}`,
  };
}

export default async function MatchupPage({ params }: PageProps<"/m/[id]">) {
  const { id } = await params;
  const [{ skin }, voterId] = await Promise.all([readPrefs(), readVoterId()]);
  const v = await getMatchupView(id, voterId);
  if (!v) notFound();
  await bumpViews(id);

  return (
    <div className={`matchup skin-${skin}`}>
      {skin === "arcade" ? <ArcadeView v={v} /> : skin === "broadcast" ? <BroadcastView v={v} /> : <ComicView v={v} />}
      <Rematch
        a={{ slug: v.a.character.slug, version: v.a.version.key }}
        b={{ slug: v.b.character.slug, version: v.b.version.key }}
        arena={v.arena}
        mode={v.mode}
        prep={v.prep}
      />
      <Community skin={skin} v={v} />
      <Sources v={v} />
    </div>
  );
}
