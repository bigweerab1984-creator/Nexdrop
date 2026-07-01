// app/api/products/route.ts
// Public endpoint the storefront calls to list products.
// Keeps the CJ API key server-side; the browser never talks to CJ directly.
import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, applyMarkup } from '@/lib/cj';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('q') ?? undefined;
  const page = Number(searchParams.get('page') ?? '1');
  const saleOnly = searchParams.get('saleOnly') === 'true';

  try {
    // Load local products
    let localProducts: any[] = [];
    try {
      const localData = await fs.readFile(path.join(process.cwd(), 'data/products.json'), 'utf-8');
      localProducts = JSON.parse(localData).products || [];
    } catch (e) {
      console.warn('No local products found');
    }

    // Filter local products if keyword is present
    if (keyword) {
      localProducts = localProducts.filter(p =>
        p.name.toLowerCase().includes(keyword.toLowerCase()) ||
        p.category.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    if (saleOnly) {
      localProducts = localProducts.filter(p => p.onSale);
    }

    let mappedCj: any[] = [];
    let cjTotal = 0;

    try {
      const { products: cjProducts, total } = await searchProducts({ keyword, pageNum: page, pageSize: 48 });
      cjTotal = total;
      mappedCj = cjProducts.map((p) => ({
        id: p.pid,
        name: p.productNameEn,
        image: p.productImage,
        category: p.categoryName,
        price: applyMarkup(Number(p.sellPrice)),
        onSale: Number(p.sellPrice) < 20 // Mock sale logic for CJ
      })).filter(p => !saleOnly || p.onSale);
    } catch (cjErr) {
      console.warn('CJ fetch failed, returning local products only', cjErr);
    }

    // Combine products (local first)
    const combined = [...localProducts, ...mappedCj];

    return NextResponse.json({ products: combined, total: cjTotal + localProducts.length });
  } catch (err) {
    console.error('Fatal error in products API', err);
    return NextResponse.json(
      { error: 'Could not load products right now. Please try again shortly.' },
      { status: 500 }
    );
  }
}
