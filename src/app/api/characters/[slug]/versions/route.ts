import { NextRequest } from "next/server";
import { hasApiKey } from "@/lib/ai/client";
import { addVersion } from "@/lib/characters";
import { fail, readJson } from "@/lib/http";
import { allow, clientIp } from "@/lib/rate-limit";

export const maxDuration = 300;

export async function POST(req: NextRequest, ctx: RouteContext<"/api/characters/[slug]/versions">) {
  const { slug } = await ctx.params;
  const body = await readJson<{ label: string }>(req);
  if (!body.label || typeof body.label !== "string" || body.label.trim().length < 2) {
    return Response.json({ error: "Name the version you want, e.g. 'Ultra Instinct'." }, { status: 400 });
  }
  if (!hasApiKey()) return Response.json({ error: "New versions need the AI, and ANTHROPIC_API_KEY isn't set on the server yet." }, { status: 503 });
  if (!allow("version", clientIp(req), 6, 60 * 60 * 1000)) {
    return Response.json({ error: "You've requested a lot of versions this hour. Try again later." }, { status: 429 });
  }
  try {
    return Response.json({ character: await addVersion(slug, body.label) });
  } catch (err) {
    return fail(err);
  }
}
