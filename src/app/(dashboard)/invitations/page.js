'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { invitations } from '@/lib/api';

export default function InvitationsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invitations.list()
      .then((res) => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus undangan ini?')) return;
    try {
      await invitations.delete(id);
      setData(data.filter((inv) => inv.id !== id));
    } catch {
      alert('Gagal menghapus undangan');
    }
  };

  const handlePublish = async (id, isPublished) => {
    try {
      isPublished ? await invitations.unpublish(id) : await invitations.publish(id);
      setData(data.map((inv) =>
        inv.id === id ? { ...inv, is_published: !isPublished } : inv
      ));
    } catch {
      alert('Gagal mengubah status');
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            Undangan Saya
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Kelola semua undangan pernikahan Anda
          </p>
        </div>
        <Link href="/invitations/create" className="btn btn-primary">
          ➕ Buat Undangan
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">💌</div>
          <div className="empty-title">Belum Ada Undangan</div>
          <div className="empty-text">Mulai buat undangan pertama Anda untuk momen spesial!</div>
          <Link href="/invitations/create" className="btn btn-primary" style={{ marginTop: '20px' }}>
            ➕ Buat Sekarang
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {data.map((inv, i) => (
            <div key={inv.id} className="card" style={{ overflow: 'hidden', animation: `slide-up 0.4s ease-out ${i * 0.05}s both` }}>
              {/* Cover */}
              <div style={{
                height: '160px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                {inv.cover_photo ? (
                  <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${inv.cover_photo}`}
                    alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '48px' }}>💍</span>
                )}
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span className={`badge ${inv.is_published ? 'badge-success' : 'badge-warning'}`}>
                    {inv.is_published ? '🟢 Published' : '🟡 Draft'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px' }}>
                  {inv.bride_name && inv.groom_name
                    ? `${inv.bride_name} & ${inv.groom_name}`
                    : inv.title || 'Undangan Baru'}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                  {inv.theme_name || 'Tema belum dipilih'} • {inv.wedding_date || 'Tanggal belum diatur'}
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link href={`/invitations/${inv.id}/edit`} className="btn btn-secondary btn-sm">
                    ✏️ Edit
                  </Link>
                  <Link href={`/invitations/${inv.id}/guests`} className="btn btn-ghost btn-sm">
                    👥 Tamu
                  </Link>
                  <Link href={`/invitations/${inv.id}/analytics`} className="btn btn-ghost btn-sm">
                    📊 Statistik
                  </Link>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handlePublish(inv.id, inv.is_published)}
                  >
                    {inv.is_published ? '📤 Unpublish' : '📤 Publish'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(inv.id)}
                    style={{ color: 'var(--color-danger)' }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
