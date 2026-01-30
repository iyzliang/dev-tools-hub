/**
 * Markdown export utilities: full HTML document, .md file download, and preview HTML for copy.
 */

import { parseMarkdown } from "./markdown-utils";

const HTML_DOC_TEMPLATE = (bodyHtml: string, styleHint: string) =>
  `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Markdown Export</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/github.min.css">
  <style>${styleHint}</style>
</head>
<body>
  <div class="md-vue">${bodyHtml}</div>
</body>
</html>`;

/** Minimal Vue-style scope for exported HTML (same as markdown-editor.css vars). */
const MD_VUE_CSS_SNIPPET = `
  .md-vue { line-height: 1.7; color: #374151; }
  .md-vue h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; padding-bottom: 0.3rem; border-bottom: 1px solid #e2e8f0; }
  .md-vue h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; padding-bottom: 0.25rem; border-bottom: 1px solid #e2e8f0; }
  .md-vue h3, .md-vue h4, .md-vue h5, .md-vue h6 { font-size: 1.125rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
  .md-vue p { margin-bottom: 1rem; }
  .md-vue pre { margin-bottom: 1rem; padding: 1rem 1.25rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.5rem; overflow-x: auto; font-size: 0.875rem; }
  .md-vue :not(pre) > code { padding: 0.2em 0.4em; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.25rem; font-size: 0.875em; }
  .md-vue blockquote { margin: 1rem 0; padding: 0.5rem 0 0.5rem 1rem; border-left: 4px solid #3b82f6; background: #eff6ff; }
  .md-vue table { width: 100%; margin: 1rem 0; border-collapse: collapse; font-size: 0.875rem; }
  .md-vue th, .md-vue td { padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; }
  .md-vue th { font-weight: 600; background: #f9fafb; }
  .md-vue .vue-container { margin: 1rem 0; padding: 1rem 1.25rem; border-left: 4px solid; border-radius: 0 0.5rem 0.5rem 0; }
  .md-vue .vue-tip { border-color: #22c55e; background: #f0fdf4; }
  .md-vue .vue-warning { border-color: #f59e0b; background: #fffbeb; }
  .md-vue .vue-danger { border-color: #ef4444; background: #fef2f2; }
  .md-vue .vue-details { border-color: #8b5cf6; background: #f5f3ff; }
`;

export interface ExportHtmlSuccess {
  ok: true;
  blob: Blob;
  html: string;
}

export interface ExportHtmlFailure {
  ok: false;
  error: string;
}

export type ExportHtmlResult = ExportHtmlSuccess | ExportHtmlFailure;

/**
 * Convert Markdown to a full HTML document (with Vue-style CSS). Returns Blob for download.
 */
export function exportMarkdownAsHtml(markdown: string): ExportHtmlResult {
  const parsed = parseMarkdown(markdown);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error.message };
  }
  const fullHtml = HTML_DOC_TEMPLATE(parsed.html, MD_VUE_CSS_SNIPPET);
  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  return { ok: true, blob, html: fullHtml };
}

export interface ExportMdSuccess {
  ok: true;
  blob: Blob;
}

export interface ExportMdFailure {
  ok: false;
  error: string;
}

export type ExportMdResult = ExportMdSuccess | ExportMdFailure;

/**
 * Create a Blob for the raw Markdown file (for download).
 */
export function exportMarkdownAsFile(markdown: string): ExportMdResult {
  const blob = new Blob([markdown], {
    type: "text/markdown;charset=utf-8",
  });
  return { ok: true, blob };
}

export interface GetPreviewHtmlSuccess {
  ok: true;
  html: string;
}

export interface GetPreviewHtmlFailure {
  ok: false;
  error: string;
}

export type GetPreviewHtmlResult =
  | GetPreviewHtmlSuccess
  | GetPreviewHtmlFailure;

/**
 * Get the preview HTML fragment (with md-vue wrapper) for copying to clipboard.
 */
export function getPreviewHtmlForCopy(markdown: string): GetPreviewHtmlResult {
  const parsed = parseMarkdown(markdown);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error.message };
  }
  const wrapped = `<div class="md-vue">${parsed.html}</div>`;
  return { ok: true, html: wrapped };
}
