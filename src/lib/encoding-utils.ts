export type EncodingType = "unicode" | "url" | "utf16" | "base64" | "md5" | "sha1" | "html";
export type DecodingType = "unicode" | "url" | "utf16" | "base64" | "query_string" | "jwt";

export function encodeToUnicodeEscaped(str: string): string { return Array.from(str).map((c) => "\\u" + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")).join(""); }

export type DecodeResultString = { ok: true; value: string } | { ok: false; error: string };

export function decodeFromUnicodeEscaped(input: string): DecodeResultString {
  try {
    const value = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
    return { ok: true, value };
  } catch {
    return { ok: false, error: "Unicode decode failed" };
  }
}

export function encodeToUrlEncoded(str: string): string {
  return encodeURIComponent(str);
}

export function decodeFromUrlEncoded(input: string): DecodeResultString {
  try {
    return { ok: true, value: decodeURIComponent(input.replace(/\+/g, " ")) };
  } catch {
    return { ok: false, error: "URL decode failed" };
  }
}

export function encodeToHexEscaped(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return Array.from(bytes)
    .map((b) => "\\x" + b.toString(16).toUpperCase().padStart(2, "0"))
    .join("");
}

export function decodeFromHexEscaped(input: string): DecodeResultString {
  try {
    const matches = input.match(/\\x([0-9a-fA-F]{2})/g);
    if (!matches || matches.length === 0) return { ok: false, error: "No \\xXX found" };
    const bytes = new Uint8Array(matches.length);
    matches.forEach((m, i) => { bytes[i] = parseInt(m.slice(2), 16); });
    return { ok: true, value: new TextDecoder("utf-8").decode(bytes) };
  } catch {
    return { ok: false, error: "Hex decode failed" };
  }
}

export type EncodeResult = { ok: true; value: string } | { ok: false; error: string };

function b64Encode(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
}

function b64Decode(s: string): Uint8Array {
  const n = s.replace(/\s+/g, "").replace(/=+$/, "");
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(n, "base64"));
  const bin = atob(n);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function encodeBase64Text(str: string): EncodeResult {
  try {
    return { ok: true, value: b64Encode(new TextEncoder().encode(str)) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Base64 encode failed" };
  }
}

export function decodeBase64Text(input: string): DecodeResultString {
  const n = input.trim().replace(/\s+/g, "");
  if (!n) return { ok: false, error: "Empty Base64" };
  if (!/^[A-Za-z0-9+/]*=*$/.test(n)) return { ok: false, error: "Invalid Base64" };
  try {
    return { ok: true, value: new TextDecoder("utf-8").decode(b64Decode(n)) };
  } catch {
    return { ok: false, error: "Base64 decode failed" };
  }
}

export function md5Hash(str: string): string {
  if (typeof process !== "undefined" && process.versions && process.versions.node) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require("crypto");
    return crypto.createHash("md5").update(str, "utf8").digest("hex");
  }
  const u8 = new TextEncoder().encode(str);
  const len = u8.length;
  const n = (((len + 8) >>> 6) + 1) * 16;
  const M = new Uint32Array(n);
  for (let i = 0; i < len; i++) M[i >>> 2] |= u8[i] << ((i % 4) * 8);
  M[len >>> 2] |= 0x80 << ((len % 4) * 8);
  M[n - 2] = len * 8;
  const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number) => x ^ y ^ z;
  const I = (x: number, y: number, z: number) => y ^ (x | ~z);
  const rot = (v: number, n: number) => (v << n) | (v >>> (32 - n));
  const add = (a: number, b: number) => ((a + b) >>> 0) & 0xffffffff;
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const K = new Uint32Array([0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,0x698098d8,0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,0xa679438e,0x49b40821,0xf61e2562,0xc040b340,0x265e5a51,0xe9b6c7aa,0xd62f105d,0x02441453,0xd8a1e681,0xe7d3fbc8,0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,0xfcefa3f8,0x676f02d9,0x8d2a4c8a,0xfffa3942,0x8771f681,0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,0xbebfbc70,0x289b7ec6,0xeaa127fa,0xd4ef3085,0x04881d05,0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,0xf4292244,0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,0xffeff47d,0x85845dd1,0x6fa87e4f,0xfe2ce6e0,0xa3014314,0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391]);
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  for (let o = 0; o < n; o += 16) {
    let aa = a, bb = b, cc = c, dd = d;
    for (let i = 0; i < 64; i++) {
      let f: number, g: number;
      if (i < 16) { f = F(bb, cc, dd); g = i; }
      else if (i < 32) { f = G(bb, cc, dd); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = H(bb, cc, dd); g = (3 * i + 5) % 16; }
      else { f = I(bb, cc, dd); g = (7 * i) % 16; }
      const t = dd; dd = cc; cc = bb;
      bb = add(bb, rot(add(add(aa, f), add(K[i], M[o + g])), S[i]));
      aa = t;
    }
    a = add(a, aa); b = add(b, bb); c = add(c, cc); d = add(d, dd);
  }
  const toHex = (x: number) => [x&0xff,(x>>>8)&0xff,(x>>>16)&0xff,(x>>>24)&0xff].map(b=>b.toString(16).padStart(2,"0")).join("");
  return toHex(a)+toHex(b)+toHex(c)+toHex(d);
}

export async function sha1HashAsync(str: string): Promise<string> {
  const bytes = new TextEncoder().encode(str);
  if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle) {
    const buf = await globalThis.crypto.subtle.digest("SHA-1", bytes);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  if (typeof process !== "undefined" && process.versions && process.versions.node) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require("crypto");
    return crypto.createHash("sha1").update(str, "utf8").digest("hex");
  }
  throw new Error("SHA-1 not available");
}

const HTML_ENT: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };

export function encodeHtmlDeep(str: string): string {
  let out = "";
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    out += HTML_ENT[c] != null ? HTML_ENT[c] : "&#x" + str.charCodeAt(i).toString(16).toUpperCase() + ";";
  }
  return out;
}

export function decodeHtmlEntities(input: string): DecodeResultString {
  try {
    const v = input.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&apos;/g, "'");
    return { ok: true, value: v };
  } catch {
    return { ok: false, error: "HTML decode failed" };
  }
}

export interface ParseQueryStringResult { [key: string]: string | string[]; }

export function parseQueryString(input: string): { ok: true; value: ParseQueryStringResult } | { ok: false; error: string } {
  const qs = input.trim().replace(/^\?/, "");
  if (!qs) return { ok: true, value: {} };
  const r: ParseQueryStringResult = {};
  for (const p of qs.split("&")) {
    const eq = p.indexOf("=");
    const k = decodeURIComponent((eq === -1 ? p : p.slice(0, eq)).replace(/\+/g, " "));
    const v = eq === -1 ? "" : decodeURIComponent(p.slice(eq + 1).replace(/\+/g, " "));
    if (k in r) {
      const prev = r[k];
      r[k] = Array.isArray(prev) ? [...prev, v] : [prev as string, v];
    } else r[k] = v;
  }
  return { ok: true, value: r };
}

export interface JwtDecoded { header: Record<string, unknown>; payload: Record<string, unknown>; }

function b64UrlDecode(s: string): string {
  let b = s.replace(/-/g, "+").replace(/_/g, "/");
  b += "==".slice(0, (4 - (b.length % 4)) % 4);
  try { return new TextDecoder("utf-8").decode(b64Decode(b)); } catch { return ""; }
}

export function decodeJwtPayload(input: string): { ok: true; value: JwtDecoded } | { ok: false; error: string } {
  const t = input.trim();
  if (!t) return { ok: false, error: "Empty JWT" };
  const parts = t.split(".");
  if (parts.length !== 3) return { ok: false, error: "JWT must have 3 parts" };
  try {
    const h = b64UrlDecode(parts[0]);
    const p = b64UrlDecode(parts[1]);
    if (!h || !p) return { ok: false, error: "Base64Url decode failed" };
    return { ok: true, value: { header: JSON.parse(h), payload: JSON.parse(p) } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "JWT parse failed" };
  }
}
