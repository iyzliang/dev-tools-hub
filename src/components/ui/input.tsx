import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", hasError = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 ease-out placeholder:text-slate-400",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
          hasError &&
            "border-red-500 text-red-700 placeholder:text-red-400 focus:border-red-500 focus:ring-red-500/30",
          !hasError && "border-slate-200",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

