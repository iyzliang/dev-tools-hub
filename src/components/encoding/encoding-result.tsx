"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";
import type { JwtDecoded, ParseQueryStringResult } from "@/lib/encoding-utils";

export type ResultDisplayType = "text" | "keyValue" | "jwt" | "error";

export interface EncodingResultProps {
  resultType: ResultDisplayType;
  text?: string;
  keyValue?: ParseQueryStringResult;
  jwt?: JwtDecoded;
  errorMessage?: string;
  onCopy?: (target: "text" | "json" | "query" | "payload") => void;
}

function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}

export function EncodingResult({
  resultType,
  text = "",
  keyValue,
  jwt,
  errorMessage,
  onCopy,
}: EncodingResultProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const showCopied = useCallback((key: string) => {
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleCopyText = useCallback(async () => {
    const ok = await copyToClipboard(text);
    if (ok) showCopied("text");
    onCopy?.(ok ? "text" : "text");
  }, [text, onCopy, showCopied]);

  const handleCopyJson = useCallback(async () => {
    if (!keyValue) return;
    const ok = await copyToClipboard(JSON.stringify(keyValue, null, 2));
    if (ok) showCopied("json");
    onCopy?.(ok ? "json" : "json");
  }, [keyValue, onCopy, showCopied]);

  const handleCopyQuery = useCallback(async () => {
    if (!keyValue) return;
    const pairs = Object.entries(keyValue).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((val) => `${k}=${encodeURIComponent(val)}`) : [`${k}=${encodeURIComponent(v as string)}`]
    );
    const ok = await copyToClipboard(pairs.join("&"));
    if (ok) showCopied("query");
    onCopy?.(ok ? "query" : "query");
  }, [keyValue, onCopy, showCopied]);

  const handleCopyPayload = useCallback(async () => {
    if (!jwt) return;
    const ok = await copyToClipboard(JSON.stringify(jwt.payload, null, 2));
    if (ok) showCopied("payload");
    onCopy?.(ok ? "payload" : "payload");
  }, [jwt, onCopy, showCopied]);

  if (resultType === "error" && errorMessage) {
    return (
      <div className="flex flex-col gap-2">
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (resultType === "text" && text !== undefined) {
    return (
      <div className="flex flex-col gap-2">
        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-all font-mono text-sm text-slate-800">
          {text || ""}
        </pre>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleCopyText}
          disabled={!text}
          className="self-start gap-1.5"
          aria-label="复制结果"
        >
          <ClipboardCopy className="h-3.5 w-3.5" />
          {copied === "text" ? "已复制" : "复制"}
        </Button>
      </div>
    );
  }

  if (resultType === "keyValue" && keyValue) {
    const entries = Object.entries(keyValue);
    return (
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          {entries.map(([k, v]) => (
            <div key={k} className="rounded border border-slate-200 bg-white px-2 py-1.5 font-mono text-xs">
              <span className="font-semibold text-slate-600">{k}:</span>{" "}
              {Array.isArray(v) ? v.join(", ") : String(v)}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleCopyJson} className="gap-1.5" aria-label="复制为 JSON">
            <ClipboardCopy className="h-3.5 w-3.5" />
            {copied === "json" ? "已复制" : "复制为 JSON"}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={handleCopyQuery} className="gap-1.5" aria-label="复制为 Query">
            <ClipboardCopy className="h-3.5 w-3.5" />
            {copied === "query" ? "已复制" : "复制为 Query"}
          </Button>
        </div>
      </div>
    );
  }

  if (resultType === "jwt" && jwt) {
    return (
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <div className="rounded border border-slate-200 bg-white p-2">
            <div className="mb-1 text-xs font-semibold text-slate-600">Header</div>
            <pre className="overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-slate-800">
              {JSON.stringify(jwt.header, null, 2)}
            </pre>
          </div>
          <div className="rounded border border-slate-200 bg-white p-2">
            <div className="mb-1 text-xs font-semibold text-slate-600">Payload</div>
            <pre className="overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-slate-800">
              {JSON.stringify(jwt.payload, null, 2)}
            </pre>
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={handleCopyPayload} className="self-start gap-1.5" aria-label="复制 Payload">
          <ClipboardCopy className="h-3.5 w-3.5" />
          {copied === "payload" ? "已复制" : "复制 Payload"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-slate-500">
      输入内容后执行编码/解码
    </div>
  );
}

export default EncodingResult;
