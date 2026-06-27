const CJ_API_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

const apiKey = process.env.CJ_API_KEY;

if (!apiKey) {
  throw new Error("CJ_API_KEY is not set");
}

export interface CjProductDetail {
  pid: string;
  productNameEn: string;
  sellPrice: number;
  productImageSet: string[];
}

export interface CjOrderItem {
  vid: string;
  quantity: number;
}

export interface CjOrderResult {
  orderId: string;
  orderNum: string;
}

export interface CjShippingAddress {
  name: string;
  address1: string;
  city: string;
  countryCode: string;
  postalCode: string;
  phone: string;
}

const MARKUP_MULTIPLIER = 1.4;

export function applyMarkup(cjPrice: number): number {
  return Math.round(cjPrice * MARKUP_MULTIPLIER * 100) / 100;
}

export async function searchProducts(opts?: {
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
}): Promise<{ products: CjProductDetail[]; total: number }> {
  const params = new URLSearchParams();
  if (opts?.keyword) params.set("productNameEn", opts.keyword);
  params.set("pageNum", String(opts?.pageNum ?? 1));
  params.set("pageSize", String(opts?.pageSize ?? 20));

  const res = await fetch(`${CJ_API_BASE}/product/list?${params.toString()}`, {
    headers: { "CJ-Access-Token": apiKey! },
  });

  if (!res.ok) {
    throw new Error(`CJ product search failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const pages = data.data?.content ?? [];
  const rawProducts = pages.flatMap((page: any) => page.productList ?? []);

  const products: CjProductDetail[] = rawProducts.map((p: any) => ({
    pid: p.id,
    productNameEn: p.nameEn,
    sellPrice: Number(p.sellPrice),
    productImageSet: p.bigImage ? [p.bigImage] : [],
  }));

  return {
    products,
    total: Number(data.data?.totalRecords ?? products.length),
  };
}

export async function getProductDetail(pid: string): Promise<CjProductDetail> {
  const res = await fetch(`${CJ_API_BASE}/product/query?pid=${pid}`, {
    headers: { "CJ-Access-Token": apiKey! },
  });

  if (!res.ok) {
    throw new Error(`CJ product lookup failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const product = data.data;

  return {
    pid: product.pid,
    productNameEn: product.productNameEn,
    sellPrice: Number(product.sellPrice),
    productImageSet: Array.isArray(product.productImageSet)
      ? product.productImageSet
      : product.productImage
      ? [product.productImage]
      : [],
  };
}

export async function createCjOrder(
  _items: CjOrderItem[],
  _shippingAddress: CjShippingAddress
): Promise<CjOrderResult> {
  throw new Error(
    "createCjOrder is not yet implemented against CJ's real order API — " +
      "see the comment above this function before taking live payments."
  );
}
