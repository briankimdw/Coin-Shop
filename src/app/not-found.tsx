import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-[#C9A84C]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-6xl font-bold text-[#C9A84C] font-serif mb-2">
          404
        </p>
        <h1 className="text-2xl font-bold text-[#1B2A4A] font-serif mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-[#C9A84C] text-white font-semibold rounded-lg hover:bg-[#b8963f] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/inventory"
            className="px-6 py-3 border-2 border-[#1B2A4A] text-[#1B2A4A] font-semibold rounded-lg hover:bg-[#1B2A4A] hover:text-white transition-colors"
          >
            Browse Inventory
          </Link>
        </div>
      </div>
    </div>
  );
}
