import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

const VALID_TAGS = [
  "article",
  "issue",
  "category",
  "author",
  "page",
  "siteSettings",
] as const;

/**
 * Sanity webhook target. Configure a webhook in sanity.io/manage to POST here on
 * create/update/delete of any content type, sending the shared secret as the
 * `x-webhook-secret` header (or `?secret=`). Projection should include `_type`.
 */
export async function POST(req: NextRequest) {
  const secret =
    req.headers.get("x-webhook-secret") ||
    req.nextUrl.searchParams.get("secret");

  if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let type: string | undefined;
  try {
    const body = await req.json();
    type = body?._type;
  } catch {
    // Body optional; fall through to revalidate everything.
  }

  // Next 16: route handlers pass a cache profile; "max" purges immediately.
  if (type && (VALID_TAGS as readonly string[]).includes(type)) {
    revalidateTag(type, "max");
  } else {
    VALID_TAGS.forEach((t) => revalidateTag(t, "max"));
  }

  return NextResponse.json({
    revalidated: true,
    type: type ?? "all",
    now: Date.now(),
  });
}
