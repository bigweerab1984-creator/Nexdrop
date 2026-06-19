// app/api/products/route.ts
// Public endpoint the storefront calls to list products.
// Keeps the CJ API key server-side; the browser never talks to CJ directly.
import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, applyMarkup } from '@/lib/cj';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('q') ?? undefined;
  const page = Number(searchParams.get('page') ?? '1');

  try {
    const { products, total } = await searchProducts({ keyword, pageNum: page, pageSize: 48 });

    const mapped = products.map((p) => ({
      id: p.pid,
      name: p.productNameEn,
      image: p.productImage,
      category: p.categoryName,
      price: applyMarkup(Number(p.sellPrice)),
    }));

    return NextResponse.json({ products: mapped, total });
  } catch (err) {
    console.error('Failed to fetch CJ products', err);
    return NextResponse.json(
      { error: 'Could not load products right now. Please try again shortly.' },
      { status: 502 }
    );
  }
}
