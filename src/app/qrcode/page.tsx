"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ContentTypeSelector,
  ContentFormWrapper,
  DEFAULT_CONTENT_DATA,
  StyleConfig,
  QRCodePreview,
  ImageUploader,
  ScanResult,
  type ContentFormData,
} from "@/components/qrcode";
import {
  type QRContentType,
  formatQRContent,
} from "@/lib/qrcode-content";
import {
  generateQRCodeDataURL,
  generateQRCodeSVG,
  type QRCodeOptions,
} from "@/lib/qrcode-generator";
import {
  scanQRCodeFromFile,
  scanQRCodeFromURL,
  scanQRCodeFromBlob,
} from "@/lib/qrcode-scanner";
import { type ExportFormat } from "@/lib/qrcode-export";
import { trackEvent } from "@/lib/analytics";

// ============================================================================
// Types
// ============================================================================

type QRCodeMode = "generate" | "scan";

// ============================================================================
// Constants
// ============================================================================

const TOOL_NAME = "qrcode-tool";
const DEBOUNCE_DELAY = 300;

// ============================================================================
// Component
// ============================================================================

export default function QRCodeToolPage() {
  // Mode state
  const [mode, setMode] = useState<QRCodeMode>("generate");

  // Generate mode states
  const [contentType, setContentType] = useState<QRContentType>("text");
  const [contentData, setContentData] = useState<ContentFormData>(DEFAULT_CONTENT_DATA);
  const [styleOptions, setStyleOptions] = useState<QRCodeOptions>({
    size: 256,
    errorCorrectionLevel: "M",
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    margin: 4,
  });
  const [qrDataURL, setQrDataURL] = useState<string | null>(null);
  const [qrSvgString, setQrSvgString] = useState<string | undefined>();
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Scan mode states
  const [uploadedImageURL, setUploadedImageURL] = useState<string | null>(null);
  const [scanContent, setScanContent] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Refs for debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>("");

  // Track tool open
  useEffect(() => {
    trackEvent("tool_open", { tool_name: TOOL_NAME }, { toolName: TOOL_NAME });
  }, []);

  // Generate QR code
  const generateQRCode = useCallback(async () => {
    // Format content based on type
    const result = formatQRContent({
      type: contentType,
      config: contentData[contentType],
    } as Parameters<typeof formatQRContent>[0]);

    if (!result.success) {
      setGenerateError(result.error || "内容格式化失败");
      setQrDataURL(null);
      setQrSvgString(undefined);
      return;
    }

    // Skip if content hasn't changed
    if (result.content === lastContentRef.current) {
      return;
    }
    lastContentRef.current = result.content;

    setIsGenerating(true);
    setGenerateError(null);

    try {
      // Generate DataURL for preview
      const dataURLResult = await generateQRCodeDataURL(result.content, styleOptions);
      if (!dataURLResult.success) {
        setGenerateError(dataURLResult.error || "生成二维码失败");
        setQrDataURL(null);
        setQrSvgString(undefined);
        return;
      }

      // Generate SVG for export
      const svgResult = await generateQRCodeSVG(result.content, styleOptions);

      setQrDataURL(dataURLResult.dataURL);
      setQrSvgString(svgResult.success ? svgResult.svg : undefined);

      // Track event
      trackEvent(
        "qrcode_generate",
        {
          content_type: contentType,
          size: styleOptions.size ?? 256,
          error_level: styleOptions.errorCorrectionLevel ?? "M",
          has_custom_color:
            styleOptions.foregroundColor !== "#000000" ||
            styleOptions.backgroundColor !== "#FFFFFF",
        },
        { toolName: TOOL_NAME }
      );
    } catch {
      setGenerateError("生成二维码时发生错误");
      setQrDataURL(null);
      setQrSvgString(undefined);
    } finally {
      setIsGenerating(false);
    }
  }, [contentType, contentData, styleOptions]);

  // Debounced auto-generate
  useEffect(() => {
    if (mode !== "generate") return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      generateQRCode();
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [contentType, contentData, styleOptions, mode, generateQRCode]);

  // Handle content form change
  const handleContentChange = useCallback(
    <T extends QRContentType>(type: T, data: ContentFormData[T]) => {
      setContentData((prev) => ({ ...prev, [type]: data }));
    },
    []
  );

  // Handle mode switch
  const handleModeSwitch = useCallback(
    (newMode: QRCodeMode) => {
      if (newMode === mode) return;

      trackEvent(
        "qrcode_mode_switch",
        { from_mode: mode, to_mode: newMode },
        { toolName: TOOL_NAME }
      );

      setMode(newMode);
    },
    [mode]
  );

  // Handle image upload
  const handleImageLoad = useCallback(async (data: File | Blob) => {
    setIsScanning(true);
    setScanError(null);
    setScanContent(null);

    // Create preview URL
    const previewURL = URL.createObjectURL(data);
    setUploadedImageURL(previewURL);

    try {
      const result =
        data instanceof File
          ? await scanQRCodeFromFile(data)
          : await scanQRCodeFromBlob(data);

      if (result.success) {
        setScanContent(result.content);

        trackEvent(
          "qrcode_scan",
          { input_method: data instanceof File ? "upload" : "paste", success: true },
          { toolName: TOOL_NAME }
        );
      } else {
        setScanError(result.error || "解析失败");

        trackEvent(
          "qrcode_scan",
          { input_method: data instanceof File ? "upload" : "paste", success: false },
          { toolName: TOOL_NAME }
        );
      }
    } catch {
      setScanError("解析二维码时发生错误");
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Handle URL submit
  const handleUrlSubmit = useCallback(async (url: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanContent(null);
    setUploadedImageURL(url);

    try {
      const result = await scanQRCodeFromURL(url);

      if (result.success) {
        setScanContent(result.content);

        trackEvent(
          "qrcode_scan",
          { input_method: "url", success: true },
          { toolName: TOOL_NAME }
        );
      } else {
        setScanError(result.error || "解析失败");

        trackEvent(
          "qrcode_scan",
          { input_method: "url", success: false },
          { toolName: TOOL_NAME }
        );
      }
    } catch {
      setScanError("加载图片时发生错误");
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Handle clear uploaded image
  const handleClearImage = useCallback(() => {
    if (uploadedImageURL && uploadedImageURL.startsWith("blob:")) {
      URL.revokeObjectURL(uploadedImageURL);
    }
    setUploadedImageURL(null);
    setScanContent(null);
    setScanError(null);
  }, [uploadedImageURL]);

  // Handle download
  const handleDownload = useCallback((format: ExportFormat) => {
    trackEvent(
      "qrcode_download",
      { format, export_size: styleOptions.size ?? 256 },
      { toolName: TOOL_NAME }
    );
  }, [styleOptions.size]);

  // Handle copy
  const handleCopy = useCallback(() => {
    trackEvent("qrcode_copy", {}, { toolName: TOOL_NAME });
  }, []);

  // Handle scan result copy
  const handleScanCopy = useCallback(() => {
    trackEvent("qrcode_scan_copy", {}, { toolName: TOOL_NAME });
  }, []);

  // Keyboard shortcut (Cmd/Ctrl + Enter)
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      if (!isCmdOrCtrl || event.key !== "Enter") return;

      event.preventDefault();
      if (mode === "generate") {
        generateQRCode();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, generateQRCode]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header Section */}
      <header className="shrink-0 space-y-4 pb-4">
        {/* Title */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            二维码工具
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            生成与解析二维码，支持多种内容类型与样式自定义。快捷键{" "}
            <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
              ⌘/Ctrl + Enter
            </kbd>
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => handleModeSwitch("generate")}
            className={`cursor-pointer rounded-md px-4 py-2 text-xs font-medium transition-all duration-150 ${
              mode === "generate"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            生成二维码
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("scan")}
            className={`cursor-pointer rounded-md px-4 py-2 text-xs font-medium transition-all duration-150 ${
              mode === "scan"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            解析二维码
          </button>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        {mode === "generate" ? (
          <>
            {/* Left Panel - Configuration */}
            <div className="flex min-h-0 flex-col">
              <div className="mb-2 flex shrink-0 items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-slate-700">配置选项</span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <div className="space-y-6">
                  {/* Content Type Selector */}
                  <ContentTypeSelector
                    value={contentType}
                    onChange={setContentType}
                  />

                  {/* Dynamic Form */}
                  <div className="border-t border-slate-200 pt-4">
                    <ContentFormWrapper
                      type={contentType}
                      data={contentData}
                      onChange={handleContentChange}
                    />
                  </div>

                  {/* Style Config */}
                  <div className="border-t border-slate-200 pt-4">
                    <StyleConfig
                      value={styleOptions}
                      onChange={setStyleOptions}
                    />
                  </div>

                  {/* Generate Button */}
                  <div className="border-t border-slate-200 pt-4">
                    <Button
                      onClick={generateQRCode}
                      disabled={isGenerating}
                      className="w-full gap-2"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                      {isGenerating ? "生成中..." : "生成二维码"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex min-h-0 flex-col">
              <div className="mb-2 flex shrink-0 items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-700">预览与导出</span>
              </div>
              <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white p-4">
                <QRCodePreview
                  dataURL={qrDataURL}
                  content={lastContentRef.current}
                  svgString={qrSvgString}
                  isGenerating={isGenerating}
                  error={generateError || undefined}
                  onDownload={handleDownload}
                  onCopy={handleCopy}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Left Panel - Image Upload */}
            <div className="flex min-h-0 flex-col">
              <div className="mb-2 flex shrink-0 items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-slate-700">上传图片</span>
              </div>
              <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <ImageUploader
                  onImageLoad={handleImageLoad}
                  onUrlSubmit={handleUrlSubmit}
                  previewUrl={uploadedImageURL}
                  onClear={handleClearImage}
                  isProcessing={isScanning}
                />
              </div>
            </div>

            {/* Right Panel - Scan Result */}
            <div className="flex min-h-0 flex-col">
              <div className="mb-2 flex shrink-0 items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-700">解析结果</span>
              </div>
              <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white p-4">
                <ScanResult
                  content={scanContent}
                  isScanning={isScanning}
                  error={scanError}
                  onCopy={handleScanCopy}
                />
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
