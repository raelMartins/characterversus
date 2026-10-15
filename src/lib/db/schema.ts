import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Profile, Verdict } from "@/lib/schemas";

export const characters = pgTable(
  "characters",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    franchise: text("franchise").notNull(),
    isRealPerson: boolean("is_real_person").notNull().default(false),
    // Lowercased name + aliases + franchise, for search.
    searchText: text("search_text").notNull(),
    profile: jsonb("profile").$type<Profile>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("characters_slug_idx").on(t.slug)],
);

export const matchups = pgTable(
  "matchups",
  {
    id: text("id").primaryKey(),
    // Canonical key: both fighters (sorted) + arena + mode + prep. One verdict per key.
    key: text("key").notNull(),
    aId: text("a_id").notNull().references(() => characters.id),
    aVersion: text("a_version").notNull(),
    bId: text("b_id").notNull().references(() => characters.id),
    bVersion: text("b_version").notNull(),
    arena: text("arena").notNull(),
    mode: text("mode").notNull(),
    prep: text("prep").notNull(),
    currentVersion: integer("current_version").notNull().default(1),
    // Set while a re-review is running so two reviews never overlap.
    reviewStartedAt: timestamp("review_started_at", { withTimezone: true }),
    views: integer("views").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("matchups_key_idx").on(t.key)],
);

export const verdicts = pgTable(
  "verdicts",
  {
    id: text("id").primaryKey(),
    matchupId: text("matchup_id").notNull().references(() => matchups.id),
    version: integer("version").notNull(),
    data: jsonb("data").$type<Verdict>().notNull(),
    changeNote: text("change_note").notNull(),
    winnerChanged: boolean("winner_changed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("verdicts_matchup_version_idx").on(t.matchupId, t.version)],
);

export const matchupVotes = pgTable(
  "matchup_votes",
  {
    matchupId: text("matchup_id").notNull().references(() => matchups.id),
    verdictVersion: integer("verdict_version").notNull(),
    voterId: text("voter_id").notNull(),
    agree: boolean("agree").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("matchup_votes_unique_idx").on(t.matchupId, t.verdictVersion, t.voterId)],
);

export type ArgumentStatus = "open" | "held" | "changed" | "accepted";

export const disputes = pgTable(
  "disputes",
  {
    id: text("id").primaryKey(),
    matchupId: text("matchup_id").notNull().references(() => matchups.id),
    text: text("text").notNull(),
    authorId: text("author_id").notNull(),
    votes: integer("votes").notNull().default(1),
    status: text("status").$type<ArgumentStatus>().notNull().default("open"),
    reply: text("reply"),
    reviewedInVersion: integer("reviewed_in_version"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("disputes_matchup_idx").on(t.matchupId)],
);

export const disputeVotes = pgTable(
  "dispute_votes",
  {
    disputeId: text("dispute_id").notNull().references(() => disputes.id),
    voterId: text("voter_id").notNull(),
  },
  (t) => [uniqueIndex("dispute_votes_unique_idx").on(t.disputeId, t.voterId)],
);

export type CharacterRow = typeof characters.$inferSelect;
export type MatchupRow = typeof matchups.$inferSelect;
export type VerdictRow = typeof verdicts.$inferSelect;
export type DisputeRow = typeof disputes.$inferSelect;
