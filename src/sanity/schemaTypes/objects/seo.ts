import { SearchIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const seoType = defineType({
  name: "seo",
  title: "SEO & social sharing",
  type: "object",
  icon: SearchIcon,
  description:
    "Optional overrides for how this content appears in Google and when shared on social. Leave blank to use sensible defaults.",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      description:
        "Overrides the browser-tab / search-result title. Aim for under ~60 characters.",
      validation: (rule) => rule.max(70).warning("Shorter titles display better."),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 2,
      description:
        "The grey summary line under the title in Google / social cards. ~150–160 characters.",
      validation: (rule) =>
        rule.max(180).warning("Search engines truncate long descriptions."),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      description:
        "Optional. The image shown when this page is shared. Defaults to the hero/cover image. Ideal size 1200×630.",
      options: { hotspot: true },
    }),
  ],
});
