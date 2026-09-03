"use client";

import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) { return <CheckboxPrimitive.Root className={cn("peer size-5 shrink-0 rounded-md border border-input bg-surface outline-none focus-visible:ring-3 focus-visible:ring-ring/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className)} {...props}><CheckboxPrimitive.Indicator><Check className="size-4" /></CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>; }
