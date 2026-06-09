import {
  CogIcon,
  DocumentTextIcon,
  BookIcon,
  UserIcon,
  TagIcon,
  DocumentIcon,
} from "@sanity/icons";
import type { StructureResolver } from "sanity/structure";

/**
 * Task-oriented Studio sidebar for the editor:
 * Articles · Issues · Authors · Categories · Pages · (pinned) Site Settings.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Harlo")
    .items([
      S.listItem()
        .title("Articles")
        .icon(DocumentTextIcon)
        .child(
          S.documentTypeList("article")
            .title("Articles")
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
        ),
      S.listItem()
        .title("Issues")
        .icon(BookIcon)
        .child(
          S.documentTypeList("issue")
            .title("Issues")
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
        ),
      S.documentTypeListItem("author").title("Authors").icon(UserIcon),
      S.documentTypeListItem("category").title("Categories").icon(TagIcon),
      S.documentTypeListItem("page").title("Pages").icon(DocumentIcon),
      S.divider(),
      S.listItem()
        .title("Site Settings")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site Settings")
        ),
    ]);
