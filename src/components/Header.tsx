"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SocialIcons } from "./SocialIcons";
import { SearchBox } from "./SearchBox";
import { urlForImage } from "@/sanity/image";
import {
  accentHex,
  PHYSICAL_COPY_URL,
  SUBMIT_PORTFOLIO_URL,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CategoryRef, SiteSettings } from "@/lib/types";

export function Header({
  settings,
  categories,
}: {
  settings: SiteSettings | null;
  categories: CategoryRef[];
}) {
  const pathname = usePathname();
  const [condensed, setCondensed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const navItems = [
    ...categories.map((c) => ({
      label: c.title,
      href: `/${c.slug}`,
      accent: accentHex(c.accentColor),
      match: pathname === `/${c.slug}` || pathname.startsWith(`/${c.slug}/`),
    })),
    {
      label: "Issues",
      href: "/issues",
      accent: accentHex("blue"),
      match: pathname.startsWith("/issues"),
    },
    {
      label: "About",
      href: "/about",
      accent: accentHex("pink"),
      match: pathname === "/about",
    },
  ];

  const logo = settings?.logoWide;
  const logoSrc = logo?.asset ? urlForImage(logo).width(600).url() : null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-rule">
      {/* Utility row */}
      <div
        className={cn(
          "border-b border-rule/10 transition-all",
          condensed ? "hidden md:block" : "block"
        )}
      >
        <div className="container-page flex items-center justify-between py-1.5">
          {/* Mobile: socials left */}
          <div className="md:hidden">
            <SocialIcons socials={settings?.socials} />
          </div>
          {/* Mobile: Issues right */}
          <Link
            href="/issues"
            className="section-title !text-pink !text-sm md:hidden"
          >
            Issues
          </Link>

          {/* Desktop: social icons + submit / physical links */}
          <div className="hidden md:block">
            <SocialIcons socials={settings?.socials} />
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a
              href={SUBMIT_PORTFOLIO_URL}
              target="_blank"
              rel="noreferrer"
              className="meta hover:text-pink"
            >
              Submit portfolio
            </a>
            <a
              href={PHYSICAL_COPY_URL}
              target="_blank"
              rel="noreferrer"
              className="meta hover:text-pink"
            >
              Physical copy
            </a>
          </div>
        </div>
      </div>

      {/* Brand + nav */}
      <div className="container-page">
        <div
          className={cn(
            "flex items-center justify-between gap-4 transition-all",
            condensed ? "py-2" : "py-3 md:py-5"
          )}
        >
          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-3 -ml-3 rounded touch-manipulation active:bg-pink/20"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            onPointerUp={() => setMenuOpen(true)}
          >
            <span className="block w-6 h-0.5 bg-ink mb-1.5" />
            <span className="block w-6 h-0.5 bg-ink mb-1.5" />
            <span className="block w-6 h-0.5 bg-ink" />
          </button>

          {/* Wordmark */}
          <Link
            href="/"
            className="flex-1 md:flex-none flex justify-center md:justify-center md:absolute md:left-1/2 md:-translate-x-1/2"
            aria-label="Harlo Magazine home"
          >
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt={logo?.alt || "Harlo"}
                className={cn(
                  "w-auto transition-all object-contain",
                  condensed ? "h-7 md:h-9" : "h-9 md:h-16"
                )}
              />
            ) : (
              <span
                className={cn(
                  "font-head font-extrabold uppercase text-pink tracking-tight transition-all leading-none",
                  condensed ? "text-2xl md:text-3xl" : "text-3xl md:text-5xl"
                )}
              >
                Harlo
              </span>
            )}
          </Link>

          {/* Search toggle (desktop right) */}
          <button
            type="button"
            className="p-2 -mr-2 md:ml-auto"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <SearchIcon />
          </button>
        </div>

        {/* Desktop nav row */}
        <nav
          aria-label="Primary"
          className={cn(
            "hidden md:flex items-center justify-center gap-8 transition-all",
            condensed ? "pb-2" : "pb-3"
          )}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="section-title !text-pink relative py-1"
              style={{ fontSize: condensed ? "0.95rem" : "1.05rem" }}
            >
              {item.label}
              {item.match ? (
                <span
                  className="absolute left-0 right-0 -bottom-0.5 h-[3px]"
                  style={{ background: item.accent }}
                />
              ) : null}
            </Link>
          ))}
        </nav>

        {/* Expanding search field */}
        {searchOpen ? (
          <div className="pb-3">
            <SearchBox autoFocus onSubmitted={() => setSearchOpen(false)} />
          </div>
        ) : null}
      </div>
      </header>

      {/* Mobile overlay menu — rendered outside <header> so its fixed
          positioning is relative to the viewport, not the header's
          backdrop-filter containing block. */}
      {menuOpen ? (
        <MobileMenu
          navItems={navItems}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
    </>
  );
}

function MobileMenu({
  navItems,
  onClose,
}: {
  navItems: { label: string; href: string }[];
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col md:hidden"
      style={{ background: "#ffffff" }}
    >
      <div className="container-page flex items-center justify-between py-3 border-b border-rule">
        <span className="font-head font-extrabold uppercase text-pink text-2xl">
          Harlo
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="p-2 -mr-2 text-3xl leading-none"
        >
          ×
        </button>
      </div>
      <nav
        aria-label="Mobile"
        className="container-page flex flex-col gap-5 py-8 flex-1"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="section-title !text-pink text-2xl"
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-6">
          <SearchBox onSubmitted={onClose} />
        </div>
      </nav>
      <div className="container-page py-6 border-t border-rule flex flex-col gap-3">
        <a
          href={SUBMIT_PORTFOLIO_URL}
          target="_blank"
          rel="noreferrer"
          onClick={onClose}
          className="section-title !text-pink"
        >
          Submit portfolio
        </a>
        <a
          href={PHYSICAL_COPY_URL}
          target="_blank"
          rel="noreferrer"
          onClick={onClose}
          className="meta hover:text-pink"
        >
          Get a physical copy
        </a>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
