import { NextRequest } from "next/server";
import { AiError, hasApiKey } from "@/lib/ai/client";
import { fail, readJson } from "@/lib/http";
import { getOrCreateMatchup, type MatchupRequest } from "@/lib/matchups";
import { allow, clientIp } from "@/lib/rate-limit";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await readJson<MatchupRequest>(req);
  if (!body.a?.slug || !body.b?.slug) return Response.json({ error: "Pick two characters first." }, { status: 400 });
  const ip = clientIp(req);
  try {
    const result = await getOrCreateMatchup(
      {
        a: { slug: String(body.a.slug), version: body.a.version ? String(body.a.version) : undefined },
        b: { slug: String(body.b.slug), version: body.b.version ? String(body.b.version) : undefined },
        arena: String(body.arena ?? "neutral"),
        mode: String(body.mode ?? "character"),
        prep: String(body.prep ?? "none"),
      },
      // Only charged when the fight has never been judged before.
      () => hasApiKey() && allow("judge", ip, 20, 60 * 60 * 1000),
    );
    return Response.json(result);
  } catch (err) {
    if (!hasApiKey() && err instanceof AiError && err.message === "rate limited") {
      return Response.json({ error: "This exact fight hasn't been judged yet, and the AI judge needs ANTHROPIC_API_KEY on the server." }, { status: 503 });
    }
    return fail(err);
  }
}
