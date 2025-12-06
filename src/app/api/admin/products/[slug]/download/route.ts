import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { getProductBySlug } from '@/lib/supabase/products';

export const runtime = 'nodejs';

function getFileExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop();
    if (!ext || ext.length > 10) {
      return 'jpg';
    }
    return ext.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
  } catch (error) {
    return 'jpg';
  }
}

function sanitizeProductForExport(product: any) {
  const {
    id,
    slug,
    title,
    description,
    price,
    rating,
    reviewCount,
    images,
    condition,
    category,
    brand,
    payeeEmail,
    payee_email,
    currency,
    checkoutLink,
    checkout_link,
    reviews,
    meta,
    inStock,
    in_stock,
    isFeatured,
    is_featured,
    ...rest
  } = product;

  return {
    id,
    slug,
    title,
    description,
    price,
    rating,
    review_count: reviewCount ?? rest.review_count ?? 0,
    images,
    condition,
    category,
    brand,
    payee_email: payeeEmail ?? payee_email ?? '',
    currency,
    checkout_link: checkoutLink ?? checkout_link ?? '',
    reviews: reviews ?? [],
    meta: meta ?? {},
    in_stock: inStock ?? in_stock ?? true,
    is_featured: isFeatured ?? is_featured ?? false,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
    }

    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const zip = new AdmZip();

    // Add product data as JSON
    const productJson = JSON.stringify(sanitizeProductForExport(product), null, 2);
    zip.addFile('product.json', Buffer.from(productJson, 'utf8'));

    // Download product images
    const images: string[] = Array.isArray(product.images) ? product.images : [];

    for (let index = 0; index < images.length; index += 1) {
      const imageUrl = images[index];
      if (!imageUrl) continue;

      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image (${response.status})`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const extension = getFileExtension(imageUrl);
        const filename = `images/${String(index + 1).padStart(2, '0')}.${extension}`;
        zip.addFile(filename, Buffer.from(arrayBuffer));
      } catch (error) {
        console.error(`Failed to download image for ${slug}:`, error);
      }
    }

    const zipBuffer = zip.toBuffer();

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${slug}.zip"`,
        'Content-Length': String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error('Error creating product export:', error);
    return NextResponse.json(
      { error: 'Failed to generate product export' },
      { status: 500 }
    );
  }
}
