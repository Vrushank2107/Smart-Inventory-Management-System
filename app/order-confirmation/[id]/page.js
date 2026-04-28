"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderConfirmation({ params }) {
  const resolvedParams = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchOrder();
    }
  }, [status, router, resolvedParams.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${resolvedParams.id}`);
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
      } else {
        setError("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      default:
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-4">
            {error || "Order not found"}
          </h3>
          <Link
            href="/"
            className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success Message */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              Order Confirmed!
            </h1>
            <p className="text-emerald-700 dark:text-emerald-300 mt-1">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white dark:bg-surface-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-2">
              Order Details
            </h2>
            <p className="text-sm text-surface-600 dark:text-surface-400">
              Order ID: <span className="font-mono">{order.id}</span>
            </p>
            <p className="text-sm text-surface-600 dark:text-surface-400">
              Placed on: {formatDate(order.createdAt)}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-4">
            Items Ordered
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-surface-200 dark:border-surface-600 last:border-b-0">
                <div className="flex-1">
                  <h4 className="text-medium font-medium text-surface-900 dark:text-surface-50">
                    {item.product.name}
                  </h4>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-medium font-medium text-surface-900 dark:text-surface-50">
                    ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    ₹{parseFloat(item.price).toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t border-surface-200 dark:border-surface-600 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-surface-600 dark:text-surface-400">Subtotal</span>
              <span className="text-surface-900 dark:text-surface-50">
                ₹{parseFloat(order.totalAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-surface-600 dark:text-surface-400">Tax</span>
              <span className="text-surface-900 dark:text-surface-50">
                ₹{(parseFloat(order.finalAmount) - parseFloat(order.totalAmount)).toFixed(2)}
              </span>
            </div>
            {parseFloat(order.discountAmount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-surface-600 dark:text-surface-400">Discount</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  -₹{parseFloat(order.discountAmount).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-surface-200 dark:border-surface-600">
              <span className="text-surface-900 dark:text-surface-50">Total</span>
              <span className="text-surface-900 dark:text-surface-50">
                ₹{parseFloat(order.finalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping & Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-surface-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-4">
            Shipping Address
          </h3>
          <div className="text-sm text-surface-600 dark:text-surface-400 space-y-1">
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
            <p>{order.shippingAddress?.country}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-4">
            Payment Information
          </h3>
          <div className="text-sm text-surface-600 dark:text-surface-400 space-y-1">
            <p>Method: {order.paymentMethod?.replace('_', ' ').toUpperCase()}</p>
            <p>Status: <span className="font-medium text-emerald-600 dark:text-emerald-400">Completed</span></p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/inventory"
          className="flex-1 bg-primary-600 text-white text-center py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href="/orders"
          className="flex-1 bg-surface-600 text-white text-center py-3 px-4 rounded-md hover:bg-surface-700 focus:outline-none focus:ring-2 focus:ring-surface-500 focus:ring-offset-2 transition-colors"
        >
          View Order History
        </Link>
      </div>
    </div>
  );
}
