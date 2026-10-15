import "server-only";
import { cookies } from "next/headers";
import { newId } from "@/lib/keys";

// Anonymous voter id kept in a cookie until accounts exist.
const COOKIE = "vid";

export async function readVoterId() {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

// Only call from Route Handlers or Server Functions (it may set a cookie).
export async function ensureVoterId() {
  const store = await cookies();
  const existing = store.get(COOKIE)?.value;
  if (existing) return existing;
  const id = newId();
  store.set(COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 * 2, secure: process.env.NODE_ENV === "production" });
  return id;
}
