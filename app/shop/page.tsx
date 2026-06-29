'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 40 }}
      >
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: 16, fontFamily: 'var(--font-space-grotesk)' }}>Shop NexDrop</h1>
        <p style={{ opacity: 0.6, fontSize: 18 }}>Handpicked products at wholesale prices.</p>
      </motion.div>

      <div style={{ position: 'relative', marginBottom: 48 }}>
        <input
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            color: 'var(--text)',
            fontSize: 16,
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: '#2a1518', color: '#ff8080', padding: 16, borderRadius: 12, marginBottom: 32, border: '1px solid #4a1518' }}
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
           <div className="spinner" style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
           <style jsx>{`
             @keyframes spin {
               to { transform: rotate(360deg); }
             }
           `}</style>
        </div>
      ) : (
        <motion.div
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 32,
          }}
        >
          <AnimatePresence>
            {products.map((p) => (
              <motion.div
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8 }}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 24,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{p.name}</div>
                  <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>{p.category}</div>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ color: 'var(--accent2)', fontWeight: 800, fontSize: 20 }}>
                      ${Number.isFinite(p.price) ? p.price.toFixed(2) : '—'}
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      style={{
                        padding: '10px 20px',
                        background: 'var(--accent)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#7d5eff')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 24,
              padding: 24,
              minWidth: 300,
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              zIndex: 100,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Your Cart</div>
              <div style={{ background: 'var(--accent)', color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 12 }}>{cart.length} items</div>
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
               {cart.map((item, idx) => (
                 <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, opacity: 0.8 }}>
                    <span>{item.name} (x{item.quantity})</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                 </div>
               ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 24, color: 'var(--accent2)' }}>${cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={checkout}
              disabled={checkingOut}
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--accent2)',
                color: '#000',
                border: 'none',
                borderRadius: 16,
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {checkingOut ? 'Redirecting…' : 'Complete Purchase'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
