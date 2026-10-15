import "server-only";
import { explainAiError } from "@/lib/ai/client";

export function fail(err: unknown, status = 400) {
  const e = explainAiError(err);
  if (status >= 500 || !(e.userMessage)) console.error(e.message);
  else console.warn(e.message);
  return Response.json({ error: e.userMessage }, { status });
}

export async function readJson<T>(req: Request): Promise<Partial<T>> {
  try {
    return (await req.json()) as Partial<T>;
  } catch {
    return {};
  }
}
