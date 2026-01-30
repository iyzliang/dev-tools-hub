/**
 * Unit tests for markdown-utils: parseVueStyleContainers, parseMarkdown, markdownToHtml.
 */

import { describe, it, expect } from "vitest";
import {
  parseVueStyleContainers,
  parseMarkdown,
  markdownToHtml,
} from "./markdown-utils";

describe("parseVueStyleContainers", () => {
  it("returns empty blocks and rest for empty string", () => {
    const result = parseVueStyleContainers("");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks).toEqual([]);
      expect(result.rest).toBe("");
    }
  });

  it("returns error for non-string input", () => {
    const result = parseVueStyleContainers(
      null as unknown as string,
    ) as { ok: false; error: string };
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("parses single tip block without title", () => {
    const raw = `::: tip
content here
:::`;
    const result = parseVueStyleContainers(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0]).toMatchObject({
        type: "tip",
        content: "content here",
      });
      expect(result.blocks[0]?.title).toBeUndefined();
      expect(result.rest).toContain("<!--vue-block-0-->");
    }
  });

  it("parses single tip block with title", () => {
    const raw = `::: tip 提示
这是一段提示内容
:::`;
    const result = parseVueStyleContainers(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks[0]).toMatchObject({
        type: "tip",
        title: "提示",
        content: "这是一段提示内容",
      });
    }
  });

  it("parses warning, danger, details types", () => {
    const raw = `::: warning 注意
注意内容
:::
::: danger
危险
:::
::: details 点击展开
详情内容
:::`;
    const result = parseVueStyleContainers(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks).toHaveLength(3);
      expect(result.blocks[0]).toMatchObject({ type: "warning", title: "注意", content: "注意内容" });
      expect(result.blocks[1]).toMatchObject({ type: "danger", title: undefined, content: "危险" });
      expect(result.blocks[2]).toMatchObject({ type: "details", title: "点击展开", content: "详情内容" });
    }
  });

  it("parses multiple blocks with text between", () => {
    const raw = `# Title
::: tip
first block
:::
normal paragraph
::: warning
second block
:::`;
    const result = parseVueStyleContainers(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks).toHaveLength(2);
      expect(result.blocks[0]?.content).toBe("first block");
      expect(result.blocks[1]?.content).toBe("second block");
      expect(result.rest).toContain("# Title");
      expect(result.rest).toContain("normal paragraph");
      expect(result.rest).toContain("<!--vue-block-0-->");
      expect(result.rest).toContain("<!--vue-block-1-->");
    }
  });

  it("handles unclosed block", () => {
    const raw = `::: tip
content
no closing :::`;
    const result = parseVueStyleContainers(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0]?.content).toContain("content");
      expect(result.blocks[0]?.content).toContain("no closing :::");
    }
  });

  it("ignores invalid ::: type", () => {
    const raw = `::: unknown
content
:::`;
    const result = parseVueStyleContainers(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      // "unknown" does not match tip|warning|danger|details, so OPEN_REGEX won't match
      expect(result.blocks).toHaveLength(0);
      expect(result.rest).toBe(raw);
    }
  });

  it("allows leading whitespace before :::", () => {
    const raw = `  ::: tip
  content
  :::`;
    const result = parseVueStyleContainers(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks[0]).toMatchObject({ type: "tip", content: "  content" });
    }
  });
});

describe("parseMarkdown", () => {
  it("returns error for empty-ish or non-string", () => {
    const r = parseMarkdown(null as unknown as string);
    expect(r.ok).toBe(false);
  });

  it("parses plain markdown to html", () => {
    const raw = "# Hello\n\nWorld **bold**.";
    const result = parseMarkdown(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.html).toContain("<h1");
      expect(result.html).toContain("Hello");
      expect(result.html).toContain("<strong>bold</strong>");
      expect(result.vueBlocks).toHaveLength(0);
    }
  });

  it("parses GFM: code block, list, table", () => {
    const raw = "```js\nconst x = 1;\n```\n- a\n- b\n\n| A | B |\n|---|---|\n| 1 | 2 |";
    const result = parseMarkdown(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.html).toContain("<pre");
      expect(result.html).toContain("<code");
      expect(result.html).toContain("<ul");
      expect(result.html).toContain("<table");
    }
  });

  it("parses markdown with Vue container", () => {
    const raw = `# Doc
::: tip 提示
内容
:::
end`;
    const result = parseMarkdown(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.html).toContain("<h1");
      expect(result.vueBlocks).toHaveLength(1);
      expect(result.html).toContain('class="vue-container vue-tip"');
      expect(result.html).toContain("提示");
      expect(result.html).toContain("内容");
      expect(result.html).toContain("end");
    }
  });

  it("parses multiple Vue containers and standard markdown", () => {
    const raw = `::: warning
w1
:::
para
::: danger 危险
d1
:::`;
    const result = parseMarkdown(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.vueBlocks).toHaveLength(2);
      expect(result.html).toContain("vue-warning");
      expect(result.html).toContain("vue-danger");
      expect(result.html).toContain("危险");
      expect(result.html).toContain("para");
    }
  });

  it("rejects input exceeding max length", () => {
    const long = "x".repeat(2_000_001);
    const result = parseMarkdown(long);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("maximum length");
    }
  });

  it("handles empty input", () => {
    const result = parseMarkdown("");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.html).toBe("");
      expect(result.vueBlocks).toEqual([]);
    }
  });
});

describe("markdownToHtml", () => {
  it("returns same result as parseMarkdown", () => {
    const raw = "# Hi\n::: tip\nx\n:::";
    const r1 = parseMarkdown(raw);
    const r2 = markdownToHtml(raw);
    expect(r1.ok).toBe(r2.ok);
    if (r1.ok && r2.ok) {
      expect(r1.html).toBe(r2.html);
    }
  });
});
