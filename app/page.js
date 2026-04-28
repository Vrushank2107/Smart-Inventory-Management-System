"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isAuthenticated = status === "authenticated";

  return (
    <section className="space-y-6">
      <div className="glass-card relative overflow-hidden p-7 md:p-10">
        <div className="pointer-events-none absolute -top-16 right-10 h-40 w-40 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-0 h-52 w-52 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-600 dark:text-accent-300">Intelligent Commerce Platform</p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl text-surface-900 dark:text-surface-50">
            {isAuthenticated 
              ? "Welcome back! Ready to shop with smart discounts?"
              : "Modern inventory management with a smart discount decision engine"
            }
          </h1>
          <p className="text-surface-600 dark:text-surface-300">
            {isAuthenticated 
              ? `Hello ${session.user.name}! Browse inventory, build your cart, and instantly see the best possible discounted price based on your membership tier.`
              : "Browse inventory, build your cart, and instantly see the best possible discounted price based on active business rules."
            }
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {isAuthenticated ? (
              <>
                <Link href="/inventory" className="btn-primary">
                  Explore Inventory
                </Link>
                <Link href="/cart" className="btn-muted">
                  View Cart
                </Link>
              </>
            ) : (
              <Link href="/auth/signup" className="btn-primary">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="glass-card p-5">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
            {isAuthenticated ? "Membership Benefits" : "Smart Pricing"}
          </h2>
          <p className="mt-2 text-sm text-surface-600 dark:text-surface-300">
            {isAuthenticated 
              ? "Enjoy exclusive discounts based on your membership tier - GOLD, SILVER, or NORMAL."
              : "Get personalized discounts based on your membership level when you sign up."
            }
          </p>
        </article>
        <article className="glass-card p-5">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">Real-time Cart</h2>
          <p className="mt-2 text-sm text-surface-600 dark:text-surface-300">
            Cart automatically recalculates total, discount, and final payable amount in real time.
          </p>
        </article>
        <article className="glass-card p-5">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">Transparent Decisions</h2>
          <p className="mt-2 text-sm text-surface-600 dark:text-surface-300">
            Every discount decision is explained so users understand why a final price was chosen.
          </p>
        </article>
      </div>

      {!isAuthenticated && (
        <div className="glass-card p-6 text-center">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-surface-600 dark:text-surface-300 mb-6">
            Join thousands of customers enjoying smart discounts and personalized pricing based on their membership tier.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/auth/signup" className="btn-primary">
              Sign Up Now
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
