import { MatchupCards } from "@/components/MatchupCards";
import { Picker } from "@/components/Picker";
import { getCharacterBySlug, searchCharacters, toSummary, type CharacterSummary } from "@/lib/characters";
import { listMatchups } from "@/lib/matchups";

async function initial(slug: string | undefined): Promise<CharacterSummary | null> {
  if (!slug) return null;
  const row = await getCharacterBySlug(slug);
  return row ? toSummary(row) : null;
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  let [a, b] = await Promise.all([initial(one(sp.a)), initial(one(sp.b))]);
  // With no fighters in the URL, start from the newest two so the page opens on a real matchup.
  if (!a && !b) {
    const recent = await searchCharacters("", 2);
    [a, b] = [recent[1] ?? null, recent[0] ?? null];
  }
  const [hot, recent] = await Promise.all([listMatchups("hot", 6), listMatchups("recent", 9)]);

  return (
    <div className="home">
      <div className="home-intro">
        <h1>Who would win?</h1>
        <p>Pick any two characters from any story, or anyone famous. Choose where they fight and how. We judge it from their real feats and show you the fight blow by blow.</p>
      </div>
      <Picker initialA={a} initialB={b} />
      <section className="fight-list" id="fights">
        <h2>Hot right now</h2>
        <MatchupCards items={hot} empty="No fights yet. Book the first one above." />
      </section>
      <section className="fight-list">
        <h2>Just judged</h2>
        <MatchupCards items={recent} empty="No fights yet." />
      </section>
    </div>
  );
}
