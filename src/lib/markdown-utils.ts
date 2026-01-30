/**
 * Markdown Utilities
 *
 * Parses Markdown with GFM support and VuePress-style custom containers
 * (::: tip / warning / danger / details). Provides parseMarkdown, parseVueStyleContainers,
 * and markdownToHtml for rendering. Code blocks are syntax-highlighted via markdown-highlight.
 */

import { marked } from "marked";
import { highlightCode } from "./markdown-highlight";

marked.use({
  renderer: {
    code({ text, lang }: { text?: string; lang?: string }) {
      const result = highlightCode(text ?? "", lang ?? undefined);
      return result.html;
    },
  },
});

// ============================================================================
// Types
// ============================================================================

export type VueContainerType = "tip" | "warning" | "danger" | "details";

export interface VueStyleBlock {
  type: VueContainerType;
  title?: string;
  content: string;
  /** Start index in original string (for debugging) */
  startIndex?: number;
  /** End index in original string */
  endIndex?: number;
}

export interface MarkdownParseResultSuccess {
  ok: true;
  /** HTML string from standard Markdown (GFM), with placeholders for Vue blocks */
  html: string;
  /** Extracted Vue-style blocks in order (placeholders in html reference these by index) */
  vueBlocks: VueStyleBlock[];
  /** Raw string with Vue blocks replaced by placeholders (what was passed to marked) */
  rawWithPlaceholders: string;
}

export interface MarkdownParseResultFailure {
  ok: false;
  error: {
    message: string;
    /** Optional position/location for UI */
    position?: number;
  };
}

export type MarkdownParseResult =
  | MarkdownParseResultSuccess
  | MarkdownParseResultFailure;

export interface ParseVueContainersSuccess {
  ok: true;
  blocks: VueStyleBlock[];
  /** Text with Vue blocks replaced by placeholders (e.g. <!--vue-block-0-->). Same length-ish for simple substitution. */
  rest: string;
}

export interface ParseVueContainersFailure {
  ok: false;
  error: string;
}

export type ParseVueContainersResult =
  | ParseVueContainersSuccess
  | ParseVueContainersFailure;

const OPEN_REGEX = /^\s*:::\s*(tip|warning|danger|details)\s*(.*)$/;
const CLOSE_REGEX = /^\s*:::\s*$/;

// ============================================================================
// Vue-style container parsing
// ============================================================================

/**
 * Parse VuePress-style custom containers (::: tip / warning / danger / details)
 * from raw Markdown. Returns blocks and the rest of the text with placeholders.
 */
export function parseVueStyleContainers(
  raw: string,
): ParseVueContainersResult {
  if (typeof raw !== "string") {
    return { ok: false, error: "Input must be a string" };
  }

  const blocks: VueStyleBlock[] = [];
  const lines = raw.split(/\r?\n/);
  const restLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const openMatch = lines[i]?.match(OPEN_REGEX);
    if (openMatch) {
      const type = openMatch[1] as VueContainerType;
      const titleLine = openMatch[2]?.trim() ?? "";
      const title = titleLine.length > 0 ? titleLine : undefined;
      i += 1;

      const contentLines: string[] = [];
      let closed = false;

      while (i < lines.length) {
        if (CLOSE_REGEX.test(lines[i] ?? "")) {
          closed = true;
          i += 1;
          break;
        }
        // Another opening ::: without closing - treat as unclosed block and push current content
        const nextOpen = lines[i]?.match(OPEN_REGEX);
        if (nextOpen) {
          break;
        }
        contentLines.push(lines[i] ?? "");
        i += 1;
      }

      blocks.push({
        type,
        title,
        content: contentLines.join("\n"),
      });

      const placeholder = `<!--vue-block-${blocks.length - 1}-->`;
      restLines.push(placeholder);

      if (!closed) {
        // Unclosed block: we already consumed lines into content; rest of doc continues
      }
      continue;
    }

    restLines.push(lines[i] ?? "");
    i += 1;
  }

  return {
    ok: true,
    blocks,
    rest: restLines.join("\n"),
  };
}

// ============================================================================
// Markdown parsing (GFM) with marked
// ============================================================================

const MAX_INPUT_LENGTH = 2_000_000;

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Render a single Vue-style block to HTML (wrapper div with class).
 * details type uses <details>/<summary> for native collapse.
 */
function renderVueBlockToHtml(block: VueStyleBlock): string {
  const typeClass = `vue-${block.type}`;
  const contentRaw = block.content.trim();
  const contentHtml =
    contentRaw.length > 0
      ? marked.parse(contentRaw, { async: false }) as string
      : "";

  if (block.type === "details") {
    const summaryText =
      block.title != null && block.title.length > 0
        ? escapeHtml(block.title)
        : "详情";
    return `<details class="vue-container ${typeClass}"><summary class="vue-container-title">${summaryText}</summary>${contentHtml}</details>`;
  }

  const titleHtml =
    block.title != null && block.title.length > 0
      ? `<p class="vue-container-title"><strong>${escapeHtml(block.title)}</strong></p>`
      : "";
  return `<div class="vue-container ${typeClass}">${titleHtml}${contentHtml}</div>`;
}

/**
 * Parse full Markdown string: extract Vue containers, parse rest with GFM,
 * return HTML with Vue blocks rendered and merged.
 */
export function parseMarkdown(raw: string): MarkdownParseResult {
  if (typeof raw !== "string") {
    return {
      ok: false,
      error: { message: "Input must be a string" },
    };
  }

  if (raw.length > MAX_INPUT_LENGTH) {
    return {
      ok: false,
      error: {
        message: `Input exceeds maximum length (${MAX_INPUT_LENGTH} characters)`,
      },
    };
  }

  const vueResult = parseVueStyleContainers(raw);
  if (!vueResult.ok) {
    return { ok: false, error: { message: vueResult.error } };
  }

  const { blocks, rest } = vueResult;

  try {
    const htmlFromMarked = marked.parse(rest, {
      async: false,
      gfm: true,
      breaks: true,
    }) as string;

    let finalHtml = htmlFromMarked;
    for (let i = 0; i < blocks.length; i++) {
      const placeholder = `<!--vue-block-${i}-->`;
      const blockHtml = renderVueBlockToHtml(blocks[i] ?? { type: "tip", content: "" });
      finalHtml = finalHtml.replace(placeholder, blockHtml);
    }

    return {
      ok: true,
      html: finalHtml,
      vueBlocks: blocks,
      rawWithPlaceholders: rest,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Markdown parse failed";
    return {
      ok: false,
      error: { message },
    };
  }
}

/**
 * Convert Markdown to full HTML string (convenience wrapper around parseMarkdown).
 */
export function markdownToHtml(raw: string): MarkdownParseResult {
  return parseMarkdown(raw);
}
