import { describe, it, expect } from "vitest";
import {
  buildRegex,
  testRegex,
  execAll,
  getMatchResults,
  replaceByRegex,
  escapeForRegex,
  unescapeRegex,
  explainRegex,
  getRegexPresets,
  REGEX_PRESETS,
} from "./regex-utils";

describe("buildRegex", () => {
  it("returns RegExp for valid pattern", () => {
    const r = buildRegex("\\d+");
    expect(r instanceof RegExp).toBe(true);
    if (r instanceof RegExp) expect(r.source).toBe("\\d+");
  });

  it("returns error for empty pattern", () => {
    const r = buildRegex("");
    expect(r).toEqual({ error: "正则模式不能为空" });
  });

  it("returns error for invalid regex", () => {
    const r = buildRegex("(unclosed");
    expect(r).toHaveProperty("error");
    expect((r as { error: string }).error.length).toBeGreaterThan(0);
  });

  it("applies flags", () => {
    const r = buildRegex("a", { i: true });
    expect(r instanceof RegExp).toBe(true);
    if (r instanceof RegExp) expect(r.flags).toContain("i");
  });
});

describe("testRegex", () => {
  it("returns true when match", () => {
    const r = buildRegex("\\d+");
    expect(r instanceof RegExp).toBe(true);
    if (r instanceof RegExp) {
      expect(testRegex(r, "abc123")).toBe(true);
      expect(testRegex(r, "xyz")).toBe(false);
    }
  });
});

describe("execAll", () => {
  it("returns all matches with groups", () => {
    const r = buildRegex("(\\d+)([a-z]+)", { g: true });
    expect(r instanceof RegExp).toBe(true);
    if (r instanceof RegExp) {
      const matches = execAll(r, "1ab 2cd");
      expect(matches).toHaveLength(2);
      expect(matches[0].match).toBe("1ab");
      expect(matches[0].index).toBe(0);
      expect(matches[0].groups["0"]).toBe("1");
      expect(matches[0].groups["1"]).toBe("ab");
      expect(matches[1].match).toBe("2cd");
    }
  });

  it("returns all matches even when regex has no g flag", () => {
    const r = buildRegex("\\d+");
    expect(r instanceof RegExp).toBe(true);
    if (r instanceof RegExp) {
      const matches = execAll(r, "a1b2c");
      expect(matches).toHaveLength(2);
      expect(matches[0].match).toBe("1");
      expect(matches[1].match).toBe("2");
    }
  });

  it("returns empty array when no match", () => {
    const r = buildRegex("x+", { g: true });
    expect(r instanceof RegExp).toBe(true);
    if (r instanceof RegExp) {
      const matches = execAll(r, "abc");
      expect(matches).toHaveLength(0);
    }
  });
});

describe("getMatchResults", () => {
  it("returns matches for valid pattern", () => {
    const result = getMatchResults("\\d+", {}, "a1b22c");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matches).toHaveLength(2);
      expect(result.matches[0].match).toBe("1");
      expect(result.matches[1].match).toBe("22");
    }
  });

  it("returns error for invalid pattern", () => {
    const result = getMatchResults("(invalid", {}, "text");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
  });

  it("returns error for too long input", () => {
    const result = getMatchResults("a", {}, "x".repeat(500_001));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("过长");
  });
});

describe("replaceByRegex", () => {
  it("replaces all with global flag", () => {
    const result = replaceByRegex("\\d+", { g: true }, "a1b2c3", "X");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result).toBe("aXbXcX");
      expect(result.replaceCount).toBe(3);
    }
  });

  it("replaces $1 and $&", () => {
    const result = replaceByRegex(
      "(\\d+)",
      { g: true },
      "a1b2",
      "[$1]($&)",
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result).toBe("a[1](1)b[2](2)");
    }
  });

  it("returns error for invalid pattern", () => {
    const result = replaceByRegex("(x", {}, "text", "y");
    expect(result.ok).toBe(false);
  });
});

describe("escapeForRegex", () => {
  it("escapes special characters", () => {
    expect(escapeForRegex(".*+?^${}()[]|\\")).toBe(
      "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\[\\]\\|\\\\",
    );
  });

  it("leaves normal chars unchanged", () => {
    expect(escapeForRegex("abc123")).toBe("abc123");
  });
});

describe("unescapeRegex", () => {
  it("unescapes backslash sequences", () => {
    expect(unescapeRegex("\\d\\s")).toBe("ds");
  });

  it("leaves non-escape unchanged", () => {
    expect(unescapeRegex("ab")).toBe("ab");
  });
});

describe("explainRegex", () => {
  it("returns parts for simple pattern", () => {
    const result = explainRegex("\\d+");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.parts.length).toBeGreaterThan(0);
      const types = result.parts.map((p) => p.type);
      expect(types).toContain("escape");
      expect(types).toContain("quantifier");
    }
  });

  it("returns error for invalid pattern", () => {
    const result = explainRegex("(unclosed");
    expect(result.ok).toBe(false);
  });

  it("returns error for empty pattern", () => {
    const result = explainRegex("");
    expect(result.ok).toBe(false);
  });

  it("identifies character class", () => {
    const result = explainRegex("[a-z]");
    expect(result.ok).toBe(true);
    if (result.ok) {
      const cc = result.parts.find((p) => p.type === "characterClass");
      expect(cc).toBeDefined();
    }
  });
});

describe("getRegexPresets", () => {
  it("returns non-empty array", () => {
    const presets = getRegexPresets();
    expect(Array.isArray(presets)).toBe(true);
    expect(presets.length).toBeGreaterThan(0);
  });

  it("each preset has id, name, pattern, description", () => {
    const presets = getRegexPresets();
    for (const p of presets) {
      expect(p).toHaveProperty("id");
      expect(p).toHaveProperty("name");
      expect(p).toHaveProperty("pattern");
      expect(p).toHaveProperty("description");
    }
  });

  it("presets are same as REGEX_PRESETS", () => {
    expect(getRegexPresets()).toEqual(REGEX_PRESETS);
  });
});
