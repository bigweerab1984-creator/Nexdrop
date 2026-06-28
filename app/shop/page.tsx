// app/shop/page.tsx
'use client';

import { useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
};

type CartLine = { productId: string; quantity: number; name: string; price: number };

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/products${query ? `?q=${encodeURIComponent(query)}` : ''}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then((data) => setProducts(data.products))
      .catch((err) => {
        if (err.name !== 'AbortError') setError('Could not load products. Is the CJ API configured?');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query]);

  function addToCart(p: Product) {
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === p.id);
      if (existing) {
        return prev.map((line) =>
          line.productId === p.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...prev, { productId: p.id, quantity: 1, name: p.name, price: p.price }];
    });
  }

  const cartTotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);

  async function checkout() {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redirect to Stripe Checkout
      } else {
        setError(data.error ?? 'Checkout failed.');
      }
    } catch {
      setError('Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>NexDrop Shop</h1>

      <input
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 20,
          background: '#181b23',
          border: '1px solid var(--border)',
          borderRadius: 8,
          color: 'var(--text)',
        }}
      />

      {error && (
        <div style={{ background: '#2a1518', color: '#ff8080', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading products…</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <img src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, marginBottom: 6 }}>{p.name}</div>
                <div style={{ color: 'var(--accent2)', fontWeight: 700, marginBottom: 8 }}>
                  ${Number.isFinite(p.price) ? p.price.toFixed(2) : '—'}
                </div>
                <button
                  onClick={() => addToCart(p)}
                  style={{
                    width: '100%',
                    padding: 8,
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                  }}
                >
                  Add to cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
            minWidth: 240,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Cart ({cart.length})</div>
          <div style={{ marginBottom: 8 }}>${cartTotal.toFixed(2)}</div>
          <button
            onClick={checkout}
            disabled={checkingOut}
            style={{
              width: '100%',
              padding: 10,
              background: 'var(--accent2)',
              color: '#000',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {checkingOut ? 'Redirecting…' : 'Checkout'}
          </button>
        </div>
      )}
    </div>
  );
}
