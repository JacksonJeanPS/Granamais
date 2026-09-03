import { signOut } from "@/app/(auth)/actions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Layout({ children }: { children: React.ReactNode }) { return <AppShell header={<div className="ms-auto flex items-center gap-2"><ThemeToggle /><form action={signOut}><Button variant="outline" size="sm">Sair</Button></form></div>}>{children}</AppShell>; }
