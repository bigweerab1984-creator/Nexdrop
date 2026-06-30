'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 72,
        background: 'rgba(10, 11, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
      }}
    >
      <div style={{ maxWidth: 1200, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: 24, fontWeight: 800, textDecoration: 'none', color: '#fff', fontFamily: 'var(--font-space-grotesk)' }}>
          NEX<span style={{ color: 'var(--accent)' }}>DROP</span>
        </Link>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Link href="/shop" style={{ textDecoration: 'none', color: '#fff', fontWeight: 600, fontSize: 15, opacity: 0.8 }}>
            Shop
          </Link>
          <Link href="/contact" style={{ textDecoration: 'none', color: '#fff', fontWeight: 600, fontSize: 15, opacity: 0.8 }}>
            Contact
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
