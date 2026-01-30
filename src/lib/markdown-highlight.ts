/**
 * Markdown code block syntax highlighting using highlight.js.
 * Vue-style light theme, supports JavaScript, TypeScript, Vue, HTML, CSS, JSON, Bash, Shell.
 */

import hljs from "highlight.js/lib/common";

// ============================================================================
// Types
// ============================================================================

export interface HighlightCodeResult {
  ok: true;
  html: string;
  language: string;
}

export interface HighlightCodeError {
  ok: false;
  html: string;
  /** Escaped plain text when language is unknown */
  language: "";
}

export type HighlightCodeOutput = HighlightCodeResult | HighlightCodeError;

/** Language alias: Vue template → HTML highlighting */
const LANGUAGE_ALIASES: Record<string, string> = {
  vue: "html",
  vb: "html",
  sh: "shell",
};

/**
 * Default theme CSS path (github style, light). Import in app:
 * import 'highlight.js/styles/github.css'
 */
export const HIGHLIGHT_THEME_CSS = "highlight.js/styles/github.css";

/**
 * Theme name for documentation / dynamic load.
 */
export const HIGHLIGHT_THEME_NAME = "github";

// ============================================================================
// highlightCode
// ============================================================================

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Highlight code string with optional language. Returns HTML with hljs class names.
 * Unknown language falls back to escaped plain text.
 */
export function highlightCode(
  code: string,
  language?: string,
): HighlightCodeOutput {
  const lang = (language ?? "").trim().toLowerCase();
  const resolved =
    lang.length > 0 && LANGUAGE_ALIASES[lang]
      ? LANGUAGE_ALIASES[lang]
      : lang;

  if (resolved.length === 0) {
    return {
      ok: false,
      html: `<pre><code>${escapeHtml(code)}</code></pre>`,
      language: "",
    };
  }

  try {
    const langDef = hljs.getLanguage(resolved);
    if (!langDef) {
      return {
        ok: false,
        html: `<pre><code>${escapeHtml(code)}</code></pre>`,
        language: "",
      };
    }

    const result = hljs.highlight(code, {
      language: resolved,
      ignoreIllegals: true,
    });

    const blockHtml = `<pre><code class="language-${resolved} hljs">${result.value}</code></pre>`;
    return {
      ok: true,
      html: blockHtml,
      language: resolved,
    };
  } catch {
    return {
      ok: false,
      html: `<pre><code>${escapeHtml(code)}</code></pre>`,
      language: "",
    };
  }
}

/**
 * Returns CSS path for the default highlight theme. Use in app:
 * - Next.js: add to globals or component: import 'highlight.js/styles/github.css'
 * - Or document HIGHLIGHT_THEME_CSS for manual link
 */
export function getHighlightCss(): string {
  return HIGHLIGHT_THEME_CSS;
}
