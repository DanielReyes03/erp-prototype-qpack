import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QPack ERP",
  description:
    "Prototipo funcional de ERP para importadora y revendedora de plásticos — demo navegable.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-theme="light"
      className={`${inter.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full min-h-screen bg-background text-foreground font-sans text-sm">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
