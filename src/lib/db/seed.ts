import { sql } from "drizzle-orm";
import { canonicalOrder, matchupKey, searchText } from "@/lib/keys";
import type { Profile, Verdict } from "@/lib/schemas";
import { characters, matchups, verdicts } from "./schema";
import type { Db } from "./index";

// A starter matchup so the site has something to show before any AI calls are made.

const percy: Profile = {
  name: "Percy Jackson",
  aliases: ["Perseus Jackson", "Seaweed Brain"],
  franchise: "Percy Jackson & the Olympians",
  medium: "book",
  isRealPerson: false,
  summary: "Demigod son of Poseidon who commands water, storms and earthquakes. Fights with the celestial bronze sword Riptide and gets stronger the closer he is to water.",
  defaultVersionKey: "after-tartarus",
  versions: [
    {
      key: "after-tartarus",
      label: "After Tartarus",
      era: "The House of Hades / The Blood of Olympus",
      description: "Percy at his peak, after surviving Tartarus. Hydrokinesis at its most dangerous, without the Curse of Achilles.",
      tier: 9,
      tierNote: "Triggered the eruption of Mount St. Helens and later controlled a river of poison in Tartarus.",
      stats: { power: 7.5, durability: 7, speed: 6, skill: 7, abilities: 6.5, intelligence: 6, stamina: 8 },
      abilities: ["Hydrokinesis, including liquids like poison", "Storm and hurricane creation", "Earthquakes", "Heals and breathes in water", "Talks to horses and sea creatures"],
      feats: [
        "Drowned the goddess Akhlys in her own poison in Tartarus",
        "Set off the eruption of Mount St. Helens",
        "Created a hurricane-force storm at sea",
        "Beat Ares in a sword fight at age 12",
      ],
      weaknesses: ["Much weaker far from water", "Fatal flaw: personal loyalty", "Refuses to use the darkest version of his power"],
      equipment: ["Riptide (celestial bronze sword)", "Shield wristwatch"],
    },
    {
      key: "curse-of-achilles",
      label: "Curse of Achilles",
      era: "The Last Olympian",
      description: "Bathed in the River Styx: nearly invulnerable except for one small spot on his back.",
      tier: 9,
      tierNote: "Fought Kronos and an army of monsters while almost untouchable.",
      stats: { power: 7, durability: 9.5, speed: 6.5, skill: 7, abilities: 6, intelligence: 5.5, stamina: 8 },
      abilities: ["Near invulnerability", "Hydrokinesis", "Storm creation"],
      feats: ["Fought Kronos to a standstill", "Held the Williamsburg Bridge against an army"],
      weaknesses: ["One mortal spot on the small of his back", "Weaker away from water"],
      equipment: ["Riptide"],
    },
    {
      key: "lightning-thief",
      label: "Age 12",
      era: "The Lightning Thief",
      description: "A brand-new demigod still learning what he can do.",
      tier: 5,
      tierNote: "Beat a Minotaur and held off Ares with help from the sea.",
      stats: { power: 4, durability: 4, speed: 4.5, skill: 4, abilities: 3.5, intelligence: 4, stamina: 5 },
      abilities: ["Basic hydrokinesis", "Heals in water"],
      feats: ["Killed the Minotaur", "Wounded Ares on a beach"],
      weaknesses: ["Inexperienced", "Dyslexic and impulsive"],
      equipment: ["Riptide"],
    },
  ],
  suggestedVersions: ["Chalice of the Gods (age 17)"],
  look: { skin: "#c7b195", top: "#f08a24", bottom: "#355789", hair: "#2b2420", accent: "#d29a46", hairStyle: "spiky", build: "average", prop: "sword", aura: "water", cape: false },
  sources: [{ title: "Riordan Wiki: Percy Jackson", url: "https://riordan.fandom.com/wiki/Percy_Jackson" }],
};

const aelin: Profile = {
  name: "Aelin Galathynius",
  aliases: ["Celaena Sardothien", "Aelin Ashryver Galathynius", "Fireheart"],
  franchise: "Throne of Glass",
  medium: "book",
  isRealPerson: false,
  summary: "Half-Fae queen of Terrasen with the most powerful fire magic of her bloodline, and one of the deadliest assassins ever trained. Pairs raw flame with elite swordwork.",
  defaultVersionKey: "queen-of-flame",
  versions: [
    {
      key: "queen-of-flame",
      label: "Queen of Flame",
      era: "Empire of Storms",
      description: "Aelin with full control of her fire, Fae form and years of combat behind her.",
      tier: 9,
      tierNote: "Her wildfire can level a fleet and melt stone at full power.",
      stats: { power: 7.5, durability: 6.5, speed: 7, skill: 9, abilities: 5, intelligence: 8, stamina: 6 },
      abilities: ["Fire magic of Mala Fire-Bringer", "Fae shapeshifting", "Elite swordsmanship and assassin training"],
      feats: [
        "Destroyed the Rifthold clock tower with wildfire",
        "Kept her mind through months in an iron coffin",
        "Out-fought trained Fae warriors in close combat",
      ],
      weaknesses: ["Burnout if she draws on too much power", "Iron suppresses her magic"],
      equipment: ["Goldryn (sword)", "Daggers"],
    },
    {
      key: "heir-of-fire",
      label: "Training with Rowan",
      era: "Heir of Fire",
      description: "Learning to control her fire under Rowan Whitethorn.",
      tier: 7,
      tierNote: "Burned through a horde of skinwalkers once her power broke loose.",
      stats: { power: 6, durability: 6, speed: 6.5, skill: 8.5, abilities: 4, intelligence: 7.5, stamina: 5.5 },
      abilities: ["Fire magic, still unstable", "Fae shapeshifting"],
      feats: ["Killed a skinwalker and burned a battlefield of Valg-possessed soldiers"],
      weaknesses: ["Loses control under stress", "Burnout"],
      equipment: ["Daggers"],
    },
    {
      key: "celaena",
      label: "As Celaena",
      era: "Throne of Glass",
      description: "Adarlan's Assassin before her magic returns.",
      tier: 4,
      tierNote: "Peak-human assassin who won the king's competition.",
      stats: { power: 3, durability: 3.5, speed: 4.5, skill: 9, abilities: 1, intelligence: 7.5, stamina: 5 },
      abilities: ["Assassination", "Expert with nearly every weapon"],
      feats: ["Won the king's competition for Champion"],
      weaknesses: ["No magic", "Human durability"],
      equipment: ["Daggers", "Bow"],
    },
  ],
  suggestedVersions: ["After the Lock (Kingdom of Ash)"],
  look: { skin: "#d6bf9f", top: "#22343c", bottom: "#18242a", hair: "#e5b44c", accent: "#ff8a1e", hairStyle: "long", build: "slim", prop: "sword", aura: "fire", cape: false },
  sources: [{ title: "Throne of Glass Wiki: Aelin Galathynius", url: "https://throneofglass.fandom.com/wiki/Aelin_Galathynius" }],
};

// In canonical order the seed ids sort as aelin < percy, so side "a" is Aelin.
const oceanVerdict: Verdict = {
  winner: "b",
  confidence: 72,
  method: "Knockout, underwater",
  summary: "On the open ocean Percy has an endless supply of the one thing that cancels Aelin's fire. She is the better swordfighter and wins every exchange on the surface, but he can heal from any wound and end the fight by taking it under.",
  keyFactors: [
    { side: "b", text: "Unlimited water to attack, defend and heal with" },
    { side: "a", text: "Clearly better sword skill and combat experience" },
    { side: "a", text: "Can flash-boil water and turn steam into a weapon" },
    { side: "b", text: "Fire cannot burn two hundred feet underwater" },
  ],
  beats: [
    { who: "a", title: "Aelin strikes first", sfx: "FWOOM!", text: "Aelin does not wait for introductions. A wall of wildfire skims across the waves. Percy drops beneath the surface and the flames pass over empty water." },
    { who: "b", title: "The sea answers", sfx: "KRSSHH!", text: "Percy rises on a column of water and brings a thirty-foot wave down on her. Aelin shifts into her Fae form and flash-boils the crest into steam." },
    { who: "a", title: "Scalding fog", sfx: "HSSSS", text: "She turns the steam into a weapon and it blisters his arms. Percy sinks into the sea and comes back up healed." },
    { who: "both", title: "Blade on blade", sfx: "CLANG!", text: "Goldryn meets Riptide on a platform of churning water. Aelin is the better swordfighter and opens a cut along his ribs." },
    { who: "b", title: "Pulled under", sfx: "GLUB.", text: "So he stops trying. Percy collapses the platform and drags her down. Two hundred feet below, her fire gutters out against the pressure." },
  ],
  finish: "Percy hauls her back to the surface before it is too late. He wins, and she lives to be furious about it.",
  flip: "Move the fight to a desert and Aelin is the favourite.",
};

export async function seedIfEmpty(db: Db) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(characters);
  if (count > 0) return;

  const rows = [
    { id: "seed-percy", profile: percy },
    { id: "seed-aelin", profile: aelin },
  ];
  for (const { id, profile } of rows) {
    await db.insert(characters).values({
      id,
      slug: id.replace("seed-", "") === "percy" ? "percy-jackson" : "aelin-galathynius",
      name: profile.name,
      franchise: profile.franchise,
      isRealPerson: profile.isRealPerson,
      searchText: searchText(profile.name, profile.aliases, profile.franchise),
      profile,
    });
  }

  const p = { id: "seed-percy", version: "after-tartarus" };
  const a = { id: "seed-aelin", version: "queen-of-flame" };
  const [x, y] = canonicalOrder(p, a);
  await db.insert(matchups).values({
    id: "seed-ocean",
    key: matchupKey(p, a, "ocean", "character", "none"),
    aId: x.id,
    aVersion: x.version,
    bId: y.id,
    bVersion: y.version,
    arena: "ocean",
    mode: "character",
    prep: "none",
  });
  await db.insert(verdicts).values({
    id: "seed-ocean-v1",
    matchupId: "seed-ocean",
    version: 1,
    data: oceanVerdict,
    changeNote: "First verdict.",
  });
}
