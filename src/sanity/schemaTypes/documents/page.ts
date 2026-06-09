import { DocumentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const pageType = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentIcon,
  description: "Static pages such as About and Contact.",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: 'e.g. "about" → harlomagazine.com/about',
      options: { source: "title", maxLength: 96 },
      validation: (rule) =>
        rule.required().custom((slug) => {
          // Pages may use reserved segments like "about"/"contact" intentionally,
          // but not ones that would shadow dynamic app routes.
          const blocked = ["issues", "author", "search", "studio", "api"];
          if (slug?.current && blocked.includes(slug.current)) {
            return `"${slug.current}" is reserved for another section.`;
          }
          return true;
        }),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
    }),
    defineField({
      name: "seo",
      title: "SEO & social",
      type: "seo",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
