import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { client } from "@/sanity/client";
import { readToken } from "@/sanity/env";

/**
 * Entry point for Sanity Presentation / preview links. Validates the signed
 * preview URL secret, enables Next.js Draft Mode, and redirects to the page.
 */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: readToken }),
});
