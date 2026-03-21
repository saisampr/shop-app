'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Invalid credentials'));
        return;
      }
      localStorage.setItem('access_token', data.access_token);
      router.push('/');
    } catch {
      setError('Could not reach the server. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '400px', margin: '4rem auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem' }}>🔐 Login</h1>

      {error && (
        <p style={{ color: '#c0392b', background: '#fdecea', padding: '0.6rem 0.9rem', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••"
            style={inputStyle}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.65rem', background: loading ? '#888' : '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: loading ? 'default' : 'pointer', fontSize: '0.95rem', fontWeight: 600 }}
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: '#555' }}>
        Don&apos;t have an account?{' '}
        <Link href="/register" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
      </p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
        <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>← Back to shop</Link>
      </p>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.65rem',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  fontFamily: 'sans-serif',
};
