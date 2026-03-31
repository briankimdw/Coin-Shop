import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import prisma from "@/lib/prisma";
import { parseJsonField } from "@/lib/utils";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

async function getPost(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.metaTitle || post.title,
    description: post.metaDesc || post.excerpt || `Read ${post.title}`,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.excerpt || `Read ${post.title}`,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const tags = parseJsonField<string[]>(post.tags, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-white">
        <nav className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-[#C9A84C] transition-colors duration-300">Home</Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link href="/blog" className="hover:text-[#C9A84C] transition-colors duration-300">Blog</Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="truncate max-w-[200px] font-medium text-[#1B2A4A]">
              {post.title}
            </li>
          </ol>
        </nav>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
            <img
              src={post.coverImage}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header>
          <h1 className="font-serif text-3xl font-bold leading-tight text-[#1B2A4A] md:text-4xl">
            {post.title}
          </h1>

          <div className="mt-5 flex items-center gap-3 text-sm text-gray-400">
            <span className="font-semibold text-[#1B2A4A]">
              {post.author}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <time dateTime={post.createdAt.toISOString()}>
              {format(post.createdAt, "MMMM d, yyyy")}
            </time>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-lg mt-10 max-w-none text-gray-600 prose-headings:font-serif prose-headings:text-[#1B2A4A] prose-a:text-[#C9A84C] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#1B2A4A] prose-blockquote:border-[#C9A84C] prose-blockquote:text-gray-500"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-12 border-t border-[var(--border)] pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#1B2A4A]/5 px-3.5 py-1 text-xs font-medium text-[#1B2A4A] border border-[#1B2A4A]/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#C9A84C] transition-colors duration-300 hover:text-[#B8942E]"
          >
            <span>&larr;</span> Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
