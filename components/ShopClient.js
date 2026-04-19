"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function money(value) {
  return Number(value || 0).toFixed(2);
}

export default function ShopClient({ products }) {
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
      if (!cartItems.length) {
        setSummary({
          total: 0,
          discountApplied: 0,
          finalAmount: 0,
          explanation: ["Add products to start discount evaluation."]
        });
        return;
      }
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

  const quantityById = useMemo(() => {
    const map = new Map();
    for (const item of cartItems) map.set(item.productId, item.quantity);
    return map;
  }, [cartItems]);

  const addToCart = (productId) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((item) => item.productId === productId);
      if (idx === -1) return [...prev, { productId, quantity: 1 }];
      const clone = [...prev];
      clone[idx] = { ...clone[idx], quantity: clone[idx].quantity + 1 };
      return clone;
    });
  };

  const decreaseQuantity = (productId) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <section className="space-y-7">
      <header className="glass-card relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Inventory Catalog</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">Browse Products & Build Cart</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Build dynamic baskets and get real-time discount optimization powered by a rule-based decision engine.
            </p>
          </div>
          <Link href="/cart" className="btn-primary">
            Open Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
          </Link>
        </div>
      </header>

      <div className="glass-card p-5 md:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <label className="block text-sm font-medium text-slate-200">Customer Tier</label>
          <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-medium text-cyan-300">
            Recalculates instantly
          </span>
        </div>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="glass-card group flex h-full flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/30"
          >
            <div>
              <p className="inline-flex rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs uppercase tracking-wide text-cyan-300">
                {product.category}
              </p>
              <h2 className="mt-3 text-lg font-semibold text-slate-100">{product.name}</h2>
              <p className="mt-2 text-2xl font-bold text-white">Rs. {money(product.price)}</p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => decreaseQuantity(product.id)}
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-lg font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!quantityById.get(product.id)}
              >
                -
              </button>
              <button
                onClick={() => addToCart(product.id)}
                className="btn-muted flex-1 group-hover:border-cyan-300/40"
              >
                Add to Cart <span className="ml-2 text-cyan-300">({quantityById.get(product.id) || 0})</span>
              </button>
            </div>
          </article>
        ))}
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
          <h3 className="text-lg font-semibold">Decision Explanation</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {summary.explanation?.map((line) => (
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
