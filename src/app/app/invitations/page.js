'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Users, BarChart3, Send, Trash2, Heart, Mail, Share2, MessageSquare, ScanLine, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { invitations } from '@/lib/api';
import { confirmAction } from '@/lib/toast-confirm';
import { getInvitationUrl } from '@/lib/constants';

export default function InvitationsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invitations.list()
      .then((res) => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    confirmAction('Hapus undangan ini?', async () => {
      try { 
        await invitations.delete(id); 
        setData(curr => curr.filter((inv) => inv.id !== id)); 
        toast.success('Undangan dihapus');
      }
      catch { toast.error('Gagal menghapus undangan'); }
    });
  };

  const handlePublish = async (id, currentStatus) => {
    const isPublished = currentStatus === 'published';
    try {
      isPublished ? await invitations.unpublish(id) : await invitations.publish(id);
      setData(data.map((inv) => inv.id === id ? { ...inv, status: isPublished ? 'draft' : 'published' } : inv));
      toast.success(isPublished ? 'Undangan diubah ke Draft' : 'Undangan berhasil di-Publish');
    } catch { toast.error('Gagal mengubah status'); }
  };

  const handleShare = async (slug) => {
    const url = getInvitationUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link undangan berhasil disalin!');
    } catch (err) {
      toast.error('Gagal menyalin link');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Undangan Saya</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Kelola semua undangan pernikahan Anda</p>
        </div>
        <Link href="/app/invitations/create" className="btn btn-primary"><Plus size={16} /> Buat Undangan</Link>
      </div>

      {data.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon" style={{ fontSize: '16px' }}><Mail size={48} strokeWidth={1.5} color="#94a3b8" /></div>
          <div className="empty-title">Belum Ada Undangan</div>
          <div className="empty-text">Mulai buat undangan pertama Anda untuk momen spesial!</div>
          <Link href="/app/invitations/create" className="btn btn-primary" style={{ marginTop: '20px' }}><Plus size={16} /> Buat Sekarang</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
          {data.map((inv, i) => (
            <div key={inv.id} className="card" style={{ overflow: 'hidden', animation: `slide-up 0.4s ease-out ${i * 0.05}s both` }}>
              <div style={{
                height: '160px', background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              }}>
                {inv.cover_photo ? (
                  <img src={(Array.isArray(inv.cover_photo) ? inv.cover_photo[0] : inv.cover_photo).startsWith('http') ? (Array.isArray(inv.cover_photo) ? inv.cover_photo[0] : inv.cover_photo) : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${(Array.isArray(inv.cover_photo) ? inv.cover_photo[0] : inv.cover_photo)}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/dummies/cover.jpg`} alt="Dummy Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                )}
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span className={`badge ${inv.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                    {inv.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px' }}>
                  {inv.bride_name && inv.groom_name ? `${inv.bride_name} & ${inv.groom_name}` : inv.title || 'Undangan Baru'}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                  {inv.theme_name || 'Tema belum dipilih'} • {inv.wedding_date || 'Tanggal belum diatur'}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a href={getInvitationUrl(inv.slug)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}>
                    <Eye size={14} /> Lihat Website
                  </a>
                  <button className="btn btn-primary btn-sm" onClick={() => handleShare(inv.slug)}>
                    <Share2 size={14} /> Bagikan
                  </button>
                  <Link href={`/app/invitations/${inv.id}/edit`} className="btn btn-secondary btn-sm"><Pencil size={14} /> Edit</Link>
                  <Link href={`/app/invitations/${inv.id}/scan`} className="btn btn-ghost btn-sm" style={{ color: '#0ea5e9', background: '#e0f2fe', border: 'none' }}><ScanLine size={14} /> Scan QR</Link>
                  <Link href={`/app/invitations/${inv.id}/guests`} className="btn btn-ghost btn-sm"><Users size={14} /> Tamu</Link>
                  <Link href={`/app/invitations/${inv.id}/guestbook`} className="btn btn-ghost btn-sm"><MessageSquare size={14} /> Ucapan</Link>
                  <Link href={`/app/invitations/${inv.id}/analytics`} className="btn btn-ghost btn-sm"><BarChart3 size={14} /> Statistik</Link>
                  <button className="btn btn-ghost btn-sm" onClick={() => handlePublish(inv.id, inv.status)}>
                    <Send size={14} /> {inv.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(inv.id)} style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={14} />
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
