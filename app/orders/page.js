"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Orders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [confirmCancelOrderId, setConfirmCancelOrderId] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'PROCESSING':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'SHIPPED':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'DELIVERED':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      case 'CANCELLED':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    }
  };

  const handleCancelOrder = async (orderId) => {
    setError("");
    setCancellingOrderId(orderId);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "CANCELLED" })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to cancel order");
        return;
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "CANCELLED" } : order
        )
      );
      setConfirmCancelOrderId(null);
    } catch (cancelError) {
      console.error("Error cancelling order:", cancelError);
      setError("Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (status === "loading" || loading) {
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
            <p className="text-xs uppercase tracking-[0.2em] text-accent-600 dark:text-accent-300">
              Account Activity
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl text-surface-900 dark:text-surface-50">
              Order History
            </h1>
            <p className="mt-3 max-w-2xl text-surface-600 dark:text-surface-300">
              Track your previous purchases, status updates, and payment totals.
            </p>
          </div>
          <Link href="/inventory" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </header>

      {error && (
        <div className="glass-card border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass-card py-12 text-center">
          <div className="text-surface-400 dark:text-surface-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-2">
            No orders yet
          </h3>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link
            href="/inventory"
            className="btn-primary"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <article key={order.id} className="glass-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                      Order #{order.id.slice(-8)}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                    ₹{parseFloat(order.finalAmount).toFixed(2)}
                  </p>
                  <Link
                    href={`/order-confirmation/${order.id}`}
                    className="mt-1 inline-block text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              <div className="border-t border-surface-200 dark:border-surface-600 pt-4">
                <div className="flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="soft-border rounded-lg bg-surface-100 px-2.5 py-1.5 text-sm text-surface-600 dark:bg-surface-800/40 dark:text-surface-300"
                    >
                      {item.product.name} x{item.quantity}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="soft-border rounded-lg bg-surface-100 px-2.5 py-1.5 text-sm text-surface-600 dark:bg-surface-800/40 dark:text-surface-300">
                      +{order.items.length - 3} more
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Link
                  href={`/order-confirmation/${order.id}`}
                  className="btn-muted"
                >
                  View Order
                </Link>
                {order.status === 'CONFIRMED' && (
                  confirmCancelOrderId === order.id ? (
                    <>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                        className="inline-flex items-center justify-center rounded-xl border border-red-400 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/50 dark:bg-red-500 dark:hover:bg-red-400"
                      >
                        {cancellingOrderId === order.id ? "Cancelling..." : "Confirm Cancel"}
                      </button>
                      <button
                        onClick={() => setConfirmCancelOrderId(null)}
                        disabled={cancellingOrderId === order.id}
                        className="btn-muted disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Keep Order
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmCancelOrderId(order.id)}
                      className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-200 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      Cancel Order
                    </button>
                  )
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
