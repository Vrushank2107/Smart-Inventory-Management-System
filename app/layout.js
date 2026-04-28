import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata = {
  title: "Smart Inventory & Intelligent Discount Engine",
  description: "Production-grade inventory and discount decision application"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="transition-colors duration-300">
        <SessionProviderWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ErrorBoundary>
              <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-6 md:py-10">
                <SiteHeader />
                {children}
              </main>
            </ErrorBoundary>
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
