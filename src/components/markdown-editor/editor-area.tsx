"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TAB_SIZE = 2;

export interface EditorAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Minimum height in pixels or Tailwind class (e.g. min-h-[400px]) */
  minHeight?: string;
  /** Called when toolbar wants to insert at cursor; parent can pass ref and call insertAtCursor */
}

export interface EditorAreaHandle {
  insertAtCursor: (text: string) => void;
  /** Wrap current selection with before/after strings. */
  wrapSelection: (before: string, after: string) => void;
}

export const EditorArea = React.forwardRef<EditorAreaHandle, EditorAreaProps>(
  (
    {
      value,
      onChange,
      placeholder = "输入 Markdown…",
      disabled = false,
      className,
      minHeight = "min-h-[400px]",
    },
    ref,
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const insertAtCursor = React.useCallback(
      (text: string) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const before = value.slice(0, start);
        const after = value.slice(end);
        const next = before + text + after;
        onChange(next);
        requestAnimationFrame(() => {
          el.focus();
          const newPos = start + text.length;
          el.setSelectionRange(newPos, newPos);
        });
      },
      [value, onChange],
    );

    const wrapSelection = React.useCallback(
      (before: string, after: string) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const left = value.slice(0, start);
        const sel = value.slice(start, end);
        const right = value.slice(end);
        const next = left + before + sel + after + right;
        onChange(next);
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(
            start + before.length,
            end + before.length,
          );
        });
      },
      [value, onChange],
    );

    React.useImperativeHandle(
      ref,
      () => ({
        insertAtCursor,
        wrapSelection,
      }),
      [insertAtCursor, wrapSelection],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const el = e.currentTarget;
          const start = el.selectionStart;
          const end = el.selectionEnd;
          const spaces = " ".repeat(TAB_SIZE);
          const before = value.slice(0, start);
          const after = value.slice(end);
          onChange(before + spaces + after);
          requestAnimationFrame(() => {
            el.setSelectionRange(start + TAB_SIZE, start + TAB_SIZE);
          });
        }
      },
      [value, onChange],
    );

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
      },
      [onChange],
    );

    return (
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Markdown 编辑区"
        className={cn(
          "font-mono text-sm resize-y",
          minHeight,
          className,
        )}
        spellCheck={false}
        data-gramm={false}
        data-gramm_editor={false}
      />
    );
  },
);

EditorArea.displayName = "EditorArea";
