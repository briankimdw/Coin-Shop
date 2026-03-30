import Link from "next/link";
import Image from "next/image";
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
    <article className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Cover Image */}
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-gray-100">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
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
      </Link>

      {/* Content */}
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <time dateTime={date.toISOString()}>
            {format(date, "MMMM d, yyyy")}
          </time>
          <span>&middot;</span>
          <span>{post.author}</span>
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-serif text-lg font-bold leading-tight text-gray-900 transition-colors hover:text-[#C9A84C]">
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {truncate(post.excerpt, 150)}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-block text-sm font-medium text-[#C9A84C] transition-colors hover:text-[#b8973f]"
        >
          Read more &rarr;
        </Link>
      </div>
    </article>
  );
}
