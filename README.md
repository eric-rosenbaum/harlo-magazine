# Harlo Magazine

Image-forward culture / fashion / music magazine. Continuously-published articles
by category **plus** print-style issue PDFs rendered as an on-domain flipbook —
run end-to-end from an embedded Sanity Studio by a single non-technical editor.

Built to [`harlo-magazine-spec.md`](./harlo-magazine-spec.md). See that file for the
full product spec and the resolved v1 decisions.

## Stack

- **Next.js 16** (App Router, RSC, ISR + on-demand revalidation) · TypeScript (strict)
- **Sanity v5** embedded at `/studio` (content + image/PDF CDN, Presentation preview)
- **Tailwind v4** with brand tokens as CSS custom properties
- **react-pdf (PDF.js) + react-pageflip** for the flipbook, with a scroll-view fallback
- **Kit (ConvertKit)** newsletter proxy · **Plausible** analytics · **Vercel** hosting

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev                        # http://localhost:3000  ·  studio at /studio
```

Until a real Sanity project id is set, the app builds and runs against empty data
(showing branded empty states) so you can develop the front end immediately.

### Connect Sanity

1. Create a project at <https://sanity.io/manage>, add a `production` dataset.
2. Put the **Project ID** in `NEXT_PUBLIC_SANITY_PROJECT_ID`.
3. Create a **Viewer** token → `SANITY_API_READ_TOKEN` (used for drafts/preview).
4. Visit `/studio`, sign in, and add CORS origins for `http://localhost:3000`
   and your production domain in sanity.io/manage (allow credentials).
5. Seed: create 3 Categories (e.g. Music=blue, Fashion=orange, Culture=lime), an
   Author, a few Articles, and one Issue (cover + PDF). Fill **Site Settings**.

### Environment variables

See `.env.local.example`. Key ones:

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` / `_API_VERSION` | Sanity connection |
| `SANITY_API_READ_TOKEN` | Server reads + draft/preview |
| `SANITY_REVALIDATE_SECRET` | Auth for the `/api/revalidate` webhook |
| `SANITY_PREVIEW_SECRET` | (reserved) preview gating |
| `NEWSLETTER_PROVIDER_API_KEY` / `NEWSLETTER_FORM_ID` | Kit/ConvertKit |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, OG, sitemap, RSS |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Analytics (omit to disable) |
| `NEXT_PUBLIC_ADOBE_FONTS_KIT_ID` | Optional Minion Pro Adobe kit |

## On-demand revalidation (publish → live in seconds)

Create a Sanity **webhook** (sanity.io/manage → API → Webhooks):

- **URL:** `https://harlomagazine.com/api/revalidate`
- **Trigger:** create / update / delete
- **Filter:** `_type in ["article","issue","category","author","page","siteSettings"]`
- **Projection:** `{ _type }`
- **HTTP header:** `x-webhook-secret: <SANITY_REVALIDATE_SECRET>`

Pages are statically generated with a 60s ISR floor; the webhook purges the
relevant content tag (`revalidateTag`) immediately on publish.

## Preview / draft workflow

Sanity **Presentation** (in Studio) previews unpublished drafts in the live layout
via Next.js Draft Mode (`/api/draft-mode/enable` · `/api/draft-mode/disable`).

## The flipbook

`src/components/flipbook/` renders `issue.pdfFile` with PDF.js + react-pageflip:
two-page spread on desktop, single-page swipe on mobile, lazy per-page rendering,
keyboard ←/→, fullscreen, and an accessible **scroll view** (also the automatic
fallback for very large issues / reduced-motion). The PDF.js worker is self-hosted.

## Brand decisions baked in (all easily changed)

- **Fonts:** Display = Montserrat (stand-in for **Lemon Milk** — swap to
  `next/font/local` in `src/app/fonts.ts`); Body = Source Serif 4 (fallback for
  **Minion Pro** — set `NEXT_PUBLIC_ADOBE_FONTS_KIT_ID` to load the real kit).
- **Category accents:** set per category in Studio (`accentColor`). Pink is the
  global brand spine and never a category color.
- Tokens live in `src/app/globals.css` (`@theme`).

## Future upgrades (out of v1, documented)

- Pre-rasterize PDF pages to WebP at upload (webhook → serverless) for the
  flipbook — the first performance upgrade at scale.
- Dynamic OG image generation (Satori), Algolia search, automated trending.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```
