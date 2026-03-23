import path from "path";

/**
 * Single source of truth for PDF output directory.
 * Use PDF_OUTPUT_DIR env (absolute path) if set, e.g. in dev when cwd differs per route.
 */
export const OUTPUT_DIR =
  process.env.PDF_OUTPUT_DIR?.trim() || path.resolve(process.cwd(), "output");
