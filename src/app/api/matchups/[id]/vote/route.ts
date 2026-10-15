import { after, NextRequest } from "next/server";
import { fail, readJson } from "@/lib/http";
import { castVote, runReview, shouldReview } from "@/lib/matchups";
import { ensureVoterId } from "@/lib/voter";

export const maxDuration = 300;

export async function POST(req: NextRequest, ctx: RouteContext<"/api/matchups/[id]/vote">) {
  const { id } = await ctx.params;
  const body = await readJson<{ vote: "agree" | "disagree" | null }>(req);
  const vote = body.vote === "agree" || body.vote === "disagree" ? body.vote : null;
  try {
    const voter = await ensureVoterId();
    await castVote(id, voter, vote);
    if (await shouldReview(id)) after(() => runReview(id).catch((e) => console.error("review failed", e)));
    return Response.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
