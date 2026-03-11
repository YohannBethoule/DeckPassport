# MTG DeckPassport

DeckPassport is a tool for MTG Commander players to generate a sleek, shareable card that captures the identity of their deck — commander art, color identity, bracket, win conditions, and key cards, all in one image. No more walls of text to explain your deck. Just share the card.

## Hosting

- **App**: Hosted on [Vercel](https://vercel.com)
- **Database**: Hosted on [Neon](https://neon.tech) (PostgreSQL)

### Neon branches

| Branch | Purpose |
|--------|---------|
| `main` | Production database |
| `dev` | Local development & Vercel preview deployments |

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
