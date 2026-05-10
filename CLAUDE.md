# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server on http://localhost:3000
pnpm build            # Run migrations + seed + nuxt build
pnpm lint             # ESLint
pnpm typecheck        # Vue/TS type checking

pnpm db:generate      # Generate new Drizzle migration from schema changes
pnpm db:migrate       # Apply pending migrations
pnpm db:seed          # Seed brackets and archetypes (idempotent, uses onConflictDoNothing)
```

## Architecture

**Nuxt 4** full-stack app. Frontend in `app/`, server in `server/`, shared Zod schemas in `shared/`.

### Data flow

The central type is `InsertDeckWithCommander` (from `shared/schemas/deck.ts`). It is:
- **Input**: the form schema submitted from the frontend
- **Transformed by Zod** at the API boundary into `{ commander, partner, background, archetypes, deck, ...printUris }`
- **Reconstructed** from DB data by `toDeckView()` in `app/composables/useDeckView.ts` for display and editing

Commanders, partners, and backgrounds are deduplicated in the DB: `findOrCreateCommander` / `findOrCreateBackground` in `server/utils/deck.ts` upsert by name. The default image URL stored on the commander/background row is the canonical Scryfall art; alternative prints chosen by the user are stored separately in `decks_to_commander_prints` / `decks_to_background_prints` and only written when the print URI differs from the default.

### Database (Drizzle + Neon)

Schema files in `server/database/schema/`. `server/database/index.ts` exports the `db` instance using `drizzle-orm/neon-http`.

Neon has two branches:
- `main` → production
- `dev` → local dev and preview deployments

The app is hosted on a Hetzner VPS, deployments managed via Coolify.

Set `DATABASE_URL` in `.env` to the `dev` branch connection string for local work.

### Auth (better-auth)

Configured in `server/utils/auth.ts`. Supports Google OAuth and email/password. Session is fetched server-side via `auth.api.getSession({ headers: event.headers })`. Deck creation and edit/delete are allowed without auth (userId is nullable); ownership checks are in `server/utils/deck.ts:checkDeckOwnership`.

### Scryfall integration

All card search and image fetching happens client-side via `app/composables/useScryfall.ts`, which hits the Scryfall public API directly. Images served to the `DeckView` card are proxied through `/api/image-proxy` to allow `modern-screenshot` to capture cross-origin images as PNG.

### Card export

`DeckViewExport` wraps `DeckView` in an element ref. `useDownloadCard` uses `modern-screenshot`'s `domToPng` at 3× scale to render it as a PNG download. Elements with class `no-export` are excluded.

### Shared schemas

`shared/schemas/` contains Zod schemas used on both client and server. Nuxt aliases `#shared/schemas/*` for imports. The `insertDeckWithCommanderSchema` includes a `.transform()` that reshapes the flat form payload into the structured server-side shape.
