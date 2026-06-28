import { PortableTextRenderer } from "./PortableTextRenderer";
import {
  PHYSICAL_COPY_URL,
  SITE_NAME,
  SUBMIT_PORTFOLIO_URL,
} from "@/lib/constants";
import type { CategoryRef, SiteSettings } from "@/lib/types";

export function Footer({
  settings,
}: {
  settings: SiteSettings | null;
  categories: CategoryRef[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rule mt-20">
      <div className="container-page py-16 flex flex-col items-center text-center gap-6">
        <a
          href={SUBMIT_PORTFOLIO_URL}
          target="_blank"
          rel="noreferrer"
          className="font-head font-extrabold uppercase tracking-tight text-pink leading-none text-3xl md:text-5xl hover:underline"
        >
          Submit your portfolio →
        </a>
        <p className="text-muted max-w-md">
          Want to get featured or work with Harlo? Send us your work.
        </p>
        <a
          href={PHYSICAL_COPY_URL}
          target="_blank"
          rel="noreferrer"
          className="section-title !text-base border border-rule px-4 py-2 hover:bg-pink hover:text-white hover:border-pink transition-colors"
        >
          Get a physical copy
        </a>
      </div>

      <div className="container-page py-6 border-t border-rule/30">
        {settings?.footer ? (
          <div className="text-sm text-muted">
            <PortableTextRenderer value={settings.footer} />
          </div>
        ) : (
          <p className="text-sm text-muted">
            © {year} {SITE_NAME}. All rights reserved.
          </p>
        )}
      </div>
    </footer>
  );
}
