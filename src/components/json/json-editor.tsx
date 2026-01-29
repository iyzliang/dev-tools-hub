"use client";

import * as React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { cn } from "@/lib/utils";

const jsonEditorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#f9fafb",
      color: "#111827",
      fontSize: "13px",
    },
    ".cm-scroller": {
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      lineHeight: 1.45,
    },
    ".cm-gutters": {
      backgroundColor: "#f3f4f6",
      color: "#9ca3af",
      borderRight: "1px solid #e5e7eb",
    },
    ".cm-content": {
      padding: "8px 0",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#2563eb",
    },
    "&.cm-focused": {
      outline: "none",
    },
  },
  { dark: false },
);

export interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export function JsonEditor({
  value,
  onChange,
  className,
  placeholder,
  readOnly = false,
}: JsonEditorProps) {
  const [internalValue, setInternalValue] = React.useState(value);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <div
      className={cn(
        "h-full min-h-[220px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50",
        "shadow-sm",
        className,
      )}
    >
      <CodeMirror
        value={internalValue}
        height="100%"
        extensions={[json(), jsonEditorTheme]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
        }}
        editable={!readOnly}
        theme="light"
        onChange={(val) => {
          setInternalValue(val);
          onChange(val);
        }}
        placeholder={placeholder}
      />
    </div>
  );
}

