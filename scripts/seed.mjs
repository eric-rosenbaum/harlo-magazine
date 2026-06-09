// One-off content seeder for Harlo.
//
// Writes as the logged-in *user* (reads the Sanity CLI auth token from
// ~/.config/sanity/config.json) because this brand-new project's API/robot
// tokens have a Sanity-side grant bug. Idempotent: stable _ids + createOrReplace.
//
// Run: node scripts/seed.mjs
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { createClient } from "@sanity/client";

const projectId = "vnhyz260";
const dataset = "production";
const apiVersion = "2024-10-01";

const token =
  process.env.SANITY_USER_TOKEN ||
  JSON.parse(
    readFileSync(`${homedir()}/.config/sanity/config.json`, "utf8")
  ).authToken;

if (!token) {
  console.error("No Sanity auth token found. Run `npx sanity login` first.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const key = (() => {
  let n = 0;
  return () => `k${(n++).toString(36)}${Date.now().toString(36)}`;
})();

/** Build Portable Text blocks from an array of {style?, text} or plain strings. */
function blocks(items) {
  return items.map((it) => {
    const { style = "normal", text } = typeof it === "string" ? { text: it } : it;
    return {
      _type: "block",
      _key: key(),
      style,
      markDefs: [],
      children: [{ _type: "span", _key: key(), text, marks: [] }],
    };
  });
}

async function uploadImage(url, filename) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`fetch image ${url} -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buf, {
    filename,
    contentType: "image/jpeg",
  });
  return asset._id;
}

function imageField(assetId, { alt, caption, credit } = {}) {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
    ...(alt ? { alt } : {}),
    ...(caption ? { caption } : {}),
    ...(credit ? { credit } : {}),
  };
}

/** Generate a simple valid multi-page PDF so the flipbook has real pages. */
function makePdf(labels, colors) {
  const enc = (s) => Buffer.from(s, "latin1");
  const N = labels.length;
  const fontNum = 3;
  const pageNums = labels.map((_, i) => 4 + i);
  const contentNums = labels.map((_, i) => 4 + N + i);
  const objs = [];
  objs.push({ num: 1, body: enc("<< /Type /Catalog /Pages 2 0 R >>") });
  objs.push({
    num: 2,
    body: enc(
      `<< /Type /Pages /Kids [${pageNums
        .map((n) => `${n} 0 R`)
        .join(" ")}] /Count ${N} >>`
    ),
  });
  objs.push({
    num: 3,
    body: enc("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"),
  });
  labels.forEach((label, i) => {
    const [r, g, b] = colors[i % colors.length];
    objs.push({
      num: pageNums[i],
      body: enc(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontNum} 0 R >> >> /Contents ${contentNums[i]} 0 R >>`
      ),
    });
    const stream =
      `${r} ${g} ${b} rg 0 0 612 792 re f\n` +
      `1 1 1 rg 56 360 500 90 re f\n` +
      `0 0 0 rg BT /F1 42 Tf 80 386 Td (${label}) Tj ET`;
    objs.push({
      num: contentNums[i],
      body: enc(
        `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`
      ),
    });
  });
  let pdf = enc("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const offsets = {};
  objs.sort((a, b) => a.num - b.num);
  for (const o of objs) {
    offsets[o.num] = pdf.length;
    pdf = Buffer.concat([pdf, enc(`${o.num} 0 obj\n`), o.body, enc("\nendobj\n")]);
  }
  const xrefStart = pdf.length;
  const maxNum = objs[objs.length - 1].num;
  let xref = `xref\n0 ${maxNum + 1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= maxNum; n++) {
    xref += `${String(offsets[n] || 0).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${maxNum + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.concat([pdf, enc(xref)]);
}

async function run() {
  console.log("→ Cleaning up the draft categories you made in the Studio…");
  const draftCats = await client.fetch(
    `*[_type=="category" && _id in path("drafts.**")]._id`
  );
  if (draftCats.length) {
    const tx = client.transaction();
    draftCats.forEach((id) => tx.delete(id));
    await tx.commit();
    console.log(`  removed ${draftCats.length} draft categories`);
  }

  console.log("→ Categories");
  const categories = [
    { _id: "music", title: "Music", accentColor: "blue", navOrder: 1 },
    { _id: "fashion", title: "Fashion", accentColor: "orange", navOrder: 2 },
    { _id: "culture", title: "Culture", accentColor: "lime", navOrder: 3 },
  ];
  for (const c of categories) {
    await client.createOrReplace({
      _id: c._id,
      _type: "category",
      title: c.title,
      slug: { _type: "slug", current: c._id },
      accentColor: c.accentColor,
      navOrder: c.navOrder,
      description: `The latest in ${c.title.toLowerCase()} from Harlo.`,
    });
  }

  console.log("→ Author (with photo)");
  const authorPhoto = await uploadImage(
    "https://picsum.photos/seed/harlo-author/600/600",
    "author.jpg"
  );
  await client.createOrReplace({
    _id: "author-harlo",
    _type: "author",
    name: "Harlo Editorial",
    slug: { _type: "slug", current: "harlo-editorial" },
    photo: imageField(authorPhoto, { alt: "Harlo Editorial" }),
    bio: blocks([
      "The Harlo editorial desk — covering the music, fashion and culture worth your time.",
    ]),
    socialLinks: [
      { _type: "socialLink", _key: key(), platform: "instagram", url: "https://instagram.com" },
    ],
  });

  console.log("→ Articles (uploading hero images)");
  const now = Date.now();
  const day = 86400000;
  const articles = [
    {
      _id: "article-synth-revival",
      title: "The Synth Revival Nobody Saw Coming",
      category: "music",
      dek: "How a generation raised on streaming fell back in love with analog warmth.",
      seed: "synth",
      featured: true,
      trending: true,
      trendingRank: 1,
      daysAgo: 0,
    },
    {
      _id: "article-midnight-sets",
      title: "Midnight Sets: A Night in the Booth",
      category: "music",
      dek: "Backstage with the DJs redrawing the city after dark.",
      seed: "booth",
      trending: true,
      trendingRank: 2,
      daysAgo: 1,
    },
    {
      _id: "article-slow-fashion",
      title: "Slow Fashion's Loud Moment",
      category: "fashion",
      dek: "The designers betting that less, but better, is the future.",
      seed: "fashion1",
      featured: true,
      trending: true,
      trendingRank: 1,
      daysAgo: 2,
    },
    {
      _id: "article-return-trench",
      title: "The Return of the Trench",
      category: "fashion",
      dek: "An old icon, reissued for a wetter, stranger decade.",
      seed: "trench",
      daysAgo: 3,
    },
    {
      _id: "article-cant-stop-watching",
      title: "Why We Can't Stop Watching",
      category: "culture",
      dek: "Comfort television, the algorithm, and the new shape of attention.",
      seed: "screen",
      trending: true,
      trendingRank: 1,
      daysAgo: 4,
    },
  ];

  for (const a of articles) {
    const hero = await uploadImage(
      `https://picsum.photos/seed/harlo-${a.seed}/1600/1067`,
      `${a._id}.jpg`
    );
    await client.createOrReplace({
      _id: a._id,
      _type: "article",
      title: a.title,
      slug: { _type: "slug", current: a._id.replace("article-", "") },
      dek: a.dek,
      category: { _type: "reference", _ref: a.category },
      authors: [{ _type: "reference", _ref: "author-harlo", _key: key() }],
      heroImage: imageField(hero, { alt: a.title, credit: "Photo: Unsplash" }),
      body: blocks([
        a.dek,
        { style: "h2", text: "The shift" },
        "It started quietly, the way these things always do — a few rooms, a few records, a handful of people who refused to let it go. Then, all at once, everyone was paying attention.",
        "What follows is part reporting, part field guide: who is driving this, why it matters now, and where it goes from here.",
        { style: "h2", text: "What comes next" },
        "Nobody can say for certain. But the people closest to it are unanimous on one point — this is only the beginning.",
      ]),
      excerpt: a.dek,
      publishedAt: new Date(now - a.daysAgo * day).toISOString(),
      featured: !!a.featured,
      trending: !!a.trending,
      ...(a.trendingRank ? { trendingRank: a.trendingRank } : {}),
    });
    console.log(`  ✓ ${a.title}`);
  }

  console.log("→ Issue (cover + generated flipbook PDF)");
  const cover = await uploadImage(
    "https://picsum.photos/seed/harlo-cover01/1200/1600",
    "issue-01-cover.jpg"
  );
  const pdfBuffer = makePdf(
    ["HARLO", "ISSUE 01", "MUSIC", "FASHION", "CULTURE", "THE POP ISSUE", "CREDITS", "FIN"],
    [
      [1, 0.27, 0.64],
      [0.016, 0.85, 1],
      [1, 0.65, 0],
      [0.576, 0.95, 0.21],
      [1, 0.93, 0.55],
      [1, 0.27, 0.64],
      [0.1, 0.1, 0.1],
      [1, 0.27, 0.64],
    ]
  );
  const pdfAsset = await client.assets.upload("file", pdfBuffer, {
    filename: "harlo-issue-01.pdf",
    contentType: "application/pdf",
  });
  await client.createOrReplace({
    _id: "issue-01",
    _type: "issue",
    issueNumber: "01",
    title: "The Pop Issue",
    slug: { _type: "slug", current: "the-pop-issue" },
    coverImage: imageField(cover, { alt: "Harlo Issue 01 — The Pop Issue cover" }),
    pdfFile: { _type: "file", asset: { _type: "reference", _ref: pdfAsset._id } },
    publishedAt: new Date(now - 5 * day).toISOString(),
    description:
      "Our debut issue — a love letter to pop, in print. Flip through the full thing right here.",
    allowDownload: false,
    featuredArticles: [
      { _type: "reference", _ref: "article-synth-revival", _key: key() },
      { _type: "reference", _ref: "article-slow-fashion", _key: key() },
    ],
  });

  // Link an article to the issue.
  await client
    .patch("article-synth-revival")
    .set({ relatedIssue: { _type: "reference", _ref: "issue-01" } })
    .commit();

  console.log("→ Site settings + pages");
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    newsletter: {
      heading: "Get Harlo in your inbox",
      blurb: "The latest stories and issues, no noise.",
    },
    socials: [
      { _type: "socialLink", _key: key(), platform: "instagram", url: "https://instagram.com" },
      { _type: "socialLink", _key: key(), platform: "tiktok", url: "https://tiktok.com" },
    ],
    subscribeUrl: "#newsletter",
    footer: blocks([`© ${new Date().getFullYear()} Harlo Magazine. All rights reserved.`]),
  });
  await client.createOrReplace({
    _id: "page-about",
    _type: "page",
    title: "About Harlo",
    slug: { _type: "slug", current: "about" },
    body: blocks([
      "Harlo is an independent magazine covering music, fashion and culture — online, and in print.",
      "We publish stories continuously and release designed issues you can read right here as a flipbook.",
    ]),
  });
  await client.createOrReplace({
    _id: "page-contact",
    _type: "page",
    title: "Contact",
    slug: { _type: "slug", current: "contact" },
    body: blocks([
      "For press, pitches and partnerships: hello@harlomagazine.com",
    ]),
  });

  console.log("\n✅ Seed complete.");
  const counts = await client.fetch(
    `{"articles":count(*[_type=="article"]),"issues":count(*[_type=="issue"]),"categories":count(*[_type=="category"])}`
  );
  console.log("   ", JSON.stringify(counts));
}

run().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
