'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MonitorPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error('Failed to fetch logs', err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ai': return 'var(--accent)';
      case 'obsidian': return 'var(--accent2)';
      case 'voice': return '#ff47d1';
      default: return 'var(--text)';
    }
  };

  return (
    <div style={{
      padding: '100px 24px 40px',
      maxWidth: 1000,
      margin: '0 auto',
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          marginBottom: 12
        }}>
          Brain <span style={{ color: 'var(--accent2)' }}>Monitor</span>
        </h1>
        <p style={{ opacity: 0.6, fontSize: 18 }}>Live activity feed from your Second Brain.</p>
      </div>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        padding: 32,
        boxShadow: '0 12px 48px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {logs.length === 0 && (
            <div style={{ textAlign: 'center', opacity: 0.3, padding: '40px 0' }}>
              No activity recorded yet. Start chatting with the Brain!
            </div>
          )}
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div
                key={log.timestamp + i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: getTypeColor(log.type),
                  boxShadow: `0 0 10px ${getTypeColor(log.type)}`
                }} />

                <div style={{ width: 80, fontSize: 12, opacity: 0.4, fontFamily: 'var(--font-space-mono)' }}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                </div>

                <div style={{
                  textTransform: 'uppercase',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: getTypeColor(log.type),
                  width: 80
                }}>
                  {log.type}
                </div>

                <div style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>
                  {log.message}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
