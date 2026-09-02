import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Grana+ | Sua vida financeira com clareza", template: "%s | Grana+" },
  description: "Organize contas, cartões, parcelas, orçamento e metas em um só lugar, feito para a vida financeira brasileira.",
  applicationName: "Grana+", icons: { icon: "/icon.svg" }, robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: [
  { media: "(prefers-color-scheme: light)", color: "#F6F7F3" },
  { media: "(prefers-color-scheme: dark)", color: "#101714" },
] };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${manrope.variable} antialiased`}><body><ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>{children}</ThemeProvider></body></html>;
}
