// Copies the PDF.js worker into /public so the flipbook loads it from a stable
// same-origin URL (/pdf.worker.min.mjs). Crucially, it resolves the worker from
// the pdfjs-dist that *react-pdf* actually uses, so the worker version can never
// drift from react-pdf's bundled API version (a mismatch breaks every PDF).
// Runs on install + before dev/build.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

let src;
try {
  const reactPdfDir = dirname(require.resolve("react-pdf/package.json"));
  src = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs", {
    paths: [reactPdfDir],
  });
} catch {
  console.warn("[copy-pdf-worker] could not resolve react-pdf's worker yet, skipping.");
  process.exit(0);
}

const destDir = resolve(root, "public");
const dest = resolve(destDir, "pdf.worker.min.mjs");
if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`[copy-pdf-worker] copied ${src} → public/pdf.worker.min.mjs`);
