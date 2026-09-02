import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Alert({ className, ...props }: ComponentProps<"div">) { return <div role="alert" className={cn("rounded-xl border border-border bg-subtle p-3.5 text-sm leading-5", className)} {...props} />; }
function AlertTitle({ className, ...props }: ComponentProps<"h3">) { return <h3 className={cn("font-bold", className)} {...props} />; }
function AlertDescription({ className, ...props }: ComponentProps<"p">) { return <p className={cn("text-muted", className)} {...props} />; }

export { Alert, AlertTitle, AlertDescription };
