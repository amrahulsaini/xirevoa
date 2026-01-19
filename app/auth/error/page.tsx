"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: { [key: string]: { title: string; message: string } } = {
    invalid_token: {
      title: "Invalid Verification Link",
      message: "This verification link is invalid or has expired. Please request a new verification email.",
    },
    server_error: {
      title: "Server Error",
      message: "An error occurred while processing your request. Please try again later.",
    },
    default: {
      title: "Authentication Error",
      message: "An error occurred during authentication. Please try again.",
    },
  };

  const errorInfo = errorMessages[error || "default"] || errorMessages.default;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-red-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-red-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500 rounded-2xl blur-xl opacity-50" />
            <div className="relative h-12 w-12 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/logo.png"
                alt="Xirevoa AI"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Xirevoa AI
          </h1>
        </Link>

        {/* Error Card */}
        <div className="bg-zinc-900 border-2 border-red-500/30 rounded-2xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{errorInfo.title}</h2>
          <p className="text-zinc-400 mb-6">{errorInfo.message}</p>

          <div className="flex flex-col gap-3">
            <Link 
              href="/auth/login"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition-colors"
            >
              Go to Login
            </Link>
            <Link 
              href="/auth/signup"
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Create New Account
            </Link>
            <Link 
              href="/"
              className="text-zinc-400 hover:text-yellow-400 text-sm mt-2"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
