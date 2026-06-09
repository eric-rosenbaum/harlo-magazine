/**
 * Safe embed renderer. YouTube and Vimeo render as sandboxed responsive iframes.
 * Instagram / TikTok / X render as a tasteful link-out card (v1) — upgrading to
 * full oEmbed widgets is a documented later enhancement.
 */
function parseEmbed(url: string): {
  type: "youtube" | "vimeo" | "instagram" | "tiktok" | "twitter" | "other";
  id?: string;
} {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      return { type: "youtube", id: u.searchParams.get("v") || undefined };
    }
    if (host === "youtu.be") {
      return { type: "youtube", id: u.pathname.slice(1) };
    }
    if (host === "vimeo.com") {
      return { type: "vimeo", id: u.pathname.split("/").filter(Boolean)[0] };
    }
    if (host.endsWith("instagram.com")) return { type: "instagram" };
    if (host.endsWith("tiktok.com")) return { type: "tiktok" };
    if (host === "twitter.com" || host === "x.com") return { type: "twitter" };
    return { type: "other" };
  } catch {
    return { type: "other" };
  }
}

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "X",
  other: "the web",
};

export function EmbedRenderer({
  url,
  caption,
}: {
  url: string;
  caption?: string;
}) {
  const { type, id } = parseEmbed(url);

  let frame: React.ReactNode = null;

  if (type === "youtube" && id) {
    frame = (
      <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={caption || "YouTube video"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  } else if (type === "vimeo" && id) {
    frame = (
      <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://player.vimeo.com/video/${id}`}
          title={caption || "Vimeo video"}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  } else {
    frame = (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between border border-rule p-4 hover:bg-[#fafafa] transition-colors"
      >
        <span className="kicker">View on {PLATFORM_LABEL[type] ?? "the web"}</span>
        <span aria-hidden className="text-pink">
          →
        </span>
      </a>
    );
  }

  return (
    <figure className="my-8">
      {frame}
      {caption ? (
        <figcaption className="meta mt-2">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
