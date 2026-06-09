"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

export function SearchBox({
  initialQuery = "",
  autoFocus = false,
  onSubmitted,
  placeholder = "Search Harlo…",
}: {
  initialQuery?: string;
  autoFocus?: boolean;
  onSubmitted?: () => void;
  placeholder?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const id = useId();

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        if (!query) return;
        router.push(`/search?q=${encodeURIComponent(query)}`);
        onSubmitted?.();
      }}
      className="flex items-center border-b border-rule"
    >
      <label htmlFor={id} className="sr-only">
        Search
      </label>
      <input
        id={id}
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent py-2 outline-none placeholder:text-muted font-body"
      />
      <button type="submit" className="kicker text-pink px-2 py-1">
        Go
      </button>
    </form>
  );
}
