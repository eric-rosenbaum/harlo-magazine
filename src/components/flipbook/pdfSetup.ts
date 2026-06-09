import { pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

/**
 * Self-host the PDF.js worker from the app bundle (never hotlink a CDN worker).
 * The bundler resolves this URL against the installed pdfjs-dist so the worker
 * version always matches react-pdf's pdfjs.
 */
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/** Documented v1 thresholds for auto-degrading to the scroll/list view. */
export const FLIPBOOK_MAX_PAGES = 80;
export const FLIPBOOK_MAX_BYTES = 40 * 1024 * 1024; // ~40MB

export const PDF_OPTIONS = {
  cMapUrl: "https://unpkg.com/pdfjs-dist@6.0.227/cmaps/",
  cMapPacked: true,
} as const;
