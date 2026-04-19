import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "Smart Inventory & Intelligent Discount Engine",
  description: "Production-grade inventory and discount decision application"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-6 md:py-10">
          <SiteHeader />
          {children}
        </main>
      </body>
    </html>
  );
}
