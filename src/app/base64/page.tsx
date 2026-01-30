"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Base64TextArea } from "@/components/base64/base64-textarea";
import { ImagePicker } from "@/components/base64/image-picker";
import {
  base64ToBlob,
  dataURLToBlob,
  detectMimeType,
  estimateBytesFromBase64,
  fileToDataURL,
} from "@/lib/base64-utils";
import { getInputSizeRange, trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import {
  ClipboardCopy,
  Download,
  Image as ImageIcon,
  RefreshCcw,
  Text,
  Wand2,
} from "lucide-react";

type Mode = "imageToBase64" | "base64ToImage";

const TOOL_NAME = "base64";

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"] as const;
  let value = bytes / 1024;
  for (const unit of units) {
    if (value < 1024) return `${value.toFixed(value < 10 ? 2 : 1)} ${unit}`;
    value /= 1024;
  }
  return `${value.toFixed(1)} TB`;
}

function extFromMime(mime: string | undefined): string {
  const m = (mime || "").toLowerCase();
  if (m === "image/png") return "png";
  if (m === "image/jpeg" || m === "image/jpg") return "jpg";
  if (m === "image/webp") return "webp";
  if (m === "image/gif") return "gif";
  if (m === "image/bmp") return "bmp";
  if (m === "image/svg+xml") return "svg";
  return "bin";
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ignore and fallback
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

async function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function downloadText(text: string, fileName: string) {
  await downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), fileName);
}

async function tryCopyImageBlob(blob: Blob): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!blob.type?.startsWith("image/")) {
    return { ok: false, error: "无法复制：当前内容不是图片 MIME（建议粘贴 DataURL 以保留 MIME）" };
  }
  const ClipboardItemCtor = (globalThis as unknown as { ClipboardItem?: typeof ClipboardItem })
    .ClipboardItem;
  if (!navigator.clipboard?.write || !ClipboardItemCtor) {
    return { ok: false, error: "当前浏览器不支持复制图片到剪贴板" };
  }
  try {
    const item = new ClipboardItemCtor({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
    return { ok: true };
  } catch {
    return { ok: false, error: "复制图片失败（可能被浏览器权限或安全策略拦截）" };
  }
}

export default function Base64ToolPage() {
  const [mode, setMode] = useState<Mode>("imageToBase64");

  // image -> base64
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [encoded, setEncoded] = useState<string>("");
  const [isEncoding, setIsEncoding] = useState(false);

  // base64 -> image
  const [input, setInput] = useState<string>("");
  const [decodedBlob, setDecodedBlob] = useState<Blob | null>(null);
  const [decodedPreviewUrl, setDecodedPreviewUrl] = useState<string | null>(null);
  const [decodedMime, setDecodedMime] = useState<string | null>(null);
  const [decodedBytes, setDecodedBytes] = useState<number | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  // messages
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimerRef = useRef<number | null>(null);

  const canEncode = Boolean(imageFile) && !isEncoding;
  const canDecode = Boolean(input.trim()) && !isDecoding;

  // Track tool open
  useEffect(() => {
    trackEvent("tool_open", { tool_name: TOOL_NAME }, { toolName: TOOL_NAME });
  }, []);

  const setToastWithTimeout = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1800);
  }, []);

  // Cleanup toast timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Cleanup decoded preview URL
  useEffect(() => {
    return () => {
      if (decodedPreviewUrl) URL.revokeObjectURL(decodedPreviewUrl);
    };
  }, [decodedPreviewUrl]);

  const encodeBytesInfo = useMemo(() => {
    if (!encoded.trim()) return null;
    const r = estimateBytesFromBase64(encoded);
    return r.ok ? r.bytes : null;
  }, [encoded]);

  const handleEncode = useCallback(async () => {
    if (!imageFile) return;

    setIsEncoding(true);
    setError(null);
    setToast(null);

    try {
      const res = await fileToDataURL(imageFile);
      if (!res.ok) {
        setError(res.error || "生成 Base64 失败");
        trackEvent(
          "base64_encode",
          {
            success: false,
            input_size_range: getInputSizeRange(imageFile.size),
            mime: imageFile.type,
          },
          { toolName: TOOL_NAME },
        );
        return;
      }

      setEncoded(res.dataURL);
      setToastWithTimeout("已生成 Base64（DataURL）");

      trackEvent(
        "base64_encode",
        {
          success: true,
          input_size_range: getInputSizeRange(res.dataURL.length),
          mime: imageFile.type,
          file_size_bytes: imageFile.size,
        },
        { toolName: TOOL_NAME },
      );
    } finally {
      setIsEncoding(false);
    }
  }, [imageFile, setToastWithTimeout]);

  const handleDecode = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setIsDecoding(true);
    setError(null);
    setToast(null);

    // cleanup previous preview URL
    if (decodedPreviewUrl) {
      URL.revokeObjectURL(decodedPreviewUrl);
      setDecodedPreviewUrl(null);
    }
    setDecodedBlob(null);
    setDecodedMime(null);
    setDecodedBytes(null);

    try {
      const bytesEstimate = estimateBytesFromBase64(trimmed);
      const mimeFromDataUrl = detectMimeType(trimmed) ?? null;

      const result = trimmed.startsWith("data:")
        ? dataURLToBlob(trimmed)
        : base64ToBlob(trimmed, mimeFromDataUrl ?? undefined);

      if (!result.ok) {
        setError(result.error || "解析失败");
        trackEvent(
          "base64_decode",
          {
            success: false,
            input_size_range: getInputSizeRange(trimmed.length),
            bytes_estimate: bytesEstimate.ok ? bytesEstimate.bytes : null,
            has_data_url_prefix: trimmed.startsWith("data:"),
          },
          { toolName: TOOL_NAME },
        );
        return;
      }

      const url = URL.createObjectURL(result.blob);
      setDecodedBlob(result.blob);
      setDecodedPreviewUrl(url);
      setDecodedMime(result.mimeType);
      setDecodedBytes(result.bytes);
      setToastWithTimeout("已解析预览");

      trackEvent(
        "base64_decode",
        {
          success: true,
          input_size_range: getInputSizeRange(trimmed.length),
          bytes_estimate: bytesEstimate.ok ? bytesEstimate.bytes : null,
          bytes: result.bytes,
          mime: result.mimeType,
          has_data_url_prefix: trimmed.startsWith("data:"),
        },
        { toolName: TOOL_NAME },
      );
    } finally {
      setIsDecoding(false);
    }
  }, [decodedPreviewUrl, input, setToastWithTimeout]);

  const handleCopyBase64 = useCallback(async () => {
    const text = mode === "imageToBase64" ? encoded : input;
    if (!text.trim()) {
      setToastWithTimeout("暂无可复制内容");
      return;
    }
    const ok = await copyText(text);
    setToastWithTimeout(ok ? "已复制到剪贴板" : "复制失败，请手动选择复制");
    trackEvent(
      "base64_copy",
      { mode, input_size_range: getInputSizeRange(text.length) },
      { toolName: TOOL_NAME },
    );
  }, [encoded, input, mode, setToastWithTimeout]);

  const handleDownload = useCallback(async () => {
    if (mode === "imageToBase64") {
      if (!encoded.trim()) {
        setToastWithTimeout("暂无可下载内容");
        return;
      }
      await downloadText(encoded, "base64.txt");
      trackEvent(
        "base64_download",
        { mode, kind: "text", input_size_range: getInputSizeRange(encoded.length) },
        { toolName: TOOL_NAME },
      );
      return;
    }

    if (!decodedBlob) {
      setToastWithTimeout("暂无可下载内容");
      return;
    }
    const ext = extFromMime(decodedMime ?? decodedBlob.type);
    await downloadBlob(decodedBlob, `decoded.${ext}`);
    trackEvent(
      "base64_download",
      { mode, kind: "image", bytes: decodedBlob.size, mime: decodedMime ?? decodedBlob.type },
      { toolName: TOOL_NAME },
    );
  }, [decodedBlob, decodedMime, encoded, mode, setToastWithTimeout]);

  const handleCopyImage = useCallback(async () => {
    if (!decodedBlob) {
      setToastWithTimeout("暂无可复制的图片");
      return;
    }
    const r = await tryCopyImageBlob(decodedBlob);
    setToastWithTimeout(r.ok ? "已复制图片到剪贴板" : r.error);
    trackEvent(
      "base64_copy",
      { mode, kind: "image", success: r.ok, mime: decodedBlob.type },
      { toolName: TOOL_NAME },
    );
  }, [decodedBlob, mode, setToastWithTimeout]);

  const handleModeSwitch = useCallback(
    (next: Mode) => {
      if (next === mode) return;
      trackEvent(
        "base64_mode_switch",
        { from_mode: mode, to_mode: next },
        { toolName: TOOL_NAME },
      );
      setError(null);
      setToast(null);
      setMode(next);
    },
    [mode],
  );

  // Keyboard shortcut (Cmd/Ctrl + Enter)
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      if (!isCmdOrCtrl || event.key !== "Enter") return;
      event.preventDefault();

      if (mode === "imageToBase64") {
        if (canEncode) void handleEncode();
      } else {
        if (canDecode) void handleDecode();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canDecode, canEncode, handleDecode, handleEncode, mode]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 space-y-4 pb-4">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Base64 转换
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            图片 ↔ Base64/DataURL 互转，支持复制与下载。快捷键{" "}
            <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
              ⌘/Ctrl + Enter
            </kbd>
          </p>
        </div>

        {/* Mode Toggle + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-500">模式</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => handleModeSwitch("imageToBase64")}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  mode === "imageToBase64"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" />
                  图片转 Base64
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch("base64ToImage")}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  mode === "base64ToImage"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Text className="h-3.5 w-3.5" />
                  Base64 转图片
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => (mode === "imageToBase64" ? void handleEncode() : void handleDecode())}
              disabled={mode === "imageToBase64" ? !canEncode : !canDecode}
              className="gap-1.5"
            >
              {mode === "imageToBase64" ? (
                <>
                  <Wand2 className="h-3.5 w-3.5" />
                  {isEncoding ? "生成中..." : "生成 Base64"}
                </>
              ) : (
                <>
                  <RefreshCcw className="h-3.5 w-3.5" />
                  {isDecoding ? "解析中..." : "解析预览"}
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopyBase64}
              className="gap-1.5"
            >
              <ClipboardCopy className="h-3.5 w-3.5" />
              复制
            </Button>

            <Button size="sm" variant="secondary" onClick={handleDownload} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              下载
            </Button>

            {mode === "base64ToImage" && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopyImage}
                disabled={!decodedBlob}
                aria-label="复制图片到剪贴板"
                className="gap-1.5"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                复制图片
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
            <div className="text-xs text-red-700">
              <span className="font-medium">提示：</span>
              <span className="ml-1">{error}</span>
            </div>
          </div>
        )}

        {toast && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <span className="text-xs text-emerald-700">{toast}</span>
          </div>
        )}
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        {mode === "imageToBase64" ? (
          <>
            <div className="flex min-h-0 flex-col">
              <div className="mb-2 flex shrink-0 items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-slate-700">选择图片</span>
              </div>
              <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <ImagePicker
                  value={imageFile}
                  onChange={(file) => {
                    setImageFile(file);
                    setError(null);
                    setToast(null);
                    if (!file) {
                      setEncoded("");
                      return;
                    }
                  }}
                  disabled={isEncoding}
                />
              </div>
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-700">输出 Base64</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {encodeBytesInfo != null ? `约 ${formatBytes(encodeBytesInfo)}` : ""}
                </div>
              </div>
              <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white p-4">
                <Base64TextArea
                  label="结果"
                  value={encoded}
                  onChange={undefined}
                  readOnly
                  disabled={isEncoding}
                  placeholder="选择图片后点击「生成 Base64」"
                  showViewToggle
                  showToolbar
                  mimeTypeHint={imageFile?.type}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex min-h-0 flex-col">
              <div className="mb-2 flex shrink-0 items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-slate-700">输入 Base64 / DataURL</span>
              </div>
              <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white p-4">
                <Base64TextArea
                  label="输入"
                  value={input}
                  onChange={(v) => {
                    setInput(v);
                    setError(null);
                    setToast(null);
                  }}
                  disabled={isDecoding}
                  placeholder="粘贴 Base64 或 data:image/...;base64,..."
                  showViewToggle
                  showToolbar
                />
              </div>
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-700">图片预览</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {decodedBytes != null ? `${formatBytes(decodedBytes)}` : ""}
                  {decodedMime ? ` · ${decodedMime}` : ""}
                </div>
              </div>

              <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white p-4">
                {decodedPreviewUrl ? (
                  <div className="flex h-full flex-col">
                    <div className="flex flex-1 items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={decodedPreviewUrl}
                        alt="解析结果预览"
                        className="max-h-[320px] max-w-full rounded-md border border-slate-200 bg-white shadow-sm"
                      />
                    </div>

                    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-medium text-slate-800">解析信息</span>
                        <span className="text-slate-600">
                          {decodedBytes != null ? formatBytes(decodedBytes) : "-"}
                        </span>
                        <span className="text-slate-600">
                          {decodedMime ?? "未知 MIME（建议使用 DataURL 输入）"}
                        </span>
                        <span className="text-slate-600">
                          扩展名：.{extFromMime(decodedMime ?? decodedBlob?.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
                    <div className="mb-3 rounded-full bg-slate-100 p-4">
                      <ImageIcon className="h-7 w-7 text-slate-400" />
                    </div>
                    <h3 className="mb-1 text-sm font-medium text-slate-700">
                      暂无预览
                    </h3>
                    <p className="text-xs text-slate-500">
                      在左侧粘贴 Base64/DataURL 后，点击「解析预览」即可查看结果
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

