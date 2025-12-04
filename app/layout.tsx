import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Background from "@/components/ui/Background";
import ScrollProgress from "@/components/ui/ScrollProgress";
import { Providers } from "@/components/web3/Providers";
import { ToastProvider } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { KeyboardShortcutsProvider } from "@/components/keyboard/KeyboardShortcutsProvider";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lore - Earn and Learn through IP",
  description: "Create, remix, and monetize intellectual property on the blockchain with Story Protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={cn(
        inter.variable,
        "font-sans antialiased bg-slate-950 text-slate-50 min-h-screen flex flex-col"
      )}>
        <ErrorBoundary>
          <Providers>
            <ToastProvider>
              <KeyboardShortcutsProvider>
                <ScrollProgress />
                <Background />

                <div className="flex flex-1 relative">
                  {/* Sidebar - Fixed on Desktop, Drawer on Mobile */}
                  <Sidebar />

                  {/* Main Content Area */}
                  <main className="flex-1 w-full lg:px-24 pb-24 lg:pb-8 transition-all duration-300 ease-in-out">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                      {children}
                    </div>
                  </main>
                </div>
              </KeyboardShortcutsProvider>
            </ToastProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
