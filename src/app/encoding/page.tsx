"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EncodingTypeSelector, EncodingResult } from "@/components/encoding";
import type { EncodingMode } from "@/components/encoding";
import type { EncodingType, DecodingType } from "@/lib/encoding-utils";
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
  parseQueryString,
  decodeJwtPayload,
} from "@/lib/encoding-utils";
import { trackEvent } from "@/lib/analytics";
import type { ResultDisplayType } from "@/components/encoding/encoding-result";
import type { ParseQueryStringResult } from "@/lib/encoding-utils";
import type { JwtDecoded } from "@/lib/encoding-utils";
import { Wand2 } from "lucide-react";

const TOOL_NAME = "encoding-tool";

const DEFAULT_ENCODE_TYPE: EncodingType = "unicode";
const DEFAULT_DECODE_TYPE: DecodingType = "unicode";

export default function EncodingPage() {
  const [mode, setMode] = useState<EncodingMode>("encode");
  const [encodeType, setEncodeType] = useState<EncodingType>(DEFAULT_ENCODE_TYPE);
  const [decodeType, setDecodeType] = useState<DecodingType>(DEFAULT_DECODE_TYPE);
  const [inputValue, setInputValue] = useState("");
  const [resultType, setResultType] = useState<ResultDisplayType>("text");
  const [resultText, setResultText] = useState("");
  const [resultKeyValue, setResultKeyValue] = useState<ParseQueryStringResult | undefined>();
  const [resultJwt, setResultJwt] = useState<JwtDecoded | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const clearResult = useCallback(() => {
    setResultType("text");
    setResultText("");
    setResultKeyValue(undefined);
    setResultJwt(undefined);
    setErrorMessage(undefined);
  }, []);

  const runEncode = useCallback(
    async (trimmed: string, type: EncodingType) => {
      switch (type) {
        case "unicode":
          setResultText(encodeToUnicodeEscaped(trimmed));
          setResultType("text");
          return true;
        case "url":
          setResultText(encodeToUrlEncoded(trimmed));
          setResultType("text");
          return true;
        case "utf16":
          setResultText(encodeToHexEscaped(trimmed));
          setResultType("text");
          return true;
        case "base64": {
          const r = encodeBase64Text(trimmed);
          if (!r.ok) {
            setErrorMessage(r.error);
            setResultType("error");
            return false;
          }
          setResultText(r.value);
          setResultType("text");
          return true;
        }
        case "md5":
          setResultText(md5Hash(trimmed));
          setResultType("text");
          return true;
        case "sha1":
          setLoading(true);
          try {
            const h = await sha1HashAsync(trimmed);
            setResultText(h);
            setResultType("text");
            return true;
          } catch {
            setErrorMessage("SHA-1 计算失败");
            setResultType("error");
            return false;
          } finally {
            setLoading(false);
          }
        case "html":
          setResultText(encodeHtmlDeep(trimmed));
          setResultType("text");
          return true;
        default:
          return false;
      }
    },
    []
  );

  const runDecode = useCallback(
    (trimmed: string, type: DecodingType) => {
      switch (type) {
        case "unicode": {
          const r = decodeFromUnicodeEscaped(trimmed);
          if (!r.ok) {
            setErrorMessage(r.error);
            setResultType("error");
            return false;
          }
          setResultText(r.value);
          setResultType("text");
          return true;
        }
        case "url": {
          const r = decodeFromUrlEncoded(trimmed);
          if (!r.ok) {
            setErrorMessage(r.error);
            setResultType("error");
            return false;
          }
          setResultText(r.value);
          setResultType("text");
          return true;
        }
        case "utf16": {
          const r = decodeFromHexEscaped(trimmed);
          if (!r.ok) {
            setErrorMessage(r.error);
            setResultType("error");
            return false;
          }
          setResultText(r.value);
          setResultType("text");
          return true;
        }
        case "base64": {
          const r = decodeBase64Text(trimmed);
          if (!r.ok) {
            setErrorMessage(r.error);
            setResultType("error");
            return false;
          }
          setResultText(r.value);
          setResultType("text");
          return true;
        }
        case "query_string": {
          const r = parseQueryString(trimmed);
          if (!r.ok) {
            setErrorMessage(r.error);
            setResultType("error");
            return false;
          }
          setResultKeyValue(r.value);
          setResultType("keyValue");
          return true;
        }
        case "jwt": {
          const r = decodeJwtPayload(trimmed);
          if (!r.ok) {
            setErrorMessage(r.error);
            setResultType("error");
            return false;
          }
          setResultJwt(r.value);
          setResultType("jwt");
          return true;
        }
        default:
          return false;
      }
    },
    []
  );

  const handleRun = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      clearResult();
      return;
    }
    setErrorMessage(undefined);
    if (mode === "encode") {
      const ok = await runEncode(trimmed, encodeType);
      trackEvent("encoding_encode", { encoding_type: encodeType, success: ok }, { toolName: TOOL_NAME });
    } else {
      const ok = runDecode(trimmed, decodeType);
      trackEvent("encoding_decode", { decoding_type: decodeType, success: ok }, { toolName: TOOL_NAME });
    }
  }, [inputValue, mode, encodeType, decodeType, runEncode, runDecode, clearResult]);

  const handleCopy = useCallback((target: "text" | "json" | "query" | "payload") => {
    trackEvent("encoding_copy", { result_type: target }, { toolName: TOOL_NAME });
  }, []);

  useEffect(() => {
    trackEvent("tool_open", { tool_name: TOOL_NAME }, { toolName: TOOL_NAME });
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      if (!isCmdOrCtrl || event.key !== "Enter") return;
      event.preventDefault();
      handleRun();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleRun]);

  const resultNode = (
    <EncodingResult
      resultType={resultType}
      text={resultText}
      keyValue={resultKeyValue}
      jwt={resultJwt}
      errorMessage={errorMessage}
      onCopy={handleCopy}
    />
  );

  const placeholderByType =
    mode === "encode"
      ? encodeType === "base64"
        ? "输入文本，将转为 Base64"
        : encodeType === "md5" || encodeType === "sha1"
          ? "输入文本，将计算哈希"
          : "输入要编码的文本"
      : decodeType === "query_string"
        ? "输入 ?key=value&a=b 形式的查询串"
        : decodeType === "jwt"
          ? "粘贴 JWT 字符串（header.payload.signature）"
          : "输入要解码的内容";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 space-y-4 pb-4">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            信息编码工具
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            编码：Unicode(\\u)、URL(%)、UTF16(\\x)、Base64、MD5、SHA1、HTML；解码：Unicode、URL、UTF16、Base64、URL 参数解析、JWT 解码。快捷键{" "}
            <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
              ⌘/Ctrl + Enter
            </kbd>
          </p>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-700">配置与输入</span>
          </div>
          <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex h-full flex-col gap-4 overflow-y-auto">
              <EncodingTypeSelector
                mode={mode}
                encodeType={encodeType}
                decodeType={decodeType}
                onModeChange={(m) => {
                  if (m !== mode) {
                    trackEvent("encoding_mode_switch", { from_mode: mode, to_mode: m }, { toolName: TOOL_NAME });
                  }
                  setMode(m);
                  clearResult();
                }}
                onEncodeTypeChange={(t) => {
                  setEncodeType(t);
                  clearResult();
                }}
                onDecodeTypeChange={(t) => {
                  setDecodeType(t);
                  clearResult();
                }}
              />
              <label className="text-xs font-medium text-slate-600" htmlFor="encoding-input">
                输入
              </label>
              <Textarea
                id="encoding-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholderByType}
                className="min-h-[200px] flex-1 resize-y font-mono text-sm"
                aria-label="输入"
              />
              <div className="mt-auto pt-4">
                <Button
                  onClick={handleRun}
                  disabled={!inputValue.trim() || loading}
                  className="w-full gap-2"
                  aria-label="执行"
                >
                  <Wand2 className="h-4 w-4" />
                  {loading ? "处理中…" : "执行"}
                </Button>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  快捷键：{" "}
                  <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">
                    ⌘/Ctrl + Enter
                  </kbd>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-700">结果</span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200 bg-white p-4">
            {resultNode}
          </div>
        </div>
      </section>
    </div>
  );
}
