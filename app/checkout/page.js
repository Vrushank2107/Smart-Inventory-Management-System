"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckoutContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [discountResult, setDiscountResult] = useState(null);
  const [calculatingDiscount, setCalculatingDiscount] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: ""
  });
  
  const [billingAddress, setBillingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: ""
  });
  
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const inputClassName = "input-modern w-full";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/checkout");
      return;
    }

    if (status === "authenticated") {
      fetchCart();
    }
  }, [status, router]);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
        
        // Check if discount data is passed from cart page
        const urlTotal = searchParams.get('total');
        const urlDiscount = searchParams.get('discount');
        const urlFinalAmount = searchParams.get('finalAmount');
        
        if (urlTotal && urlDiscount && urlFinalAmount) {
          // Use discount data from URL parameters
          const urlUserType = searchParams.get('userType') || session?.user?.type || "NORMAL";
          setDiscountResult({
            total: parseFloat(urlTotal),
            discountApplied: parseFloat(urlDiscount),
            finalAmount: parseFloat(urlFinalAmount),
            explanation: ["Discount calculated from cart"]
          });
          console.log("Using discount data from cart:", { urlTotal, urlDiscount, urlFinalAmount, urlUserType });
        } else {
          // Check localStorage as backup
          const storedSummary = localStorage.getItem('cartDiscountSummary');
          if (storedSummary) {
            const summary = JSON.parse(storedSummary);
            setDiscountResult(summary);
            console.log("Using discount data from localStorage:", summary);
            localStorage.removeItem('cartDiscountSummary'); // Clean up
          } else if (data.items && data.items.length > 0) {
            // Calculate discounts if no data from cart
            await calculateDiscounts(data.items);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscounts = async (items) => {
    setCalculatingDiscount(true);
    try {
      const cartItemsForCalculation = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const userType = session?.user?.type || "NORMAL";
      console.log("Session data:", JSON.stringify(session, null, 2));
      console.log("Session user type:", session?.user?.type);
      console.log("Final user type being sent:", userType);
      console.log("Cart items:", cartItemsForCalculation);

      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cartItems: cartItemsForCalculation,
          userType: userType
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Discount result:", data);
        setDiscountResult(data);
      } else {
        console.error("Discount calculation failed:", response.status);
      }
    } catch (error) {
      console.error("Error calculating discounts:", error);
    } finally {
      setCalculatingDiscount(false);
    }
  };

  const calculateSubtotal = () => {
    if (discountResult && discountResult.finalAmount !== undefined) {
      return discountResult.finalAmount;
    }
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
  };

  const calculateOriginalSubtotal = () => {
    if (discountResult && discountResult.total !== undefined) {
      return discountResult.total;
    }
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
  };

  const calculateDiscountAmount = () => {
    if (discountResult && discountResult.discountApplied !== undefined) {
      return discountResult.discountApplied;
    }
    return 0;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleShippingChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBillingChange = (field, value) => {
    setBillingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const finalBillingAddress = sameAsShipping ? shippingAddress : billingAddress;
      
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress,
        billingAddress: finalBillingAddress,
        paymentMethod,
        originalAmount: calculateOriginalSubtotal(),
        discountAmount: calculateDiscountAmount(),
        totalAmount: calculateSubtotal(),
        taxAmount: calculateTax(),
        finalAmount: calculateTotal()
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        router.push(`/order-confirmation/${order.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError("An error occurred during checkout");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="space-y-6">
        <div className="glass-card p-10 text-center">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50">Your cart is empty</h1>
          <p className="mt-3 text-surface-600 dark:text-surface-300">
            Add products from inventory to continue to checkout.
          </p>
          <div className="mt-6">
            <Link href="/inventory" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-7">
      <header className="glass-card relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-600 dark:text-accent-300">
              Secure Checkout
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl text-surface-900 dark:text-surface-50">
              Shipping, billing, and payment
            </h1>
            <p className="mt-3 max-w-2xl text-surface-600 dark:text-surface-300">
              Confirm your details and place your order with the latest discount calculation.
            </p>
          </div>
          <Link href="/cart" className="btn-muted">
            Back to Cart
          </Link>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-4">
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  className={inputClassName}
                  value={shippingAddress.street}
                  onChange={(e) => handleShippingChange("street", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  className={inputClassName}
                  value={shippingAddress.city}
                  onChange={(e) => handleShippingChange("city", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  required
                  className={inputClassName}
                  value={shippingAddress.state}
                  onChange={(e) => handleShippingChange("state", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  required
                  className={inputClassName}
                  value={shippingAddress.zipCode}
                  onChange={(e) => handleShippingChange("zipCode", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  required
                  className={inputClassName}
                  value={shippingAddress.country}
                  onChange={(e) => handleShippingChange("country", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-50">
                Billing Address
              </h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-surface-300 bg-white text-primary-600"
                />
                <span className="text-sm text-surface-700 dark:text-surface-300">
                  Same as shipping
                </span>
              </label>
            </div>
            
            {!sameAsShipping && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    className={inputClassName}
                    value={billingAddress.street}
                    onChange={(e) => handleBillingChange("street", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    className={inputClassName}
                    value={billingAddress.city}
                    onChange={(e) => handleBillingChange("city", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    className={inputClassName}
                    value={billingAddress.state}
                    onChange={(e) => handleBillingChange("state", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    required
                    className={inputClassName}
                    value={billingAddress.zipCode}
                    onChange={(e) => handleBillingChange("zipCode", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    className={inputClassName}
                    value={billingAddress.country}
                    onChange={(e) => handleBillingChange("country", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-4">
              Payment Method
            </h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="credit_card"
                  checked={paymentMethod === "credit_card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2 h-4 w-4 text-primary-600"
                />
                <span className="text-surface-700 dark:text-surface-300">Credit Card</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="debit_card"
                  checked={paymentMethod === "debit_card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2 h-4 w-4 text-primary-600"
                />
                <span className="text-surface-700 dark:text-surface-300">Debit Card</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="paypal"
                  checked={paymentMethod === "paypal"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2 h-4 w-4 text-primary-600"
                />
                <span className="text-surface-700 dark:text-surface-300">PayPal</span>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card sticky top-4 p-6">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-4">
              Order Summary
            </h2>
            <div className="mb-4">
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                {calculatingDiscount ? "Updating total..." : "Totals synced"}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="soft-border flex justify-between rounded-lg bg-surface-100 p-3 text-sm dark:bg-surface-800/40">
                  <div>
                    <span className="font-medium text-surface-900 dark:text-surface-50">
                      {item.product.name}
                    </span>
                    <span className="text-surface-500 dark:text-surface-400 ml-2">
                      x{item.quantity}
                    </span>
                  </div>
                  <span className="text-surface-900 dark:text-surface-50">
                    ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-surface-200 dark:border-surface-600 pt-4 space-y-2">
              {calculateDiscountAmount() > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-600 dark:text-surface-400">Original Subtotal</span>
                    <span className="text-surface-500 dark:text-surface-400 line-through">
                      ₹{calculateOriginalSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">Discount</span>
                    <span className="text-green-600 dark:text-green-400">
                      -₹{calculateDiscountAmount().toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-surface-600 dark:text-surface-400">Subtotal</span>
                <span className="text-surface-900 dark:text-surface-50">
                  ₹{calculateSubtotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-600 dark:text-surface-400">Tax</span>
                <span className="text-surface-900 dark:text-surface-50">
                  ₹{calculateTax().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-surface-900 dark:text-surface-50">Total</span>
                <span className="text-surface-900 dark:text-surface-50">
                  ₹{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
