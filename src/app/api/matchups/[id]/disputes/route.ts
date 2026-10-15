import { after, NextRequest } from "next/server";
import { fail, readJson } from "@/lib/http";
import { addDispute, runReview, shouldReview } from "@/lib/matchups";
import { allow, clientIp } from "@/lib/rate-limit";
import { ensureVoterId } from "@/lib/voter";

export const maxDuration = 300;

export async function POST(req: NextRequest, ctx: RouteContext<"/api/matchups/[id]/disputes">) {
  const { id } = await ctx.params;
  const body = await readJson<{ text: string }>(req);
  if (!allow("dispute", clientIp(req), 10, 60 * 60 * 1000)) {
    return Response.json({ error: "You've posted a lot of arguments this hour. Upvote others for now." }, { status: 429 });
  }
  try {
    const voter = await ensureVoterId();
    const disputeId = await addDispute(id, voter, String(body.text ?? ""));
    if (await shouldReview(id)) after(() => runReview(id).catch((e) => console.error("review failed", e)));
    return Response.json({ id: disputeId });
  } catch (err) {
    return fail(err);
  }
}
