const CJ_API_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

const apiKey = process.env.CJ_API_KEY;

if (!apiKey) {
  throw new Error("CJ_API_KEY is not set");
}

export interface CjProduct {
  pid: string;
  productName: string;
  sellPrice: number;
  productImage: string;
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

export async function getCjProduct(pid: string): Promise<CjProduct> {
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
    productName: product.productNameEn,
    sellPrice: Number(product.sellPrice),
    productImage: product.productImage,
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
