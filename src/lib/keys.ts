// Pure helpers shared by the server code and the seed.

export function slugify(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function newId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export type Side = { id: string; version: string };

// The same fight booked in either order hits the same verdict.
export function canonicalOrder(x: Side, y: Side): [Side, Side] {
  const kx = `${x.id}:${x.version}`;
  const ky = `${y.id}:${y.version}`;
  return kx <= ky ? [x, y] : [y, x];
}

export function matchupKey(a: Side, b: Side, arena: string, mode: string, prep: string) {
  const [x, y] = canonicalOrder(a, b);
  return `${x.id}:${x.version}|${y.id}:${y.version}|${arena}|${mode}|${prep}`;
}

export function searchText(name: string, aliases: string[], franchise: string) {
  return [name, ...aliases, franchise].join(" | ").toLowerCase();
}
