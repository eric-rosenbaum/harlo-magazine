import { ImageIcon, BlockquoteIcon, PlayIcon, BookIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * The rich-text body used by articles. Publishing-friendly toolbar:
 * paragraph / H2 / H3 / blockquote, bold / italic, links (internal + external),
 * plus inline images, pull quotes, embeds, and issue-link promo cards.
 */
export const blockContentType = defineType({
  name: "blockContent",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Paragraph", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            title: "Link",
            type: "object",
            icon: undefined,
            fields: [
              defineField({
                name: "linkType",
                title: "Link to",
                type: "string",
                initialValue: "external",
                options: {
                  list: [
                    { title: "External URL", value: "external" },
                    { title: "Internal page", value: "internal" },
                  ],
                  layout: "radio",
                },
              }),
              defineField({
                name: "href",
                title: "URL",
                type: "url",
                description: "External web address.",
                hidden: ({ parent }) => parent?.linkType === "internal",
                validation: (rule) =>
                  rule.uri({
                    scheme: ["http", "https", "mailto", "tel"],
                    allowRelative: false,
                  }),
              }),
              defineField({
                name: "reference",
                title: "Internal page",
                type: "reference",
                to: [
                  { type: "article" },
                  { type: "issue" },
                  { type: "page" },
                ],
                description: "Link to another article, issue, or page on Harlo.",
                hidden: ({ parent }) => parent?.linkType !== "internal",
              }),
            ],
          },
        ],
      },
    }),

    // ── Inline image ──────────────────────────────────────────────────────
    defineArrayMember({
      type: "image",
      name: "image",
      title: "Image",
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description:
            "Describe the image for screen readers and SEO. Required.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
          description: "Shown beneath the image.",
        }),
        defineField({
          name: "credit",
          title: "Credit",
          type: "string",
          description: "Photographer / source credit.",
        }),
        defineField({
          name: "size",
          title: "Display size",
          type: "string",
          initialValue: "inline",
          options: {
            list: [
              { title: "Inline (text width)", value: "inline" },
              { title: "Wide (breaks out a little)", value: "wide" },
              { title: "Full-bleed (edge to edge)", value: "full-bleed" },
            ],
            layout: "radio",
          },
        }),
      ],
    }),

    // ── Pull quote ────────────────────────────────────────────────────────
    defineArrayMember({
      type: "object",
      name: "pullQuote",
      title: "Pull quote",
      icon: BlockquoteIcon,
      fields: [
        defineField({
          name: "quote",
          title: "Quote",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "attribution",
          title: "Attribution",
          type: "string",
          description: "Who said it (optional).",
        }),
      ],
      preview: {
        select: { title: "quote", subtitle: "attribution" },
      },
    }),

    // ── Embed (oEmbed / iframe) ───────────────────────────────────────────
    defineArrayMember({
      type: "object",
      name: "embed",
      title: "Embed (YouTube, Vimeo, Instagram, TikTok, X)",
      icon: PlayIcon,
      fields: [
        defineField({
          name: "url",
          title: "URL",
          type: "url",
          description:
            "Paste the link to the video or post. Supported: YouTube, Vimeo, Instagram, TikTok, X/Twitter.",
          validation: (rule) =>
            rule.required().uri({ scheme: ["http", "https"] }),
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
        }),
      ],
      preview: {
        select: { title: "url", subtitle: "caption" },
        prepare: ({ title, subtitle }) => ({
          title: subtitle || "Embed",
          subtitle: title,
        }),
      },
    }),

    // ── Issue link promo card ─────────────────────────────────────────────
    defineArrayMember({
      type: "object",
      name: "issueLink",
      title: 'Issue promo ("Read this in Issue 0X")',
      icon: BookIcon,
      fields: [
        defineField({
          name: "issue",
          title: "Issue",
          type: "reference",
          to: [{ type: "issue" }],
          validation: (rule) => rule.required(),
        }),
      ],
      preview: {
        select: {
          number: "issue.issueNumber",
          title: "issue.title",
          media: "issue.coverImage",
        },
        prepare: ({ number, title, media }) => ({
          title: `Read this in Issue ${number ?? "?"}`,
          subtitle: title,
          media,
        }),
      },
    }),
  ],
});
