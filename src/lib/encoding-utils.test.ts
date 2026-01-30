import { describe, it, expect } from "vitest";
import {
  encodeToUnicodeEscaped,
  decodeFromUnicodeEscaped,
  encodeToUrlEncoded,
  decodeFromUrlEncoded,
  encodeToHexEscaped,
  decodeFromHexEscaped,
  encodeBase64Text,
  decodeBase64Text,
  md5Hash,
  sha1HashAsync,
  encodeHtmlDeep,
  decodeHtmlEntities,
  parseQueryString,
  decodeJwtPayload,
} from "./encoding-utils";

describe("encoding-utils", () => {
  describe("Unicode", () => {
    it("encodes to \\uXXXX", () => {
      expect(encodeToUnicodeEscaped("a")).toBe("\\u0061");
      expect(encodeToUnicodeEscaped("AB")).toBe("\\u0041\\u0042");
      expect(encodeToUnicodeEscaped("")).toBe("");
    });
    it("decodes from \\uXXXX", () => {
      expect(decodeFromUnicodeEscaped("\\u0061")).toEqual({ ok: true, value: "a" });
      expect(decodeFromUnicodeEscaped("\\u0041\\u0042")).toEqual({ ok: true, value: "AB" });
      expect(decodeFromUnicodeEscaped("")).toEqual({ ok: true, value: "" });
    });
    it("round-trips", () => {
      const s = "hello 世界";
      const enc = encodeToUnicodeEscaped(s);
      const dec = decodeFromUnicodeEscaped(enc);
      expect(dec.ok).toBe(true);
      if (dec.ok) expect(dec.value).toBe(s);
    });
  });

  describe("URL", () => {
    it("encodes and decodes", () => {
      const s = "a b+c";
      expect(encodeToUrlEncoded(s)).toBe(encodeURIComponent(s));
      expect(decodeFromUrlEncoded(encodeToUrlEncoded(s))).toEqual({ ok: true, value: s });
    });
  });

  describe("Hex / UTF16", () => {
    it("encodes to \\xXX", () => {
      expect(encodeToHexEscaped("a")).toBe("\\x61");
      expect(encodeToHexEscaped("AB")).toBe("\\x41\\x42");
    });
    it("decodes from \\xXX", () => {
      expect(decodeFromHexEscaped("\\x61")).toEqual({ ok: true, value: "a" });
      expect(decodeFromHexEscaped("\\x41\\x42")).toEqual({ ok: true, value: "AB" });
    });
    it("round-trips UTF-8", () => {
      const s = "中文";
      const enc = encodeToHexEscaped(s);
      const dec = decodeFromHexEscaped(enc);
      expect(dec.ok).toBe(true);
      if (dec.ok) expect(dec.value).toBe(s);
    });
  });

  describe("Base64", () => {
    it("encodes and decodes", () => {
      expect(encodeBase64Text("a")).toEqual({ ok: true, value: "YQ==" });
      expect(decodeBase64Text("YQ==")).toEqual({ ok: true, value: "a" });
      expect(encodeBase64Text("")).toEqual({ ok: true, value: "" });
      expect(decodeBase64Text("")).toEqual({ ok: false, error: "Empty Base64" });
    });
    it("rejects invalid Base64", () => {
      expect(decodeBase64Text("YQ==!")).toEqual({ ok: false, error: "Invalid Base64" });
    });
  });

  describe("MD5", () => {
    it("hashes string", () => {
      const h = md5Hash("hello");
      expect(h).toMatch(/^[a-f0-9]{32}$/);
      expect(md5Hash("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
      expect(md5Hash("a")).toMatch(/^[a-f0-9]{32}$/);
      expect(md5Hash("a")).toBe(md5Hash("a"));
    });
  });

  describe("SHA1", () => {
    it("hashes string async", async () => {
      const h = await sha1HashAsync("hello");
      expect(h).toMatch(/^[a-f0-9]{40}$/);
    });
  });

  describe("HTML", () => {
    it("encodes and decodes", () => {
      expect(encodeHtmlDeep("<&>")).toBe("&lt;&amp;&gt;");
      expect(decodeHtmlEntities("&lt;&amp;&gt;")).toEqual({ ok: true, value: "<&>" });
    });
  });

  describe("parseQueryString", () => {
    it("parses query string", () => {
      expect(parseQueryString("?a=1&b=2")).toEqual({ ok: true, value: { a: "1", b: "2" } });
      expect(parseQueryString("a=1")).toEqual({ ok: true, value: { a: "1" } });
      expect(parseQueryString("")).toEqual({ ok: true, value: {} });
    });
  });

  describe("decodeJwtPayload", () => {
    it("decodes valid JWT", () => {
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const payload = btoa(JSON.stringify({ sub: "123" })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const token = header + "." + payload + ".sig";
      const r = decodeJwtPayload(token);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.header).toEqual({ alg: "HS256", typ: "JWT" });
        expect(r.value.payload).toEqual({ sub: "123" });
      }
    });
    it("rejects invalid JWT", () => {
      expect(decodeJwtPayload("")).toEqual({ ok: false, error: "Empty JWT" });
      expect(decodeJwtPayload("a.b")).toEqual({ ok: false, error: "JWT must have 3 parts" });
    });
  });
});
