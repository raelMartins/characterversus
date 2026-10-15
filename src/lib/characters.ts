import "server-only";
import { and, eq, ilike, ne, sql } from "drizzle-orm";
import { buildProfile, buildVersion } from "@/lib/ai/profile";
import { AiError } from "@/lib/ai/client";
import { getDb, schema } from "@/lib/db";
import { newId, searchText, slugify } from "@/lib/keys";
import type { CharacterVersion, Look, Profile } from "@/lib/schemas";

const { characters } = schema;

export type CharacterSummary = {
  slug: string;
  name: string;
  franchise: string;
  isRealPerson: boolean;
  defaultVersionKey: string;
  versions: { key: string; label: string; era: string; tier: number }[];
  suggestedVersions: string[];
  look: Look;
};

export function toSummary(row: { slug: string; profile: Profile }): CharacterSummary {
  const p = row.profile;
  return {
    slug: row.slug,
    name: p.name,
    franchise: p.franchise,
    isRealPerson: p.isRealPerson,
    defaultVersionKey: p.defaultVersionKey,
    versions: p.versions.map((v) => ({ key: v.key, label: v.label, era: v.era, tier: v.tier })),
    suggestedVersions: p.suggestedVersions,
    look: p.look,
  };
}

export async function searchCharacters(q: string, limit = 8): Promise<CharacterSummary[]> {
  const db = await getDb();
  const term = q.trim().toLowerCase();
  if (!term) {
    const rows = await db.select({ slug: characters.slug, profile: characters.profile }).from(characters).orderBy(sql`${characters.createdAt} desc`).limit(limit);
    return rows.map(toSummary);
  }
  const escaped = term.replace(/[%_\\]/g, (c) => `\\${c}`);
  const rows = await db
    .select({ slug: characters.slug, profile: characters.profile })
    .from(characters)
    .where(ilike(characters.searchText, `%${escaped}%`))
    // Names that start with the query come first.
    .orderBy(sql`case when lower(${characters.name}) like ${escaped + "%"} then 0 else 1 end`, characters.name)
    .limit(limit);
  return rows.map(toSummary);
}

export async function getCharacterBySlug(slug: string) {
  const db = await getDb();
  const [row] = await db.select().from(characters).where(eq(characters.slug, slug)).limit(1);
  return row ?? null;
}

export async function getCharacterById(id: string) {
  const db = await getDb();
  const [row] = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
  return row ?? null;
}

export function findVersion(profile: Profile, key?: string | null): CharacterVersion {
  return profile.versions.find((v) => v.key === key) ?? profile.versions.find((v) => v.key === profile.defaultVersionKey) ?? profile.versions[0];
}

// Several people asking for the same new character at once share one AI build.
const inflight = new Map<string, Promise<CharacterSummary>>();

export async function createCharacter(name: string, hint?: string): Promise<CharacterSummary> {
  const clean = name.trim().replace(/\s+/g, " ").slice(0, 80);
  if (clean.length < 2) throw new AiError("short name", "Type a character's name first.");
  const k = clean.toLowerCase();
  const existing = inflight.get(k);
  if (existing) return existing;
  const job = (async () => {
    const db = await getDb();
    const [exact] = await db.select({ slug: characters.slug, profile: characters.profile }).from(characters).where(sql`lower(${characters.name}) = ${k}`).limit(1);
    if (exact) return toSummary(exact);

    const profile = await buildProfile(clean, hint?.slice(0, 200));

    // The AI may have resolved the name to someone we already have (e.g. "Celaena" -> Aelin).
    const [same] = await db
      .select({ slug: characters.slug, profile: characters.profile })
      .from(characters)
      .where(and(sql`lower(${characters.name}) = ${profile.name.toLowerCase()}`, sql`lower(${characters.franchise}) = ${profile.franchise.toLowerCase()}`))
      .limit(1);
    if (same) return toSummary(same);

    let slug = slugify(profile.name) || newId();
    const [taken] = await db.select({ id: characters.id }).from(characters).where(eq(characters.slug, slug)).limit(1);
    if (taken) slug = slugify(`${profile.name} ${profile.franchise}`) || newId();
    const [takenAgain] = await db.select({ id: characters.id }).from(characters).where(eq(characters.slug, slug)).limit(1);
    if (takenAgain) slug = `${slug}-${newId().slice(0, 4)}`;

    await db.insert(characters).values({
      id: newId(),
      slug,
      name: profile.name,
      franchise: profile.franchise,
      isRealPerson: profile.isRealPerson,
      searchText: searchText(profile.name, profile.aliases, profile.franchise),
      profile,
    });
    return toSummary({ slug, profile });
  })().finally(() => inflight.delete(k));
  inflight.set(k, job);
  return job;
}

export async function addVersion(slug: string, label: string): Promise<CharacterSummary> {
  const db = await getDb();
  const row = await getCharacterBySlug(slug);
  if (!row) throw new AiError("no character", "That character doesn't exist.");
  const profile = row.profile;
  if (profile.versions.length >= 8) throw new AiError("too many", `${profile.name} already has the maximum number of versions.`);
  const wanted = label.trim().slice(0, 80);
  const dup = profile.versions.find((v) => v.label.toLowerCase() === wanted.toLowerCase());
  if (dup) return toSummary(row);

  const version = await buildVersion(profile, wanted);
  let key = version.key;
  while (profile.versions.some((v) => v.key === key)) key = `${version.key}-${newId().slice(0, 3)}`;
  const next: Profile = {
    ...profile,
    versions: [...profile.versions, { ...version, key }],
    suggestedVersions: profile.suggestedVersions.filter((s) => s.toLowerCase() !== wanted.toLowerCase()),
  };
  await db.update(characters).set({ profile: next, updatedAt: new Date() }).where(eq(characters.id, row.id));
  return toSummary({ slug, profile: next });
}

export async function relatedCharacters(franchise: string, excludeId: string) {
  const db = await getDb();
  const rows = await db
    .select({ slug: characters.slug, profile: characters.profile })
    .from(characters)
    .where(and(eq(characters.franchise, franchise), ne(characters.id, excludeId)))
    .limit(6);
  return rows.map(toSummary);
}
