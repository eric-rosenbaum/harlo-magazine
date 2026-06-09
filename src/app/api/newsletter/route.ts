import { NextResponse, type NextRequest } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Newsletter signup proxy. Keeps the provider key server-side. Defaults to Kit
 * (ConvertKit); swap the fetch for Beehiiv if you change providers. Returns
 * actionable messages, never a bare error.
 */
export async function POST(req: NextRequest) {
  let email = "";
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json(
      { message: "Something went wrong reading your request." },
      { status: 400 }
    );
  }

  email = (email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEWSLETTER_PROVIDER_API_KEY;
  const formId = process.env.NEWSLETTER_FORM_ID;

  if (!apiKey || !formId) {
    // Not configured yet — fail gracefully so the form still "works" in dev.
    return NextResponse.json(
      {
        message:
          "Newsletter isn't connected yet. Add your provider keys to enable sign-ups.",
      },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, email }),
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: "We couldn't sign you up just now. Please try again shortly." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message: "Almost there — check your inbox to confirm your subscription.",
    });
  } catch {
    return NextResponse.json(
      { message: "Network error reaching the newsletter provider." },
      { status: 502 }
    );
  }
}
