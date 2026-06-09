import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/paths";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/api", "/search"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
