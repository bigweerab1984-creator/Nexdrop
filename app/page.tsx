'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, Suspense } from 'react';
import { Mesh } from 'three';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import Link from 'next/link';

function Hero3D() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, opacity: 0.6 }}>
      <Canvas>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Float speed={5} rotationIntensity={2} floatIntensity={2}>
            <Sphere args={[1, 100, 200]} scale={2.4}>
              <MeshDistortMaterial
                color="#6c47ff"
                attach="material"
                distort={0.5}
                speed={2}
                roughness={0}
              />
            </Sphere>
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function Home() {
  const reviews = [
    {
      name: 'Priya S.',
      rating: 5,
      text: "Found a desk lamp here I couldn't find anywhere else for under £20. Showed up in 6 days, exactly as pictured.",
      rotate: -3,
    },
    {
      name: 'Marcus T.',
      rating: 5,
      text: 'Genuinely surprised by the checkout — fast, no weird upsells, and tracking updated the whole way.',
      rotate: 2,
    },
    {
      name: 'Aisha K.',
      rating: 5,
      text: "Ordered three things in one go. All arrived separately but all arrived, and the prices beat every site I'd checked.",
      rotate: -2,
    },
    {
      name: 'Daniel R.',
      rating: 5,
      text: 'Customer support actually replied within a day when I had a sizing question. Did not expect that.',
      rotate: 3,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--text)',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      {/* ---------- HERO ---------- */}
      <section
        style={{
          position: 'relative',
          padding: '120px 24px 80px',
          maxWidth: 1200,
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <Hero3D />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            style={{
              display: 'inline-block',
              background: 'var(--accent)',
              color: '#fff',
              fontFamily: "'Space Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 4,
              marginBottom: 28,
              boxShadow: '0 4px 14px rgba(108, 71, 255, 0.4)',
              letterSpacing: '0.02em',
            }}
          >
            NEW FINDS DAILY ✂
          </motion.div>

          <motion.h1
            variants={itemVariants}
            style={{
              fontFamily: "'Space Grotesk', Inter, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(40px, 9vw, 84px)',
              lineHeight: 1,
              margin: '0 0 24px',
              letterSpacing: '-0.04em',
              background: 'linear-gradient(to bottom, #fff, #888)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Good stuff.
            <br />
            <span style={{ color: 'var(--accent2)', WebkitTextFillColor: 'initial' }}>Stupid good prices.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            style={{
              fontSize: 20,
              lineHeight: 1.6,
              color: 'var(--text)',
              opacity: 0.7,
              maxWidth: 600,
              margin: '0 auto 40px',
            }}
          >
            NexDrop hunts down genuinely useful, slightly unexpected things —
            and gets them to your door without the markup.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link
              href="/shop"
              style={{
                display: 'inline-block',
                background: 'var(--accent2)',
                color: '#000',
                fontWeight: 700,
                fontSize: 18,
                padding: '18px 48px',
                borderRadius: 50,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(0, 229, 160, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              Start browsing &rarr;
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- TRUST TICKER ---------- */}
      <div
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '20px 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            gap: 64,
            fontFamily: "'Space Mono', monospace",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}
        >
          {Array(5)
            .fill([
              '⚡ FAST SHIPPING',
              '🔒 SECURE CHECKOUT',
              '⭐ REAL REVIEWS',
              '↩ EASY RETURNS',
            ])
            .flat()
            .map((item, i) => (
              <span key={i} style={{ color: 'var(--accent2)' }}>
                {item}
              </span>
            ))}
        </div>
      </div>

      {/* ---------- REVIEWS ---------- */}
      <section
        style={{
          padding: '100px 24px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontFamily: "'Space Grotesk', Inter, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 48px)',
            textAlign: 'center',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          People keep coming back
        </h2>
        <p
          style={{
            textAlign: 'center',
            opacity: 0.6,
            fontSize: 18,
            marginBottom: 64,
          }}
        >
          A few words from people who&apos;ve actually ordered.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
          }}
        >
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '32px',
                position: 'relative',
              }}
            >
              <div style={{ marginBottom: 16, color: 'var(--accent2)', fontSize: 20 }}>
                {'★'.repeat(r.rating)}
              </div>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: 'var(--text)',
                  marginBottom: 24,
                }}
              >
                &ldquo;{r.text}&rdquo;
              </p>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--accent)',
                }}
              >
                &mdash; {r.name}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- FOOTER CTA ---------- */}
      <section
        style={{
          background: 'var(--surface)',
          padding: '100px 24px',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
        }}
      >
        <h2
          style={{
            fontFamily: "'Space Grotesk', Inter, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 48px)',
            marginBottom: 32,
            letterSpacing: '-0.02em',
          }}
        >
          Ready to dig in?
        </h2>
        <Link
          href="/shop"
          style={{
            display: 'inline-block',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            padding: '18px 48px',
            borderRadius: 50,
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(108, 71, 255, 0.3)',
          }}
        >
          See what&apos;s new &rarr;
        </Link>
      </section>
    </div>
  );
}
