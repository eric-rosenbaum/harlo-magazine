import { BookIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const issueType = defineType({
  name: "issue",
  title: "Issue",
  type: "document",
  icon: BookIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "Settings" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "issueNumber",
      title: "Issue number",
      type: "string",
      group: "content",
      description: 'e.g. "01" or "Special". Text, so leading zeros are kept.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description: 'e.g. "The Pop Issue".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description: "URL for the issue, e.g. issue-01 or the-pop-issue.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      description: "Shown on the issues grid, the viewer rail, and social shares.",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pdfFile",
      title: "Issue PDF",
      type: "file",
      group: "content",
      description: "The PDF that gets rendered as the on-site flipbook.",
      options: { accept: "application/pdf" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "meta",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      group: "content",
      description: "Shown on the issue card and viewer.",
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "blockContent",
      group: "content",
      description: "Optional masthead / credits block.",
    }),
    defineField({
      name: "featuredArticles",
      title: 'Related articles ("From the Magazine")',
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      group: "content",
    }),
    defineField({
      name: "allowDownload",
      title: "Allow PDF download",
      type: "boolean",
      group: "meta",
      description:
        "If on, readers get a Download button. Off = view-only in the flipbook.",
      initialValue: false,
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
    select: { number: "issueNumber", title: "title", media: "coverImage" },
    prepare: ({ number, title, media }) => ({
      title: `Issue ${number ?? "?"} — ${title ?? ""}`,
      media,
    }),
  },
});
