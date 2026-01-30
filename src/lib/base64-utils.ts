export const DEFAULT_MIME_TYPE = "application/octet-stream";

// 20MB - keep conversions safe in browser memory.
export const DEFAULT_MAX_DECODE_BYTES = 20 * 1024 * 1024;

export interface NormalizeBase64Success {
  ok: true;
  /** Base64 payload without any whitespace/newlines */
  base64: string;
  /** Whether input was a DataURL */
  isDataURL: boolean;
  /** MIME type (if known) */
  mimeType?: string;
}

export interface NormalizeBase64Failure {
  ok: false;
  error: string;
}

export type NormalizeBase64Result = NormalizeBase64Success | NormalizeBase64Failure;

export interface Base64ToBlobSuccess {
  ok: true;
  blob: Blob;
  mimeType: string;
  bytes: number;
}

export interface Base64ToBlobFailure {
  ok: false;
  error: string;
}

export type Base64ToBlobResult = Base64ToBlobSuccess | Base64ToBlobFailure;

export interface Base64DecodeOptions {
  /** Maximum allowed decoded bytes, default: 20MB */
  maxBytes?: number;
}

function stripWhitespace(input: string): string {
  return input.replace(/\s+/g, "");
}

function isLikelyBase64(payload: string): boolean {
  // Allow unpadded base64; validate characters and padding placement loosely.
  // Note: strict validation is intentionally avoided to not reject valid unpadded inputs.
  if (payload.length === 0) return false;
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(payload)) return false;
  const firstPad = payload.indexOf("=");
  if (firstPad === -1) return true;
  // If there is padding, it must be at the end.
  return firstPad >= payload.length - 2;
}

function padBase64(payload: string): string {
  const mod = payload.length % 4;
  if (mod === 0) return payload;
  if (mod === 2) return `${payload}==`;
  if (mod === 3) return `${payload}=`;
  // mod === 1 is invalid length; keep as-is for error handling downstream.
  return payload;
}

function estimateBytesFromBase64Payload(payload: string): number {
  // RFC 4648 base64: 4 chars => 3 bytes, minus padding.
  const len = payload.length;
  if (len === 0) return 0;
  const pad =
    payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((len * 3) / 4) - pad);
}

function decodeBase64ToUint8Array(payload: string): Uint8Array {
  const normalized = padBase64(payload);

  // Node.js path (Buffer) first when available (server-side / tests).
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(normalized, "base64"));
  }

  if (typeof globalThis.atob !== "function") {
    throw new Error("当前环境不支持 Base64 解码");
  }

  const binary = globalThis.atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function detectMimeType(dataURL: string): string | undefined {
  const parsed = parseDataURL(dataURL);
  return parsed.ok ? parsed.mimeType : undefined;
}

function parseDataURL(
  dataURL: string
):
  | { ok: true; mimeType: string; base64: string }
  | { ok: false; error: string } {
  if (!dataURL.startsWith("data:")) {
    return { ok: false, error: "不是合法的 DataURL" };
  }

  const commaIndex = dataURL.indexOf(",");
  if (commaIndex === -1) {
    return { ok: false, error: "DataURL 缺少数据部分" };
  }

  const header = dataURL.slice("data:".length, commaIndex);
  const dataPart = dataURL.slice(commaIndex + 1);

  const headerLower = header.toLowerCase();
  if (!headerLower.includes(";base64")) {
    return { ok: false, error: "仅支持 base64 编码的 DataURL" };
  }

  // mime is the first segment before ';'
  const mimeCandidate = header.split(";")[0]?.trim();
  const mimeType = mimeCandidate ? mimeCandidate : DEFAULT_MIME_TYPE;

  const base64 = stripWhitespace(dataPart);
  if (!isLikelyBase64(base64)) {
    return { ok: false, error: "Base64 内容不合法" };
  }

  return { ok: true, mimeType, base64 };
}

export function normalizeBase64Input(input: string): NormalizeBase64Result {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "请输入 Base64 或 DataURL" };
  }

  if (trimmed.startsWith("data:")) {
    const parsed = parseDataURL(trimmed);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    return {
      ok: true,
      base64: parsed.base64,
      isDataURL: true,
      mimeType: parsed.mimeType,
    };
  }

  const base64 = stripWhitespace(trimmed);
  if (!isLikelyBase64(base64)) {
    return { ok: false, error: "Base64 内容不合法" };
  }

  return { ok: true, base64, isDataURL: false };
}

export function estimateBytesFromBase64(
  input: string
): { ok: true; bytes: number } | { ok: false; error: string } {
  const normalized = normalizeBase64Input(input);
  if (!normalized.ok) return normalized;
  return { ok: true, bytes: estimateBytesFromBase64Payload(normalized.base64) };
}

export async function fileToDataURL(
  file: Blob
): Promise<{ ok: true; dataURL: string } | { ok: false; error: string }> {
  if (typeof FileReader === "undefined") {
    return { ok: false, error: "当前环境不支持 FileReader" };
  }

  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve({ ok: false, error: "读取文件失败" });
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        resolve({ ok: false, error: "读取结果不正确" });
        return;
      }
      resolve({ ok: true, dataURL: result });
    };
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(
  base64: string,
  mimeType: string = DEFAULT_MIME_TYPE,
  options: Base64DecodeOptions = {}
): Base64ToBlobResult {
  const normalized = normalizeBase64Input(base64);
  if (!normalized.ok) return normalized;

  const bytes = estimateBytesFromBase64Payload(normalized.base64);
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_DECODE_BYTES;
  if (bytes > maxBytes) {
    return {
      ok: false,
      error: `输入过大（约 ${bytes} bytes），请减少内容或分段处理`,
    };
  }

  try {
    const u8 = decodeBase64ToUint8Array(normalized.base64);
    return {
      ok: true,
      blob: new Blob([u8], { type: mimeType || DEFAULT_MIME_TYPE }),
      mimeType: mimeType || DEFAULT_MIME_TYPE,
      bytes,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Base64 解码失败";
    return { ok: false, error };
  }
}

export function dataURLToBlob(
  dataURL: string,
  options: Base64DecodeOptions = {}
): Base64ToBlobResult {
  const parsed = parseDataURL(dataURL.trim());
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const bytes = estimateBytesFromBase64Payload(parsed.base64);
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_DECODE_BYTES;
  if (bytes > maxBytes) {
    return {
      ok: false,
      error: `输入过大（约 ${bytes} bytes），请减少内容或分段处理`,
    };
  }

  try {
    const u8 = decodeBase64ToUint8Array(parsed.base64);
    return {
      ok: true,
      blob: new Blob([u8], { type: parsed.mimeType }),
      mimeType: parsed.mimeType,
      bytes,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : "DataURL 解码失败";
    return { ok: false, error };
  }
}

