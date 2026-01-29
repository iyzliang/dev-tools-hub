import {
  FileJson2,
  KeyRound,
  QrCode,
  Regex,
  Link,
  GitCompare,
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
];
