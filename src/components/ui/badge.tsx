import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("inline-flex items-center rounded-full bg-subtle px-2.5 py-1 text-xs font-bold text-muted-foreground", className)} {...props} />;
}
