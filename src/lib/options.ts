// Shared option lists for the matchup picker, the AI prompts and validation.

export const TIERS = [
  { tier: 1, name: "Critter", hint: "Slugs, cats, small animals" },
  { tier: 2, name: "Everyday human", hint: "An untrained adult" },
  { tier: 3, name: "Trained fighter", hint: "Soldiers, athletes, brawlers" },
  { tier: 4, name: "Peak human", hint: "Batman, Jackie Chan in his prime, Olympic-level martial artists" },
  { tier: 5, name: "Wall level", hint: "Breaks walls and cars, low superhuman" },
  { tier: 6, name: "Building level", hint: "Levels buildings" },
  { tier: 7, name: "City block level", hint: "Destroys a neighbourhood" },
  { tier: 8, name: "City level", hint: "Wipes out a city" },
  { tier: 9, name: "Mountain level", hint: "Volcanic eruptions, mountain-busting" },
  { tier: 10, name: "Country level", hint: "Nations and continents" },
  { tier: 11, name: "Planet level", hint: "Destroys or reshapes a planet" },
  { tier: 12, name: "Star level", hint: "Stars and solar systems" },
  { tier: 13, name: "Galaxy level", hint: "Galaxies" },
  { tier: 14, name: "Universal", hint: "Whole universes, cosmic entities" },
  { tier: 15, name: "Beyond", hint: "Multiversal to omnipotent; God the Father sits alone at the top" },
] as const;

export function tierInfo(tier: number) {
  const t = Math.min(15, Math.max(1, Math.round(tier)));
  return TIERS[t - 1];
}

// A playful headline number: roughly 10^(tier-1), so the scale runs from 1 to 100 trillion.
export function powerLevel(tier: number, stats: { power: number }) {
  const t = Math.min(15, Math.max(1, tier));
  const base = Math.pow(10, t - 1);
  return Math.round(base * (0.5 + stats.power / 10));
}

export const ARENAS = [
  { key: "neutral", label: "Neutral ground", note: "An open field with nothing to exploit." },
  { key: "ocean", label: "Open ocean", note: "Endless water in every direction, a small rocky outcrop to stand on." },
  { key: "desert", label: "Desert", note: "Hot, dry dunes with no water for miles." },
  { key: "city", label: "City rooftops", note: "A dense city at night, water towers on the roofs, a river nearby." },
  { key: "forest", label: "Forest", note: "Thick old-growth forest, plenty of cover and things that burn." },
  { key: "volcano", label: "Volcano", note: "The rim of an active volcano, lava below." },
  { key: "arctic", label: "Arctic", note: "Frozen tundra, blizzard conditions." },
  { key: "space", label: "Outer space", note: "Vacuum near a space station. Fighters who can't survive space get a suit." },
] as const;
export type ArenaKey = (typeof ARENAS)[number]["key"];

export const MODES = [
  { key: "character", label: "In character", note: "They fight the way they normally would, with their usual morals and restraint." },
  { key: "bloodlust", label: "Bloodlusted", note: "No restraint. Both go all out to win, using lethal force." },
] as const;
export type ModeKey = (typeof MODES)[number]["key"];

export const PREPS = [
  { key: "none", label: "No prep", note: "They meet without warning and know nothing about each other." },
  { key: "full", label: "Full prep", note: "Each had a week to study the other and gear up." },
] as const;
export type PrepKey = (typeof PREPS)[number]["key"];

export function arenaLabel(key: string) {
  return ARENAS.find((a) => a.key === key)?.label ?? key;
}
export function arenaNote(key: string) {
  return ARENAS.find((a) => a.key === key)?.note ?? key;
}
export function modeLabel(key: string) {
  return MODES.find((m) => m.key === key)?.label ?? key;
}
export function prepLabel(key: string) {
  return PREPS.find((p) => p.key === key)?.label ?? key;
}

export const SKINS = [
  { key: "comic", label: "Comic book" },
  { key: "arcade", label: "Arcade" },
  { key: "broadcast", label: "Fight night" },
] as const;
export type SkinKey = (typeof SKINS)[number]["key"];
export const DEFAULT_SKIN: SkinKey = "comic";
export function isSkin(v: unknown): v is SkinKey {
  return SKINS.some((s) => s.key === v);
}
