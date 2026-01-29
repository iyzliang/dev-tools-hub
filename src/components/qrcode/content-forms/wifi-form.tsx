"use client";

import { useState } from "react";
import { type WifiConfig, type WifiEncryptionType, WIFI_ENCRYPTION_LABELS } from "@/lib/qrcode-content";

// ============================================================================
// Types
// ============================================================================

export interface WifiFormProps {
  /** Form data */
  value: WifiConfig;
  /** Callback when form data changes */
  onChange: (value: WifiConfig) => void;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const ENCRYPTION_TYPES: WifiEncryptionType[] = ["WPA", "WEP", "nopass"];

// ============================================================================
// Component
// ============================================================================

/**
 * WiFi connection form for QR code content
 */
export function WifiForm({ value, onChange, disabled = false }: WifiFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = <K extends keyof WifiConfig>(
    key: K,
    newValue: WifiConfig[K]
  ) => {
    onChange({ ...value, [key]: newValue });
  };

  return (
    <div className="space-y-4">
      {/* SSID */}
      <div className="space-y-2">
        <label htmlFor="wifi-ssid" className="text-xs font-medium text-slate-600">
          网络名称 (SSID) <span className="text-red-500">*</span>
        </label>
        <input
          id="wifi-ssid"
          type="text"
          value={value.ssid}
          onChange={(e) => handleChange("ssid", e.target.value)}
          disabled={disabled}
          placeholder="输入 WiFi 网络名称"
          className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
      </div>

      {/* Encryption Type */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600">加密类型</label>
        <div className="grid grid-cols-3 gap-2">
          {ENCRYPTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange("encryptionType", type)}
              disabled={disabled}
              className={`cursor-pointer rounded-md border px-3 py-2 text-xs font-medium transition-all ${
                value.encryptionType === type
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {WIFI_ENCRYPTION_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Password (only show when encryption is not 'nopass') */}
      {value.encryptionType !== "nopass" && (
        <div className="space-y-2">
          <label htmlFor="wifi-password" className="text-xs font-medium text-slate-600">
            密码 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="wifi-password"
              type={showPassword ? "text" : "password"}
              value={value.password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={disabled}
              placeholder="输入 WiFi 密码"
              className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                disabled ? "cursor-not-allowed opacity-50" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hidden Network */}
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={value.hidden || false}
          onChange={(e) => handleChange("hidden", e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-xs text-slate-600">隐藏网络</span>
      </label>
    </div>
  );
}

export default WifiForm;
