export interface JsonErrorLocation {
  position: number;
  line: number;
  column: number;
}

export interface JsonParseSuccess<T = unknown> {
  ok: true;
  value: T;
}

export interface JsonParseFailure {
  ok: false;
  error: {
    message: string;
    location?: JsonErrorLocation;
  };
}

export type JsonParseResult<T = unknown> =
  | JsonParseSuccess<T>
  | JsonParseFailure;

function computeLocation(source: string, position: number): JsonErrorLocation {
  let line = 1;
  let column = 1;

  for (let i = 0; i < position && i < source.length; i += 1) {
    if (source[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { position, line, column };
}

export function parseJsonWithLocation<T = unknown>(
  source: string,
): JsonParseResult<T> {
  try {
    const value = JSON.parse(source) as T;
    return { ok: true, value };
  } catch (err) {
    const error = err instanceof Error ? err : new Error("JSON 解析失败");
    let location: JsonErrorLocation | undefined;

    const match = /position\s+(\d+)/i.exec(error.message);
    if (match) {
      const pos = Number.parseInt(match[1] ?? "0", 10);
      if (Number.isFinite(pos) && pos >= 0) {
        location = computeLocation(source, pos);
      }
    }

    return {
      ok: false,
      error: {
        message: error.message,
        location,
      },
    };
  }
}

export function formatJson(source: string): string {
  const parsed = parseJsonWithLocation(source);
  if (!parsed.ok) {
    throw new Error(parsed.error.message);
  }
  return JSON.stringify(parsed.value, null, 2);
}

export function minifyJson(source: string): string {
  const parsed = parseJsonWithLocation(source);
  if (!parsed.ok) {
    throw new Error(parsed.error.message);
  }
  return JSON.stringify(parsed.value);
}

