import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/spot-prices";
import { parseJsonField, cn } from "@/lib/utils";
import { JsonLd } from "@/components/JsonLd";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

function getGradeBadgeColor(grade: string | null | undefined): string {
  if (!grade) return "bg-gray-100 text-gray-600";
  if (grade.startsWith("MS-7") || grade.startsWith("PF-7"))
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (grade.startsWith("MS-6") || grade.startsWith("PF-6"))
    return "bg-blue-50 text-blue-700 border border-blue-200";
  if (grade.startsWith("AU") || grade.startsWith("EF"))
    return "bg-amber-50 text-amber-700 border border-amber-200";
  if (grade.startsWith("VF") || grade.startsWith("F-"))
    return "bg-orange-50 text-orange-700 border border-orange-200";
  return "bg-gray-100 text-gray-600";
}

function getCertLink(certification: string | null, certNumber: string | null): string | null {
  if (!certification || !certNumber) return null;
  if (certification === "PCGS") return `https://www.pcgs.com/cert/${certNumber}`;
  if (certification === "NGC") return `https://www.ngccoin.com/certlookup/${certNumber}`;
  return null;
}

async function getCoin(slug: string) {
  return prisma.coinListing.findUnique({ where: { slug } });
}

async function getRelatedCoins(category: string, excludeId: string) {
  return prisma.coinListing.findMany({
    where: {
      category,
      id: { not: excludeId },
      sold: false,
    },
    take: 4,
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const coin = await getCoin(params.slug);
  if (!coin) return { title: "Coin Not Found" };

  return {
    title: coin.title,
    description: coin.description || `View details for ${coin.title}`,
    openGraph: {
      title: coin.title,
      description: coin.description || `View details for ${coin.title}`,
      images: parseJsonField<string[]>(coin.images, []).slice(0, 1),
    },
  };
}

export default async function CoinDetailPage({ params }: PageProps) {
  const coin = await getCoin(params.slug);
  if (!coin) notFound();

  const images = parseJsonField<string[]>(coin.images, []);
  const relatedCoins = await getRelatedCoins(coin.category, coin.id);
  const certLink = getCertLink(coin.certification ?? null, coin.certNumber ?? null);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: coin.title,
          description: coin.description || `Details for ${coin.title}`,
          image: images.length > 0 ? images[0] : undefined,
          offers: {
            "@type": "Offer",
            price: coin.askingPrice,
            priceCurrency: "USD",
            availability: coin.sold
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
          },
        }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-white">
        <nav className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-[#C9A84C] transition-colors duration-300">Home</Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link href="/inventory" className="hover:text-[#C9A84C] transition-colors duration-300">Inventory</Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-[#1B2A4A] font-medium truncate max-w-[200px]">
              {coin.title}
            </li>
          </ol>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image Section */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-gray-50 shadow-sm">
              {images.length > 0 ? (
                <img
                  src={images[0]}
                  alt={coin.title}
                  className="absolute inset-0 h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <span className="text-8xl text-gray-300">&#x1FA99;</span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 border-[var(--border)] hover:border-[#C9A84C]/50 transition-all duration-300 cursor-pointer"
                  >
                    <img
                      src={img}
                      alt={`${coin.title} - Image ${i + 1}`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1B2A4A] md:text-3xl leading-tight">
              {coin.title}
            </h1>

            {/* Price - prominent */}
            <div className="mt-5">
              <p className="text-3xl font-bold text-[#C9A84C]">
                {formatPrice(coin.askingPrice)}
              </p>
            </div>

            {/* Details Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-5">
              {coin.year && (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Year
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-[#1B2A4A]">
                    {coin.year}
                  </dd>
                </div>
              )}

              {coin.mintMark && (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Mint Mark
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-[#1B2A4A]">
                    {coin.mintMark}
                  </dd>
                </div>
              )}

              {coin.grade && (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Grade
                  </dt>
                  <dd className="mt-1.5">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        getGradeBadgeColor(coin.grade)
                      )}
                    >
                      {coin.grade}
                    </span>
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Category
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-[#1B2A4A]">
                  {coin.category}
                </dd>
              </div>

              {coin.metal && (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Metal
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-[#1B2A4A]">
                    {coin.metal}
                  </dd>
                </div>
              )}
            </div>

            {/* Certification */}
            {coin.certification && coin.certification !== "Raw" && (
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-white p-5">
                <dt className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Certification
                </dt>
                <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-[#1B2A4A]">
                  {coin.certification}
                  {coin.certNumber && <span className="text-gray-500">#{coin.certNumber}</span>}
                  {certLink && (
                    <a
                      href={certLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C9A84C] hover:text-[#B8942E] underline underline-offset-2 transition-colors duration-300"
                    >
                      Verify
                    </a>
                  )}
                </dd>
              </div>
            )}

            {/* Description */}
            {coin.description && (
              <div className="mt-8">
                <h2 className="font-serif text-lg font-bold text-[#1B2A4A]">
                  Description
                </h2>
                <p className="mt-3 leading-relaxed text-gray-600">
                  {coin.description}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/contact?subject=${encodeURIComponent(`Inquiry about ${coin.title}`)}`}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#1B2A4A] to-[#243558] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#1B2A4A]/25 hover:-translate-y-0.5"
              >
                Inquire About This Coin
              </Link>
              <Link
                href="/inventory"
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-7 py-3.5 text-sm font-medium text-gray-600 transition-all duration-300 hover:bg-gray-50 hover:border-gray-300"
              >
                &larr; Back to Inventory
              </Link>
            </div>
          </div>
        </div>

        {/* Related Items */}
        {relatedCoins.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[var(--border)]">
            <h2 className="font-serif text-2xl font-bold text-[#1B2A4A]">
              Related Items
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedCoins.map((related) => {
                const relImages = parseJsonField<string[]>(related.images, []);
                return (
                  <Link
                    key={related.id}
                    href={`/inventory/${related.slug}`}
                    className="group overflow-hidden rounded-xl border border-[var(--border)] bg-white transition-all duration-400 hover:shadow-xl hover:shadow-[#1B2A4A]/8 hover:-translate-y-1"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      {relImages.length > 0 ? (
                        <img
                          src={relImages[0]}
                          alt={related.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-4xl text-gray-300">&#x1FA99;</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-sm font-bold text-[#1B2A4A] transition-colors duration-300 group-hover:text-[#C9A84C] line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="mt-2 text-lg font-bold text-[#C9A84C]">
                        {formatPrice(related.askingPrice)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
