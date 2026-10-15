import "server-only";
import { and, desc, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";
import { AiError } from "@/lib/ai/client";
import { judge, review, type FightSetup } from "@/lib/ai/judge";
import { findVersion, getCharacterById, getCharacterBySlug, toSummary } from "@/lib/characters";
import { getDb, schema } from "@/lib/db";
import { canonicalOrder, matchupKey, newId } from "@/lib/keys";
import { ARENAS, MODES, PREPS } from "@/lib/options";
import type { Verdict } from "@/lib/schemas";

const { matchups, verdicts, matchupVotes, disputes, disputeVotes, characters } = schema;

export type MatchupRequest = {
  a: { slug: string; version?: string };
  b: { slug: string; version?: string };
  arena: string;
  mode: string;
  prep: string;
};

const inflight = new Map<string, Promise<string>>();

// Returns the matchup id, judging the fight only if nobody has asked for this exact setup before.
export async function getOrCreateMatchup(req: MatchupRequest, canJudge: () => boolean): Promise<{ id: string; created: boolean }> {
  if (!ARENAS.some((a) => a.key === req.arena)) throw new AiError("bad arena", "Pick an arena.");
  if (!MODES.some((m) => m.key === req.mode)) throw new AiError("bad mode", "Pick how they fight.");
  if (!PREPS.some((p) => p.key === req.prep)) throw new AiError("bad prep", "Pick a prep option.");

  const [ca, cb] = await Promise.all([getCharacterBySlug(req.a.slug), getCharacterBySlug(req.b.slug)]);
  if (!ca || !cb) throw new AiError("missing character", "Pick two characters from the search first.");
  const va = findVersion(ca.profile, req.a.version);
  const vb = findVersion(cb.profile, req.b.version);
  if (ca.id === cb.id && va.key === vb.key) throw new AiError("mirror", "Pick two different fighters, or two versions of the same one.");

  const sa = { id: ca.id, version: va.key };
  const sb = { id: cb.id, version: vb.key };
  const key = matchupKey(sa, sb, req.arena, req.mode, req.prep);

  const db = await getDb();
  const [found] = await db.select({ id: matchups.id }).from(matchups).where(eq(matchups.key, key)).limit(1);
  if (found) return { id: found.id, created: false };

  const pending = inflight.get(key);
  if (pending) return { id: await pending, created: false };
  if (!canJudge()) throw new AiError("rate limited", "You've booked a lot of new fights. Try again in a few minutes, or open one that already exists.");

  const job = (async () => {
    const [x, y] = canonicalOrder(sa, sb);
    const pick = (s: typeof sa) => (s.id === ca.id && s.version === va.key ? { row: ca, v: va } : { row: cb, v: vb });
    const fx = pick(x);
    const fy = pick(y);
    const verdict = await judge({
      a: { profile: fx.row.profile, version: fx.v },
      b: { profile: fy.row.profile, version: fy.v },
      arena: req.arena,
      mode: req.mode,
      prep: req.prep,
    });
    const id = newId();
    await db.insert(matchups).values({ id, key, aId: x.id, aVersion: x.version, bId: y.id, bVersion: y.version, arena: req.arena, mode: req.mode, prep: req.prep });
    await db.insert(verdicts).values({ id: newId(), matchupId: id, version: 1, data: verdict, changeNote: "First verdict." });
    return id;
  })().finally(() => inflight.delete(key));
  inflight.set(key, job);
  return { id: await job, created: true };
}

export async function getMatchupView(id: string, voterId: string | null) {
  const db = await getDb();
  const [m] = await db.select().from(matchups).where(eq(matchups.id, id)).limit(1);
  if (!m) return null;
  const [ca, cb, history] = await Promise.all([
    getCharacterById(m.aId),
    getCharacterById(m.bId),
    db.select().from(verdicts).where(eq(verdicts.matchupId, id)).orderBy(desc(verdicts.version)),
  ]);
  if (!ca || !cb || !history.length) return null;
  const current = history.find((v) => v.version === m.currentVersion) ?? history[0];

  const [counts, disputeRows, myVoteRows] = await Promise.all([
    db
      .select({ agree: matchupVotes.agree, n: sql<number>`count(*)::int` })
      .from(matchupVotes)
      .where(and(eq(matchupVotes.matchupId, id), eq(matchupVotes.verdictVersion, current.version)))
      .groupBy(matchupVotes.agree),
    db.select().from(disputes).where(eq(disputes.matchupId, id)).orderBy(desc(disputes.votes), desc(disputes.createdAt)).limit(30),
    voterId
      ? db.select({ agree: matchupVotes.agree }).from(matchupVotes).where(and(eq(matchupVotes.matchupId, id), eq(matchupVotes.verdictVersion, current.version), eq(matchupVotes.voterId, voterId))).limit(1)
      : Promise.resolve([] as { agree: boolean }[]),
  ]);
  let myDisputeVotes: string[] = [];
  if (voterId && disputeRows.length) {
    const rows = await db
      .select({ id: disputeVotes.disputeId })
      .from(disputeVotes)
      .where(and(eq(disputeVotes.voterId, voterId), inArray(disputeVotes.disputeId, disputeRows.map((d) => d.id))));
    myDisputeVotes = rows.map((r) => r.id);
  }

  const va = findVersion(ca.profile, m.aVersion);
  const vb = findVersion(cb.profile, m.bVersion);
  return {
    id: m.id,
    arena: m.arena,
    mode: m.mode,
    prep: m.prep,
    reviewing: Boolean(m.reviewStartedAt),
    a: { character: toSummary(ca), profile: ca.profile, version: va },
    b: { character: toSummary(cb), profile: cb.profile, version: vb },
    verdict: current.data,
    verdictVersion: current.version,
    // Formatted here so server and browser render the same text.
    history: history.map((h) => ({
      version: h.version,
      note: h.changeNote,
      winnerChanged: h.winnerChanged,
      date: h.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
      winner: h.data.winner,
    })),
    votes: {
      agree: counts.find((c) => c.agree)?.n ?? 0,
      disagree: counts.find((c) => !c.agree)?.n ?? 0,
      mine: myVoteRows[0] ? (myVoteRows[0].agree ? "agree" : "disagree") : null,
    } as { agree: number; disagree: number; mine: "agree" | "disagree" | null },
    disputes: disputeRows.map((d) => ({
      id: d.id,
      text: d.text,
      votes: d.votes,
      status: d.status,
      reply: d.reply,
      mine: myDisputeVotes.includes(d.id),
      own: voterId === d.authorId,
    })),
    reviewThreshold: thresholds().disputeVotes,
  };
}
export type MatchupView = NonNullable<Awaited<ReturnType<typeof getMatchupView>>>;

export async function bumpViews(id: string) {
  const db = await getDb();
  await db.update(matchups).set({ views: sql`${matchups.views} + 1` }).where(eq(matchups.id, id));
}

export async function listMatchups(order: "recent" | "hot", limit = 12) {
  const db = await getDb();
  const rows = await db
    .select({ m: matchups, v: verdicts })
    .from(matchups)
    .innerJoin(verdicts, and(eq(verdicts.matchupId, matchups.id), eq(verdicts.version, matchups.currentVersion)))
    .orderBy(order === "hot" ? desc(matchups.views) : desc(matchups.createdAt))
    .limit(limit);
  if (!rows.length) return [];
  const ids = [...new Set(rows.flatMap((r) => [r.m.aId, r.m.bId]))];
  const chars = await db.select({ id: characters.id, slug: characters.slug, profile: characters.profile }).from(characters).where(inArray(characters.id, ids));
  const byId = new Map(chars.map((c) => [c.id, c]));
  return rows.flatMap(({ m, v }) => {
    const a = byId.get(m.aId);
    const b = byId.get(m.bId);
    if (!a || !b) return [];
    return [{
      id: m.id,
      arena: m.arena,
      mode: m.mode,
      a: { name: a.profile.name, look: a.profile.look, version: findVersion(a.profile, m.aVersion).label },
      b: { name: b.profile.name, look: b.profile.look, version: findVersion(b.profile, m.bVersion).label },
      winner: v.data.winner,
      confidence: v.data.confidence,
      method: v.data.method,
    }];
  });
}
export type MatchupCard = Awaited<ReturnType<typeof listMatchups>>[number];

// ---------- community ----------

function thresholds() {
  return {
    disputeVotes: Number(process.env.REVIEW_MIN_DISPUTE_VOTES ?? 25),
    disagreeVotes: Number(process.env.REVIEW_MIN_DISAGREE_VOTES ?? 30),
    disagreeShare: 0.4,
  };
}

export async function castVote(matchupId: string, voterId: string, vote: "agree" | "disagree" | null) {
  const db = await getDb();
  const [m] = await db.select({ v: matchups.currentVersion }).from(matchups).where(eq(matchups.id, matchupId)).limit(1);
  if (!m) throw new AiError("no matchup", "That fight doesn't exist.");
  await db.delete(matchupVotes).where(and(eq(matchupVotes.matchupId, matchupId), eq(matchupVotes.verdictVersion, m.v), eq(matchupVotes.voterId, voterId)));
  if (vote) await db.insert(matchupVotes).values({ matchupId, verdictVersion: m.v, voterId, agree: vote === "agree" });
}

export async function addDispute(matchupId: string, voterId: string, text: string) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length < 15) throw new AiError("short", "Say a bit more. Name the feat or ability the verdict missed.");
  if (clean.length > 600) throw new AiError("long", "Keep it under 600 characters.");
  const db = await getDb();
  const [m] = await db.select({ id: matchups.id }).from(matchups).where(eq(matchups.id, matchupId)).limit(1);
  if (!m) throw new AiError("no matchup", "That fight doesn't exist.");
  const [mine] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(disputes)
    .where(and(eq(disputes.matchupId, matchupId), eq(disputes.authorId, voterId), eq(disputes.status, "open")));
  if ((mine?.n ?? 0) >= 3) throw new AiError("too many", "You already have 3 open arguments on this fight. Upvote others instead.");
  const id = newId();
  await db.insert(disputes).values({ id, matchupId, text: clean, authorId: voterId, votes: 1 });
  await db.insert(disputeVotes).values({ disputeId: id, voterId });
  return id;
}

export async function toggleDisputeVote(disputeId: string, voterId: string) {
  const db = await getDb();
  const [d] = await db.select({ id: disputes.id, matchupId: disputes.matchupId }).from(disputes).where(eq(disputes.id, disputeId)).limit(1);
  if (!d) throw new AiError("no dispute", "That argument no longer exists.");
  const removed = await db.delete(disputeVotes).where(and(eq(disputeVotes.disputeId, disputeId), eq(disputeVotes.voterId, voterId))).returning();
  if (removed.length) {
    await db.update(disputes).set({ votes: sql`greatest(${disputes.votes} - 1, 0)` }).where(eq(disputes.id, disputeId));
  } else {
    await db.insert(disputeVotes).values({ disputeId, voterId });
    await db.update(disputes).set({ votes: sql`${disputes.votes} + 1` }).where(eq(disputes.id, disputeId));
  }
  return d.matchupId;
}

// Decide whether the fans have pushed hard enough for the AI to look again.
export async function shouldReview(matchupId: string) {
  const t = thresholds();
  const db = await getDb();
  const [m] = await db.select().from(matchups).where(eq(matchups.id, matchupId)).limit(1);
  if (!m || m.reviewStartedAt) return false;
  const open = await db.select({ votes: disputes.votes }).from(disputes).where(and(eq(disputes.matchupId, matchupId), eq(disputes.status, "open")));
  if (!open.length) return false;
  if (open.some((d) => d.votes >= t.disputeVotes)) return true;
  const counts = await db
    .select({ agree: matchupVotes.agree, n: sql<number>`count(*)::int` })
    .from(matchupVotes)
    .where(and(eq(matchupVotes.matchupId, matchupId), eq(matchupVotes.verdictVersion, m.currentVersion)))
    .groupBy(matchupVotes.agree);
  const disagree = counts.find((c) => !c.agree)?.n ?? 0;
  const agree = counts.find((c) => c.agree)?.n ?? 0;
  return disagree >= t.disagreeVotes && disagree / Math.max(1, agree + disagree) >= t.disagreeShare;
}

export async function runReview(matchupId: string) {
  const db = await getDb();
  const staleLock = new Date(Date.now() - 10 * 60 * 1000);
  // Take the review lock; a stale lock (crashed review) can be retaken after 10 minutes.
  const locked = await db
    .update(matchups)
    .set({ reviewStartedAt: new Date() })
    .where(and(eq(matchups.id, matchupId), or(isNull(matchups.reviewStartedAt), lt(matchups.reviewStartedAt, staleLock))))
    .returning();
  const m = locked[0];
  if (!m) return;
  try {
    const [ca, cb, [cur]] = await Promise.all([
      getCharacterById(m.aId),
      getCharacterById(m.bId),
      db.select().from(verdicts).where(and(eq(verdicts.matchupId, matchupId), eq(verdicts.version, m.currentVersion))).limit(1),
    ]);
    if (!ca || !cb || !cur) return;
    const open = await db
      .select()
      .from(disputes)
      .where(and(eq(disputes.matchupId, matchupId), eq(disputes.status, "open")))
      .orderBy(desc(disputes.votes))
      .limit(10);
    if (!open.length) return;

    const setup: FightSetup = {
      a: { profile: ca.profile, version: findVersion(ca.profile, m.aVersion) },
      b: { profile: cb.profile, version: findVersion(cb.profile, m.bVersion) },
      arena: m.arena,
      mode: m.mode,
      prep: m.prep,
    };
    const result = await review(setup, cur.data as Verdict, open.map((d) => ({ id: d.id, text: d.text, votes: d.votes })));
    const nextVersion = m.currentVersion + 1;
    await db.insert(verdicts).values({
      id: newId(),
      matchupId,
      version: nextVersion,
      data: result.verdict,
      changeNote: result.changeNote,
      winnerChanged: result.verdict.winner !== cur.data.winner,
    });
    for (const d of open) {
      const ruling = result.rulings.find((r) => r.disputeId === d.id);
      await db
        .update(disputes)
        .set({ status: ruling?.decision ?? "held", reply: ruling?.reply ?? "Considered in the review. The verdict stands.", reviewedInVersion: nextVersion })
        .where(eq(disputes.id, d.id));
    }
    await db.update(matchups).set({ currentVersion: nextVersion }).where(eq(matchups.id, matchupId));
  } finally {
    await db.update(matchups).set({ reviewStartedAt: null }).where(eq(matchups.id, matchupId));
  }
}
