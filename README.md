# MTG DeckPassport

DeckPassport is a tool for MTG Commander players to generate a sleek, shareable card that captures the identity of their deck — commander art, color identity, bracket, win conditions, and key cards, all in one image. No more walls of text to explain your deck. Just share the card.

## Hosting

- **App**: Hosted on [Hetzner](https://www.hetzner.com) VPS, managed via [Coolify](https://coolify.io)
- **Database**: Hosted on [Neon](https://neon.tech) (PostgreSQL)
- **File storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (playgroup images)

### Neon branches

| Branch | Purpose |
|--------|---------|
| `main` | Production database |
| `dev` | Local development & preview deployments |

### Cloudflare R2

Playgroup cover images are stored in a Cloudflare R2 bucket. Set the following env vars to enable uploads:

| Variable | Description |
|----------|-------------|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret key |
| `R2_BUCKET_NAME` | Name of the R2 bucket |
| `R2_PUBLIC_URL` | Public base URL of the bucket (e.g. `https://cdn.deckpassport.com`) — no trailing slash |

> The public URL must have no path prefix, as the key is appended directly after a `/`.

## Setup

1. Copy the example env file and fill in your Neon connection string:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```
