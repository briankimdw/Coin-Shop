import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/spot-prices";
import { parseJsonField, cn } from "@/lib/utils";
import { JsonLd } from "@/components/JsonLd";

interface PageProps {
  params: { slug: string };
}

function getGradeBadgeColor(grade: string | null | undefined): string {
  if (!grade) return "bg-gray-200 text-gray-700";
  if (grade.startsWith("MS-7") || grade.startsWith("PF-7"))
    return "bg-emerald-100 text-emerald-800";
  if (grade.startsWith("MS-6") || grade.startsWith("PF-6"))
    return "bg-blue-100 text-blue-800";
  if (grade.startsWith("AU") || grade.startsWith("EF"))
    return "bg-amber-100 text-amber-800";
  if (grade.startsWith("VF") || grade.startsWith("F-"))
    return "bg-orange-100 text-orange-800";
  return "bg-gray-200 text-gray-700";
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
      <div className="border-b border-gray-200 bg-white">
        <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-[#C9A84C]">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/inventory" className="hover:text-[#C9A84C]">Inventory</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">
              {coin.title}
            </li>
          </ol>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Section */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
              {images.length > 0 ? (
                <Image
                  src={images[0]}
                  alt={coin.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-8xl">&#x1FA99;</span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200"
                  >
                    <Image
                      src={img}
                      alt={`${coin.title} - Image ${i + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">
              {coin.title}
            </h1>

            {/* Details Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              {coin.year && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Year
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {coin.year}
                  </dd>
                </div>
              )}

              {coin.mintMark && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Mint Mark
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {coin.mintMark}
                  </dd>
                </div>
              )}

              {coin.grade && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Grade
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                        getGradeBadgeColor(coin.grade)
                      )}
                    >
                      {coin.grade}
                    </span>
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Category
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {coin.category}
                </dd>
              </div>

              {coin.metal && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Metal
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {coin.metal}
                  </dd>
                </div>
              )}
            </div>

            {/* Certification */}
            {coin.certification && coin.certification !== "Raw" && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Certification
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                  {coin.certification}
                  {coin.certNumber && <span>#{coin.certNumber}</span>}
                  {certLink && (
                    <a
                      href={certLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C9A84C] underline hover:text-[#b8973f]"
                    >
                      Verify
                    </a>
                  )}
                </dd>
              </div>
            )}

            {/* Description */}
            {coin.description && (
              <div className="mt-6">
                <h2 className="font-serif text-lg font-semibold text-gray-900">
                  Description
                </h2>
                <p className="mt-2 leading-relaxed text-gray-600">
                  {coin.description}
                </p>
              </div>
            )}

            {/* Price */}
            <div className="mt-8">
              <p className="text-3xl font-bold text-[#C9A84C]">
                {formatPrice(coin.askingPrice)}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/contact?subject=${encodeURIComponent(`Inquiry about ${coin.title}`)}`}
                className="inline-flex items-center justify-center rounded-lg bg-[#1B2A4A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2a3d66]"
              >
                Inquire About This Coin
              </Link>
              <Link
                href="/inventory"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                &larr; Back to Inventory
              </Link>
            </div>
          </div>
        </div>

        {/* Related Items */}
        {relatedCoins.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              Related Items
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedCoins.map((related) => {
                const relImages = parseJsonField<string[]>(related.images, []);
                return (
                  <Link
                    key={related.id}
                    href={`/inventory/${related.slug}`}
                    className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {relImages.length > 0 ? (
                        <Image
                          src={relImages[0]}
                          alt={related.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-4xl">&#x1FA99;</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#C9A84C]">
                        {related.title}
                      </h3>
                      <p className="mt-1 text-lg font-bold text-[#C9A84C]">
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
