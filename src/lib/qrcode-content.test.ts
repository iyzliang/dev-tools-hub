/**
 * Unit tests for QR Code Content Formatting Utilities
 */

import { describe, it, expect } from "vitest";
import {
  formatTextContent,
  formatWifiContent,
  formatVCardContent,
  formatEmailContent,
  formatPhoneContent,
  formatSmsContent,
  formatQRContent,
  type WifiConfig,
  type VCardConfig,
  type EmailConfig,
  type PhoneConfig,
  type SmsConfig,
  type TextConfig,
} from "./qrcode-content";

// ============================================================================
// formatTextContent Tests
// ============================================================================

describe("formatTextContent", () => {
  it("should format plain text correctly", () => {
    const config: TextConfig = { content: "Hello World" };
    const result = formatTextContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("Hello World");
    expect(result.error).toBeUndefined();
  });

  it("should format URL correctly", () => {
    const config: TextConfig = { content: "https://example.com" };
    const result = formatTextContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("https://example.com");
  });

  it("should trim whitespace", () => {
    const config: TextConfig = { content: "  test content  " };
    const result = formatTextContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("test content");
  });

  it("should fail with empty content", () => {
    const config: TextConfig = { content: "" };
    const result = formatTextContent(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe("内容不能为空");
  });

  it("should fail with whitespace-only content", () => {
    const config: TextConfig = { content: "   " };
    const result = formatTextContent(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe("内容不能为空");
  });
});

// ============================================================================
// formatWifiContent Tests
// ============================================================================

describe("formatWifiContent", () => {
  it("should format WPA WiFi correctly", () => {
    const config: WifiConfig = {
      ssid: "MyNetwork",
      password: "mypassword123",
      encryptionType: "WPA",
    };
    const result = formatWifiContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("WIFI:T:WPA;S:MyNetwork;P:mypassword123;;");
  });

  it("should format WEP WiFi correctly", () => {
    const config: WifiConfig = {
      ssid: "OldNetwork",
      password: "wepkey",
      encryptionType: "WEP",
    };
    const result = formatWifiContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("WIFI:T:WEP;S:OldNetwork;P:wepkey;;");
  });

  it("should format open WiFi correctly", () => {
    const config: WifiConfig = {
      ssid: "OpenNetwork",
      password: "",
      encryptionType: "nopass",
    };
    const result = formatWifiContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("WIFI:T:nopass;S:OpenNetwork;;");
  });

  it("should handle hidden network", () => {
    const config: WifiConfig = {
      ssid: "HiddenNetwork",
      password: "secret",
      encryptionType: "WPA",
      hidden: true,
    };
    const result = formatWifiContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe(
      "WIFI:T:WPA;S:HiddenNetwork;P:secret;H:true;;"
    );
  });

  it("should escape special characters in SSID", () => {
    const config: WifiConfig = {
      ssid: "Network;With:Special",
      password: "pass",
      encryptionType: "WPA",
    };
    const result = formatWifiContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toContain("Network\\;With\\:Special");
  });

  it("should escape special characters in password", () => {
    const config: WifiConfig = {
      ssid: "Network",
      password: "pass;word:test",
      encryptionType: "WPA",
    };
    const result = formatWifiContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toContain("P:pass\\;word\\:test");
  });

  it("should fail with empty SSID", () => {
    const config: WifiConfig = {
      ssid: "",
      password: "test",
      encryptionType: "WPA",
    };
    const result = formatWifiContent(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe("网络名称(SSID)不能为空");
  });

  it("should fail when encrypted network has no password", () => {
    const config: WifiConfig = {
      ssid: "Network",
      password: "",
      encryptionType: "WPA",
    };
    const result = formatWifiContent(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe("加密网络需要提供密码");
  });
});

// ============================================================================
// formatVCardContent Tests
// ============================================================================

describe("formatVCardContent", () => {
  it("should format minimal vCard correctly", () => {
    const config: VCardConfig = {
      fullName: "John Doe",
    };
    const result = formatVCardContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toContain("BEGIN:VCARD");
    expect(result.content).toContain("VERSION:3.0");
    expect(result.content).toContain("FN:John Doe");
    expect(result.content).toContain("END:VCARD");
  });

  it("should format full vCard correctly", () => {
    const config: VCardConfig = {
      fullName: "张三",
      firstName: "三",
      lastName: "张",
      phone: "+86 138 0000 0000",
      email: "zhangsan@example.com",
      organization: "示例公司",
      title: "工程师",
      address: "北京路 100 号",
      city: "上海",
      state: "上海市",
      postalCode: "200000",
      country: "中国",
      url: "https://example.com",
      note: "备注信息",
    };
    const result = formatVCardContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toContain("FN:张三");
    expect(result.content).toContain("N:张;三;;;");
    expect(result.content).toContain("TEL:+86 138 0000 0000");
    expect(result.content).toContain("EMAIL:zhangsan@example.com");
    expect(result.content).toContain("ORG:示例公司");
    expect(result.content).toContain("TITLE:工程师");
    expect(result.content).toContain("ADR:");
    expect(result.content).toContain("URL:https://example.com");
    expect(result.content).toContain("NOTE:备注信息");
  });

  it("should escape special characters", () => {
    const config: VCardConfig = {
      fullName: "Name;With,Special\\Chars",
    };
    const result = formatVCardContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toContain("FN:Name\\;With\\,Special\\\\Chars");
  });

  it("should fail with empty fullName", () => {
    const config: VCardConfig = {
      fullName: "",
    };
    const result = formatVCardContent(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe("姓名不能为空");
  });

  it("should fail with whitespace-only fullName", () => {
    const config: VCardConfig = {
      fullName: "   ",
    };
    const result = formatVCardContent(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe("姓名不能为空");
  });
});

// ============================================================================
// formatEmailContent Tests
// ============================================================================

describe("formatEmailContent", () => {
  it("should format simple email correctly", () => {
    const config: EmailConfig = {
      to: "test@example.com",
    };
    const result = formatEmailContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("mailto:test@example.com");
  });

  it("should format email with subject correctly", () => {
    const config: EmailConfig = {
      to: "test@example.com",
      subject: "Hello",
    };
    const result = formatEmailContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("mailto:test@example.com?subject=Hello");
  });

  it("should format email with all fields correctly", () => {
    const config: EmailConfig = {
      to: "test@example.com",
      subject: "Test Subject",
      body: "Test Body",
      cc: "cc@example.com",
      bcc: "bcc@example.com",
    };
    const result = formatEmailContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toContain("mailto:test@example.com?");
    expect(result.content).toContain("subject=Test%20Subject");
    expect(result.content).toContain("body=Test%20Body");
    expect(result.content).toContain("cc=cc%40example.com");
    expect(result.content).toContain("bcc=bcc%40example.com");
  });

  it("should encode special characters in subject and body", () => {
    const config: EmailConfig = {
      to: "test@example.com",
      subject: "你好 World!",
      body: "Test & Test",
    };
    const result = formatEmailContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toContain("subject=");
    expect(result.content).toContain("body=Test%20%26%20Test");
  });

  it("should fail with empty recipient", () => {
    const config: EmailConfig = {
      to: "",
    };
    const result = formatEmailContent(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe("收件人邮箱不能为空");
  });

  it("should fail with invalid email format", () => {
    const config: EmailConfig = {
      to: "invalid-email",
    };
    const result = formatEmailContent(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe("邮箱格式不正确");
  });

  it("should trim email address", () => {
    const config: EmailConfig = {
      to: "  test@example.com  ",
    };
    const result = formatEmailContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("mailto:test@example.com");
  });
});

// ============================================================================
// formatPhoneContent Tests
// ============================================================================

describe("formatPhoneContent", () => {
  it("should format phone number correctly", () => {
    const config: PhoneConfig = {
      number: "13800138000",
    };
    const result = formatPhoneContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("tel:13800138000");
  });

  it("should handle phone number with country code", () => {
    const config: PhoneConfig = {
      number: "+86 138 0013 8000",
    };
    const result = formatPhoneContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("tel:+8613800138000");
  });

  it("should clean phone number format", () => {
    const config: PhoneConfig = {
      number: "(021) 1234-5678",
    };
    const result = formatPhoneContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("tel:02112345678");
  });

  it("should fail with empty number", () => {
    const config: PhoneConfig = {
      number: "",
    };
    const result = formatPhoneContent(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe("电话号码不能为空");
  });

  it("should fail with too short number", () => {
    const config: PhoneConfig = {
      number: "12",
    };
    const result = formatPhoneContent(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe("请输入有效的电话号码");
  });
});

// ============================================================================
// formatSmsContent Tests
// ============================================================================

describe("formatSmsContent", () => {
  it("should format SMS without message correctly", () => {
    const config: SmsConfig = {
      number: "13800138000",
    };
    const result = formatSmsContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("smsto:13800138000");
  });

  it("should format SMS with message correctly", () => {
    const config: SmsConfig = {
      number: "13800138000",
      message: "Hello World",
    };
    const result = formatSmsContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("smsto:13800138000:Hello World");
  });

  it("should handle international number format", () => {
    const config: SmsConfig = {
      number: "+86 138 0013 8000",
      message: "测试消息",
    };
    const result = formatSmsContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("smsto:+8613800138000:测试消息");
  });

  it("should fail with empty number", () => {
    const config: SmsConfig = {
      number: "",
      message: "Test",
    };
    const result = formatSmsContent(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe("电话号码不能为空");
  });

  it("should ignore empty message", () => {
    const config: SmsConfig = {
      number: "13800138000",
      message: "   ",
    };
    const result = formatSmsContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toBe("smsto:13800138000");
  });
});

// ============================================================================
// formatQRContent (Unified Function) Tests
// ============================================================================

describe("formatQRContent", () => {
  it("should dispatch to formatTextContent for text type", () => {
    const result = formatQRContent({
      type: "text",
      config: { content: "Hello" },
    });

    expect(result.success).toBe(true);
    expect(result.content).toBe("Hello");
  });

  it("should dispatch to formatWifiContent for wifi type", () => {
    const result = formatQRContent({
      type: "wifi",
      config: {
        ssid: "Test",
        password: "pass",
        encryptionType: "WPA",
      },
    });

    expect(result.success).toBe(true);
    expect(result.content).toContain("WIFI:");
  });

  it("should dispatch to formatVCardContent for vcard type", () => {
    const result = formatQRContent({
      type: "vcard",
      config: { fullName: "Test User" },
    });

    expect(result.success).toBe(true);
    expect(result.content).toContain("BEGIN:VCARD");
  });

  it("should dispatch to formatEmailContent for email type", () => {
    const result = formatQRContent({
      type: "email",
      config: { to: "test@example.com" },
    });

    expect(result.success).toBe(true);
    expect(result.content).toContain("mailto:");
  });

  it("should dispatch to formatPhoneContent for phone type", () => {
    const result = formatQRContent({
      type: "phone",
      config: { number: "13800138000" },
    });

    expect(result.success).toBe(true);
    expect(result.content).toContain("tel:");
  });

  it("should dispatch to formatSmsContent for sms type", () => {
    const result = formatQRContent({
      type: "sms",
      config: { number: "13800138000", message: "Hi" },
    });

    expect(result.success).toBe(true);
    expect(result.content).toContain("smsto:");
  });
});

// ============================================================================
// Edge Cases and Boundary Tests
// ============================================================================

describe("Edge Cases", () => {
  it("should handle very long text content", () => {
    const longText = "A".repeat(5000);
    const result = formatTextContent({ content: longText });

    expect(result.success).toBe(true);
    expect(result.content.length).toBe(5000);
  });

  it("should handle Unicode characters in WiFi SSID", () => {
    const config: WifiConfig = {
      ssid: "中文网络名称",
      password: "密码123",
      encryptionType: "WPA",
    };
    const result = formatWifiContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toContain("中文网络名称");
  });

  it("should handle emoji in text content", () => {
    const result = formatTextContent({ content: "Hello 👋 World 🌍" });

    expect(result.success).toBe(true);
    expect(result.content).toBe("Hello 👋 World 🌍");
  });

  it("should handle newlines in vCard note", () => {
    const config: VCardConfig = {
      fullName: "Test",
      note: "Line 1\nLine 2\nLine 3",
    };
    const result = formatVCardContent(config);

    expect(result.success).toBe(true);
    expect(result.content).toContain("NOTE:Line 1\\nLine 2\\nLine 3");
  });
});
