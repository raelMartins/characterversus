import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_SKIN, isSkin, type SkinKey } from "@/lib/options";

export type ThemePref = "light" | "dark" | null;

export async function readPrefs(): Promise<{ skin: SkinKey; theme: ThemePref }> {
  const store = await cookies();
  const skin = store.get("skin")?.value;
  const theme = store.get("theme")?.value;
  return {
    skin: isSkin(skin) ? skin : DEFAULT_SKIN,
    theme: theme === "light" || theme === "dark" ? theme : null,
  };
}
