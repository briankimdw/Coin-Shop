import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import prisma from "@/lib/prisma";
import { parseJsonField } from "@/lib/utils";

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
      <div className="border-b border-gray-200 bg-white">
        <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-[#C9A84C]">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/blog" className="hover:text-[#C9A84C]">Blog</Link>
            </li>
            <li>/</li>
            <li className="truncate max-w-[200px] font-medium text-gray-900">
              {post.title}
            </li>
          </ol>
        </nav>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Header */}
        <header>
          <h1 className="font-serif text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            {post.title}
          </h1>

          <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              {post.author}
            </span>
            <span>&middot;</span>
            <time dateTime={post.createdAt.toISOString()}>
              {format(post.createdAt, "MMMM d, yyyy")}
            </time>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-lg mt-8 max-w-none text-gray-700 prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-[#C9A84C] prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-10 border-t border-gray-200 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tags
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#1B2A4A]/10 px-3 py-1 text-xs font-medium text-[#1B2A4A]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-10">
          <Link
            href="/blog"
            className="text-sm font-medium text-[#C9A84C] transition-colors hover:text-[#b8973f]"
          >
            &larr; Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
