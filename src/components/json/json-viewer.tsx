"use client";

import * as React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { cn } from "@/lib/utils";

const jsonViewerTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#ffffff",
      color: "#111827",
      fontSize: "13px",
    },
    ".cm-scroller": {
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      lineHeight: 1.45,
    },
    ".cm-gutters": {
      backgroundColor: "#f9fafb",
      color: "#9ca3af",
      borderRight: "1px solid #e5e7eb",
    },
    ".cm-content": {
      padding: "8px 0",
    },
    "&.cm-focused": {
      outline: "none",
    },
  },
  { dark: false },
);

export interface JsonViewerProps {
  value: string;
  className?: string;
}

export function JsonViewer({ value, className }: JsonViewerProps) {
  const [displayValue, setDisplayValue] = React.useState(value);

  React.useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <div
      className={cn(
        "h-full min-h-[220px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <CodeMirror
        value={displayValue}
        height="100%"
        extensions={[json(), jsonViewerTheme]}
        editable={false}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
        }}
        theme="light"
      />
    </div>
  );
}

