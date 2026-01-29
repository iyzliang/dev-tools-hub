"use client";

import { useState } from "react";
import { type VCardConfig } from "@/lib/qrcode-content";

// ============================================================================
// Types
// ============================================================================

export interface VCardFormProps {
  /** Form data */
  value: VCardConfig;
  /** Callback when form data changes */
  onChange: (value: VCardConfig) => void;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Sub-components
// ============================================================================

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "tel" | "url";
}

function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  type = "text",
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
      />
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

/**
 * vCard contact form for QR code content
 */
export function VCardForm({ value, onChange, disabled = false }: VCardFormProps) {
  const [showMore, setShowMore] = useState(false);

  const handleChange = <K extends keyof VCardConfig>(
    key: K,
    newValue: VCardConfig[K]
  ) => {
    onChange({ ...value, [key]: newValue });
  };

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <FormField
        id="vcard-fullname"
        label="姓名"
        value={value.fullName}
        onChange={(v) => handleChange("fullName", v)}
        placeholder="张三"
        required
        disabled={disabled}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          id="vcard-lastname"
          label="姓"
          value={value.lastName || ""}
          onChange={(v) => handleChange("lastName", v)}
          placeholder="张"
          disabled={disabled}
        />
        <FormField
          id="vcard-firstname"
          label="名"
          value={value.firstName || ""}
          onChange={(v) => handleChange("firstName", v)}
          placeholder="三"
          disabled={disabled}
        />
      </div>

      <FormField
        id="vcard-phone"
        label="电话"
        value={value.phone || ""}
        onChange={(v) => handleChange("phone", v)}
        placeholder="+86 138 0000 0000"
        type="tel"
        disabled={disabled}
      />

      <FormField
        id="vcard-email"
        label="邮箱"
        value={value.email || ""}
        onChange={(v) => handleChange("email", v)}
        placeholder="example@email.com"
        type="email"
        disabled={disabled}
      />

      {/* Expandable Section */}
      <div className="border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          disabled={disabled}
          className="flex w-full cursor-pointer items-center justify-between text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          <span>更多信息</span>
          <svg
            className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMore && (
          <div className="mt-3 space-y-4">
            <FormField
              id="vcard-org"
              label="公司"
              value={value.organization || ""}
              onChange={(v) => handleChange("organization", v)}
              placeholder="公司名称"
              disabled={disabled}
            />

            <FormField
              id="vcard-title"
              label="职位"
              value={value.title || ""}
              onChange={(v) => handleChange("title", v)}
              placeholder="职位名称"
              disabled={disabled}
            />

            <FormField
              id="vcard-url"
              label="网站"
              value={value.url || ""}
              onChange={(v) => handleChange("url", v)}
              placeholder="https://example.com"
              type="url"
              disabled={disabled}
            />

            <FormField
              id="vcard-address"
              label="地址"
              value={value.address || ""}
              onChange={(v) => handleChange("address", v)}
              placeholder="街道地址"
              disabled={disabled}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="vcard-city"
                label="城市"
                value={value.city || ""}
                onChange={(v) => handleChange("city", v)}
                placeholder="城市"
                disabled={disabled}
              />
              <FormField
                id="vcard-state"
                label="省/州"
                value={value.state || ""}
                onChange={(v) => handleChange("state", v)}
                placeholder="省/州"
                disabled={disabled}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="vcard-postalcode"
                label="邮编"
                value={value.postalCode || ""}
                onChange={(v) => handleChange("postalCode", v)}
                placeholder="邮编"
                disabled={disabled}
              />
              <FormField
                id="vcard-country"
                label="国家"
                value={value.country || ""}
                onChange={(v) => handleChange("country", v)}
                placeholder="国家"
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="vcard-note" className="text-xs font-medium text-slate-600">
                备注
              </label>
              <textarea
                id="vcard-note"
                value={value.note || ""}
                onChange={(e) => handleChange("note", e.target.value)}
                disabled={disabled}
                placeholder="备注信息"
                rows={2}
                className={`w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  disabled ? "cursor-not-allowed opacity-50" : ""
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VCardForm;
