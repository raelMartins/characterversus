import "server-only";

// Small in-memory limiter for the endpoints that spend AI credits.
// Good enough for a single Railway instance; move to Postgres or Redis when scaling out.

const hits = new Map<string, number[]>();

export function allow(bucket: string, who: string, max: number, windowMs: number) {
  const key = `${bucket}:${who}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}
