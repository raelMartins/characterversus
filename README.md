# Who Wins?! (working title)

Pick any two characters, fictional or famous, choose where and how they fight, and get a verdict with the fight told blow by blow. Fans can agree, disagree and argue; strong arguments trigger an AI re-review that either defends or changes the verdict.

## How it works

1. **Character profiles.** When someone searches for a character we don't have, Claude researches them on the web (franchise wikis, the VS Battles Wiki), then turns the notes into a structured profile: versions (e.g. Percy with the Curse of Achilles vs after Tartarus), a power tier from 1 (critter) to 15 (beyond), seven stats, abilities, feats, weaknesses, and the colors and props used to draw their faceless figure. Saved once, reused forever. Fans can request extra versions from a character's page.
2. **Verdicts.** A fight is two fighters (with versions) plus an arena, a mindset (in character or bloodlusted) and prep time. Each exact setup is judged once and cached, so everyone sees the same answer. Closer fights get more beats.
3. **Disputes.** Votes and arguments are tied to the verdict version. When an argument passes `REVIEW_MIN_DISPUTE_VOTES`, or disagreement passes `REVIEW_MIN_DISAGREE_VOTES` and 40%, Claude re-judges with the top arguments, replies to each one, and publishes a new verdict version with a public history note. Votes trigger a review; they don't decide it.
4. **Skins.** Comic book (default), Arcade and Fight night. Each has light and dark modes. Preferences are stored in cookies so the server renders the right one.

## Run locally

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev
```

With no `DATABASE_URL`, the app runs an embedded Postgres (PGlite) in `./.data` and seeds a Percy Jackson vs Aelin Galathynius fight, so the site works before you add an API key. Delete `.data` to start fresh.

## Deploy to Railway

1. Push this repo to GitHub and create a Railway project from it.
2. Add a **Postgres** service to the project.
3. On the web service, set variables:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `ANTHROPIC_API_KEY` = your key
4. Railway detects Next.js and runs `npm run build` then `npm start`. Migrations run automatically on first request.

Don't run production without `DATABASE_URL`: the embedded database lives on Railway's ephemeral disk and is wiped on every deploy.

## Code map

- `src/lib/ai/` — Claude calls: `profile.ts` (research + structuring), `judge.ts` (verdicts and reviews). Uses `claude-opus-5-5` with server-side refusal fallback.
- `src/lib/characters.ts`, `src/lib/matchups.ts` — data access and the review logic.
- `src/lib/db/` — Drizzle schema, connection (Postgres or PGlite) and seed. Change the schema, then `npm run db:generate`.
- `src/components/Figure.tsx` — the faceless fighter renderer.
- `src/components/matchup/` — the three matchup layouts plus shared community and rematch panels.
- `src/app/skins/` — per-skin tokens and styles; `src/app/globals.css` is the shared structure.
- `design-mockups/` — the original static design explorations.

## Not built yet

- Accounts (votes use an anonymous cookie for now).
- Coins and the animated video replay.
- Team fights (2v2, 2v3).
- Real people are allowed in text with comedy-only, non-violent rules in the judge prompt.
