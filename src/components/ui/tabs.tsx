"use client";

import { Tabs as TabsPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;
function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) { return <TabsPrimitive.List className={cn("inline-flex h-11 items-center rounded-xl bg-subtle p-1", className)} {...props} />; }
function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) { return <TabsPrimitive.Trigger className={cn("h-9 rounded-lg px-4 text-sm font-bold text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)} {...props} />; }
function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) { return <TabsPrimitive.Content className={cn("mt-6 outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...props} />; }
export { Tabs, TabsList, TabsTrigger, TabsContent };
