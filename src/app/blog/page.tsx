import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import BlogCard from "@/components/BlogCard";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "News & Market Updates",
  description:
    "Stay informed with the latest coin collecting news, precious metals market updates, and expert insights.",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Banner */}
      <section className="page-hero py-14 md:py-16">
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Latest Updates</p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">
            News &amp; Market Updates
          </h1>
          <p className="mt-3 text-[#FAF7F0]/60 text-lg">
            Insights, market analysis, and collecting tips from our experts
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  slug: post.slug,
                  excerpt: post.excerpt,
                  coverImage: post.coverImage,
                  author: post.author,
                  tags: post.tags,
                  createdAt: post.createdAt,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center bg-white">
            <div className="text-5xl mb-4 text-gray-300">&#128221;</div>
            <p className="text-lg font-medium text-gray-400">
              No posts yet
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Check back soon for news and market updates.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
