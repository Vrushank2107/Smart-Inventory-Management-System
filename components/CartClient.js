"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function money(value) {
  return Number(value || 0).toFixed(2);
}

export default function CartClient({ products }) {
  const [cartItems, setCartItems] = useState([]);
  const [userType, setUserType] = useState("NORMAL");
  const [summary, setSummary] = useState({
    total: 0,
    discountApplied: 0,
    finalAmount: 0,
    explanation: []
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasHydratedCart, setHasHydratedCart] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const existing = window.localStorage.getItem("smart-inventory-cart");
        setCartItems(existing ? JSON.parse(existing) : []);
      } catch {
        setCartItems([]);
      } finally {
        setHasHydratedCart(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasHydratedCart) return;
    localStorage.setItem("smart-inventory-cart", JSON.stringify(cartItems));
  }, [cartItems, hasHydratedCart]);

  useEffect(() => {
    const calculate = async () => {
      setIsCalculating(true);
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems, userType })
      });
      const data = await response.json();
      setSummary(data);
      setIsCalculating(false);
    };
    calculate();
  }, [cartItems, userType]);

  const rows = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    return cartItems
      .map((item) => {
        const product = byId.get(item.productId);
        if (!product) return null;
        return {
          ...item,
          name: product.name,
          price: Number(product.price)
        };
      })
      .filter(Boolean);
  }, [cartItems, products]);

  const updateQuantity = (productId, quantity) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <section className="space-y-7">
      <header className="glass-card flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Checkout Workspace</p>
          <h1 className="mt-1 text-3xl font-bold">Cart & Pricing</h1>
        </div>
        <Link href="/inventory" className="btn-primary">
          Continue Shopping
        </Link>
      </header>

      <div className="glass-card p-5">
        <label className="mb-2 block text-sm font-medium text-slate-200">Customer Tier</label>
        <select
          value={userType}
          onChange={(event) => setUserType(event.target.value)}
          className="input-modern w-full max-w-xs"
        >
          <option value="NORMAL">NORMAL</option>
          <option value="SILVER">SILVER</option>
          <option value="GOLD">GOLD</option>
        </select>
      </div>

      <div className="glass-card p-5">
        <h2 className="mb-4 text-lg font-semibold">Cart Items</h2>
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.productId}
              className="soft-border flex items-center justify-between rounded-xl bg-slate-900/60 p-4"
            >
              <div>
                <p className="font-medium text-slate-100">{row.name}</p>
                <p className="text-sm text-slate-400">Rs. {money(row.price)} each</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(row.productId, row.quantity - 1)}
                  className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-lg"
                >
                  -
                </button>
                <span className="min-w-6 text-center font-semibold">{row.quantity}</span>
                <button
                  onClick={() => updateQuantity(row.productId, row.quantity + 1)}
                  className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-lg"
                >
                  +
                </button>
              </div>
            </div>
          ))}
          {!rows.length ? (
            <p className="rounded-xl border border-dashed border-white/20 bg-slate-900/40 p-6 text-center text-slate-400">
              Cart is empty. Add products from the main catalog.
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Billing Summary</h3>
            <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
              {isCalculating ? "Calculating..." : "Live"}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-center justify-between text-slate-300">
              <span>Total</span>
              <span>Rs. {money(summary.total)}</span>
            </p>
            <p className="flex items-center justify-between text-emerald-300">
              <span>Discount Applied</span>
              <span>- Rs. {money(summary.discountApplied)}</span>
            </p>
            <div className="my-2 h-px bg-white/10" />
            <p className="flex items-center justify-between text-xl font-bold text-white">
              <span>Payable</span>
              <span>Rs. {money(summary.finalAmount)}</span>
            </p>
          </div>
        </section>
        <section className="glass-card p-5">
          <h3 className="text-lg font-semibold">Explanation</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {(summary.explanation || []).map((line) => (
              <li key={line} className="soft-border rounded-lg bg-slate-900/50 px-3 py-2">
                {line}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
