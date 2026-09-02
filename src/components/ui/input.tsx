import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return <input type={type} className={cn("h-11 w-full rounded-xl border border-input bg-surface px-3.5 text-base outline-none transition-shadow placeholder:text-muted focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm", className)} {...props} />;
}

export { Input };
