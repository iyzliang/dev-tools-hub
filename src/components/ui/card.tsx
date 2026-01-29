import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({
  className,
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5",
        interactive &&
          "transition-all duration-200 ease-out hover:border-slate-300 hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

