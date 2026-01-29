"use client";

import {
  type QRContentType,
  type TextConfig,
  type WifiConfig,
  type VCardConfig,
  type EmailConfig,
  type PhoneConfig,
  type SmsConfig,
} from "@/lib/qrcode-content";

import {
  TextUrlForm,
  WifiForm,
  VCardForm,
  EmailForm,
  PhoneForm,
  SmsForm,
} from "./content-forms";

// ============================================================================
// Types
// ============================================================================

/**
 * Union type for all content form data
 */
export type ContentFormData = {
  text: TextConfig;
  wifi: WifiConfig;
  vcard: VCardConfig;
  email: EmailConfig;
  phone: PhoneConfig;
  sms: SmsConfig;
};

export interface ContentFormWrapperProps {
  /** Current content type */
  type: QRContentType;
  /** Form data for all content types */
  data: ContentFormData;
  /** Callback when any form data changes */
  onChange: <T extends QRContentType>(type: T, data: ContentFormData[T]) => void;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for each content type
 */
export const DEFAULT_CONTENT_DATA: ContentFormData = {
  text: { content: "" },
  wifi: { ssid: "", password: "", encryptionType: "WPA", hidden: false },
  vcard: { fullName: "" },
  email: { to: "" },
  phone: { number: "" },
  sms: { number: "", message: "" },
};

// ============================================================================
// Component
// ============================================================================

/**
 * Content form wrapper that renders the appropriate form based on content type
 */
export function ContentFormWrapper({
  type,
  data,
  onChange,
  disabled = false,
}: ContentFormWrapperProps) {
  switch (type) {
    case "text":
      return (
        <TextUrlForm
          value={data.text}
          onChange={(value) => onChange("text", value)}
          disabled={disabled}
        />
      );

    case "wifi":
      return (
        <WifiForm
          value={data.wifi}
          onChange={(value) => onChange("wifi", value)}
          disabled={disabled}
        />
      );

    case "vcard":
      return (
        <VCardForm
          value={data.vcard}
          onChange={(value) => onChange("vcard", value)}
          disabled={disabled}
        />
      );

    case "email":
      return (
        <EmailForm
          value={data.email}
          onChange={(value) => onChange("email", value)}
          disabled={disabled}
        />
      );

    case "phone":
      return (
        <PhoneForm
          value={data.phone}
          onChange={(value) => onChange("phone", value)}
          disabled={disabled}
        />
      );

    case "sms":
      return (
        <SmsForm
          value={data.sms}
          onChange={(value) => onChange("sms", value)}
          disabled={disabled}
        />
      );

    default:
      return null;
  }
}

export default ContentFormWrapper;
