'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: [err.message || 'Terjadi kesalahan saat registrasi'] });
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan nama lengkap' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'nama@email.com' },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Minimal 8 karakter' },
    { key: 'password_confirmation', label: 'Konfirmasi Password', type: 'password', placeholder: 'Ulangi password' },
  ];

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
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '28px',
          }}>✨</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            Buat Akun Baru
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
            Mulai buat undangan pernikahan impian Anda
          </p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', background: '#fef2f2',
            color: '#dc2626', fontSize: '14px', marginBottom: '20px',
            border: '1px solid #fecaca',
          }}>
            {errors.general[0]}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.key} style={{ marginBottom: '20px' }}>
              <label className="label">{field.label}</label>
              <input
                className={`input ${errors[field.key] ? 'input-error' : ''}`}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                required
              />
              {errors[field.key] && (
                <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
                  {errors[field.key][0]}
                </p>
              )}
            </div>
          ))}
          <button
            className="btn btn-primary btn-lg"
            type="submit"
            disabled={loading}
            style={{ width: '100%', fontSize: '15px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                Mendaftar...
              </span>
            ) : 'Daftar Sekarang'}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
          Sudah punya akun?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary-600)', fontWeight: '600', textDecoration: 'none' }}>
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
