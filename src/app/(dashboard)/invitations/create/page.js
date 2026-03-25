'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { themes, invitations } from '@/lib/api';

export default function CreateInvitationPage() {
  const router = useRouter();
  const [themeList, setThemeList] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [form, setForm] = useState({ title: '', bride_name: '', groom_name: '', wedding_date: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    themes.list()
      .then((res) => setThemeList(res.data || []))
      .catch(() => setThemeList([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTheme) {
      setError('Pilih tema terlebih dahulu');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await invitations.create({ ...form, theme_id: selectedTheme });
      const id = res.data?.id || res.id;
      router.push(`/invitations/${id}/edit`);
    } catch (err) {
      setError(err.message || 'Gagal membuat undangan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'slide-up 0.4s ease-out' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>
        Buat Undangan Baru
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
        Pilih tema dan isi detail dasar undangan Anda
      </p>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px', background: '#fef2f2',
          color: '#dc2626', fontSize: '14px', marginBottom: '20px', border: '1px solid #fecaca',
        }}>
          {error}
        </div>
      )}

      {/* Theme Selection */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '600', margin: '0 0 16px' }}>
          1. Pilih Tema
        </h2>
        {themeList.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Tidak ada tema tersedia</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {themeList.map((theme) => (
              <div
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                style={{
                  borderRadius: '12px',
                  border: selectedTheme === theme.id ? '3px solid var(--color-primary-500)' : '2px solid #e2e8f0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: selectedTheme === theme.id ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                <div style={{
                  height: '100px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {theme.thumbnail ? (
                    <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${theme.thumbnail}`}
                      alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '28px' }}>🎨</span>
                  )}
                </div>
                <div style={{ padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                    {theme.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Basic Info */}
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '600', margin: '0 0 16px' }}>
            2. Detail Dasar
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label className="label">Judul Undangan</label>
              <input className="input" placeholder="The Wedding of..." value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Nama Mempelai Wanita</label>
                <input className="input" placeholder="Nama Lengkap" value={form.bride_name}
                  onChange={(e) => setForm({ ...form, bride_name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Nama Mempelai Pria</label>
                <input className="input" placeholder="Nama Lengkap" value={form.groom_name}
                  onChange={(e) => setForm({ ...form, groom_name: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Tanggal Pernikahan</label>
              <input className="input" type="date" value={form.wedding_date}
                onChange={(e) => setForm({ ...form, wedding_date: e.target.value })} required />
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}
          style={{ width: '100%' }}>
          {submitting ? 'Membuat...' : '🚀 Buat Undangan'}
        </button>
      </form>
    </div>
  );
}
