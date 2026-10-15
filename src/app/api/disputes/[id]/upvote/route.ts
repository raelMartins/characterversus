import { after, NextRequest } from "next/server";
import { fail } from "@/lib/http";
import { runReview, shouldReview, toggleDisputeVote } from "@/lib/matchups";
import { ensureVoterId } from "@/lib/voter";

export const maxDuration = 300;

export async function POST(_req: NextRequest, ctx: RouteContext<"/api/disputes/[id]/upvote">) {
  const { id } = await ctx.params;
  try {
    const voter = await ensureVoterId();
    const matchupId = await toggleDisputeVote(id, voter);
    if (await shouldReview(matchupId)) after(() => runReview(matchupId).catch((e) => console.error("review failed", e)));
    return Response.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
