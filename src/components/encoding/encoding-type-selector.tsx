"use client";

import type { EncodingType, DecodingType } from "@/lib/encoding-utils";
import { cn } from "@/lib/utils";

export type EncodingMode = "encode" | "decode";

const ENCODE_TYPES: { value: EncodingType; label: string; hint: string }[] = [
  { value: "unicode", label: "Unicode", hint: "\\uXXXX" },
  { value: "url", label: "URL 编码", hint: "%XX" },
  { value: "utf16", label: "UTF16/十六进制", hint: "\\xXX" },
  { value: "base64", label: "Base64", hint: "" },
  { value: "md5", label: "MD5", hint: "" },
  { value: "sha1", label: "SHA1", hint: "" },
  { value: "html", label: "HTML 深度编码", hint: "&#xXX;" },
];

const DECODE_TYPES: { value: DecodingType; label: string; hint: string }[] = [
  { value: "unicode", label: "Unicode", hint: "\\uXXXX" },
  { value: "url", label: "URL 解码", hint: "%XX" },
  { value: "utf16", label: "UTF16/十六进制", hint: "\\xXX" },
  { value: "base64", label: "Base64", hint: "" },
  { value: "query_string", label: "URL 参数解析", hint: "?key=value" },
  { value: "jwt", label: "JWT 解码", hint: "" },
];

export interface EncodingTypeSelectorProps {
  mode: EncodingMode;
  encodeType: EncodingType;
  decodeType: DecodingType;
  onModeChange: (mode: EncodingMode) => void;
  onEncodeTypeChange: (t: EncodingType) => void;
  onDecodeTypeChange: (t: DecodingType) => void;
}

export function EncodingTypeSelector({
  mode,
  encodeType,
  decodeType,
  onModeChange,
  onEncodeTypeChange,
  onDecodeTypeChange,
}: EncodingTypeSelectorProps) {
  const types = mode === "encode" ? ENCODE_TYPES : DECODE_TYPES;
  const currentValue = mode === "encode" ? encodeType : decodeType;

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-slate-600">模式</label>
      <div className="flex gap-2" role="radiogroup" aria-label="编码或解码">
        <button
          type="button"
          role="radio"
          aria-checked={mode === "encode"}
          aria-label="编码"
          onClick={() => onModeChange("encode")}
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-medium transition-all",
            mode === "encode"
              ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-2"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          )}
        >
          编码
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === "decode"}
          aria-label="解码"
          onClick={() => onModeChange("decode")}
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-medium transition-all",
            mode === "decode"
              ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-2"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          )}
        >
          解码
        </button>
      </div>

      <label className="text-xs font-medium text-slate-600">类型</label>
      <select
        id="encoding-type"
        value={currentValue}
        onChange={(e) => {
          const v = e.target.value;
          if (mode === "encode") onEncodeTypeChange(v as EncodingType);
          else onDecodeTypeChange(v as DecodingType);
        }}
        aria-label="选择编码或解码类型"
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        {types.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
            {opt.hint ? ` (${opt.hint})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

export default EncodingTypeSelector;
