import type { SchemaTypeDefinition } from "sanity";

import { blockContentType } from "./objects/blockContent";
import { seoType } from "./objects/seo";
import { socialLinkType } from "./objects/socialLink";
import { articleType } from "./documents/article";
import { issueType } from "./documents/issue";
import { authorType } from "./documents/author";
import { categoryType } from "./documents/category";
import { pageType } from "./documents/page";
import { siteSettingsType } from "./singletons/siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects
  blockContentType,
  seoType,
  socialLinkType,
  // Documents
  articleType,
  issueType,
  authorType,
  categoryType,
  pageType,
  // Singleton
  siteSettingsType,
];
