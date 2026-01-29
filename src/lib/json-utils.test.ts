import {
  formatJson,
  minifyJson,
  parseJsonWithLocation,
} from "./json-utils";

describe("parseJsonWithLocation", () => {
  it("parses valid JSON", () => {
    const result = parseJsonWithLocation<{ foo: string }>('{"foo":"bar"}');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.foo).toBe("bar");
    }
  });

  it("returns error for invalid JSON", () => {
    const result = parseJsonWithLocation("invalid json");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBeDefined();
    }
  });

  it("computes approximate error location when possible", () => {
    const source = '{\n  "foo": invalid\n}';
    const result = parseJsonWithLocation(source);

    expect(result.ok).toBe(false);
    if (!result.ok && result.error.location) {
      expect(result.error.location.line).toBeGreaterThan(0);
      expect(result.error.location.column).toBeGreaterThan(0);
    }
  });
});

describe("formatJson", () => {
  it("pretty prints JSON with indentation", () => {
    const formatted = formatJson('{"foo":1}');
    expect(formatted).toBe('{\n  "foo": 1\n}');
  });

  it("throws on invalid JSON", () => {
    expect(() => formatJson("invalid")).toThrowError();
  });
});

describe("minifyJson", () => {
  it("minifies JSON to single-line string", () => {
    const minified = minifyJson('{\n  "foo": 1\n}');
    expect(minified).toBe('{"foo":1}');
  });

  it("throws on invalid JSON", () => {
    expect(() => minifyJson("invalid")).toThrowError();
  });
});

