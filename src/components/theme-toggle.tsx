"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const { resolvedTheme, setTheme } = useTheme();

  return <Button aria-label="Alternar tema" variant="ghost" size="icon" disabled={!mounted} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
    {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
  </Button>;
}
