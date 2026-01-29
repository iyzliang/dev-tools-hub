"use client";

import * as React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { cn } from "@/lib/utils";

const jsonEditorTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "#ffffff",
      color: "#0f172a",
      fontSize: "13px",
    },
    ".cm-scroller": {
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      lineHeight: 1.55,
      overflow: "auto",
    },
    ".cm-gutters": {
      backgroundColor: "#f8fafc",
      color: "#94a3b8",
      borderRight: "1px solid #e2e8f0",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 12px 0 8px",
      minWidth: "3em",
    },
    ".cm-content": {
      padding: "12px 0",
    },
    ".cm-line": {
      padding: "0 12px",
    },
    ".cm-activeLine": {
      backgroundColor: "#f1f5f9",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#f1f5f9",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#2563eb",
      borderLeftWidth: "2px",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-selectionBackground": {
      backgroundColor: "#bfdbfe !important",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "#93c5fd !important",
    },
  },
  { dark: false }
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
        "flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm",
        "transition-shadow duration-150 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100",
        className
      )}
    >
      <CodeMirror
        value={internalValue}
        height="100%"
        style={{ height: "100%", overflow: "hidden" }}
        extensions={[json(), jsonEditorTheme]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          bracketMatching: true,
          autocompletion: true,
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
