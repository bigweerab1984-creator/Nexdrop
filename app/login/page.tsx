'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Set cookie that expire in 7 days
    document.cookie = `brain_password=${password}; path=/; max-age=${7 * 24 * 60 * 60}`;
    router.push('/brain');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      color: 'var(--text)',
      padding: 24
    }}>
      <form
        onSubmit={handleLogin}
        className="glass"
        style={{
          padding: 40,
          borderRadius: 24,
          maxWidth: 400,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          textAlign: 'center'
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Brain Access</h1>
        <p style={{ opacity: 0.6 }}>Please enter the Brain Access Password.</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            padding: '12px 16px',
            borderRadius: 12,
            color: '#fff',
            outline: 'none'
          }}
        />

        <button
          type="submit"
          style={{
            background: 'var(--accent)',
            color: '#000',
            border: 'none',
            padding: '12px',
            borderRadius: 12,
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Unlock Brain
        </button>
      </form>
    </div>
  );
}
