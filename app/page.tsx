'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import StorefrontHero3D from '@/components/StorefrontHero3D';
import { useEffect, useState, useMemo } from 'react';

export default function Home() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [saleProducts, setSaleProducts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch all products for the category section
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data.products || []))
      .catch(() => {});

    // Fetch sale products for the marquee
    fetch('/api/products?saleOnly=true')
      .then(res => res.json())
      .then(data => setSaleProducts(data.products || []))
      .catch(() => {});
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(allProducts.map(p => p.category)));
    return cats.map(cat => ({
      name: cat,
      products: allProducts.filter(p => p.category === cat).slice(0, 4)
    }));
  }, [allProducts]);

  const reviews = [
    {
      name: 'Priya S.',
      rating: 5,
      text: "Found a desk lamp here I couldn't find anywhere else for under £20. Showed up in 6 days, exactly as pictured.",
    },
    {
      name: 'Marcus T.',
      rating: 5,
      text: 'Genuinely surprised by the checkout — fast, no weird upsells, and tracking updated the whole way.',
    },
    {
      name: 'Aisha K.',
      rating: 5,
      text: "Ordered three things in one go. All arrived separately but all arrived, and the prices beat every site I'd checked.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: any = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    },
  };

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <StorefrontHero3D />
      {/* ---------- HERO ---------- */}
      <section style={{
        position: 'relative',
        padding: '0 24px',
        maxWidth: 1200,
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '90vh',
      }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ position: 'relative', zIndex: 10 }}
        >
          <motion.div
            variants={itemVariants}
            style={{
              display: 'inline-block',
              background: 'rgba(0, 242, 255, 0.1)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: 100,
              marginBottom: 32,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              boxShadow: '0 0 20px var(--accent-glow)',
            }}
          >
            Elevating your setup ✂
          </motion.div>

          <motion.h1
            variants={itemVariants}
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              fontFamily: "var(--font-space-grotesk), Inter, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(48px, 10vw, 96px)',
              lineHeight: 0.9,
              margin: '0 0 32px',
              letterSpacing: '-0.05em',
              background: 'linear-gradient(to bottom, #fff 40%, #666 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(255,255,255,0.2)'
            }}
          >
            Future Goods.
            <br />
            <span style={{ color: 'var(--accent2)', WebkitTextFillColor: 'initial' }}>Stupid Low Prices.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            style={{
              fontSize: 22,
              lineHeight: 1.5,
              color: 'var(--muted)',
              maxWidth: 640,
              margin: '0 auto 48px',
              fontWeight: 400,
            }}
          >
            NexDrop hunts down genuinely useful, slightly unexpected things —
            and gets them to your door without the markup.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link
              href="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--accent)',
                color: '#000',
                fontWeight: 800,
                fontSize: 18,
                padding: '20px 48px',
                borderRadius: 100,
                boxShadow: '0 8px 32px var(--accent-glow)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 48px var(--accent-glow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px var(--accent-glow)';
              }}
            >
              Start Browsing
              <span style={{ fontSize: 24 }}>→</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- ROLLING PRODUCT SCREEN ---------- */}
      <div style={{
        width: '100%',
        overflow: 'hidden',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 0',
        position: 'relative'
      }}>
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
          style={{
            display: 'flex',
            gap: 40,
            whiteSpace: 'nowrap',
            width: 'max-content'
          }}
        >
          {saleProducts.length > 0 ? (
            [...saleProducts, ...saleProducts, ...saleProducts].map((p, i) => (
              <Link
                key={i}
                href={`/shop?q=${encodeURIComponent(p.name)}`}
                style={{
                  width: 200,
                  height: 200,
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 24,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                />
              </Link>
            ))
          ) : (
            [...Array(10)].map((_, i) => (
              <div key={i} style={{
                width: 200,
                height: 200,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 24,
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <div style={{ width: '60%', height: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
              </div>
            ))
          )}
        </motion.div>
      </div>

      {/* ---------- CATEGORY SECTIONS ---------- */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 100 }}>
          {categories.map((cat, idx) => (
            <div key={cat.name}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: 40,
                borderBottom: '1px solid var(--border)',
                paddingBottom: 20
              }}>
                <div>
                  <h2 style={{
                    fontSize: 'clamp(24px, 4vw, 40px)',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase'
                  }}>
                    {cat.name} <span style={{ color: 'var(--accent)' }}>Collection</span>
                  </h2>
                </div>
                <Link href={`/shop?category=${cat.name}`} style={{
                  color: 'var(--accent)',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  View All {cat.name} →
                </Link>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 24
              }}>
                {cat.products.map((p: any) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -10 }}
                    style={{
                      background: 'var(--surface)',
                      borderRadius: 24,
                      overflow: 'hidden',
                      border: '1px solid var(--border)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ height: 300, overflow: 'hidden', position: 'relative' }}>
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {p.onSale && (
                        <div style={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          background: 'var(--accent2)',
                          color: '#000',
                          padding: '4px 12px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 800
                        }}>
                          SALE
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 24 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{p.name}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>${p.price}</span>
                        <Link href={`/shop?q=${encodeURIComponent(p.name)}`} style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border)',
                          padding: '8px 16px',
                          borderRadius: 12,
                          color: 'var(--text)',
                          fontSize: 14,
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}>
                          Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid var(--border)',
        padding: '32px 0',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 64,
          flexWrap: 'wrap',
          fontFamily: "'Space Mono', monospace",
          fontSize: 14,
          fontWeight: 700,
          opacity: 0.6
        }}>
          {['⚡ FAST SHIPPING', '🔒 SECURE PAY', '⭐ 5-STAR SERVICE', '↩ EASY RETURNS'].map((feat, i) => (
            <span key={i}>{feat}</span>
          ))}
        </div>
      </div>

      {/* ---------- REVIEWS ---------- */}
      <section style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "var(--font-space-grotesk), Inter, sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(32px, 5vw, 56px)',
          textAlign: 'center',
          marginBottom: 80,
          letterSpacing: '-0.02em',
        }}>
          Loved by thousands.
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32,
        }}>
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="glass"
              style={{
                borderRadius: 32,
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20
              }}
            >
              <div style={{ color: 'var(--accent)', fontSize: 20 }}>
                {'★'.repeat(r.rating)}
              </div>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--text)', flex: 1 }}>
                &ldquo;{r.text}&rdquo;
              </p>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--muted)',
                textTransform: 'uppercase'
              }}>
                — {r.name}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
