"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function money(value) {
  return Number(value || 0).toFixed(2);
}

export default function CartClient({ products }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState([]);
  const [userType, setUserType] = useState("NORMAL");
  const [summary, setSummary] = useState({
    total: 0,
    discountApplied: 0,
    finalAmount: 0,
    explanation: []
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/cart");
      return;
    }

    if (status === "authenticated") {
      fetchCart();
      setUserType(session.user.type || "NORMAL");
    }
  }, [status, session, router]);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const cart = await response.json();
        setCartItems(cart.items || []);
        
        // Check if discount data is passed from inventory page
        const urlTotal = searchParams.get('total');
        const urlDiscount = searchParams.get('discount');
        const urlFinalAmount = searchParams.get('finalAmount');
        
        if (urlTotal && urlDiscount && urlFinalAmount) {
          // Use discount data from URL parameters
          const urlUserType = searchParams.get('userType') || session?.user?.type || "NORMAL";
          setSummary({
            total: parseFloat(urlTotal),
            discountApplied: parseFloat(urlDiscount),
            finalAmount: parseFloat(urlFinalAmount),
            explanation: ["Discount calculated from inventory"]
          });
          setUserType(urlUserType);
          console.log("Using discount data from inventory:", { urlTotal, urlDiscount, urlFinalAmount, urlUserType });
        } else {
          // Check localStorage as backup
          const storedSummary = localStorage.getItem('inventoryDiscountSummary');
          if (storedSummary) {
            const summary = JSON.parse(storedSummary);
            setSummary(summary);
            if (summary.userType) {
              setUserType(summary.userType);
            }
            console.log("Using discount data from localStorage (inventory):", summary);
            localStorage.removeItem('inventoryDiscountSummary'); // Clean up
          } else {
            // Calculate discounts normally if no data from inventory
            // This will trigger the useEffect below
          }
        }
      } else {
        setError("Failed to load cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      // Remove item from cart
      try {
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId })
        });
        if (response.ok) {
          setCartItems(prev => prev.filter(item => item.productId !== productId));
        }
      } catch (error) {
        console.error("Error removing item:", error);
      }
    } else {
      // Update item quantity
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity })
        });
        if (response.ok) {
          setCartItems(prev => 
            prev.map(item => 
              item.productId === productId ? { ...item, quantity } : item
            )
          );
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    }
  };

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

  
  return (
    <section className="space-y-7">
      <header className="glass-card flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent-600 dark:text-accent-300">Checkout Workspace</p>
          <h1 className="mt-1 text-3xl font-bold text-surface-900 dark:text-surface-50">Cart & Pricing</h1>
        </div>
        <Link href="/inventory" className="btn-primary">
          Continue Shopping
        </Link>
      </header>

      <div className="glass-card p-5">
        <label className="mb-2 block text-sm font-medium text-surface-700 dark:text-surface-200">Customer Tier</label>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            userType === 'GOLD' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
            userType === 'SILVER' ? 'bg-surface-100 text-surface-800 dark:bg-surface-900/20 dark:text-surface-300' :
            'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300'
          }`}>
            {userType}
          </span>
          <span className="text-sm text-surface-600 dark:text-surface-400">
            (Set from inventory page)
          </span>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="mb-4 text-lg font-semibold text-surface-900 dark:text-surface-50">Cart Items</h2>
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.productId}
              className="soft-border flex items-center justify-between rounded-xl bg-surface-100 dark:bg-surface-800/40 p-4"
            >
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-50">{row.name}</p>
                <p className="text-sm text-surface-600 dark:text-surface-400">Rs. {money(row.price)} each</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(row.productId, row.quantity - 1)}
                  className="h-8 w-8 rounded-lg border border-surface-300 dark:border-white/10 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 text-lg"
                >
                  -
                </button>
                <span className="min-w-6 text-center font-semibold text-surface-900 dark:text-surface-50">{row.quantity}</span>
                <button
                  onClick={() => updateQuantity(row.productId, row.quantity + 1)}
                  className="h-8 w-8 rounded-lg border border-surface-300 dark:border-white/10 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 text-lg"
                >
                  +
                </button>
              </div>
            </div>
          ))}
          {!rows.length ? (
            <p className="rounded-xl border border-dashed border-surface-300 dark:border-white/20 bg-surface-50 dark:bg-surface-900/40 p-6 text-center text-surface-600 dark:text-surface-400">
              Cart is empty. Add products from the main catalog.
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">Billing Summary</h3>
            <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
              {isCalculating ? "Calculating..." : "Live"}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-center justify-between text-surface-600 dark:text-surface-300">
              <span>Total</span>
              <span>Rs. {money(summary.total)}</span>
            </p>
            <p className="flex items-center justify-between text-green-700 dark:text-emerald-300">
              <span>Discount Applied</span>
              <span>- Rs. {money(summary.discountApplied)}</span>
            </p>
            <div className="my-2 h-px bg-surface-300 dark:bg-white/10" />
            <p className="flex items-center justify-between text-xl font-bold text-surface-900 dark:text-surface-50">
              <span>Payable</span>
              <span>Rs. {money(summary.finalAmount)}</span>
            </p>
          </div>
          {rows.length > 0 && (
            <div className="mt-4">
              <Link
                href={`/checkout?total=${summary.total}&discount=${summary.discountApplied}&finalAmount=${summary.finalAmount}&userType=${userType}`}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors text-center block"
                onClick={() => {
                  // Also store in localStorage as backup
                  const dataWithUserType = { ...summary, userType };
                  localStorage.setItem('cartDiscountSummary', JSON.stringify(dataWithUserType));
                }}
              >
                Proceed to Checkout
              </Link>
            </div>
          )}
        </section>
        <section className="glass-card p-5">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">Explanation</h3>
          <ul className="mt-3 space-y-2 text-sm text-surface-600 dark:text-surface-300">
            {(summary.explanation || []).map((line) => (
              <li key={line} className="soft-border rounded-lg bg-surface-50 dark:bg-surface-900/50 px-3 py-2 text-surface-800 dark:text-surface-300">
                {line}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
