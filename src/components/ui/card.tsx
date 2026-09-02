import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: ComponentProps<"div">) { return <div className={cn("rounded-3xl border border-border bg-surface text-foreground shadow-sm", className)} {...props} />; }
function CardHeader({ className, ...props }: ComponentProps<"div">) { return <div className={cn("flex flex-col gap-2 p-6 pb-3 sm:p-8 sm:pb-4", className)} {...props} />; }
function CardTitle({ className, ...props }: ComponentProps<"h2">) { return <h2 className={cn("font-display text-2xl font-extrabold tracking-[-0.03em]", className)} {...props} />; }
function CardDescription({ className, ...props }: ComponentProps<"p">) { return <p className={cn("text-sm leading-6 text-muted", className)} {...props} />; }
function CardContent({ className, ...props }: ComponentProps<"div">) { return <div className={cn("p-6 pt-3 sm:p-8 sm:pt-4", className)} {...props} />; }
function CardFooter({ className, ...props }: ComponentProps<"div">) { return <div className={cn("flex items-center p-6 pt-0 sm:p-8 sm:pt-0", className)} {...props} />; }

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
