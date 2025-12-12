"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Award } from 'lucide-react';
import type { Product } from '@/types/product';

interface FeaturedProductProps {
  product: Product;
}

const FeaturedProduct: React.FC<FeaturedProductProps> = ({ product }) => {
  if (!product) {
    return null;
  }

  const { slug, title, description, price, images, inStock } = product;
  const primaryImage = images?.[0];
  const isSoldOut = inStock === false;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-md md:flex-row">
      <div className="relative w-full overflow-hidden md:w-2/5 md:h-full">
        <div className="absolute left-4 top-4 z-10 rounded-full bg-[#0046be] px-3 py-1 text-sm font-medium text-white shadow-sm">
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span>Top Deals</span>
          </div>
        </div>
        <div className="relative w-full aspect-square md:h-full md:aspect-auto">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage}
                alt={title}
                fill
                className={`object-cover transition-transform duration-500 group-hover:scale-[1.02] ${isSoldOut ? 'opacity-50' : ''}`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
                unoptimized
              />
              {isSoldOut && (
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.382)] flex items-center justify-center">
                  <div className="border-[3px] border-[#fcf050] rounded-lg px-7 py-2.5">
                    <span className="sold-out-badge text-[#fcf050] text-base md:text-lg uppercase tracking-wider whitespace-nowrap">
                      Sold Out
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
              No image available
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col p-5 sm:p-6 md:w-3/5 md:h-full md:overflow-hidden md:justify-start">
        <div className="space-y-3 md:space-y-2.5">
          <h3 className="line-clamp-2 text-lg font-medium leading-snug text-gray-900 md:text-xl">
            {title}
          </h3>

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-xl font-semibold text-gray-900 md:text-2xl">
              ${new Intl.NumberFormat('en-US').format(price)}
            </span>
            <span className="text-sm text-gray-500">Free shipping</span>
          </div>

          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mt-1">
              {description}
            </p>
          )}
        </div>

        <div className="mt-4 md:mt-3 flex flex-col gap-2 sm:flex-row sm:gap-2">
          <Link
            href={`/products/${slug}`}
            className="flex-1 flex items-center justify-center rounded-lg bg-[#0046be] py-2 px-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#003494] whitespace-nowrap"
          >
            Add to Cart
          </Link>
          <Link
            href={`/products/${slug}`}
            className="flex-1 flex items-center justify-center rounded-lg border border-[#0046be] py-2 px-3 text-sm font-semibold text-[#0046be] transition-colors duration-300 hover:bg-blue-50 whitespace-nowrap"
          >
            <span>View Details</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 flex-shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct; 