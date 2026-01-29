/**
 * QR Code Content Formatting Utilities
 *
 * Provides formatting functions for various QR code content types:
 * - Text/URL (plain text)
 * - WiFi connection
 * - vCard contact
 * - Email (mailto:)
 * - Phone (tel:)
 * - SMS (smsto:)
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Supported QR code content types
 */
export type QRContentType =
  | "text"
  | "wifi"
  | "vcard"
  | "email"
  | "phone"
  | "sms";

/**
 * WiFi encryption types
 */
export type WifiEncryptionType = "WPA" | "WEP" | "nopass";

/**
 * WiFi connection configuration
 */
export interface WifiConfig {
  /** Network SSID (name) */
  ssid: string;
  /** Network password (empty for open networks) */
  password: string;
  /** Encryption type */
  encryptionType: WifiEncryptionType;
  /** Hidden network flag */
  hidden?: boolean;
}

/**
 * vCard contact configuration (vCard 3.0)
 */
export interface VCardConfig {
  /** Full name (required) */
  fullName: string;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Phone number */
  phone?: string;
  /** Email address */
  email?: string;
  /** Organization/Company */
  organization?: string;
  /** Job title */
  title?: string;
  /** Street address */
  address?: string;
  /** City */
  city?: string;
  /** State/Province */
  state?: string;
  /** Postal code */
  postalCode?: string;
  /** Country */
  country?: string;
  /** Website URL */
  url?: string;
  /** Notes */
  note?: string;
}

/**
 * Email configuration
 */
export interface EmailConfig {
  /** Recipient email address */
  to: string;
  /** Email subject */
  subject?: string;
  /** Email body */
  body?: string;
  /** CC recipients */
  cc?: string;
  /** BCC recipients */
  bcc?: string;
}

/**
 * Phone configuration
 */
export interface PhoneConfig {
  /** Phone number */
  number: string;
}

/**
 * SMS configuration
 */
export interface SmsConfig {
  /** Phone number */
  number: string;
  /** Message content */
  message?: string;
}

/**
 * Text/URL configuration
 */
export interface TextConfig {
  /** Text content or URL */
  content: string;
}

/**
 * Union type for all content configurations
 */
export type QRContentConfig =
  | { type: "text"; config: TextConfig }
  | { type: "wifi"; config: WifiConfig }
  | { type: "vcard"; config: VCardConfig }
  | { type: "email"; config: EmailConfig }
  | { type: "phone"; config: PhoneConfig }
  | { type: "sms"; config: SmsConfig };

/**
 * Result of content formatting
 */
export interface FormatResult {
  /** Whether formatting was successful */
  success: boolean;
  /** Formatted content string */
  content: string;
  /** Error message if formatting failed */
  error?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Escape special characters in WiFi SSID and password
 * Special characters: \ ; , " :
 */
function escapeWifiString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/"/g, '\\"')
    .replace(/:/g, "\\:");
}

/**
 * Escape special characters for vCard format
 * Special characters: \ ; , newline
 */
function escapeVCardString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Encode URI component with additional safety
 */
function safeEncodeURIComponent(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

// ============================================================================
// Content Formatting Functions
// ============================================================================

/**
 * Format plain text or URL content
 *
 * @param config - Text configuration
 * @returns Formatted result
 */
export function formatTextContent(config: TextConfig): FormatResult {
  if (!config.content || config.content.trim().length === 0) {
    return {
      success: false,
      content: "",
      error: "内容不能为空",
    };
  }

  return {
    success: true,
    content: config.content.trim(),
  };
}

/**
 * Format WiFi connection content
 * Format: WIFI:T:<encryption>;S:<ssid>;P:<password>;H:<hidden>;;
 *
 * @param config - WiFi configuration
 * @returns Formatted result
 */
export function formatWifiContent(config: WifiConfig): FormatResult {
  if (!config.ssid || config.ssid.trim().length === 0) {
    return {
      success: false,
      content: "",
      error: "网络名称(SSID)不能为空",
    };
  }

  // Validate password for encrypted networks
  if (
    config.encryptionType !== "nopass" &&
    (!config.password || config.password.length === 0)
  ) {
    return {
      success: false,
      content: "",
      error: "加密网络需要提供密码",
    };
  }

  const escapedSsid = escapeWifiString(config.ssid);
  const escapedPassword = config.password
    ? escapeWifiString(config.password)
    : "";

  let content = `WIFI:T:${config.encryptionType};S:${escapedSsid};`;

  if (config.encryptionType !== "nopass" && escapedPassword) {
    content += `P:${escapedPassword};`;
  }

  if (config.hidden) {
    content += "H:true;";
  }

  content += ";";

  return {
    success: true,
    content,
  };
}

/**
 * Format vCard contact content (vCard 3.0)
 *
 * @param config - vCard configuration
 * @returns Formatted result
 */
export function formatVCardContent(config: VCardConfig): FormatResult {
  if (!config.fullName || config.fullName.trim().length === 0) {
    return {
      success: false,
      content: "",
      error: "姓名不能为空",
    };
  }

  const lines: string[] = [];

  // vCard header
  lines.push("BEGIN:VCARD");
  lines.push("VERSION:3.0");

  // Full name (required)
  lines.push(`FN:${escapeVCardString(config.fullName)}`);

  // Structured name (N field)
  const lastName = config.lastName || "";
  const firstName = config.firstName || "";
  if (lastName || firstName) {
    lines.push(
      `N:${escapeVCardString(lastName)};${escapeVCardString(firstName)};;;`
    );
  }

  // Organization
  if (config.organization) {
    lines.push(`ORG:${escapeVCardString(config.organization)}`);
  }

  // Title
  if (config.title) {
    lines.push(`TITLE:${escapeVCardString(config.title)}`);
  }

  // Phone
  if (config.phone) {
    lines.push(`TEL:${escapeVCardString(config.phone)}`);
  }

  // Email
  if (config.email) {
    lines.push(`EMAIL:${escapeVCardString(config.email)}`);
  }

  // Address
  const hasAddress =
    config.address ||
    config.city ||
    config.state ||
    config.postalCode ||
    config.country;
  if (hasAddress) {
    const addressParts = [
      "", // PO Box
      "", // Extended address
      config.address || "",
      config.city || "",
      config.state || "",
      config.postalCode || "",
      config.country || "",
    ];
    lines.push(`ADR:${addressParts.map(escapeVCardString).join(";")}`);
  }

  // URL
  if (config.url) {
    lines.push(`URL:${escapeVCardString(config.url)}`);
  }

  // Note
  if (config.note) {
    lines.push(`NOTE:${escapeVCardString(config.note)}`);
  }

  // vCard footer
  lines.push("END:VCARD");

  return {
    success: true,
    content: lines.join("\n"),
  };
}

/**
 * Format email (mailto:) content
 * Format: mailto:<to>?subject=<subject>&body=<body>&cc=<cc>&bcc=<bcc>
 *
 * @param config - Email configuration
 * @returns Formatted result
 */
export function formatEmailContent(config: EmailConfig): FormatResult {
  if (!config.to || config.to.trim().length === 0) {
    return {
      success: false,
      content: "",
      error: "收件人邮箱不能为空",
    };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(config.to.trim())) {
    return {
      success: false,
      content: "",
      error: "邮箱格式不正确",
    };
  }

  let content = `mailto:${config.to.trim()}`;

  const params: string[] = [];

  if (config.subject) {
    params.push(`subject=${safeEncodeURIComponent(config.subject)}`);
  }

  if (config.body) {
    params.push(`body=${safeEncodeURIComponent(config.body)}`);
  }

  if (config.cc) {
    params.push(`cc=${safeEncodeURIComponent(config.cc)}`);
  }

  if (config.bcc) {
    params.push(`bcc=${safeEncodeURIComponent(config.bcc)}`);
  }

  if (params.length > 0) {
    content += "?" + params.join("&");
  }

  return {
    success: true,
    content,
  };
}

/**
 * Format phone (tel:) content
 * Format: tel:<number>
 *
 * @param config - Phone configuration
 * @returns Formatted result
 */
export function formatPhoneContent(config: PhoneConfig): FormatResult {
  if (!config.number || config.number.trim().length === 0) {
    return {
      success: false,
      content: "",
      error: "电话号码不能为空",
    };
  }

  // Remove all non-digit characters except + at the beginning
  const cleanedNumber = config.number.trim().replace(/(?!^\+)[^\d]/g, "");

  if (cleanedNumber.replace(/\D/g, "").length < 3) {
    return {
      success: false,
      content: "",
      error: "请输入有效的电话号码",
    };
  }

  return {
    success: true,
    content: `tel:${cleanedNumber}`,
  };
}

/**
 * Format SMS (smsto:) content
 * Format: smsto:<number>:<message>
 *
 * @param config - SMS configuration
 * @returns Formatted result
 */
export function formatSmsContent(config: SmsConfig): FormatResult {
  if (!config.number || config.number.trim().length === 0) {
    return {
      success: false,
      content: "",
      error: "电话号码不能为空",
    };
  }

  // Remove all non-digit characters except + at the beginning
  const cleanedNumber = config.number.trim().replace(/(?!^\+)[^\d]/g, "");

  if (cleanedNumber.replace(/\D/g, "").length < 3) {
    return {
      success: false,
      content: "",
      error: "请输入有效的电话号码",
    };
  }

  let content = `smsto:${cleanedNumber}`;

  if (config.message && config.message.trim().length > 0) {
    content += `:${config.message}`;
  }

  return {
    success: true,
    content,
  };
}

// ============================================================================
// Unified Formatting Function
// ============================================================================

/**
 * Format QR code content based on type
 *
 * @param contentConfig - Content configuration with type
 * @returns Formatted result
 */
export function formatQRContent(contentConfig: QRContentConfig): FormatResult {
  switch (contentConfig.type) {
    case "text":
      return formatTextContent(contentConfig.config);
    case "wifi":
      return formatWifiContent(contentConfig.config);
    case "vcard":
      return formatVCardContent(contentConfig.config);
    case "email":
      return formatEmailContent(contentConfig.config);
    case "phone":
      return formatPhoneContent(contentConfig.config);
    case "sms":
      return formatSmsContent(contentConfig.config);
    default:
      return {
        success: false,
        content: "",
        error: "不支持的内容类型",
      };
  }
}

// ============================================================================
// Content Type Labels (for UI)
// ============================================================================

/**
 * Display labels for content types (Chinese)
 */
export const CONTENT_TYPE_LABELS: Record<QRContentType, string> = {
  text: "文本/URL",
  wifi: "WiFi 连接",
  vcard: "联系人名片",
  email: "邮件",
  phone: "电话",
  sms: "短信",
};

/**
 * WiFi encryption type labels
 */
export const WIFI_ENCRYPTION_LABELS: Record<WifiEncryptionType, string> = {
  WPA: "WPA/WPA2",
  WEP: "WEP",
  nopass: "无密码",
};
