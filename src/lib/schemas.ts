import { z } from "zod";

// ---------- Character profiles ----------

export const STAT_KEYS = ["power", "durability", "speed", "skill", "abilities", "intelligence", "stamina"] as const;
export type StatKey = (typeof STAT_KEYS)[number];

export const STAT_LABELS: Record<StatKey, string> = {
  power: "Power",
  durability: "Durability",
  speed: "Speed",
  skill: "Skill",
  abilities: "Abilities",
  intelligence: "Smarts",
  stamina: "Stamina",
};

const Stats = z.object({
  power: z.number().describe("Raw destructive output, 0-10"),
  durability: z.number().describe("How much punishment they can take, including regeneration, 0-10"),
  speed: z.number().describe("Combat and reaction speed, 0-10"),
  skill: z.number().describe("Fighting technique and experience, 0-10"),
  abilities: z.number().describe("Hax: reality warping, mind control, sealing, immortality and other rule-breaking powers, 0-10"),
  intelligence: z.number().describe("Battle IQ and tactics, 0-10"),
  stamina: z.number().describe("How long they can keep fighting, 0-10"),
});

export const VersionSchema = z.object({
  key: z.string().describe("kebab-case id, e.g. 'house-of-hades'"),
  label: z.string().describe("Short name users will recognise, e.g. 'After Tartarus'"),
  era: z.string().describe("Where in canon this version sits, e.g. 'The House of Hades'"),
  description: z.string().describe("One or two sentences on what defines this version"),
  tier: z.number().int().describe("Power tier from 1 to 15 using the scale in the instructions"),
  tierNote: z.string().describe("One sentence justifying the tier with a specific feat"),
  stats: Stats,
  abilities: z.array(z.string()).describe("Powers and techniques, most important first"),
  feats: z.array(z.string()).describe("Concrete canon feats, each one sentence, strongest first"),
  weaknesses: z.array(z.string()).describe("Real weaknesses and exploitable limits"),
  equipment: z.array(z.string()),
});
export type CharacterVersion = z.infer<typeof VersionSchema>;

export const PROPS = ["none", "sword", "dagger", "spear", "trident", "hammer", "axe", "staff", "wand", "bow", "gun", "shield", "claws", "whip", "book", "microphone"] as const;
export const AURAS = ["none", "water", "fire", "lightning", "energy", "shadow", "ice", "wind", "earth", "magic", "light"] as const;
export const HAIR = ["none", "short", "spiky", "long", "ponytail", "mane"] as const;
export const BUILDS = ["slim", "average", "muscular", "huge", "small"] as const;

export const LookSchema = z.object({
  skin: z.string().describe("Hex color of the faceless mannequin body, e.g. #c7b195. Use green for Hulk-like characters, yellow for SpongeBob-like, etc."),
  top: z.string().describe("Hex color of the torso clothing or body"),
  bottom: z.string().describe("Hex color of legs or trousers"),
  hair: z.string().describe("Hex color of hair or headwear"),
  accent: z.string().describe("Hex color of the signature accent (cape, glow, weapon trim)"),
  hairStyle: z.enum(HAIR),
  build: z.enum(BUILDS),
  prop: z.enum(PROPS).describe("Generic held item that hints at the character. Never a logo."),
  aura: z.enum(AURAS).describe("Signature element or energy around them"),
  cape: z.boolean(),
});
export type Look = z.infer<typeof LookSchema>;

export const ProfileSchema = z.object({
  name: z.string().describe("Canonical full name"),
  aliases: z.array(z.string()),
  franchise: z.string().describe("Series or franchise, e.g. 'Percy Jackson & the Olympians'. For real people, their field, e.g. 'Martial arts films'"),
  medium: z.enum(["book", "comic", "anime", "manga", "film", "tv", "game", "myth", "cartoon", "real", "other"]),
  isRealPerson: z.boolean(),
  summary: z.string().describe("Two sentences: who they are and how they fight"),
  defaultVersionKey: z.string().describe("Key of the version most fans would assume: usually their peak"),
  versions: z.array(VersionSchema).describe("1 to 4 versions; only versions whose power level genuinely differs"),
  suggestedVersions: z.array(z.string()).describe("Other notable versions not built yet, as short labels. Empty if none"),
  look: LookSchema,
  sources: z.array(z.object({ title: z.string(), url: z.string() })),
});
export type Profile = z.infer<typeof ProfileSchema>;

// ---------- Verdicts ----------

export const BeatSchema = z.object({
  who: z.enum(["a", "b", "both"]).describe("Who drives this moment"),
  title: z.string().describe("3-5 word beat title"),
  text: z.string().describe("1-3 vivid sentences, present tense, no gore"),
  sfx: z.string().describe("A short comic sound effect like FWOOM! or CLANG!"),
});
export type Beat = z.infer<typeof BeatSchema>;

export const VerdictSchema = z.object({
  winner: z.enum(["a", "b", "draw"]),
  confidence: z.number().int().describe("50-99. How sure the verdict is. Draws use 50-70"),
  method: z.string().describe("How it ends, 2-5 words, e.g. 'Knockout, underwater'"),
  summary: z.string().describe("2-3 sentences explaining why"),
  keyFactors: z.array(z.object({ side: z.enum(["a", "b", "neutral"]), text: z.string() })).describe("3-5 deciding factors"),
  beats: z.array(BeatSchema).describe("The fight in order. Count depends on closeness, see instructions"),
  finish: z.string().describe("1-2 sentences: the final moment"),
  flip: z.string().describe("One sentence: what would most likely flip this result"),
});
export type Verdict = z.infer<typeof VerdictSchema>;

export const ReviewSchema = z.object({
  rulings: z.array(
    z.object({
      disputeId: z.string(),
      decision: z.enum(["changed", "held", "accepted"]).describe("changed: this argument changed the result. held: considered but the verdict stands. accepted: correct point that is now reflected, without changing the winner"),
      reply: z.string().describe("2-3 sentences addressed to the fans, citing specifics"),
    }),
  ),
  changeNote: z.string().describe("One sentence for the public verdict history"),
  verdict: VerdictSchema,
});
export type Review = z.infer<typeof ReviewSchema>;
