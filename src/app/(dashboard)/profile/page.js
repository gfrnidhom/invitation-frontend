'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { profile } from '@/lib/api';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profile.get()
      .then((res) => {
        const data = res.data || res;
        setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
      })
      .catch(() => {
        if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await profile.update(form);
      await refreshUser();
      setMessage('✅ Profil berhasil diperbarui!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div style={{ maxWidth: '600px', animation: 'slide-up 0.4s ease-out' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>
        Profil Saya
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
        Kelola informasi akun Anda
      </p>

      {/* Avatar */}
      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700',
          }}>
            {(form.name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>
              {form.name || 'User'}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>{form.email}</div>
          </div>
        </div>

        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
            background: message.includes('✅') ? '#ecfdf5' : '#fef2f2',
            color: message.includes('✅') ? '#059669' : '#dc2626',
            fontSize: '14px', border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fecaca'}`,
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label className="label">Nama Lengkap</label>
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Nomor Telepon</label>
              <input className="input" type="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="628xxxxxxxxxx" />
            </div>
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={saving}
            style={{ width: '100%', marginTop: '24px' }}>
            {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}
