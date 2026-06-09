import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const articleType = defineType({
  name: "article",
  title: "Article",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "Publishing" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Headline",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description:
        "The URL-safe version of the headline. Keep it stable once published.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dek",
      title: "Dek / standfirst",
      type: "text",
      rows: 2,
      group: "content",
      description: "The subtitle shown under the headline and in cards.",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      group: "content",
      description: "Determines the section and the article's URL.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "authors",
      title: "Author(s)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "author" }] }],
      group: "content",
      description: "One or more bylines.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Describe the image for screen readers and SEO.",
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
        defineField({ name: "credit", title: "Credit", type: "string" }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "content",
      description:
        "Optional short summary for cards and search. Falls back to the dek if empty.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "meta",
      description: "Controls ordering and the “x hours ago” label.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "meta",
      description: "Eligible for the homepage center hero.",
      initialValue: false,
    }),
    defineField({
      name: "trending",
      title: "Trending",
      type: "boolean",
      group: "meta",
      description: "Show this article in the homepage Trending rail.",
      initialValue: false,
    }),
    defineField({
      name: "trendingRank",
      title: "Trending rank",
      type: "number",
      group: "meta",
      description:
        "Optional. Lower numbers appear first in Trending. Leave blank to sort by date.",
      hidden: ({ parent }) => !parent?.trending,
    }),
    defineField({
      name: "relatedIssue",
      title: "Related issue",
      type: "reference",
      to: [{ type: "issue" }],
      group: "meta",
      description: 'Links this article to an issue ("Read this in Issue 0X").',
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      group: "meta",
      options: { layout: "tags" },
    }),
    defineField({
      name: "seo",
      title: "SEO & social",
      type: "seo",
      group: "seo",
    }),
  ],
  orderings: [
    {
      title: "Published, newest first",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      category: "category.title",
      media: "heroImage",
      date: "publishedAt",
    },
    prepare: ({ title, category, media, date }) => ({
      title,
      subtitle: [category, date ? new Date(date).toLocaleDateString() : null]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
