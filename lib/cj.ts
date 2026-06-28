const CJ_API_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

const apiKey = process.env.CJ_API_KEY;

if (!apiKey) {
  throw new Error("CJ_API_KEY is not set");
}

const REDIS_TOKEN_KEY = "cj:access_token";

let inMemoryToken: { accessToken: string; expiresAt: number } | null = null;

let redisClient: import("redis").RedisClientType | null = null;

async function getRedisClient() {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  const { createClient } = await import("redis");
  const client = createClient({ url: redisUrl });
  await client.connect();
  redisClient = client as import("redis").RedisClientType;
  return redisClient;
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  const bufferMs = 60 * 60 * 1000;

  if (inMemoryToken && inMemoryToken.expiresAt - now > bufferMs) {
    return inMemoryToken.accessToken;
  }

  const client = await getRedisClient();

  if (client) {
    try {
      const cached = await client.get(REDIS_TOKEN_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { accessToken: string; expiresAt: number };
        if (parsed.expiresAt - now > bufferMs) {
          inMemoryToken = parsed;
          return parsed.accessToken;
        }
      }
    } catch (err) {
      console.error("CJ token Redis read failed, falling back to fresh auth:", err);
    }
  }

  const res = await fetch(`${CJ_API_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });

  if (!res.ok) {
    throw new Error(`CJ authentication failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  if (!data.result || !data.data?.accessToken) {
    throw new Error(`CJ authentication did not return a token: ${JSON.stringify(data)}`);
  }

  const accessToken: string = data.data.accessToken;
  const expiresAt = data.data.accessTokenExpiryDate
    ? new Date(data.data.accessTokenExpiryDate).getTime()
    : now + 14 * 24 * 60 * 60 * 1000;

  const tokenRecord = { accessToken, expiresAt };
  inMemoryToken = tokenRecord;

  if (client) {
    try {
      const ttlSeconds = Math.max(60, Math.floor((expiresAt - now) / 1000) + 60);
      await client.set(REDIS_TOKEN_KEY, JSON.stringify(tokenRecord), { EX: ttlSeconds });
    } catch (err) {
      console.error("CJ token Redis write failed:", err);
    }
  }

  return accessToken;
}

async function cjAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return { "CJ-Access-Token": token };
}

export interface CjProductDetail {
  pid: string;
  productNameEn: string;
  sellPrice: number;
  productImageSet: string[];
  productImage: string;
  categoryName: string;
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  const url = `${CJ_API_BASE}/product/list?${params.toString()}`;
  const maxAttempts = 3;
  let lastErrorText = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, { headers: await cjAuthHeaders() });

    if (res.status === 429) {
      lastErrorText = await res.text();
      if (attempt < maxAttempts) {
        await sleep(attempt === 1 ? 1200 : 2000);
        continue;
      }
      throw new Error(`CJ product search rate-limited after ${maxAttempts} attempts: ${lastErrorText}`);
    }

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
      productImage: p.bigImage ?? "",
      categoryName: p.threeCategoryName ?? p.twoCategoryName ?? p.oneCategoryName ?? "",
    }));

    return {
      products,
      total: Number(data.data?.totalRecords ?? products.length),
    };
  }

  throw new Error(`CJ product search failed after retries: ${lastErrorText}`);
}

export async function getProductDetail(pid: string): Promise<CjProductDetail> {
  const res = await fetch(`${CJ_API_BASE}/product/query?pid=${pid}`, {
    headers: await cjAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`CJ product lookup failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const product = data.data;

  const imageSet = Array.isArray(product.productImageSet)
    ? product.productImageSet
    : product.productImage
    ? [product.productImage]
    : [];

  return {
    pid: product.pid,
    productNameEn: product.productNameEn,
    sellPrice: Number(product.sellPrice),
    productImageSet: imageSet,
    productImage: imageSet[0] ?? "",
    categoryName: product.categoryName ?? "",
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
