import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { RESERVED_SLUGS } from "../../../lib/constants";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'Section name shown in the nav, e.g. "Music".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "The URL segment for this section (e.g. music → harlomagazine.com/music).",
      options: {
        source: "title",
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) =>
        rule.required().custom((slug) => {
          if (slug?.current && RESERVED_SLUGS.includes(slug.current)) {
            return `"${slug.current}" is a reserved word and can't be a category slug.`;
          }
          return true;
        }),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      description: "Optional intro shown at the top of the category page.",
    }),
    defineField({
      name: "accentColor",
      title: "Accent color",
      type: "string",
      description:
        "The brand accent used for this section's eyebrows, underlines and hovers.",
      initialValue: "pink",
      options: {
        list: [
          { title: "Hot Pink", value: "pink" },
          { title: "Orange", value: "orange" },
          { title: "Yellow", value: "yellow" },
          { title: "Lime", value: "lime" },
          { title: "Neon Blue", value: "blue" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "navOrder",
      title: "Nav order",
      type: "number",
      description: "Lower numbers appear first in the navigation.",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
