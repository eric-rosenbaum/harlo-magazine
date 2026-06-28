# How We Use Harlo Magazine

A plain-English guide to who does what on the site. There are **three kinds of people**: the **Developer** (Eric), the **Editor** (your friend), and **Viewers** (the public). Each has a different door into the site and a different set of things they can touch.

Think of it like a magazine: the Developer builds and maintains the printing press, the Editor decides what goes in the magazine and publishes it, and Viewers read it.

---

## The three places this site "lives"

Before the roles, it helps to know the three systems behind Harlo:

| System | What it is | Who logs in here |
| --- | --- | --- |
| **GitHub** | Where the website's *code* lives. | Developer only |
| **Vercel** | The host — turns the code into the live site at harlomagazine.com. | Developer only |
| **Sanity Studio** | The control room for *content* — articles, issues, photos, settings. Lives at **harlomagazine.com/studio**. | Developer + Editor |

Viewers never log into any of these. They just visit **harlomagazine.com**.

---

## 1. Developer — Eric (full control, including code)

**Role in Sanity:** Administrator
**Also has access to:** GitHub + Vercel (nobody else does)

You own the whole stack. You can do everything the Editor can do, **plus** everything that involves code, hosting, and configuration.

### What only you can do
- **Change how the site looks and works** — layouts, fonts, colors, new page types, new features. (Code, in GitHub.)
- **Deploy** — push code to the `main` branch and Vercel rebuilds the live site in ~2 minutes.
- **Manage the domain & hosting** — DNS, SSL, environment variables, the publish webhook. (Vercel + GoDaddy + Sanity settings.)
- **Manage who has access** — invite or remove people on the project, set their roles. (Sanity → Manage, and GitHub/Vercel.)
- **Change the content *structure*** — what fields an Article has, adding a new content type, etc. (This is code — the schema — not something done by clicking in the Studio.)
- **Back-end housekeeping** — secrets/tokens, the newsletter and analytics integrations, fixing anything broken.

### How you work
- **Code:** edit the project, push to GitHub `main` → Vercel auto-deploys.
- **Content:** you can also use the Studio at `/studio` exactly like the Editor does.
- **Settings:** Sanity dashboard at `sanity.io/manage`, Vercel dashboard, GoDaddy for the domain.

> **Rule of thumb:** if a change requires editing files or typing in a terminal, it's a Developer job. Everything else can be done by the Editor in the Studio.

---

## 2. Editor — Your Friend (full content control, no code)

**Role in Sanity:** Administrator (so she has *full* power over content and project settings — just not the code/hosting, which she never needs to touch)

She runs the magazine day-to-day. Everything about *what's on the site* is hers to control, entirely through the Studio at **harlomagazine.com/studio** — no coding, no terminal, ever.

### What she can do (all in the Studio)
- **Write & publish articles** — create a new article, add the headline, body text, photos, byline, category, hit **Publish**. It appears on the live site within seconds.
- **Edit or delete** any existing article, issue, author, or page.
- **Upload issues** — add a new Issue, upload its PDF and cover image; it shows up as a flipbook on the Issues page.
- **Manage authors** — add writers with their photo and bio; bylines link to their author page.
- **Manage categories** — the sections in the top menu (Music, Fashion, Culture, etc.) and their accent colors.
- **Control the brand assets** — in **Site Settings**: upload the logo (header) and peacock badge (footer), set social links, the subscribe link, footer text, and newsletter copy.
- **Curate the homepage** — choose the hero feature and mark articles as "Trending" to control what shows in the right-hand column.
- **Preview drafts** before publishing, so she can see exactly how a story looks before it goes live.

### How she works
1. Go to **harlomagazine.com/studio** and log in (her own Google/Sanity account).
2. Pick a section on the left (Articles, Issues, Authors, Categories, Pages, Site Settings).
3. Create or edit, then click the green **Publish** button at the bottom.
4. The live site updates automatically within a few seconds — no deploy, no waiting on Eric.

### What she does *not* do
- Touch code, GitHub, Vercel, or the domain.
- Change the *structure* of content (e.g., "add a new field to every article") — that's a quick code change, so she'd ask Eric.

> **Bottom line:** if it's about words, pictures, issues, settings, or what appears where — she can do all of it herself.

---

## 3. Viewers — The Public (read-only)

**Role:** none — they never log in.

Anyone who visits **harlomagazine.com**. They consume the magazine; they can't change anything.

### What they can do
- **Browse & read** all published articles, organized by category (Music, Fashion, Culture…).
- **Read issues** as page-turning flipbooks, and download a PDF if the Editor allowed it for that issue.
- **Search** the site.
- **Discover** via the homepage — the featured story, the latest, and what's trending.
- **Sign up for the newsletter** and follow the social links.
- **Share** articles to social media.

### What they can't do
- See anything unpublished (drafts are invisible to the public).
- Edit, comment on the CMS, or access the Studio.

---

## Quick reference

| | **Developer (Eric)** | **Editor (Friend)** | **Viewer (Public)** |
| --- | --- | --- | --- |
| Read the published site | ✅ | ✅ | ✅ |
| Sign up / search / share | ✅ | ✅ | ✅ |
| Write, edit, publish articles | ✅ | ✅ | ❌ |
| Upload issues & images | ✅ | ✅ | ❌ |
| Manage authors & categories | ✅ | ✅ | ❌ |
| Edit Site Settings (logo, socials) | ✅ | ✅ | ❌ |
| Invite/remove people, set roles | ✅ | ✅ | ❌ |
| Change content *structure* (fields/types) | ✅ | ❌ | ❌ |
| Edit design, layout, features (code) | ✅ | ❌ | ❌ |
| Deploy, domain, hosting, secrets | ✅ | ❌ | ❌ |

---

## Setup note (one-time)

For your friend to have this level of access, she needs to be added to the Sanity project as an **Administrator**:

1. Eric goes to **sanity.io/manage/project/vnhyz260/members**.
2. **Invite member** → enter her email → set role to **Administrator**.
3. She accepts the email invite, then logs in at **harlomagazine.com/studio** with that same account.

That's it — from then on she has full content control without ever needing Eric.
