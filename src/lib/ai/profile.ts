import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { TIERS } from "@/lib/options";
import { ProfileSchema, VersionSchema, type CharacterVersion, type Profile } from "@/lib/schemas";
import { AiError, FALLBACK, MODEL, ai } from "./client";

const TIER_SCALE = TIERS.map((t) => `${t.tier}. ${t.name}: ${t.hint}`).join("\n");

const RESEARCH_SYSTEM = `You research characters for a "who would win" site. Fans will argue with every detail, so accuracy matters more than hype.

Use web search and web fetch. Prefer the character's page on their franchise wiki (usually Fandom), and the VS Battles Wiki page if one exists. Read the pages rather than relying on search snippets.

Write research notes covering:
- Identity: canonical name, aliases, franchise, medium, and whether this is a real person.
- Versions: the 1-4 versions whose power level genuinely differs (e.g. before/after a major power-up). Ignore versions that are just older or younger without a real change in power. Mark the one most fans would assume (usually their peak).
- For each version: powers, specific canon feats (with the book/episode/issue where possible), durability and speed evidence, skills, equipment, weaknesses and anything that hard-counters them.
- Other notable versions you did not cover, as short labels.
- How they look: colors of their outfit, skin or body, hair, any signature item or element. This is used to draw a faceless mannequin figure.
- Source URLs you actually read.

Real people: only well-known public figures (celebrities, athletes, historical figures). Describe them from their public record, fairly and without mockery. If the name refers to a private individual, or you cannot identify a character at all, reply with exactly NOT_FOUND and a one-line reason.

If the name is ambiguous, pick the most famous character with that name and say so in the notes.`;

const STRUCTURE_SYSTEM = `You turn research notes into a structured character profile for a "who would win" site.

Power tiers (use the whole scale honestly; most humans sit at 2-4):
${TIER_SCALE}

Stats run from 0 to 10 relative to the whole multiverse of fiction, not just the character's own series: 10 is reserved for the very top of fiction. A peak human martial artist might have skill 8 but power 2.

Rules:
- Use only what the notes support. Do not invent feats.
- Versions: 1 to 4. Keys are kebab-case. defaultVersionKey must match one version key.
- Look: pick hex colors and generic props that let fans recognise the character on a faceless figure. Never use logos or symbols.
- Real people: isRealPerson true, medium "real". Keep stats grounded in reality.
- Sources: only URLs present in the notes.`;

// Run a server-tool turn to completion, resuming if the API pauses a long search loop.
async function runResearch(messages: Anthropic.Beta.BetaMessageParam[]) {
  const client = ai();
  for (let i = 0; i < 5; i++) {
    const res = await client.beta.messages.create({
      ...FALLBACK,
      model: MODEL,
      max_tokens: 16000,
      system: RESEARCH_SYSTEM,
      output_config: { effort: "medium" },
      tools: [
        { type: "web_search_20260209", name: "web_search", max_uses: 6 },
        { type: "web_fetch_20260209", name: "web_fetch", max_uses: 6 },
      ],
      messages,
    });
    if (res.stop_reason === "refusal") {
      throw new AiError("research refused", "We can't build a profile for that one.");
    }
    if (res.stop_reason === "pause_turn") {
      messages = [...messages, { role: "assistant", content: res.content }];
      continue;
    }
    return res.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
  }
  throw new AiError("research did not finish", "Research took too long. Try again.");
}

export async function researchCharacter(name: string, hint?: string): Promise<string> {
  const ask = hint ? `Character: ${name}\nContext from the user: ${hint}` : `Character: ${name}`;
  const notes = await runResearch([{ role: "user", content: ask }]);
  if (!notes || notes.startsWith("NOT_FOUND")) {
    throw new AiError(`not found: ${notes}`, `We couldn't find a character called "${name}". Try adding the series name.`);
  }
  return notes;
}

export async function structureProfile(notes: string): Promise<Profile> {
  const res = await ai().beta.messages.parse({
    ...FALLBACK,
    model: MODEL,
    max_tokens: 16000,
    system: STRUCTURE_SYSTEM,
    output_config: { effort: "medium", format: betaZodOutputFormat(ProfileSchema) },
    messages: [{ role: "user", content: `Research notes:\n\n${notes}` }],
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) {
    throw new AiError(`structure failed: ${res.stop_reason}`, "We couldn't build that profile. Try again.");
  }
  return normalizeProfile(res.parsed_output);
}

export async function buildProfile(name: string, hint?: string) {
  const notes = await researchCharacter(name, hint);
  return structureProfile(notes);
}

// Build one extra version for an existing character, e.g. a fan-requested form.
export async function buildVersion(profile: Profile, label: string): Promise<CharacterVersion> {
  const notes = await runResearch([
    {
      role: "user",
      content: `Character: ${profile.name} (${profile.franchise})\nResearch only this version: "${label}". Existing versions for reference: ${profile.versions.map((v) => v.label).join(", ")}. If this version does not exist in canon, reply NOT_FOUND.`,
    },
  ]);
  if (notes.startsWith("NOT_FOUND")) {
    throw new AiError("version not found", `We couldn't find a "${label}" version of ${profile.name}.`);
  }
  const res = await ai().beta.messages.parse({
    ...FALLBACK,
    model: MODEL,
    max_tokens: 8000,
    system: STRUCTURE_SYSTEM,
    output_config: { effort: "medium", format: betaZodOutputFormat(VersionSchema) },
    messages: [
      {
        role: "user",
        content: `Existing profile for calibration (keep stats consistent with it):\n${JSON.stringify(profile.versions)}\n\nResearch notes for the new version "${label}":\n\n${notes}`,
      },
    ],
  });
  if (!res.parsed_output) throw new AiError("version parse failed", "We couldn't build that version. Try again.");
  return normalizeVersion(res.parsed_output);
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));
const HEX = /^#[0-9a-f]{6}$/i;

function normalizeVersion(v: CharacterVersion): CharacterVersion {
  const stats = { ...v.stats };
  for (const k of Object.keys(stats) as (keyof typeof stats)[]) stats[k] = Math.round(clamp(stats[k], 0, 10) * 2) / 2;
  return {
    ...v,
    key: v.key.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || "base",
    tier: Math.round(clamp(v.tier, 1, 15)),
    stats,
  };
}

function normalizeProfile(p: Profile): Profile {
  const versions = p.versions.slice(0, 4).map(normalizeVersion);
  if (!versions.length) throw new AiError("no versions", "We couldn't build that profile. Try again.");
  const look = { ...p.look };
  for (const k of ["skin", "top", "bottom", "hair", "accent"] as const) if (!HEX.test(look[k])) look[k] = "#8a8a8a";
  return {
    ...p,
    versions,
    defaultVersionKey: versions.some((v) => v.key === p.defaultVersionKey) ? p.defaultVersionKey : versions[0].key,
    suggestedVersions: p.suggestedVersions.slice(0, 6),
    look,
    sources: p.sources.filter((s) => /^https?:\/\//.test(s.url)).slice(0, 8),
  };
}
