'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      const redirectTo = searchParams.get('redirect') || '/app/dashboard';
      router.push(redirectTo);
    } catch (err) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        animation: 'scale-in 0.3s ease-out',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <Heart size={28} color="white" fill="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            Selamat Datang
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
            Masuk ke akun Anda untuk mengelola undangan
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', background: '#fef2f2',
            color: '#dc2626', fontSize: '14px', marginBottom: '20px',
            border: '1px solid #fecaca',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="nama@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', fontSize: '15px' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 0.7s linear infinite' }} />
                Masuk...
              </span>
            ) : 'Masuk'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
          Belum punya akun?{' '}
          <Link href="/register" style={{ color: 'var(--color-primary-600)', fontWeight: '600', textDecoration: 'none' }}>
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
