import type { SVGProps } from "react";

import type { SocialLink } from "@/lib/types";

const iconProps: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
};

function InstagramIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.86s0 3.6-.07 4.86c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.9.07s-3.63 0-4.9-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.86c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.5.01-4.74.07-.9.04-1.38.19-1.7.32-.43.16-.74.36-1.06.68-.32.32-.52.63-.68 1.06-.13.32-.28.8-.32 1.7C3.21 8.5 3.2 8.85 3.2 12s.01 3.5.07 4.74c.04.9.19 1.38.32 1.7.16.43.36.74.68 1.06.32.32.63.52 1.06.68.32.13.8.28 1.7.32 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.9-.04 1.38-.19 1.7-.32.43-.16.74-.36 1.06-.68.32-.32.52-.63.68-1.06.13-.32.28-.8.32-1.7.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.04-.9-.19-1.38-.32-1.7a2.85 2.85 0 0 0-.68-1.06 2.85 2.85 0 0 0-1.06-.68c-.32-.13-.8-.28-1.7-.32C15.5 4.01 15.15 4 12 4Zm0 3.06A4.94 4.94 0 1 1 12 17a4.94 4.94 0 0 1 0-9.88Zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28Zm5.15-1.15a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg {...iconProps}>
      <path d="M18.9 2.5h3.3l-7.2 8.2L23.6 21.5h-6.6l-5.2-6.8-6 6.8H2.5l7.7-8.8L1.9 2.5h6.8l4.7 6.2 5.5-6.2Zm-1.2 17h1.8L7.1 4.4H5.2L17.7 19.5Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg {...iconProps}>
      <path d="M16.5 3c.3 2 1.5 3.7 3.5 4.2v2.6c-1.3.1-2.6-.2-3.7-.8v5.6a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.06v2.7a2.9 2.9 0 1 0 2 2.78V3h2.9Z" />
    </svg>
  );
}

const ICONS: Record<string, () => React.ReactElement> = {
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  tiktok: TikTokIcon,
};

const LABELS: Record<string, string> = {
  instagram: "Instagram",
  twitter: "X (Twitter)",
  tiktok: "TikTok",
};

export function SocialIcons({
  socials,
  className,
}: {
  socials?: SocialLink[];
  className?: string;
}) {
  if (!socials?.length) return null;
  return (
    <ul className={className} style={{ display: "flex", gap: "0.9rem" }}>
      {socials.map((s) => {
        const Icon = ICONS[s.platform];
        if (!Icon) return null;
        return (
          <li key={s.platform + s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={LABELS[s.platform] ?? s.platform}
              className="text-ink transition-colors hover:text-pink"
            >
              <Icon />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
