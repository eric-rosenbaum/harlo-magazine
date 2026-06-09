/**
 * Centralized Sanity environment configuration.
 *
 * `projectId` falls back to a syntactically-valid placeholder so the app can be
 * built and explored before a real Sanity project is connected. Swap in the real
 * id via NEXT_PUBLIC_SANITY_PROJECT_ID (sanity.io/manage) for live content.
 */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";

/** True once a real (non-placeholder) Sanity project is configured. */
export const isSanityConfigured = projectId !== "placeholder";

/** Server-only read token for drafts / Presentation. */
export const readToken = process.env.SANITY_API_READ_TOKEN || "";

export const studioUrl = "/studio";
