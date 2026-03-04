import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@components/shared/ThemeProvider";
import { DarkModeToggle } from "@components/shared/DarkModeToggle";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js Hexagonal Template",
  description: "Clean Architecture + TDD template",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        <ThemeProvider>
          <header className="border-b border-border">
            <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold text-foreground">
                Hexagonal Template
              </span>
              <DarkModeToggle />
            </nav>
          </header>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
