export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string; // 暂时使用 emoji，后续可替换为图标组件
  isHot: boolean;
  href: string;
}

export const tools: Tool[] = [
  {
    id: "json-formatter",
    name: "JSON 格式化与校验",
    description: "快速格式化、压缩和校验 JSON 数据，支持语法高亮与错误提示",
    icon: "📄",
    isHot: true,
    href: "/json",
  },
  {
    id: "password-generator",
    name: "密码生成器",
    description: "生成安全的随机密码或易记忆的密码短语，支持强度分析",
    icon: "🔐",
    isHot: true,
    href: "/password",
  },
  // 后续工具占位，待开发
  {
    id: "regex-tester",
    name: "正则表达式测试",
    description: "测试和调试正则表达式，支持多行匹配与分组捕获",
    icon: "🔍",
    isHot: false,
    href: "#",
  },
  {
    id: "url-encoder",
    name: "URL 编码/解码",
    description: "快速进行 URL 编码与解码转换，支持批量处理",
    icon: "🔗",
    isHot: false,
    href: "#",
  },
  {
    id: "diff-viewer",
    name: "文本对比工具",
    description: "对比两段文本的差异，支持行级高亮与合并视图",
    icon: "📊",
    isHot: false,
    href: "#",
  },
];
