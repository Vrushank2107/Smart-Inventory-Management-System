"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/inventory", label: "Inventory" },
  { href: "/cart", label: "Cart" },
  { href: "/offers", label: "Offers" }
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="glass-card sticky top-4 z-40 mb-6 border-white/15 px-5 py-4 md:mb-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-lg font-bold tracking-tight text-white md:text-xl">
            Smart Inventory
          </Link>
          <p className="text-xs text-slate-400">Inventory, cart, and intelligent discounting</p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              pathname === item.href
                ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-200"
                : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            {item.label}
          </Link>
        ))}
        </nav>
      </div>
    </header>
  );
}
