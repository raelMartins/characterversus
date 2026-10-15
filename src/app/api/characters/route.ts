import { NextRequest } from "next/server";
import { hasApiKey } from "@/lib/ai/client";
import { createCharacter, searchCharacters } from "@/lib/characters";
import { fail, readJson } from "@/lib/http";
import { allow, clientIp } from "@/lib/rate-limit";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    return Response.json({ results: await searchCharacters(q.slice(0, 80)) });
  } catch (err) {
    return fail(err, 500);
  }
}

// Build a brand-new profile with the AI (web research + structuring). Takes 30-90 seconds.
export async function POST(req: NextRequest) {
  const body = await readJson<{ name: string; hint: string }>(req);
  if (!body.name || typeof body.name !== "string") return Response.json({ error: "Type a character's name first." }, { status: 400 });
  if (!hasApiKey()) return Response.json({ error: "New profiles need the AI, and ANTHROPIC_API_KEY isn't set on the server yet." }, { status: 503 });
  if (!allow("profile", clientIp(req), 6, 60 * 60 * 1000)) {
    return Response.json({ error: "You've added a lot of new characters this hour. Try again later." }, { status: 429 });
  }
  try {
    const character = await createCharacter(body.name, typeof body.hint === "string" ? body.hint : undefined);
    return Response.json({ character });
  } catch (err) {
    return fail(err);
  }
}
