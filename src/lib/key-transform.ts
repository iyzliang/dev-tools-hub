/**
 * JSON Key 命名风格转换工具
 * 支持蛇形(snake_case)、驼峰(camelCase)、帕斯卡(PascalCase)之间的相互转换
 */

export type KeyTransformType = "snakeToCamel" | "camelToSnake" | "snakeToPascal";

/**
 * 将 snake_case 转换为 camelCase
 * @example snakeToCamel("user_name") => "userName"
 * @example snakeToCamel("user_id_2") => "userId2"
 */
export function snakeToCamel(str: string): string {
  if (!str || typeof str !== "string") {
    return str;
  }

  return str
    .toLowerCase()
    .replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

/**
 * 将 camelCase 或 PascalCase 转换为 snake_case
 * @example camelToSnake("userName") => "user_name"
 * @example camelToSnake("UserName") => "user_name"
 * @example camelToSnake("userId2") => "user_id_2"
 */
export function camelToSnake(str: string): string {
  if (!str || typeof str !== "string") {
    return str;
  }

  return str
    // 处理连续大写字母（如 HTMLParser -> html_parser）
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    // 处理普通驼峰（如 userName -> user_Name）
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    // 处理数字与字母的边界（如 userId2 -> userId_2）
    .replace(/([a-zA-Z])(\d)/g, "$1_$2")
    .replace(/(\d)([a-zA-Z])/g, "$1_$2")
    .toLowerCase();
}

/**
 * 将 snake_case 转换为 PascalCase
 * @example snakeToPascal("user_name") => "UserName"
 * @example snakeToPascal("user_id_2") => "UserId2"
 */
export function snakeToPascal(str: string): string {
  if (!str || typeof str !== "string") {
    return str;
  }

  const camel = snakeToCamel(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * 获取转换函数
 */
function getTransformFunction(
  type: KeyTransformType
): (str: string) => string {
  const transformers: Record<KeyTransformType, (str: string) => string> = {
    snakeToCamel,
    camelToSnake,
    snakeToPascal,
  };
  return transformers[type];
}

/**
 * 递归转换对象的所有键
 * 支持嵌套对象和数组中的对象
 */
export function transformKeys<T>(
  value: T,
  transformFn: (key: string) => string
): T {
  // 处理 null 和 undefined
  if (value === null || value === undefined) {
    return value;
  }

  // 处理数组：递归处理每个元素
  if (Array.isArray(value)) {
    return value.map((item) => transformKeys(item, transformFn)) as T;
  }

  // 处理对象
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(value as Record<string, unknown>)) {
      const newKey = transformFn(key);
      const originalValue = (value as Record<string, unknown>)[key];
      result[newKey] = transformKeys(originalValue, transformFn);
    }

    return result as T;
  }

  // 基本类型直接返回
  return value;
}

/**
 * 转换 JSON 对象的所有键
 * @param value - 要转换的值（可以是对象、数组或基本类型）
 * @param type - 转换类型
 * @returns 转换后的值
 */
export function transformJsonKeys<T>(value: T, type: KeyTransformType): T {
  const transformFn = getTransformFunction(type);
  return transformKeys(value, transformFn);
}

/**
 * 解析 JSON 字符串并转换所有键
 * @param jsonString - JSON 字符串
 * @param type - 转换类型
 * @returns 转换后的 JSON 字符串（格式化输出）
 */
export function transformJsonString(
  jsonString: string,
  type: KeyTransformType
): string {
  const parsed = JSON.parse(jsonString);
  const transformed = transformJsonKeys(parsed, type);
  return JSON.stringify(transformed, null, 2);
}

/**
 * 获取转换类型的中文描述
 */
export function getTransformTypeLabel(type: KeyTransformType): string {
  const labels: Record<KeyTransformType, string> = {
    snakeToCamel: "蛇形转驼峰",
    camelToSnake: "驼峰转蛇形",
    snakeToPascal: "蛇形转帕斯卡",
  };
  return labels[type];
}
