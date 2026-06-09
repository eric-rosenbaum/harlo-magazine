"use client";

import { useEffect, useRef, useState } from "react";
import { Page } from "react-pdf";

/**
 * A PDF page that only rasterizes once it (nearly) scrolls into view. Used by the
 * scroll/list view so a 60-page issue doesn't render 60 canvases at once.
 */
export function LazyPdfPage({
  pageNumber,
  width,
  aspectRatio,
}: {
  pageNumber: number;
  width: number;
  aspectRatio: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="mx-auto bg-white shadow-sm"
      style={{ width, aspectRatio: String(aspectRatio) }}
    >
      {visible ? (
        <Page
          pageNumber={pageNumber}
          width={width}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          loading={<PageSkeleton />}
        />
      ) : (
        <PageSkeleton />
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="h-full w-full animate-pulse bg-[#efefef] flex items-center justify-center">
      <span className="meta">Loading…</span>
    </div>
  );
}
