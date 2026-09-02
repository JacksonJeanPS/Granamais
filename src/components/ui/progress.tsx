import { Progress as ProgressPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Progress({ className, value = 0, ...props }: ComponentProps<typeof ProgressPrimitive.Root>) {
  const safeValue = Math.min(100, Math.max(0, value ?? 0));
  return <ProgressPrimitive.Root className={cn("relative h-2 w-full overflow-hidden rounded-full bg-subtle", className)} value={safeValue} {...props}><ProgressPrimitive.Indicator className="h-full bg-primary transition-transform" style={{ transform: `translateX(-${100 - safeValue}%)` }} /></ProgressPrimitive.Root>;
}

export { Progress };
