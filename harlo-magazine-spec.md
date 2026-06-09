# Harlo Magazine — Website Build Specification (v1)

**Domain:** harlomagazine.com
**Document purpose:** This is the complete, self-contained specification for building v1 of the Harlo Magazine website. It is written to be handed directly to an AI coding agent. Build exactly what is described here. Where a decision is left open, it is flagged in **Section 19 (Open Questions & Assumptions)** with the assumption the agent should build against unless told otherwise.

---

## 1. Project Overview & Goals

Harlo is a culture/fashion/music magazine run by a single non-technical editor ("the editor"). She does two things:

1. **Publishes web articles** continuously (like an editorial blog), organized by category.
2. **Releases discrete print-style issues** as PDFs she designs herself (e.g. "Issue 01", "The Pop Issue"), which readers view as an embedded, on-site **flipbook**.

The two content types are distinct but related: **articles can link to an issue**, and an issue page can surface related articles.

### Primary goals
- A polished, **image-forward** editorial site that holds up next to professional magazine sites (Elle, W, Interview were the editor's references), but **less visually busy** than Elle — more whitespace, bigger images.
- A **CMS the editor can run entirely by herself** — write/publish articles, upload issue PDFs, mark trending/featured items, manage authors and the homepage — with **zero code or developer involvement** for day-to-day publishing.
- Fast, SEO-strong, great on social shares, fully responsive.

### Success test for v1
The editor can, without help: create and publish an article with inline images, upload a new issue PDF and see it render as a flipbook, mark articles as "trending" and "featured," and edit the About/Contact pages.

---

## 2. Tech Stack (use exactly this)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router), latest stable (15/16)** | React Server Components, `generateMetadata`, ISR + on-demand revalidation. |
| Language | **TypeScript** (strict) | Throughout. |
| CMS | **Sanity v3** (hosted dataset) | Editorial-grade editor experience + image CDN. Studio embedded in this app at `/studio`. |
| Sanity packages | `next-sanity`, `@sanity/image-url`, `@portabletext/react`, `@sanity/vision` | Use `next-sanity` for client + live preview / Presentation tool. |
| Styling | **Tailwind CSS v4** + CSS custom properties for brand tokens | Brand tokens defined as CSS variables, exposed to Tailwind theme. |
| Flipbook | **`react-pdf` (PDF.js)** for page rendering + **`react-pageflip`** (StPageFlip) for the flip animation | See Section 9 for the full approach and the documented fallback. |
| Newsletter | **Kit (ConvertKit)** embed/API — *or* Beehiiv | Capture only; do not build email infra. Provider key in env. See Section 15. |
| Analytics | **Plausible** (privacy-friendly) or Vercel Analytics | Single script include. |
| Hosting | **Vercel** | Sanity dataset hosted by Sanity. PDFs/images served from Sanity's CDN. |
| Search | **GROQ-based** server search over articles (v1) | Algolia is a future upgrade, not v1. |

Do not introduce additional state libraries, UI kits, or CMS layers. Keep dependencies minimal.

---

## 3. Architecture Overview

### Rendering & data flow
- **Sanity** is the system of record. The Next.js app reads content via GROQ queries through `next-sanity`.
- **Article and issue pages, category pages, and the homepage are statically generated with ISR.** Use a moderate `revalidate` (e.g. 60s) *plus* **on-demand revalidation** triggered by a Sanity webhook (POST to `/api/revalidate`) so that when the editor publishes, the affected paths/tags rebuild within seconds. Prefer tag-based revalidation (`revalidateTag`) keyed to content types.
- **Images** are never uploaded to the repo or to Vercel. They live in Sanity and are served through Sanity's image CDN via `@sanity/image-url`, rendered through `next/image` with responsive `srcset`, lazy loading, and LQIP blur placeholders (Sanity provides `metadata.lqip`).
- **Issue PDFs** are stored as Sanity **file assets**; the flipbook viewer fetches the public CDN URL client-side and renders it with PDF.js.
- **Sanity Studio** is embedded in the same Next.js app at `/studio` (single deployment).

### High-level system

```
Editor ──> Sanity Studio (/studio) ──> Sanity dataset (content + image/PDF assets, CDN)
                                              │
                                webhook on publish → /api/revalidate (revalidateTag)
                                              │
Reader ──> Next.js (Vercel, App Router, ISR) ─┘
             ├─ GROQ queries (articles, issues, settings)
             ├─ next/image  ← Sanity image CDN
             └─ flipbook viewer (client) ← Sanity PDF CDN URL → PDF.js + react-pageflip
```

### Environments
- `production` Sanity dataset for the live site; optional `development` dataset for local work.
- Draft/preview content gated behind Next.js **Draft Mode** + Sanity perspective (`previewDrafts`). See Section 16.

---

## 4. Information Architecture & Routes

Top-level navigation (sticky, see Section 7): **MUSIC · FASHION · CULTURE · ISSUES**, plus **ABOUT/CONTACT** and a **search** affordance, with **socials** and **Subscribe / Newsletter** in the utility row.

> Note on nav wording: the style guide wrote "MUSIC, FASHION, CULTURE & ISSUES." This is interpreted as **four destinations** — Music, Fashion, Culture (categories) and Issues (the flipbook section). Confirm with the editor (Section 19, Q1). Categories are CMS-managed, so adding/removing one later is a content edit, not a code change.

### Route table (Next.js App Router)

| Path | Page | Rendering |
|---|---|---|
| `/` | Homepage | ISR |
| `/[category]` | Category index (e.g. `/music`) — list of that category's articles | ISR (dynamic from Category docs) |
| `/[category]/[slug]` | Article page | ISR |
| `/issues` | Issues index — grid of covers | ISR |
| `/issues/[slug]` | Single issue — **flipbook viewer** + issue rail + related articles | ISR (viewer hydrates client-side) |
| `/about` | About the magazine (CMS Page) | ISR |
| `/contact` | Contact (CMS Page + form/links) | ISR |
| `/author/[slug]` | Author page (bio + their articles) | ISR |
| `/search` | Search results (query param `?q=`) | Server, dynamic |
| `/studio/[[...index]]` | Embedded Sanity Studio | Client (Sanity) |
| `/api/revalidate` | Sanity webhook → on-demand revalidation | Route handler |
| `/api/newsletter` | Newsletter signup proxy to provider | Route handler |
| `/sitemap.xml`, `/robots.txt`, `/rss.xml` | SEO/feeds | Generated |
| `*` (not found) | Branded 404 | Static |

**Reserved static segments** (`/issues`, `/about`, `/contact`, `/author`, `/search`, `/studio`, `/api`, feeds) take priority over the dynamic `/[category]` segment — ensure category slugs never collide with these reserved words (enforce in the Category schema slug validation).

**URL stability:** articles live under their category path for SEO and convention. If an article is recategorized, its URL changes — keep article slugs stable, and add a redirect entry (a small CMS-managed redirects list or `next.config` redirects) if a published URL must change. v1: keep it simple, but the agent should centralize slug→path resolution in one helper so a future flat-URL switch is a one-file change.

---

## 5. Content Model (Sanity schemas)

Define these document and object types. Field types use Sanity's vocabulary. Mark required fields. Add helpful `description` text on every field (the editor relies on it). Configure **previews** (title + media) for every document so lists in the Studio are legible.

### 5.1 `article` (document)
| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | Headline. |
| `slug` | slug (source: title) | ✅ | URL-safe; unique. |
| `dek` | text (2–3 lines) | – | Standfirst/subtitle shown under the headline and in cards. |
| `category` | reference → `category` | ✅ | Drives URL and section. |
| `authors` | array of reference → `author` | ✅ (min 1) | **Supports multiple authors** (guide showed "BY X, Y"). |
| `heroImage` | image (hotspot enabled) | ✅ | With nested `alt` (required), `caption`, `credit`. |
| `body` | array (Portable Text) | ✅ | Rich text with **inline images, pull quotes, and embeds** — see 5.7. |
| `excerpt` | text | – | Falls back to `dek` for cards/SEO if empty. |
| `publishedAt` | datetime | ✅ | Controls ordering + "x hours ago." |
| `featured` | boolean | – | Eligible for homepage center hero. |
| `trending` | boolean | – | Shows in the Trending rail (manual editorial curation, see Section 19 Q5). |
| `trendingRank` | number | – | Optional manual ordering within Trending. |
| `relatedIssue` | reference → `issue` | – | "Articles can link to issues." |
| `tags` | array of string | – | Optional. |
| `seo` | object (`metaTitle`, `metaDescription`, `ogImage`) | – | Overrides defaults; see Section 11. |

**Derived (not stored):** `readTime` — compute from `body` word count (≈ 200 wpm) at render time and display as "N min read."

### 5.2 `issue` (document)
| Field | Type | Required | Notes |
|---|---|---|---|
| `issueNumber` | string | ✅ | e.g. "01" (string to preserve leading zero / allow "Special"). |
| `title` | string | ✅ | e.g. "The Pop Issue". |
| `slug` | slug | ✅ | e.g. `issue-01` or `the-pop-issue`. |
| `coverImage` | image (hotspot) | ✅ | Used on the issues grid + viewer rail + OG. `alt` required. |
| `pdfFile` | file (accept `.pdf`) | ✅ | The source PDF rendered as the flipbook. |
| `publishedAt` | datetime | ✅ | Ordering. |
| `description` | text | – | Shown on the viewer / issue card. |
| `credits` | Portable Text (light) | – | Masthead/credits block. |
| `featuredArticles` | array of reference → `article` | – | "From the Magazine" rail on the viewer. |
| `seo` | object | – | As above. |

### 5.3 `author` (document)
`name` (string, ✅), `slug` (✅), `bio` (Portable Text), `photo` (image + alt), `socialLinks` (array of `{platform, url}`).

### 5.4 `category` (document)
`title` (✅), `slug` (✅, validated to avoid reserved words in Section 4), `description` (text), `accentColor` (string/list — choose from the brand accents, see 6.1; powers per-category color coding), `navOrder` (number).

### 5.5 `page` (document)
For About / Contact and any future static page: `title` (✅), `slug` (✅), `body` (Portable Text), `seo`.

### 5.6 `siteSettings` (singleton document)
One editable record controlling global chrome:
- `logoWide` (image/SVG) — header wordmark (the "longer" logo the editor wants up top).
- `logoBadge` (image/SVG) — the peacock badge (footer + favicon source).
- `socials` (array of `{platform: instagram|twitter|tiktok, url}`).
- `subscribeUrl` (url) — where "Subscribe / Get the magazine" points (see Section 19 Q2).
- `newsletter` (object: heading, blurb — provider config lives in env).
- `footer` (Portable Text — colophon, copyright).
- `homepageHeroOverride` (optional reference → `article`) — lets the editor pin a specific article to the center hero instead of auto-picking the latest `featured`.

Configure as a Sanity **singleton** (one document, no "create new").

### 5.7 Portable Text — body content blocks
The `body` editor must support, as a publishing-friendly toolbar:
- Block styles: paragraph, H2, H3, blockquote.
- Marks: bold, italic, **link** (internal reference picker → article/issue/page, and external URL).
- Inline/block objects:
  - `image` (hotspot) with `alt` (required), `caption`, `credit`, and a `size` option (`inline` / `wide` / `full-bleed`) so text & images interlink with editorial control.
  - `pullQuote` (`quote`, optional `attribution`).
  - `embed` (paste URL → render YouTube/Vimeo/Instagram/TikTok/X via a safe oEmbed/iframe component).
  - `issueLink` (reference → `issue`, renders a styled "Read this in Issue 0X" promo card).

Render with `@portabletext/react` and custom serializers for each block. Images in body use `next/image` + Sanity URL builder.

---

## 6. Design System

The visual direction is **fixed by the editor's style guide** — follow it exactly. Within those constraints, the intentional choices below give Harlo a recognizable identity. The signature is the **editorial flipbook** plus the **peacock badge**; everything else stays quiet and disciplined so images and headlines carry the page.

### 6.1 Color tokens (CSS custom properties)
```css
:root {
  --color-bg:        #FFFFFF; /* page background */
  --color-ink:       #000000; /* article body text */
  --color-pink:      #FF46A2; /* PRIMARY: titles, menu/nav, links, brand */
  --color-orange:    #FFA500; /* accent */
  --color-yellow:    #FFEE8C; /* accent (pastel) */
  --color-lime:      #93F236; /* accent (confirm exact hex — Section 19 Q3) */
  --color-blue:      #04D9FF; /* accent (neon) */
  --color-rule:      #000000; /* hairline dividers */
  --color-muted:     #6B6B6B; /* timestamps, bylines, meta */
}
```
**Usage rules:**
- **Hot pink** is the brand spine: section titles, the nav/menu, hyperlinks, hover states. **Do not set long body copy in pink** — pink-on-white fails contrast at small sizes (see Section 13). Body copy is black.
- The four secondary accents are used **sparingly and with meaning**: assign one accent per category via `category.accentColor` (e.g. Music = blue, Fashion = pink-adjacent/orange, Culture = lime), surfaced only on small elements — category eyebrows/tags, the active-nav underline, the issue index hover. This makes color encode section, not decorate. Never wash a whole section in an accent.

### 6.2 Typography
- **Display / headlines / nav / section titles:** **Lemon Milk** (the brand display face), set in hot pink, generous size, tight tracking. Confirm license for web use (Section 19 Q4).
- **Body / article text / deks:** **Minion Pro** (serif). **Minion Pro is an Adobe font — not free.** Serve it via an **Adobe Fonts (Typekit) web project** (requires a Creative Cloud plan) using the kit `<link>`/CSS. **Fallback stack** if licensing isn't resolved by build time: `"Source Serif 4", "Spectral", Georgia, serif` — agent: implement the fallback now and make swapping in the Adobe kit a single config change.
- **Utility / meta (bylines, timestamps, kickers):** a clean small-caps treatment of the body serif, or a neutral sans for captions/labels — keep it understated and consistent.

**Type scale (fluid, `clamp()`):**
| Role | Face | Size (desktop → mobile) | Weight | Notes |
|---|---|---|---|---|
| Display / page title | Lemon Milk | 3.5–5rem → 2.25rem | bold | Pink. |
| Article H1 | Lemon Milk *or* Minion display | 2.75rem → 2rem | – | See per-page notes. |
| Section title ("The Latest", "Trending") | Lemon Milk | 1.75rem → 1.25rem | – | Pink, italic option per references. |
| Body | Minion Pro | 1.125rem / 1.7 line-height | regular | Black, max width ~68ch. |
| Dek/standfirst | Minion Pro italic | 1.25rem | regular | Muted or black. |
| Card title | Minion Pro | 1.05–1.25rem | medium | |
| Kicker/category eyebrow | utility, uppercase, tracked | 0.75rem | 600 | Accent or black. |
| Byline/meta | utility | 0.8rem | – | Muted. |

### 6.3 Spacing, layout, motion
- Generous whitespace (the brief: *less busy than Elle*). Establish an 8px spacing scale. Hairline (1px) black rules as the primary divider device (matches the references). **Zero or minimal border-radius** on images and containers (editorial, print-like).
- **Motion:** restrained. A gentle fade/slide on scroll-reveal for article cards is acceptable; the **flipbook page-turn is the one expressive motion moment**. Respect `prefers-reduced-motion` everywhere (disable flip animation → instant page change; disable reveals).
- Grid: 12-column desktop max-width container (~1280–1440px) with comfortable gutters; full-bleed allowed for hero/feature images.

### 6.4 Iconography & favicon
Social icons (Instagram, X/Twitter, TikTok) as inline SVGs. Favicon + app icons generated from `logoBadge` (peacock).

---

## 7. Global Components

### 7.1 Sticky Header / Nav (highest-priority component)
The editor explicitly wants the nav **frozen/sticky on every page and article, with the logo shrinking on scroll.** Structure:

- **Utility row (top):** socials (left), `Subscribe` and `Newsletter` links (right), search icon (right). On the reference (Interview), this row also frames the wordmark.
- **Brand row (center):** the **wide wordmark** (`logoWide`), centered, larger at top of page.
- **Nav row:** `MUSIC · FASHION · CULTURE · ISSUES · ABOUT` in Lemon Milk, hot pink, centered/spread.

**Behavior:**
- `position: sticky; top: 0;` — header stays pinned through scroll on all pages.
- **Condense on scroll:** past a threshold (~80px), collapse to a compact bar — shrink the wordmark, reduce padding, keep nav + search reachable. Smooth height/scale transition; instant under `prefers-reduced-motion`.
- **Active state:** current section's nav item underlined in its category accent.
- **Search:** icon expands an inline search field (or opens `/search`).

**Mobile header:** hamburger (left) → full-screen overlay menu with the nav, socials, subscribe/newsletter; centered wordmark; search icon (right). Matches the mobile reference.

### 7.2 Footer
- The **peacock badge** logo, larger here (editor: "include at bottom of page").
- Nav links repeated, socials, newsletter signup block, subscribe link, colophon/copyright from `siteSettings.footer`.

### 7.3 ArticleCard (reused everywhere)
Variants driven by a `variant` prop: `feature` (large, homepage center), `list` (thumbnail + title + meta, the "Latest" rail), `trending` (category eyebrow + title + small thumbnail + byline + read time), `grid` (image-top card for category pages and the 3-up "Article Pages" layout in the guide). Every card: category eyebrow (accent), title (Minion), optional dek, byline, timestamp ("x hours ago" relative for <24h, else date), read time.

### 7.4 NewsletterSignup
Heading + blurb from `siteSettings.newsletter`, email field, submit → `/api/newsletter`. Inline success/error states (errors say what to do, not just "error"). Used in footer and optionally mid-homepage.

### 7.5 Other
`SectionTitle` (pink Lemon Milk + rule), `Byline`, `CategoryEyebrow`, `Pagination`/`LoadMore`, `EmbedRenderer`, `PortableTextRenderer`, `ShareButtons` (on articles).

---

## 8. Page Specifications

### 8.1 Homepage (`/`) — image-forward, three columns
The editor's brief: center is a big image, **latest on the left, trending on the right, less busy than Elle.**

**Desktop layout (above the fold):**
```
┌───────────── sticky header ─────────────┐
├──────────┬───────────────────┬──────────┤
│ THE      │                   │ TRENDING │
│ LATEST   │   [ FEATURE ]     │ ──────── │
│ ──────   │   big hero image  │ MOVIES&TV│
│ • item   │   category eyebrow│ • item   │
│ • item   │   BIG HEADLINE    │ • item   │
│ • item   │   dek · byline    │ CULTURE  │
│ • item   │                   │ • item   │
│ (~25%)   │      (~50%)       │ (~25%)   │
└──────────┴───────────────────┴──────────┘
```
- **Center:** the hero = `siteSettings.homepageHeroOverride` if set, else most recent `featured` article. Large image, category eyebrow (accent), large Lemon Milk/serif headline, dek, byline. Optionally 1–2 secondary features stacked below.
- **Left "The Latest":** the N most recent published articles (any category), `list` variant — small thumbnail, title, "x hours ago," read time. This is the rolling feed.
- **Right "Trending":** articles flagged `trending`, grouped under their category eyebrow (MOVIES & TV-style blocks in the reference), ordered by `trendingRank` then date. **Trending is manual editorial curation** — answer to the editor's question "is that possible to code in?": yes, via the `trending` toggle; no analytics dependency in v1 (Section 19 Q5).

**Below the fold:** per-category strips (latest few from Music / Fashion / Culture, each as a horizontal `grid` row with a "See all →" to the category page), an **Issues promo strip** (latest issue cover + "Read the latest issue" → `/issues/[slug]`), and a newsletter block.

**Mobile:** single column, stacked in this order (matches the mobile reference): hero feature → "The Latest" → category strips → Trending → Issues promo → newsletter.

### 8.2 Category index (`/[category]`)
Header with category title (Lemon Milk, accent-tinted rule) + description. Responsive grid of `grid`-variant ArticleCards (image-top), newest first, with `LoadMore`/pagination (page size ~12–18). Empty state: a branded "No stories here yet" message.

### 8.3 Article page (`/[category]/[slug]`) — text & images interlinked
- **Masthead:** category eyebrow (accent), H1 headline, dek, byline(s) (linked to author pages), publish date, read time, share buttons.
- **Hero image** (full-width or contained) with caption + credit.
- **Body:** Portable Text rendered with the serializers from 5.7 — body copy in a readable measure (~68ch), inline/wide/full-bleed images interleaved with text, pull quotes, embeds. Links in pink.
- If `relatedIssue` set: an **"Read this in Issue 0X" promo card** linking to the flipbook.
- **Footer of article:** author bio block(s), tags, **"Related" / "More from [category]"** (3-up cards), share again.
- Full SEO + Article JSON-LD (Section 11).

### 8.4 Issues index (`/issues`)
Per the editor: clicking Issues shows **all the covers**. Responsive grid of issue **cover images**, newest first, each labeled "Issue 0X — Title". Hover: subtle accent/scale. Click → `/issues/[slug]`. Keep it gallery-like and spacious.

### 8.5 Single issue / Flipbook viewer (`/issues/[slug]`) — see Section 9
Layout (desktop), mirroring the W reference (cover/flipbook center, options to the side):
```
┌──────────────────────── header ───────────────────────┐
│  Issue 0X — The Pop Issue            [⤢ fullscreen]    │
├───────────────┬───────────────────────┬───────────────┤
│ OTHER ISSUES  │                       │ FROM THE      │
│ (cover rail)  │   ◀  [ FLIPBOOK ]  ▶  │ MAGAZINE      │
│ • Issue 03    │      two-page spread  │ (related      │
│ • Issue 02    │      page-turn        │  articles)    │
│ • Issue 01    │      page 4 / 48      │ • article     │
│               │                       │ • article     │
└───────────────┴───────────────────────┴───────────────┘
```
- **Center:** the flipbook (Section 9). Prev/next controls, page indicator, fullscreen toggle, optional download-PDF link (Section 19 Q7).
- **Left rail "Other Issues":** cover thumbnails of all other issues → navigate to their viewer.
- **Right rail "From the Magazine":** `issue.featuredArticles` (related web articles).
- **Mobile:** flipbook in single-page swipe mode full-width; rails collapse below the flipbook as horizontal scrollers.

### 8.6 About (`/about`) & Contact (`/contact`)
Render the CMS `page` body (Portable Text). Contact additionally shows socials and a contact method (email link or simple form → `/api/newsletter`-style handler or `mailto:`; Section 19 Q6).

### 8.7 Author (`/author/[slug]`)
Photo, name, bio, social links, and a grid of that author's articles.

### 8.8 Search (`/search?q=`)
Server-rendered results from a GROQ query matching `q` against article `title`, `dek`, `excerpt`, and plain-text `body` (and optionally issue titles). Results as `grid` cards. Empty/no-results state with suggestions. Search box also in the header.

### 8.9 404 / error
Branded 404 in Harlo's type/colors with links back to home and sections. Error states use the interface voice: explain + offer a way forward, never a bare apology.

---

## 9. The Flipbook (critical component — build carefully)

**Input:** `issue.pdfFile` → Sanity CDN URL (CORS-enabled, fine for client fetch). **Goal:** an on-brand, embedded, page-turning reader. **No third-party flipbook service in v1** (keeps it on Harlo's domain, branded, no per-issue cost, custom side rails).

### Approach (primary)
1. **Render** PDF pages with `react-pdf` (PDF.js). On load, read `numPages`.
2. **Flip** using `react-pageflip` (StPageFlip): wrap rendered pages as the book's pages.
   - **Desktop:** two-page spread; render the cover as a single right-hand page (`showCover`), then spreads.
   - **Mobile/portrait:** single-page mode with swipe; portrait orientation.
3. **Performance (important — PDFs can be large):**
   - Render **lazily/windowed** — only the current spread plus 1–2 neighbors; render others on demand as the reader advances.
   - Render each page to canvas at a **device-appropriate scale** (cap DPR; re-render sharper on zoom/fullscreen only).
   - Show a **skeleton/spinner per page** while rendering; never block the whole UI.
   - Self-host the **PDF.js worker** (`pdf.worker`) from the app's static assets (do not hotlink a CDN worker).
4. **Controls:** prev/next buttons + arrow-key support, click/drag/swipe to turn, page-number indicator (`4 / 48`), fullscreen toggle, optional zoom, optional "Download PDF" (Q7).
5. **Accessibility:** keyboard navigable (←/→), focus management, `prefers-reduced-motion` → disable the flip animation and switch pages instantly. Provide a "list/scroll view" toggle as the accessible alternative (also doubles as the fallback below).

### Documented fallback (build this too, behind a toggle/feature flag)
If the flip library underperforms on a given device (especially low-end mobile or very large PDFs), degrade to a **vertical paged PDF scroll** (react-pdf rendering pages stacked, lazy-loaded). The viewer should auto-fall back if PDF.js reports excessive page count/size beyond a configurable threshold, and always expose the manual toggle. This guarantees every issue is *readable* even when the fancy flip isn't ideal.

### Optimization note (not required for v1, document as a TODO)
For best performance at scale, pre-rasterize PDF pages to optimized images at upload time (a Sanity webhook → serverless function that renders pages to WebP, stored as assets) and feed those images to `react-pageflip` instead of live PDF.js rendering. v1 may render client-side; flag this as the first performance upgrade.

---

## 10. CMS / Editing Experience (Sanity Studio)

- **Embed Studio** at `/studio` in this app (single deploy). Configure `sanity.config.ts` with the schema types from Section 5.
- **Structure (desk) customization** so the editor sees a clean, task-oriented sidebar: `Articles`, `Issues`, `Authors`, `Categories`, `Pages`, and a pinned singleton `Site Settings`. Order Articles by `publishedAt desc` by default.
- **Field descriptions everywhere** (the editor is non-technical) — say what each field does in plain language.
- **Validation:** required fields per Section 5; `alt` text required on all images (enforced); slug uniqueness; category slug reserved-word guard.
- **Previews:** every document type shows a title + thumbnail in lists.
- **Visual editing / Presentation:** enable Sanity's Presentation tool with live preview into the Next.js front end (see Section 16) so the editor can see drafts in context.
- **Publishing UX:** the editor uses Sanity's standard draft → publish. `featured`/`trending` are simple toggles. Uploading an issue = create `issue` doc, drop in cover + PDF, publish.

---

## 11. SEO, Metadata, Structured Data, Feeds

- **Per-page metadata** via `generateMetadata`: title, description (from `seo` override → else `dek`/`excerpt`), canonical URL.
- **Open Graph / Twitter cards** on every page (magazines live on social shares): `og:title`, `og:description`, `og:image` (article `seo.ogImage` → else `heroImage`; issue → `coverImage`; site default from settings), `og:type` (`article` for articles), `twitter:card = summary_large_image`. Optional v1 upgrade: dynamic OG image generation via Next OG/Satori — otherwise use the hero/cover image.
- **JSON-LD structured data:** `Article`/`NewsArticle` on article pages (headline, image, author(s), datePublished, publisher), `Organization`/`WebSite` (+ Sitelinks SearchBox) site-wide.
- **`sitemap.xml`** (all published articles, issues, categories, pages, authors), **`robots.txt`**, **`/rss.xml`** feed of latest articles.
- Clean semantic HTML, one `<h1>` per page, descriptive link text.

---

## 12. Performance & Images

- All images through `next/image` + `@sanity/image-url`: responsive `sizes`, AVIF/WebP, lazy by default, **LQIP blur placeholder** from Sanity metadata, explicit width/height/aspect to avoid layout shift.
- Hero/feature images: `priority` for the homepage hero and article hero only.
- Fonts: `next/font` for self-hosted faces; Adobe kit loaded with `display=swap` and the local fallback stack to avoid invisible text. Subset where possible.
- Targets: good Core Web Vitals — LCP < 2.5s on the homepage hero, CLS < 0.1, minimal client JS on content pages (flipbook JS code-split and loaded only on the issue viewer route).
- ISR + on-demand revalidation (Section 3) keeps pages static-fast while staying fresh on publish.

---

## 13. Accessibility (quality floor — non-negotiable)

- WCAG AA color contrast: **body text is black on white** (passes). **Hot pink (#FF46A2) on white is ~3:1** — acceptable for large text/headlines/UI, **not** for small body copy or fine print; never set small/long text in pink. For pink interactive text, ensure size/weight clears the large-text threshold or add non-color affordances (underline).
- Required `alt` text on all images (enforced in CMS).
- Full keyboard operability: nav, search, flipbook (←/→), menus; visible focus rings throughout.
- Respect `prefers-reduced-motion` (flipbook + scroll reveals + header condense).
- Semantic landmarks (`header`/`nav`/`main`/`footer`), skip-to-content link, proper heading order.
- Flipbook ships with the accessible scroll/list view alternative (Section 9).

---

## 14. Analytics
Plausible (preferred) or Vercel Analytics via a single script include, keyed by env var. Track pageviews; optionally custom events for newsletter signups and issue opens. No invasive tracking; cookie-light.

---

## 15. Newsletter & Subscribe
- **Newsletter signup:** integrate **Kit (ConvertKit)** (or Beehiiv). The `NewsletterSignup` component posts to `/api/newsletter`, which calls the provider API with the key from env (never expose the key client-side). Inline success/error UX. Double opt-in per provider default.
- **Subscribe ("Get the magazine"):** v1 = a CMS-configurable link (`siteSettings.subscribeUrl`) — could point to a print-subscription page/store or the newsletter. **Clarify intent (Section 19 Q2)**; do not build commerce/print fulfillment in v1.

---

## 16. Preview / Draft Workflow
- Next.js **Draft Mode** + Sanity **`previewDrafts`** perspective via `next-sanity`.
- Enable Sanity **Presentation tool** so the editor previews unpublished drafts in the live layout from within Studio.
- Preview route handler toggles Draft Mode; published reads use the CDN-cached `published` perspective. Ensure drafts never leak to the public/ISR cache.

---

## 17. Deployment & Configuration

- **Deploy** the Next.js app (with embedded Studio) to **Vercel**. Sanity dataset hosted by Sanity.
- **Sanity webhook** → `/api/revalidate` (secret-protected) firing on create/update/delete of `article`, `issue`, `category`, `page`, `siteSettings`, using `revalidateTag`.
- **Environment variables:**
```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=YYYY-MM-DD
SANITY_API_READ_TOKEN=          # server-side reads / drafts
SANITY_REVALIDATE_SECRET=       # webhook auth
SANITY_PREVIEW_SECRET=          # draft-mode toggle
NEWSLETTER_PROVIDER_API_KEY=
NEWSLETTER_FORM_ID=
NEXT_PUBLIC_SITE_URL=https://harlomagazine.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=   # or Vercel Analytics
ADOBE_FONTS_KIT_ID=             # optional, Minion Pro kit
```
- Configure `next.config` image `remotePatterns` to allow `cdn.sanity.io`.
- Connect custom domain `harlomagazine.com` on Vercel.

---

## 18. Build Sequence / Milestones (suggested order for the agent)

1. **Scaffold:** Next.js (App Router, TS, Tailwind v4) + embedded Sanity Studio at `/studio`; brand tokens + fonts (with fallback) wired into the theme; deploy a skeleton to Vercel early.
2. **Content model:** implement all Sanity schemas (Section 5), Studio structure, validation, previews, singleton settings. Seed a few sample articles, one author, three categories, one issue (with a sample PDF).
3. **Data layer:** GROQ queries + typed fetch helpers; `next/image` + Sanity image builder; ISR + `/api/revalidate` webhook.
4. **Global chrome:** sticky condensing header/nav, footer, ArticleCard variants, PortableText renderer.
5. **Pages:** Homepage (3-column) → Category → Article → Issues index → Author → About/Contact → Search → 404.
6. **Flipbook:** the issue viewer with PDF.js + react-pageflip, controls, side rails, mobile single-page mode, and the scroll-view fallback.
7. **Integrations:** newsletter (`/api/newsletter`), analytics, SEO (metadata, OG, JSON-LD, sitemap, robots, RSS), preview/Presentation.
8. **Polish:** accessibility pass, performance pass (CWV), responsive QA across breakpoints, reduced-motion, empty/error states.
9. **Handover:** confirm the editor can publish an article, upload an issue, and toggle featured/trending unaided.

---

## 19. Open Questions & Assumptions

The agent should build against the **Assumption** unless the editor/Eric says otherwise.

| # | Question | Assumption for v1 |
|---|---|---|
| Q1 | Is the nav "Music / Fashion / Culture / Issues" (4 items) or "Music / Fashion / Culture & Issues" (3)? | **Four destinations**; categories are CMS-managed so this is editable without code. |
| Q2 | What does "Subscribe / Get the magazine" do — print subscription, store, or newsletter? | A **CMS-configurable link** (`subscribeUrl`); no commerce built in v1. |
| Q3 | Exact lime-green hex (style guide swatch is hard to read). | Using **`#93F236`** as a placeholder — confirm against the source style guide. |
| Q4 | Is Lemon Milk licensed for web embedding, and is there an Adobe Fonts plan for Minion Pro? | Implement with **fallbacks** (`Source Serif 4`/`Spectral`); swapping in the real kits is a one-line change. |
| Q5 | Trending = manual editorial pick, or automated by views? | **Manual** (`trending` toggle + `trendingRank`); analytics-driven trending is a future upgrade. |
| Q6 | Contact: form (which inbox?) or just email + socials? | **Email link + socials** for v1; simple form optional. |
| Q7 | Should readers be able to **download** issue PDFs, or view-only? | **View-only** by default; a download button is a flag the editor can enable. |
| Q8 | Are comments wanted on articles? | **No comments** in v1. |
| Q9 | Single editor only, or multiple Sanity users/roles? | **Single editor**; Sanity supports adding users later with no code change. |
| Q10 | Roughly how large are the issue PDFs / how many pages? | Build for **up to ~60 pages**; the scroll-view fallback + future pre-rasterization handle larger/heavier files. |

---

## 20. Out of Scope for v1 (future roadmap)
Algolia search; dynamic OG image generation; PDF page pre-rasterization pipeline; e-commerce/print subscriptions; comments; multi-language; user accounts/paywall; per-article view-count analytics feeding automated trending; advertising slots.

---

*End of specification. Build v1 to this document; surface any of the Section 19 questions that block implementation.*
