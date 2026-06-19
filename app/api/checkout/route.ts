// app/api/checkout/route.ts
// Creates a Stripe Checkout Session for the cart the customer is buying.
// We recompute prices server-side from the product IDs sent — never trust
// a price the browser sends, or anyone could pay $0.01 for anything.
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getProductDetail, applyMarkup } from '@/lib/cj';

type CartItem = { productId: string; quantity: number };

export async function POST(req: NextRequest) {
  try {
    const { items } = (await req.json()) as { items: CartItem[] };

    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    // Re-fetch real prices from CJ for every item — do not trust client-sent prices.
    const lineItems = await Promise.all(
      items.map(async (item) => {
        const detail = await getProductDetail(item.productId);
        const unitPrice = applyMarkup(Number(detail.sellPrice));
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: detail.productNameEn,
              images: detail.productImageSet?.slice(0, 1) ?? [],
              metadata: { cj_pid: item.productId },
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity: item.quantity,
        };
      })
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: {
        // Add/remove countries based on where CJ can actually ship.
        allowed_countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR'],
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop`,
      // Stash the cart so the webhook knows exactly what to order from CJ later.
      metadata: { cart: JSON.stringify(items) },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout session creation failed', err);
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
  }
}
