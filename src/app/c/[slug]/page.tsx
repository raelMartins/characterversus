import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Figure } from "@/components/Figure";
import { RequestVersion } from "@/components/RequestVersion";
import { getCharacterBySlug } from "@/lib/characters";
import { powerLevel, tierInfo } from "@/lib/options";
import { STAT_KEYS, STAT_LABELS } from "@/lib/schemas";

export async function generateMetadata({ params }: PageProps<"/c/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const row = await getCharacterBySlug(slug);
  return row ? { title: row.name, description: row.profile.summary } : { title: "Character not found" };
}

export default async function CharacterPage({ params }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const row = await getCharacterBySlug(slug);
  if (!row) notFound();
  const p = row.profile;

  return (
    <article className="profile">
      <header className="profile-head">
        <div className="profile-fig">
          <Figure look={p.look} label={p.name} />
        </div>
        <div className="profile-intro">
          <span className="eyebrow">{p.franchise}</span>
          <h1>{p.name}</h1>
          {p.aliases.length > 0 && <p className="aliases">Also known as {p.aliases.join(", ")}</p>}
          <p className="profile-summary">{p.summary}</p>
          <Link href={`/?a=${row.slug}`} className="fight-btn small">
            Pick a fight
          </Link>
        </div>
      </header>

      <section className="versions" aria-label="Versions">
        <h2>Versions</h2>
        <div className="version-grid">
          {p.versions.map((v) => {
            const t = tierInfo(v.tier);
            return (
              <section key={v.key} className="version-card">
                <header>
                  <h3>
                    {v.label}
                    {v.key === p.defaultVersionKey && <span className="badge">Default</span>}
                  </h3>
                  <span className="version-era">{v.era}</span>
                </header>
                <div className="tier-line">
                  <b>
                    Tier {v.tier}: {t.name}
                  </b>
                  <span className="power-level" title="A fun headline number: roughly ten times bigger per tier">
                    Power level {powerLevel(v.tier, v.stats).toLocaleString()}
                  </span>
                </div>
                <p className="version-desc">{v.description}</p>
                <p className="tier-note">{v.tierNote}</p>
                <dl className="stat-list">
                  {STAT_KEYS.map((k) => (
                    <div key={k}>
                      <dt>{STAT_LABELS[k]}</dt>
                      <dd>
                        <span className="stat-bar" aria-hidden="true">
                          <i style={{ width: `${v.stats[k] * 10}%` }} />
                        </span>
                        <span className="stat-num">{v.stats[k]}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <h4>Abilities</h4>
                <ul>{v.abilities.map((x, i) => <li key={i}>{x}</li>)}</ul>
                <h4>Feats</h4>
                <ul>{v.feats.map((x, i) => <li key={i}>{x}</li>)}</ul>
                <h4>Weaknesses</h4>
                <ul>{v.weaknesses.map((x, i) => <li key={i}>{x}</li>)}</ul>
                {v.equipment.length > 0 && (
                  <>
                    <h4>Equipment</h4>
                    <ul>{v.equipment.map((x, i) => <li key={i}>{x}</li>)}</ul>
                  </>
                )}
              </section>
            );
          })}
        </div>
        <RequestVersion slug={row.slug} name={p.name} suggestions={p.suggestedVersions} />
      </section>

      {p.sources.length > 0 && (
        <p className="sources">
          Sources:{" "}
          {p.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && " · "}
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
            </span>
          ))}{" "}
          (CC BY-SA)
        </p>
      )}
    </article>
  );
}
