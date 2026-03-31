import Link from "next/link";
import { format } from "date-fns";
import { truncate } from "@/lib/utils";

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    author: string;
    tags: string;
    createdAt: string | Date;
  };
}

export default function BlogCard({ post }: BlogCardProps) {
  const date =
    typeof post.createdAt === "string"
      ? new Date(post.createdAt)
      : post.createdAt;

  let tags: string[] = [];
  try {
    tags = JSON.parse(post.tags);
  } catch {
    tags = [];
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-[var(--border)] bg-white transition-all duration-400 hover:shadow-xl hover:shadow-[#1B2A4A]/8 hover:-translate-y-1">
      {/* Cover Image */}
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-gray-50">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <svg
              className="h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      </Link>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
          <time dateTime={date.toISOString()}>
            {format(date, "MMMM d, yyyy")}
          </time>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="font-medium text-gray-500">{post.author}</span>
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-serif text-lg font-bold leading-snug text-[#1B2A4A] transition-colors duration-300 hover:text-[#C9A84C]">
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            {truncate(post.excerpt, 150)}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-[#1B2A4A]/5 px-2.5 py-0.5 text-[11px] font-medium text-[#1B2A4A]/70 border border-[#1B2A4A]/10"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/blog/${post.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#C9A84C] transition-colors duration-300 hover:text-[#B8942E]"
        >
          Read more <span>&rarr;</span>
        </Link>
      </div>
    </article>
  );
}
