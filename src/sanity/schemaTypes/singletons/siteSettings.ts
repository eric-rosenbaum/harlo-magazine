import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "brand", title: "Brand", default: true },
    { name: "links", title: "Links & social" },
    { name: "homepage", title: "Homepage" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    defineField({
      name: "logoWide",
      title: "Wide wordmark (header)",
      type: "image",
      group: "brand",
      description: "The longer logo shown at the top of every page. SVG or PNG.",
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "logoBadge",
      title: "Peacock badge",
      type: "image",
      group: "brand",
      description: "The badge used in the footer and as the favicon source.",
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "socials",
      title: "Social accounts",
      type: "array",
      of: [{ type: "socialLink" }],
      group: "links",
    }),
    defineField({
      name: "subscribeUrl",
      title: "Subscribe link",
      type: "url",
      group: "links",
      description:
        'Where "Subscribe / Get the magazine" points (a store, a sign-up page, or your newsletter).',
      validation: (rule) =>
        rule.uri({ scheme: ["http", "https"], allowRelative: true }),
    }),
    defineField({
      name: "newsletter",
      title: "Newsletter block",
      type: "object",
      group: "links",
      description: "Heading and blurb for the email sign-up form.",
      fields: [
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          initialValue: "Get Harlo in your inbox",
        }),
        defineField({
          name: "blurb",
          title: "Blurb",
          type: "text",
          rows: 2,
          initialValue: "The latest stories and issues, no noise.",
        }),
      ],
    }),
    defineField({
      name: "homepageHeroOverride",
      title: "Pinned homepage hero",
      type: "reference",
      to: [{ type: "article" }],
      group: "homepage",
      description:
        "Optional. Pin a specific article to the center hero. Leave blank to auto-pick the latest featured article.",
    }),
    defineField({
      name: "footer",
      title: "Footer colophon",
      type: "blockContent",
      group: "footer",
      description: "Copyright / colophon text shown at the very bottom.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
