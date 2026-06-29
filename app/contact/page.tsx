'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to send message');
      setSubmitted(true);
    } catch (err) {
      setError('Could not send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '100px auto', textAlign: 'center', padding: 24 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ background: 'var(--surface)', padding: 48, borderRadius: 24, border: '1px solid var(--border)' }}
        >
          <div style={{ fontSize: 48, marginBottom: 24 }}>✉️</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Message Sent!</h2>
          <p style={{ opacity: 0.7, fontSize: 18 }}>We&apos;ll get back to you faster than a drone delivery.</p>
          <button
            onClick={() => setSubmitted(false)}
            style={{ marginTop: 32, padding: '12px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Send another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: 16, fontFamily: 'var(--font-space-grotesk), sans-serif' }}>Get in Touch</h1>
        <p style={{ opacity: 0.6, fontSize: 18, marginBottom: 48 }}>Have a question about an order or just want to say hi?</p>

        {error && (
          <div style={{ background: '#2a1518', color: '#ff8080', padding: 16, borderRadius: 12, marginBottom: 24, border: '1px solid #4a1518' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24, background: 'var(--surface)', padding: 40, borderRadius: 24, border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600, opacity: 0.8 }}>Your Name</label>
            <input
              name="name"
              required
              placeholder="Jane Doe"
              style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600, opacity: 0.8 }}>Email Address</label>
            <input
              name="email"
              required
              type="email"
              placeholder="jane@example.com"
              style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600, opacity: 0.8 }}>Message</label>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="How can we help?"
              style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none', resize: 'none' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '18px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 16,
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              marginTop: 8,
              transition: 'transform 0.2s ease',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
