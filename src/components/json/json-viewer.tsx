"use client";

import * as React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { cn } from "@/lib/utils";

const jsonViewerTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "#f8fafc",
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
      backgroundColor: "#f1f5f9",
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
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-selectionBackground": {
      backgroundColor: "#cbd5e1 !important",
    },
  },
  { dark: false }
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
        "flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm",
        className
      )}
    >
      <CodeMirror
        value={displayValue}
        height="100%"
        style={{ height: "100%", overflow: "hidden" }}
        extensions={[json(), jsonViewerTheme]}
        editable={false}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
          highlightSelectionMatches: true,
          bracketMatching: true,
        }}
        theme="light"
      />
    </div>
  );
}
