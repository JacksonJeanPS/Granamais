"use client";

import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
function SelectTrigger({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) { return <SelectPrimitive.Trigger className={cn("flex h-11 w-full items-center justify-between rounded-xl border border-input bg-surface px-3 text-sm outline-none focus:ring-3 focus:ring-ring/30 disabled:opacity-50", className)} {...props}>{children}<SelectPrimitive.Icon><ChevronDown className="size-4 text-muted-foreground" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>; }
function SelectContent({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Content>) { return <SelectPrimitive.Portal><SelectPrimitive.Content className={cn("z-[60] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg", className)} position="popper" sideOffset={5} {...props}><SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>; }
function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) { return <SelectPrimitive.Item className={cn("relative flex cursor-default select-none items-center rounded-lg py-2.5 pe-8 ps-3 text-sm outline-none focus:bg-subtle data-[disabled]:opacity-50", className)} {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator className="absolute end-2"><Check className="size-4 text-primary" /></SelectPrimitive.ItemIndicator></SelectPrimitive.Item>; }
export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };
