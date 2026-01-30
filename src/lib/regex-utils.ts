/**
 * Regex Utilities
 *
 * Provides regex test, replace, escape, explain and preset helpers.
 * Supports flags (g, i, m, s, u, y), match results with groups, and unified error handling.
 */

// ============================================================================
// Types
// ============================================================================

export type RegexFlagsInput = Partial<{
  g: boolean;
  i: boolean;
  m: boolean;
  s: boolean;
  u: boolean;
  y: boolean;
}>;

export interface MatchResult {
  match: string;
  index: number;
  groups: Record<string, string | undefined>;
  input: string;
}

export interface GetMatchResultsSuccess {
  ok: true;
  matches: MatchResult[];
}

export interface GetMatchResultsFailure {
  ok: false;
  error: string;
}

export type GetMatchResultsResult =
  | GetMatchResultsSuccess
  | GetMatchResultsFailure;

const MAX_INPUT_LENGTH = 500_000;

function flagsObjectToString(flags: RegexFlagsInput): string {
  const parts: string[] = [];
  if (flags.g) parts.push("g");
  if (flags.i) parts.push("i");
  if (flags.m) parts.push("m");
  if (flags.s) parts.push("s");
  if (flags.u) parts.push("u");
  if (flags.y) parts.push("y");
  return parts.join("");
}

/**
 * Build a RegExp from pattern and flags. Returns error message on invalid regex.
 */
export function buildRegex(
  pattern: string,
  flags: RegexFlagsInput = {},
): RegExp | { error: string } {
  if (pattern.length === 0) {
    return { error: "正则模式不能为空" };
  }
  const flagStr = flagsObjectToString(flags);
  try {
    return new RegExp(pattern, flagStr);
  } catch (err) {
    const message = err instanceof Error ? err.message : "无效的正则表达式";
    return { error: message };
  }
}

/**
 * Test if regex matches the string at least once.
 */
export function testRegex(regex: RegExp, str: string): boolean {
  return regex.test(str);
}

/**
 * Get all matches for regex in string. Uses global flag internally to collect every match.
 * Each result includes match, index, groups, and input.
 */
export function execAll(regex: RegExp, str: string): MatchResult[] {
  const results: MatchResult[] = [];
  const re = regex.flags.includes("g")
    ? regex
    : new RegExp(regex.source, regex.flags + "g");

  let m: RegExpExecArray | null;
  while ((m = re.exec(str)) !== null) {
    const groups: Record<string, string | undefined> = {};
    if (m.groups) {
      for (const [k, v] of Object.entries(m.groups)) {
        groups[k] = v;
      }
    }
    for (let i = 1; i < m.length; i++) {
      const key = String(i - 1);
      if (!(key in groups)) groups[key] = m[i];
    }
    results.push({
      match: m[0],
      index: m.index,
      groups,
      input: str,
    });
  }

  return results;
}

/**
 * Unified entry: build regex from pattern + flags and return all matches or error.
 */
export function getMatchResults(
  pattern: string,
  flags: RegexFlagsInput,
  input: string,
): GetMatchResultsResult {
  if (input.length > MAX_INPUT_LENGTH) {
    return { ok: false, error: "测试文本过长，请缩短后重试" };
  }
  const built = buildRegex(pattern, flags);
  if (built instanceof RegExp) {
    const matches = execAll(built, input);
    return { ok: true, matches };
  }
  return { ok: false, error: built.error };
}

// ============================================================================
// Replace
// ============================================================================

export interface ReplaceResultSuccess {
  ok: true;
  result: string;
  replaceCount: number;
}

export interface ReplaceResultFailure {
  ok: false;
  error: string;
}

export type ReplaceResult = ReplaceResultSuccess | ReplaceResultFailure;

/**
 * Replace all matches of regex in string. Supports $1-$9, $&, $`, $'.
 */
export function replaceByRegex(
  pattern: string,
  flags: RegexFlagsInput,
  source: string,
  replacement: string,
): ReplaceResult {
  const built = buildRegex(pattern, flags);
  if (built instanceof RegExp) {
    try {
      const useGlobal = built.flags.includes("g")
        ? built
        : new RegExp(built.source, built.flags + "g");
      let count = 0;
      const result = source.replace(useGlobal, (...args) => {
        count += 1;
        const full = args[0];
        const offset = args[args.length - 2];
        const input = args[args.length - 1];
        let out = replacement;
        out = out.replace(/\$&/g, full);
        out = out.replace(/\$`/g, input.slice(0, offset));
        out = out.replace(/\$'/g, input.slice(offset + full.length));
        for (let i = 1; i <= 9; i++) {
          const cap = args[i];
          if (cap !== undefined)
            out = out.replace(new RegExp(`\\$${i}`, "g"), cap);
        }
        if (args.length > 2 && typeof args[args.length - 3] === "object" && args[args.length - 3]) {
          const groups = args[args.length - 3] as Record<string, string>;
          for (const [k, v] of Object.entries(groups)) {
            if (v !== undefined)
              out = out.replace(new RegExp(`\\$<${k}>`, "g"), v);
          }
        }
        return out;
      });
      return { ok: true, result, replaceCount: count };
    } catch (err) {
      const message = err instanceof Error ? err.message : "替换失败";
      return { ok: false, error: message };
    }
  }
  return { ok: false, error: built.error };
}

// ============================================================================
// Escape / Unescape
// ============================================================================

const REGEX_SPECIAL = /[.*+?^${}()[\]|\\]/g;

/**
 * Escape special regex characters so the string matches literally.
 */
export function escapeForRegex(str: string): string {
  return str.replace(REGEX_SPECIAL, "\\$&");
}

/**
 * Unescape \\x style escapes back to literal (e.g. \\d -> d for display).
 */
export function unescapeRegex(str: string): string {
  return str.replace(/\\(.)/g, (_, c) => c);
}

// ============================================================================
// Explain (simple tokenizer)
// ============================================================================

export interface ExplainPart {
  type: string;
  raw: string;
  description: string;
}

export interface ExplainResultSuccess {
  ok: true;
  parts: ExplainPart[];
}

export interface ExplainResultFailure {
  ok: false;
  error: string;
}

export type ExplainResult = ExplainResultSuccess | ExplainResultFailure;

const ESCAPE_DESCRIPTIONS: Record<string, string> = {
  d: "数字 [0-9]",
  D: "非数字",
  w: "单词字符 [a-zA-Z0-9_]",
  W: "非单词字符",
  s: "空白字符",
  S: "非空白字符",
  b: "单词边界",
  B: "非单词边界",
  n: "换行符",
  r: "回车符",
  t: "制表符",
  "0": "空字符",
};

function describeEscape(c: string): string {
  if (ESCAPE_DESCRIPTIONS[c]) return ESCAPE_DESCRIPTIONS[c];
  return `字面量「${c}」`;
}

/**
 * Explain regex pattern into structured parts (simple tokenizer, no full AST).
 */
export function explainRegex(
  pattern: string,
  _flags: RegexFlagsInput = {},
): ExplainResult {
  if (pattern.length === 0) {
    return { ok: false, error: "正则模式不能为空" };
  }
  const built = buildRegex(pattern, _flags);
  if (!(built instanceof RegExp)) {
    return { ok: false, error: built.error };
  }

  const parts: ExplainPart[] = [];
  let i = 0;

  while (i < pattern.length) {
    const start = i;
    const c = pattern[i];

    if (c === "\\") {
      i += 1;
      if (i >= pattern.length) {
        parts.push({ type: "escape", raw: "\\", description: "反斜杠（不完整）" });
        break;
      }
      const next = pattern[i];
      i += 1;
      if (ESCAPE_DESCRIPTIONS[next] || /[dDwWsSbBnrt0]/.test(next)) {
        parts.push({
          type: "escape",
          raw: `\\${next}`,
          description: describeEscape(next),
        });
      } else {
        parts.push({
          type: "literal",
          raw: `\\${next}`,
          description: `字面量「${next}」`,
        });
      }
      continue;
    }

    if (c === "[") {
      let end = i + 1;
      let depth = 0;
      while (end < pattern.length) {
        const ch = pattern[end];
        if (ch === "\\") end += 2;
        else if (ch === "[") depth += 1;
        else if (ch === "]") {
          if (depth === 0) break;
          depth -= 1;
          end += 1;
        } else end += 1;
      }
      const raw = pattern.slice(start, end + 1);
      parts.push({
        type: "characterClass",
        raw,
        description: raw.startsWith("[^") ? "否定字符类" : "字符类",
      });
      i = end + 1;
      continue;
    }

    if (c === "(") {
      const next = pattern[i + 1];
      const isNonCapturing =
        next === "?" &&
        (pattern[i + 2] === ":" || pattern[i + 2] === "=" || pattern[i + 2] === "!");
      let end = i + 1;
      let depth = 1;
      while (end < pattern.length && depth > 0) {
        const ch = pattern[end];
        if (ch === "\\") end += 2;
        else if (ch === "(") depth += 1;
        else if (ch === ")") depth -= 1;
        end += 1;
      }
      const raw = pattern.slice(start, end);
      parts.push({
        type: "group",
        raw,
        description: isNonCapturing ? "非捕获组" : "捕获组",
      });
      i = end;
      continue;
    }

    if (c === ")" || c === "]" || c === "}") {
      parts.push({
        type: "literal",
        raw: c,
        description: `字面量「${c}」`,
      });
      i += 1;
      continue;
    }

    if (c === "^") {
      parts.push({ type: "anchor", raw: "^", description: "行首/字符串开始" });
      i += 1;
      continue;
    }
    if (c === "$") {
      parts.push({ type: "anchor", raw: "$", description: "行尾/字符串结束" });
      i += 1;
      continue;
    }

    if (c === "*" || c === "+" || c === "?") {
      parts.push({
        type: "quantifier",
        raw: c,
        description: c === "*" ? "0 次或多次" : c === "+" ? "1 次或多次" : "0 次或 1 次",
      });
      i += 1;
      continue;
    }

    if (c === "{") {
      const end = pattern.indexOf("}", i);
      const raw = end === -1 ? pattern.slice(i) : pattern.slice(start, end + 1);
      parts.push({
        type: "quantifier",
        raw,
        description: "量词（次数范围）",
      });
      i = end === -1 ? pattern.length : end + 1;
      continue;
    }

    if (c === ".") {
      parts.push({ type: "any", raw: ".", description: "任意字符（除换行）" });
      i += 1;
      continue;
    }
    if (c === "|") {
      parts.push({ type: "alternation", raw: "|", description: "或" });
      i += 1;
      continue;
    }

    parts.push({
      type: "literal",
      raw: c,
      description: `字面量「${c}」`,
    });
    i += 1;
  }

  return { ok: true, parts };
}

// ============================================================================
// Presets
// ============================================================================

export interface RegexPreset {
  id: string;
  name: string;
  pattern: string;
  description: string;
  flags?: RegexFlagsInput;
}

export const REGEX_PRESETS: RegexPreset[] = [
  {
    id: "email",
    name: "邮箱",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    description: "常见邮箱格式（仅供参考）",
  },
  {
    id: "phone-cn",
    name: "手机号（中国大陆）",
    pattern: "1[3-9]\\d{9}",
    description: "11 位手机号（仅供参考）",
  },
  {
    id: "url",
    name: "URL",
    pattern: "https?://[^\\s]+",
    description: "HTTP(S) 链接（仅供参考）",
  },
  {
    id: "ipv4",
    name: "IPv4",
    pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
    description: "IPv4 地址（仅供参考）",
  },
  {
    id: "id-card-cn",
    name: "身份证号（中国大陆）",
    pattern: "\\d{17}[0-9Xx]",
    description: "18 位身份证号（仅供参考）",
  },
  {
    id: "chinese",
    name: "中文字符",
    pattern: "[\\u4e00-\\u9fff]+",
    description: "常用汉字范围",
  },
  {
    id: "digits",
    name: "数字",
    pattern: "\\d+",
    description: "一个或多个数字",
  },
  {
    id: "blank-line",
    name: "空白行",
    pattern: "^\\s*$",
    description: "空行或仅含空白",
    flags: { m: true },
  },
];

export function getRegexPresets(): RegexPreset[] {
  return [...REGEX_PRESETS];
}
