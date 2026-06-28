"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Document, Page } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import type { PageFlipApi } from "react-pageflip";

import {
  FLIPBOOK_MAX_BYTES,
  FLIPBOOK_MAX_PAGES,
  PDF_OPTIONS,
} from "./pdfSetup";
import { LazyPdfPage } from "./LazyPdfPage";

type Mode = "flip" | "scroll";

interface Props {
  url: string;
  title: string;
  allowDownload?: boolean;
  sizeBytes?: number;
}

const MAX_PAGE_WIDTH = 520;

export default function FlipbookViewer({
  url,
  title,
  allowDownload,
  sizeBytes,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlipApi>(null);

  const [numPages, setNumPages] = useState(0);
  const [aspect, setAspect] = useState(0.7727); // w/h, A4-ish default
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState<Mode>("flip");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Measure container + breakpoint.
  useEffect(() => {
    const measure = () => {
      const w = containerRef.current?.clientWidth ?? 0;
      setContainerWidth(w);
      setIsMobile(window.innerWidth < 768);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Default to the accessible scroll view when motion is reduced.
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setMode("scroll");
    }
  }, []);

  // Track fullscreen.
  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const onDocumentLoad = useCallback(
    async (pdf: {
      numPages: number;
      getPage: (n: number) => Promise<{
        getViewport: (o: { scale: number }) => { width: number; height: number };
      }>;
    }) => {
      setNumPages(pdf.numPages);
      try {
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 1 });
        if (vp.width && vp.height) setAspect(vp.width / vp.height);
      } catch {
        /* keep default aspect */
      }
      // Auto-degrade to scroll view for very large / heavy issues.
      if (
        pdf.numPages > FLIPBOOK_MAX_PAGES ||
        (sizeBytes && sizeBytes > FLIPBOOK_MAX_BYTES)
      ) {
        setMode("scroll");
      }
    },
    [sizeBytes]
  );

  // Page render width: half the container for two-page spreads, capped.
  const pageWidth = useMemo(() => {
    if (!containerWidth) return 0;
    if (isMobile) return Math.min(containerWidth, MAX_PAGE_WIDTH);
    return Math.floor(Math.min(containerWidth / 2, MAX_PAGE_WIDTH));
  }, [containerWidth, isMobile]);

  const pageHeight = useMemo(
    () => Math.round(pageWidth / aspect),
    [pageWidth, aspect]
  );

  const goPrev = useCallback(() => flipRef.current?.pageFlip().flipPrev(), []);
  const goNext = useCallback(() => flipRef.current?.pageFlip().flipNext(), []);

  // Keyboard navigation in flip mode.
  useEffect(() => {
    if (mode !== "flip") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, goPrev, goNext]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const loading = (
    <div
      className="flex items-center justify-center bg-[#f6f6f6]"
      style={{ minHeight: 360 }}
    >
      <span className="meta">Loading issue…</span>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {mode === "flip" ? (
            <>
              <ControlButton onClick={goPrev} label="Previous page">
                ‹
              </ControlButton>
              <span className="meta tabular-nums">
                {numPages ? `${currentPage + 1} / ${numPages}` : "…"}
              </span>
              <ControlButton onClick={goNext} label="Next page">
                ›
              </ControlButton>
            </>
          ) : (
            <span className="meta">{numPages} pages</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {allowDownload ? (
            <a href={url} download className="meta hover:text-pink">
              Download PDF
            </a>
          ) : null}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="meta hover:text-pink"
          >
            {isFullscreen ? "Exit fullscreen" : "Fullscreen ⤢"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="border border-rule p-8 text-center">
          <p className="mb-2">We couldn&apos;t open this issue.</p>
          <a href={url} className="meta text-pink" target="_blank" rel="noreferrer">
            Open the PDF directly →
          </a>
        </div>
      ) : (
        <Document
          file={url}
          options={PDF_OPTIONS}
          onLoadSuccess={onDocumentLoad}
          onLoadError={() => setError("load-failed")}
          loading={loading}
          error={loading}
          className="flex justify-center"
        >
          {numPages > 0 && pageWidth > 0 ? (
            mode === "flip" ? (
              <FlipBook
                key={`${pageWidth}x${pageHeight}-${isMobile}`}
                ref={flipRef}
                numPages={numPages}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
                isMobile={isMobile}
                currentPage={currentPage}
                onFlip={(p) => setCurrentPage(p)}
                title={title}
              />
            ) : (
              <div className="flex w-full flex-col items-center gap-4 py-2">
                {Array.from({ length: numPages }, (_, i) => (
                  <LazyPdfPage
                    key={i}
                    pageNumber={i + 1}
                    width={Math.min(containerWidth, 800)}
                    aspectRatio={aspect}
                  />
                ))}
              </div>
            )
          ) : null}
        </Document>
      )}
    </div>
  );
}

/* ── The flip book itself ─────────────────────────────────────────────────── */

const FlipBook = forwardRef<
  PageFlipApi,
  {
    numPages: number;
    pageWidth: number;
    pageHeight: number;
    isMobile: boolean;
    currentPage: number;
    onFlip: (page: number) => void;
    title: string;
  }
>(function FlipBook(
  { numPages, pageWidth, pageHeight, isMobile, currentPage, onFlip, title },
  ref
) {
  return (
    <HTMLFlipBook
      ref={ref}
      width={pageWidth}
      height={pageHeight}
      size="fixed"
      minWidth={200}
      maxWidth={MAX_PAGE_WIDTH}
      minHeight={300}
      maxHeight={MAX_PAGE_WIDTH * 1.6}
      showCover
      usePortrait={isMobile}
      mobileScrollSupport
      maxShadowOpacity={0.3}
      drawShadow
      flippingTime={700}
      className="harlo-flipbook"
      style={{}}
      onFlip={(e) => onFlip(e.data)}
    >
      {Array.from({ length: numPages }, (_, i) => {
        const withinWindow = Math.abs(i - currentPage) <= 3;
        return (
          <div
            key={i}
            className="bg-white overflow-hidden"
            style={{ width: pageWidth, height: pageHeight }}
          >
            {withinWindow ? (
              <Page
                pageNumber={i + 1}
                width={pageWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                loading={<PageSpinner />}
              />
            ) : (
              <PageSpinner />
            )}
            <span className="sr-only">
              {title} — page {i + 1}
            </span>
          </div>
        );
      })}
    </HTMLFlipBook>
  );
});

function PageSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f3f3f3]">
      <span className="meta">…</span>
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="h-9 w-9 border border-rule text-xl leading-none hover:bg-pink hover:text-white transition-colors"
    >
      {children}
    </button>
  );
}
