import {
  Binary,
  Clock,
  Code,
  FileJson2,
  Hash,
  KeyRound,
  QrCode,
  type LucideIcon,
} from "lucide-react";

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isHot: boolean;
  href: string;
}

export const tools: Tool[] = [
  {
    id: "json-formatter",
    name: "JSON 格式化与校验",
    description: "快速格式化、压缩和校验 JSON 数据，支持语法高亮与错误提示",
    icon: FileJson2,
    isHot: true,
    href: "/json",
  },
  {
    id: "password-generator",
    name: "密码生成器",
    description: "生成安全的随机密码或易记忆的密码短语，支持强度分析",
    icon: KeyRound,
    isHot: true,
    href: "/password",
  },
  {
    id: "qrcode-tool",
    name: "二维码工具",
    description: "生成与解析二维码，支持多种内容类型与样式自定义",
    icon: QrCode,
    isHot: true,
    href: "/qrcode",
  },
  {
    id: "base64-converter",
    name: "Base64 转换",
    description: "图片↔Base64/DataURL 互转，支持复制与下载",
    icon: Binary,
    isHot: false,
    href: "/base64",
  },
  {
    id: "base-converter",
    name: "进制转换",
    description: "二进制、八进制、十进制、十六进制互转",
    icon: Hash,
    isHot: true,
    href: "/base-converter",
  },
  {
    id: "timestamp-converter",
    name: "时间戳转换",
    description: "时间戳与日期时间互转，支持秒/毫秒、多时区与复制",
    icon: Clock,
    isHot: false,
    href: "/timestamp",
  },
  {
    id: "encoding-tool",
    name: "信息编码工具",
    description: "Unicode/URL/UTF16/Base64/MD5/SHA1/HTML 编码与解码，URL 参数解析、JWT 解码",
    icon: Code,
    isHot: false,
    href: "/encoding",
  },
];
