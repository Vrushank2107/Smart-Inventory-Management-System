"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function AuthError() {
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

  return (
    <div className="min-h-screen flex items-start justify-center pt-2 w-full">
      <div className="w-full max-w-md px-4">
        <div className="glass-card bg-white/80 dark:bg-surface-800/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/20 dark:border-surface-700/50">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Authentication Error
            </h1>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed">
                {getErrorMessage(error)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
              >
                Try Again - Sign In
              </Link>
              
              <Link
                href="/auth/signup"
                className="w-full flex justify-center items-center py-2.5 px-4 border border-red-300 dark:border-red-600 rounded-lg shadow-sm text-sm font-medium text-red-700 dark:text-red-200 bg-white dark:bg-surface-800 hover:bg-red-50 dark:hover:bg-surface-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
              >
                Create New Account
              </Link>
            </div>

            {/* Help Section */}
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <h3 className="text-amber-800 dark:text-amber-200 font-medium mb-2">Need Help?</h3>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                <li>• Check if your email and password are correct</li>
                <li>• Ensure your account is properly created</li>
                <li>• Try clearing your browser cache and cookies</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
