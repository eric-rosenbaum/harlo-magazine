import Link from "next/link";

import { SocialIcons } from "./SocialIcons";
import { NewsletterSignup } from "./NewsletterSignup";
import { PortableTextRenderer } from "./PortableTextRenderer";
import { urlForImage } from "@/sanity/image";
import { SITE_NAME } from "@/lib/constants";
import type { CategoryRef, SiteSettings } from "@/lib/types";

export function Footer({
  settings,
  categories,
}: {
  settings: SiteSettings | null;
  categories: CategoryRef[];
}) {
  const badge = settings?.logoBadge;
  const badgeSrc = badge?.asset ? urlForImage(badge).width(240).url() : null;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rule mt-20">
      <div className="container-page py-14 grid gap-12 md:grid-cols-[1fr_1fr_1.2fr]">
        {/* Badge + nav */}
        <div>
          {badgeSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={badgeSrc}
              alt={badge?.alt || "Harlo peacock badge"}
              className="h-20 w-auto mb-6"
            />
          ) : (
            <span className="font-head font-extrabold uppercase text-pink text-3xl block mb-6">
              Harlo
            </span>
          )}
          <nav aria-label="Footer" className="flex flex-col gap-2">
            {categories.map((c) => (
              <Link
                key={c._id}
                href={`/${c.slug}`}
                className="meta hover:text-pink"
              >
                {c.title}
              </Link>
            ))}
            <Link href="/issues" className="meta hover:text-pink">
              Issues
            </Link>
            <Link href="/about" className="meta hover:text-pink">
              About
            </Link>
            <Link href="/contact" className="meta hover:text-pink">
              Contact
            </Link>
          </nav>
        </div>

        {/* Social + subscribe */}
        <div className="flex flex-col gap-5">
          <SocialIcons socials={settings?.socials} />
          {settings?.subscribeUrl ? (
            <a
              href={settings.subscribeUrl}
              className="section-title !text-pink !text-base hover:underline"
            >
              Get the magazine →
            </a>
          ) : null}
        </div>

        {/* Newsletter */}
        <div>
          <NewsletterSignup
            heading={settings?.newsletter?.heading || "Get Harlo in your inbox"}
            blurb={
              settings?.newsletter?.blurb ||
              "The latest stories and issues, no noise."
            }
          />
        </div>
      </div>

      <div className="container-page py-6 border-t border-rule/30 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        {settings?.footer ? (
          <div className="text-sm text-muted">
            <PortableTextRenderer value={settings.footer} />
          </div>
        ) : (
          <p className="text-sm text-muted">
            © {year} {SITE_NAME}. All rights reserved.
          </p>
        )}
        <Link href="/studio" className="meta hover:text-pink">
          Editor login
        </Link>
      </div>
    </footer>
  );
}
