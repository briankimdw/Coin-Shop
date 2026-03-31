"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-[#1B2A4A]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#1B2A4A] font-serif mb-3">
          Something Went Wrong
        </h1>
        <p className="text-gray-600 mb-8">
          We encountered an unexpected error. Please try again or return to the
          homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#C9A84C] text-white font-semibold rounded-lg hover:bg-[#b8963f] transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 border-2 border-[#1B2A4A] text-[#1B2A4A] font-semibold rounded-lg hover:bg-[#1B2A4A] hover:text-white transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
