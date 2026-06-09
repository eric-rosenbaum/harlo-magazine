"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterSignup({
  heading,
  blurb,
  compact = false,
}: {
  heading?: string;
  blurb?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(
          data.message ||
            "That didn't go through. Check the address and try again."
        );
        return;
      }
      setStatus("success");
      setMessage(data.message || "Almost there — check your inbox to confirm.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network hiccup. Please try again in a moment.");
    }
  }

  return (
    <div id="newsletter" className={compact ? "" : "max-w-md"}>
      {heading ? (
        <h2 className="section-title mb-2">{heading}</h2>
      ) : null}
      {blurb ? <p className="mb-4 text-muted">{blurb}</p> : null}

      {status === "success" ? (
        <p className="border border-rule p-4" role="status">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
          <div className="flex border-b border-rule">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 bg-transparent py-2 outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="kicker text-pink px-3 disabled:opacity-50"
            >
              {status === "loading" ? "…" : "Sign up"}
            </button>
          </div>
          {status === "error" ? (
            <p className="text-sm text-pink" role="alert">
              {message}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
