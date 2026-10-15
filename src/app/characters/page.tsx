import type { Metadata } from "next";
import Link from "next/link";
import { Figure } from "@/components/Figure";
import { searchCharacters } from "@/lib/characters";
import { tierInfo } from "@/lib/options";

export const metadata: Metadata = { title: "Characters" };

export default async function CharactersPage({ searchParams }: PageProps<"/characters">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const results = await searchCharacters(q, 60);
  return (
    <div className="roster-page">
      <div className="roster-head">
        <h1>Characters</h1>
        <form className="inline-form" action="/characters">
          <label htmlFor="roster-q" className="sr-only">
            Search characters
          </label>
          <input id="roster-q" name="q" defaultValue={q} placeholder="Search by name or series" />
          <button type="submit">Search</button>
        </form>
      </div>
      <p className="roster-note">Can&rsquo;t find someone? Type their name in a fighter box on the home page and we&rsquo;ll research them.</p>
      {results.length === 0 ? (
        <p className="empty-note">No characters match &ldquo;{q}&rdquo;.</p>
      ) : (
        <ul className="roster-grid">
          {results.map((c) => {
            const top = Math.max(...c.versions.map((v) => v.tier));
            return (
              <li key={c.slug}>
                <Link href={`/c/${c.slug}`} className="roster-tile">
                  <Figure look={c.look} label={c.name} noAura />
                  <strong>{c.name}</strong>
                  <span>{c.franchise}</span>
                  <em>Peak: {tierInfo(top).name}</em>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
