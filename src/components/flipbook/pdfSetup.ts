import { pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

/**
 * Self-host the PDF.js worker (never hotlink a CDN worker). The worker file is
 * copied into /public by scripts/copy-pdf-worker.mjs (predev/prebuild/postinstall),
 * so it's served same-origin at a stable URL with a version that always matches
 * the installed pdfjs-dist. This is more reliable under Turbopack than the
 * `new URL(..., import.meta.url)` trick.
 */
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * Thresholds for auto-degrading to the scroll/list view. The byte cap is a
 * backstop, not a page-weight budget: Sanity's CDN serves `accept-ranges: bytes`,
 * so PDF.js streams only the pages being viewed rather than the whole file.
 * Real issues run 50–110MB, so a low cap here silently disabled the flipbook.
 */
export const FLIPBOOK_MAX_PAGES = 80;
export const FLIPBOOK_MAX_BYTES = 250 * 1024 * 1024; // ~250MB

// Track react-pdf's own pdfjs version so cmaps match the engine.
export const PDF_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
} as const;
