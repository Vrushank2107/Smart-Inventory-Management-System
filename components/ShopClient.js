"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProductSkeleton, LoadingSpinner } from "./SkeletonLoader";

// Debounce hook for search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Debounce hook for discount calculation
function useDebounceCallback(callback, delay) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);
  }, [delay]);
}

function money(value) {
  return Number(value || 0).toFixed(2);
}

async function parseJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Expected JSON response, received ${contentType || "unknown content type"}`);
  }
  return response.json();
}

export default function ShopClient({ initialData, categories }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [userType, setUserType] = useState("NORMAL");
  const [summary, setSummary] = useState({
    total: 0,
    discountApplied: 0,
    finalAmount: 0,
    explanation: []
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingCart, setUpdatingCart] = useState(null);
  
  // Pagination and filtering state
  const [products, setProducts] = useState(initialData.products);
  const [pagination, setPagination] = useState(initialData.pagination);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Debounced search for better UX
  const debouncedSearch = useDebounce(search, 300);
  const hasFetchedCart = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/inventory");
      return;
    }

    if (status === "authenticated" && !hasFetchedCart.current) {
      fetchCart();
      setUserType(session?.user?.type || "NORMAL");
      hasFetchedCart.current = true;
    }
  }, [status, router]);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      
      if (response.ok) {
        const cart = await parseJsonResponse(response);
        setCartItems(cart.items || []);
      } else if (response.status === 401) {
        router.push("/auth/signin?callbackUrl=/inventory");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // Refs to avoid dependency issues
  const cartItemsRef = useRef(cartItems);
  const userTypeRef = useRef(userType);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    userTypeRef.current = userType;
  }, [userType]);

  // Debounced calculation for better performance
  const calculateDiscounts = useCallback(() => {
    const currentCartItems = cartItemsRef.current;
    const currentUserType = userTypeRef.current;

    if (!currentCartItems.length) {
      setSummary({
        total: 0,
        discountApplied: 0,
        finalAmount: 0,
        explanation: ["Add products to start discount evaluation."]
      });
      return;
    }
    setIsCalculating(true);

    fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItems: currentCartItems, userType: currentUserType })
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to calculate discounts (${response.status})`);
        return parseJsonResponse(response);
      })
      .then((data) => setSummary(data))
      .catch((error) => {
        console.error("Calculation error:", error);
        setSummary({
          total: 0,
          discountApplied: 0,
          finalAmount: 0,
          explanation: ["Error calculating discounts. Please try again."]
        });
      })
      .finally(() => setIsCalculating(false));
  }, []); // No dependencies - uses refs

  const debouncedCalculate = useDebounceCallback(calculateDiscounts, 500);

  useEffect(() => {
    debouncedCalculate();
  }, [cartItems, userType]);

  const fetchProducts = useCallback(async (page = 1, searchQuery = "", category = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(searchQuery && { search: searchQuery }),
        ...(category && { category })
      });

      const response = await fetch(`/api/products?${params}`);
      if (response.status === 401) {
        router.push("/auth/signin?callbackUrl=/inventory");
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch products (${response.status})`);
      }
      const data = await parseJsonResponse(response);

      if (data.products) {
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProducts(currentPage, debouncedSearch, selectedCategory);
  }, [currentPage, debouncedSearch, selectedCategory, fetchProducts]);

  const quantityById = useMemo(() => {
    const map = new Map();
    for (const item of cartItems) map.set(item.productId, item.quantity);
    return map;
  }, [cartItems]);

  const addToCart = async (productId) => {
    // Check if user is authenticated
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const currentQuantity = quantityById.get(productId) || 0;
    const maxQuantity = 8; // Set reasonable limit
    
    if (currentQuantity >= maxQuantity) {
      return;
    }

    const newQuantity = currentQuantity + 1;
    const fallbackProduct = products.find((item) => item.id === productId);
    const previousCartItems = cartItems;

    setUpdatingCart(productId);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        );
      }
      return [
        ...prev,
        {
          productId,
          quantity: newQuantity,
          product: fallbackProduct
        }
      ];
    });

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQuantity })
      });

      if (!response.ok) {
        setCartItems(previousCartItems);
        if (response.status === 401) {
          // Unauthorized, redirect to login
          router.push('/auth/signin');
        }
      }
      // Optimistic update already applied, no need to update from response
    } catch (error) {
      console.error("Error adding to cart:", error);
      setCartItems(previousCartItems);
    } finally {
      setUpdatingCart(null);
    }
  };

  const decreaseQuantity = async (productId) => {
    // Check if user is authenticated
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const currentQuantity = quantityById.get(productId) || 0;
    const previousCartItems = cartItems;
    if (currentQuantity <= 1) {
      // Remove item from cart
      setCartItems((prev) => prev.filter((item) => item.productId !== productId));
      try {
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId })
        });
        if (!response.ok) {
          setCartItems(previousCartItems);
          if (response.status === 401) {
            // Unauthorized, redirect to login
            router.push('/auth/signin');
          }
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
        setCartItems(previousCartItems);
      }
    } else {
      // Update quantity
      const newQuantity = currentQuantity - 1;
      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity: newQuantity })
        });
        if (!response.ok) {
          setCartItems(previousCartItems);
          if (response.status === 401) {
            // Unauthorized, redirect to login
            router.push('/auth/signin');
          }
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
        setCartItems(previousCartItems);
      }
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <section className="space-y-7">
      <header className="glass-card relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-600 dark:text-accent-300">Inventory Catalog</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl text-surface-900 dark:text-surface-50">
              {search ? `Search Results for "${search}"` : selectedCategory ? `${selectedCategory} Products` : "Browse Products & Build Cart"}
            </h1>
            <p className="mt-3 max-w-2xl text-surface-600 dark:text-surface-300">
              {search || selectedCategory 
                ? `Found ${products.length} of ${pagination.totalItems} products` 
                : "Build dynamic baskets and get real-time discount optimization powered by a rule-based decision engine."
              }
            </p>
            {(search || selectedCategory) && (
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("");
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 rounded-lg border border-surface-300 bg-white text-surface-700 hover:bg-surface-50 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
          <Link 
            href={`/cart?total=${summary.total}&discount=${summary.discountApplied}&finalAmount=${summary.finalAmount}&userType=${userType}`}
            className="btn-primary"
            onClick={() => {
              // Also store in localStorage as backup
              const dataWithUserType = { ...summary, userType };
              localStorage.setItem('inventoryDiscountSummary', JSON.stringify(dataWithUserType));
            }}
          >
            Open Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
          </Link>
        </div>
      </header>

      {/* Search and Filters */}
      <form onSubmit={handleSubmit} className="glass-card p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">
              Search Products
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by name or category..."
              className="input-modern w-full"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="input-modern w-full"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">
              Customer Tier
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(event) => setUserType(event.target.value)}
              className="input-modern w-full"
            >
              <option value="NORMAL">NORMAL</option>
              <option value="SILVER">SILVER</option>
              <option value="GOLD">GOLD</option>
            </select>
          </div>
        </div>
      </form>

      {/* Products Grid */}
      <div className="space-y-4">
        {loading ? (
          <ProductSkeleton count={12} />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-surface-600 dark:text-surface-400">
                Showing {products.length} of {pagination.totalItems} products
              </p>
              {loading && <LoadingSpinner size="sm" />}
            </div>
            
            {/* Authentication Notice */}
            {!session && (
              <div className="glass-card bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-amber-800 dark:text-amber-200 font-medium">Login Required for Cart</p>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">Please <Link href="/auth/signin" className="underline hover:text-amber-900 dark:hover:text-amber-100">sign in</Link> to add items to your cart and place orders.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="glass-card group flex h-full flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-accent-300/30"
                >
                  <div>
                    <p className="inline-flex rounded-full bg-accent-400/10 px-2.5 py-1 text-xs uppercase tracking-wide text-accent-600 dark:text-accent-300">
                      {product.category}
                    </p>
                    <h2 className="mt-3 text-lg font-semibold text-surface-900 dark:text-surface-50">{product.name}</h2>
                    <p className="mt-2 text-2xl font-bold text-surface-900 dark:text-surface-50">Rs. {money(product.price)}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => decreaseQuantity(product.id)}
                      className="h-10 w-10 rounded-xl border border-surface-300 dark:border-white/10 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 text-lg font-semibold transition hover:bg-surface-100 dark:hover:bg-surface-700 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!quantityById.get(product.id)}
                      aria-label={`Decrease quantity for ${product.name}`}
                    >
                      -
                    </button>
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={quantityById.get(product.id) >= 8 || updatingCart === product.id}
                      className={`btn-muted flex-1 group-hover:border-cyan-300/40 disabled:opacity-50 disabled:cursor-not-allowed ${
                        quantityById.get(product.id) >= 8 ? 'bg-surface-100 dark:bg-surface-700' : ''
                      }`}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      {updatingCart === product.id 
                        ? 'Adding...' 
                        : quantityById.get(product.id) >= 8 
                          ? `Max Quantity (${quantityById.get(product.id)})` 
                          : `Add to Cart (${quantityById.get(product.id) || 0})`
                      }
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="px-3 py-2 rounded-lg border border-surface-300 bg-white text-surface-700 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg border ${
                        page === currentPage
                          ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-300"
                          : "border-surface-300 bg-white text-surface-700 hover:bg-surface-50 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
                      }`}
                      aria-label={`Go to page ${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 rounded-lg border border-surface-300 bg-white text-surface-700 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
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
            <p className="flex items-center justify-between text-surface-600 dark:text-surface-300">
              <span>Total</span>
              <span>Rs. {money(summary.total)}</span>
            </p>
            <p className="flex items-center justify-between text-emerald-600 dark:text-emerald-300">
              <span>Discount Applied</span>
              <span>- Rs. {money(summary.discountApplied)}</span>
            </p>
            <div className="my-2 h-px bg-surface-200 dark:bg-white/10" />
            <p className="flex items-center justify-between text-xl font-bold text-surface-900 dark:text-surface-50">
              <span>Payable</span>
              <span>Rs. {money(summary.finalAmount)}</span>
            </p>
          </div>
        </section>
        <section className="glass-card p-5">
          <h3 className="text-lg font-semibold">Decision Explanation</h3>
          <ul className="mt-3 space-y-2 text-sm text-surface-300">
            {summary.explanation?.map((line, index) => (
              <li key={index} className="soft-border rounded-lg bg-surface-100 dark:bg-surface-900/50 px-3 py-2 text-surface-700 dark:text-surface-300">
                {line}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
