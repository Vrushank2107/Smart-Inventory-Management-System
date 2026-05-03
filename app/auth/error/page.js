"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "Configuration":
        return "There is a problem with the server configuration. Please try again later.";
      case "AccessDenied":
        return "Access denied. Please check your credentials and try again.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "Default":
        return "An unexpected error occurred during authentication. Please try again.";
      case "OAuthSignin":
        return "Error in attempting to retrieve the user from the OAuth provider.";
      case "OAuthCallback":
        return "Error in handling the response from the OAuth provider.";
      case "OAuthCreateAccount":
        return "Could not create user in the OAuth provider.";
      case "EmailCreateAccount":
        return "Could not create user with this email address.";
      case "Callback":
        return "Error in the OAuth callback handler.";
      case "OAuthAccountNotLinked":
        return "This account is already linked with another OAuth provider.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      default:
        return "Authentication failed. Please try again or contact support.";
    }
  };

  export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl shadow-lg">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading error page...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
}
