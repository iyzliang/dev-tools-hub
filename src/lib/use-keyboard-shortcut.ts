import { useEffect, useCallback } from "react";

type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
};

type ShortcutHandler = () => void;

export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  handler: ShortcutHandler,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrlKey ? isCtrlOrCmd : !isCtrlOrCmd;
      const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.altKey ? event.altKey : !event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        if (shortcut.ctrlKey || shortcut.metaKey) {
          event.preventDefault();
        }
        handler();
      }
    },
    [shortcut, handler]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

export function useGridShortcuts(
  onSave: () => void,
  onCopy: () => void,
  onDelete: () => void,
  enabled: boolean = true
) {
  useKeyboardShortcut({ key: "s", ctrlKey: true }, onSave, enabled);
  useKeyboardShortcut({ key: "c", ctrlKey: true }, onCopy, enabled);
  useKeyboardShortcut({ key: "Delete" }, onDelete, enabled);
  useKeyboardShortcut({ key: "Backspace" }, onDelete, enabled);
}

export function useBoxShadowShortcuts(
  onCopy: () => void,
  onReset: () => void,
  enabled: boolean = true
) {
  useKeyboardShortcut({ key: "c", ctrlKey: true }, onCopy, enabled);
  useKeyboardShortcut({ key: "r" }, onReset, enabled);
}