export interface ShadowParams {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateShadowParams(params: ShadowParams): ValidationResult {
  const errors: string[] = [];

  if (params.x < -100 || params.x > 100) {
    errors.push("X 偏移必须在 -100px 到 100px 之间");
  }

  if (params.y < -100 || params.y > 100) {
    errors.push("Y 偏移必须在 -100px 到 100px 之间");
  }

  if (params.blur < 0 || params.blur > 100) {
    errors.push("模糊半径必须在 0px 到 100px 之间");
  }

  if (params.spread < -50 || params.spread > 50) {
    errors.push("扩散半径必须在 -50px 到 50px 之间");
  }

  if (params.opacity < 0 || params.opacity > 1) {
    errors.push("透明度必须在 0 到 1 之间");
  }

  if (!isValidColor(params.color)) {
    errors.push("颜色格式无效");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isValidColor(color: string): boolean {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
  const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;
  const hslPattern = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/;
  const namedColors = [
    "black", "white", "red", "green", "blue", "yellow", "cyan", "magenta",
    "gray", "grey", "silver", "maroon", "olive", "lime", "aqua", "teal",
    "navy", "fuchsia", "purple", "orange", "pink", "brown", "gold"
  ];

  return (
    hexPattern.test(color) ||
    rgbPattern.test(color) ||
    rgbaPattern.test(color) ||
    hslPattern.test(color) ||
    namedColors.includes(color.toLowerCase())
  );
}

export function hexToRgba(hex: string, opacity: number): string {
  let r = 0;
  let g = 0;
  let b = 0;

  if (hex.length === 4) {
    r = Number.parseInt(hex[1] + hex[1], 16);
    g = Number.parseInt(hex[2] + hex[2], 16);
    b = Number.parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = Number.parseInt(hex.slice(1, 3), 16);
    g = Number.parseInt(hex.slice(3, 5), 16);
    b = Number.parseInt(hex.slice(5, 7), 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function generateBoxShadowCSS(params: ShadowParams | ShadowParams[]): string {
  const shadows = Array.isArray(params) ? params : [params];
  
  const shadowStrings = shadows.map((shadow) => {
    const rgbaColor = shadow.color.startsWith("#") 
      ? hexToRgba(shadow.color, shadow.opacity)
      : shadow.color;

    const parts = [
      shadow.inset ? "inset" : "",
      `${shadow.x}px`,
      `${shadow.y}px`,
      `${shadow.blur}px`,
      `${shadow.spread}px`,
      rgbaColor,
    ].filter((part) => part !== "");

    return parts.join(" ");
  });

  return `box-shadow: ${shadowStrings.join(", ")};`;
}

export function generateTailwindShadow(params: ShadowParams): string {
  const shadowValue = generateBoxShadowCSS(params);
  const escapedValue = shadowValue
    .replace(/box-shadow:\s*/, "")
    .replace(/\s+/g, "_")
    .replace(/,/g, "_")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

  return `[box-shadow:${escapedValue}]`;
}

export function parseBoxShadow(cssString: string): ShadowParams[] {
  const shadows: ShadowParams[] = [];
  const boxShadowMatch = cssString.match(/box-shadow:\s*([\s\S]+?);?$/);

  if (!boxShadowMatch || !boxShadowMatch[1]) {
    return shadows;
  }

  const shadowString = boxShadowMatch[1].trim();
  
  const shadowParts: string[] = [];
  let current = "";
  let parenDepth = 0;
  
  for (let i = 0; i < shadowString.length; i++) {
    const char = shadowString[i];
    if (char === "(") parenDepth++;
    else if (char === ")") parenDepth--;
    else if (char === "," && parenDepth === 0) {
      shadowParts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) {
    shadowParts.push(current.trim());
  }

  shadowParts.forEach((part) => {
    const trimmed = part.trim();
    
    const colorMatch = trimmed.match(/rgba?\([^)]+\)|#[A-Fa-f0-9]{3,6}/);
    
    let color = "#000000";
    let opacity = 1;
    
    if (colorMatch) {
      const colorValue = colorMatch[0];
      if (colorValue.startsWith("rgba")) {
        const rgbaMatch = colorValue.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
        if (rgbaMatch) {
          const r = rgbaMatch[1];
          const g = rgbaMatch[2];
          const b = rgbaMatch[3];
          opacity = rgbaMatch[4] ? Number.parseFloat(rgbaMatch[4]) : 1;
          color = `#${Number(r).toString(16).padStart(2, "0")}${Number(g).toString(16).padStart(2, "0")}${Number(b).toString(16).padStart(2, "0")}`;
        }
      } else {
        color = colorValue;
      }
    }

    const withoutColor = trimmed.replace(/rgba?\([^)]+\)|#[A-Fa-f0-9]{3,6}/, "").trim();
    
    const hasInset = withoutColor.startsWith("inset");
    const valuesStr = hasInset ? withoutColor.replace(/^inset\s*/, "") : withoutColor;
    
    const values = valuesStr.split(/\s+/).filter(v => v.length > 0);

    if (values.length >= 2) {
      const x = Number.parseInt(values[0] || "0", 10);
      const y = Number.parseInt(values[1] || "0", 10);
      const blur = values.length >= 3 ? Number.parseInt(values[2] || "0", 10) : 0;
      const spread = values.length >= 4 ? Number.parseInt(values[3] || "0", 10) : 0;

      shadows.push({
        x,
        y,
        blur,
        spread,
        color,
        opacity,
        inset: hasInset,
      });
    }
  });

  return shadows;
}

export function generateCSSVariable(name: string, params: ShadowParams): string {
  const shadowValue = generateBoxShadowCSS(params).replace("box-shadow: ", "");
  return `--${name}: ${shadowValue};`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeShadowParams(params: Partial<ShadowParams>): ShadowParams {
  return {
    x: clamp(params.x ?? 0, -100, 100),
    y: clamp(params.y ?? 0, -100, 100),
    blur: clamp(params.blur ?? 0, 0, 100),
    spread: clamp(params.spread ?? 0, -50, 50),
    color: params.color ?? "#000000",
    opacity: clamp(params.opacity ?? 1, 0, 1),
    inset: params.inset ?? false,
  };
}