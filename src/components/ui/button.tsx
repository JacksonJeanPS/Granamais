import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  { variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary-hover",
      outline: "border border-border bg-surface hover:bg-subtle",
      ghost: "hover:bg-subtle",
      destructive: "bg-destructive text-white hover:bg-destructive/90",
    },
    size: { default: "h-11 px-5", sm: "h-9 px-3", lg: "h-12 px-6", icon: "size-10" },
  }, defaultVariants: { variant: "default", size: "default" } },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
