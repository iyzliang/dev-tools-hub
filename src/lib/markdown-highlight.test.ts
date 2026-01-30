/**
 * Unit tests for markdown-highlight: highlightCode, getHighlightCss.
 */

import { describe, it, expect } from "vitest";
import {
  highlightCode,
  getHighlightCss,
  HIGHLIGHT_THEME_CSS,
  HIGHLIGHT_THEME_NAME,
} from "./markdown-highlight";

describe("highlightCode", () => {
  it("returns escaped plain text for empty language", () => {
    const result = highlightCode("const x = 1;", "");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.html).toContain("<pre>");
      expect(result.html).toContain("<code>");
      expect(result.html).toContain("const x = 1;");
      expect(result.language).toBe("");
    }
  });

  it("returns escaped plain text when language is undefined", () => {
    const result = highlightCode("const x = 1;");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.html).toContain("const x = 1;");
    }
  });

  it("highlights JavaScript code", () => {
    const result = highlightCode("const x = 1;", "javascript");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.language).toBe("javascript");
      expect(result.html).toContain("hljs");
      expect(result.html).toContain("language-javascript");
      expect(result.html).toContain("const");
    }
  });

  it("highlights TypeScript code", () => {
    const result = highlightCode("const n: number = 1;", "typescript");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.language).toBe("typescript");
      expect(result.html).toContain("language-typescript");
    }
  });

  it("highlights JSON code", () => {
    const result = highlightCode('{"a": 1}', "json");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.language).toBe("json");
      expect(result.html).toContain("language-json");
    }
  });

  it("highlights HTML code", () => {
    const result = highlightCode("<div>hello</div>", "html");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.language).toBe("html");
    }
  });

  it("aliases vue to html", () => {
    const result = highlightCode("<template><div>hi</div></template>", "vue");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.language).toBe("html");
      expect(result.html).toContain("language-html");
    }
  });

  it("highlights bash code", () => {
    const result = highlightCode("echo hello", "bash");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.language).toBe("bash");
    }
  });

  it("highlights shell code", () => {
    const result = highlightCode("ls -la", "shell");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.language).toBe("shell");
    }
  });

  it("highlights CSS code", () => {
    const result = highlightCode(".foo { color: red; }", "css");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.language).toBe("css");
    }
  });

  it("returns escaped plain text for unknown language", () => {
    const result = highlightCode("some text", "unknownlang");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.html).toContain("some text");
      expect(result.language).toBe("");
    }
  });

  it("escapes HTML in fallback output", () => {
    const result = highlightCode("<script>alert(1)</script>", "unknown");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.html).not.toContain("<script>");
      expect(result.html).toContain("&lt;script&gt;");
    }
  });
});

describe("getHighlightCss", () => {
  it("returns theme CSS path", () => {
    expect(getHighlightCss()).toBe(HIGHLIGHT_THEME_CSS);
    expect(HIGHLIGHT_THEME_CSS).toContain("github");
  });
});

describe("HIGHLIGHT_THEME_NAME", () => {
  it("is github", () => {
    expect(HIGHLIGHT_THEME_NAME).toBe("github");
  });
});
