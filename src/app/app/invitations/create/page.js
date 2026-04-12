'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Palette, Rocket, AlertCircle } from 'lucide-react';
import { themes, invitations, userThemes } from '@/lib/api';

function CreateInvitationForm() {
  const router = useRouter();

  const [themeId, setThemeId] = useState(null);
  const [themeDetail, setThemeDetail] = useState(null);
  const [form, setForm] = useState({ 
    title: '', 
    bride_name: '', 
    groom_name: '', 
    event_date: '', 
    location: '' 
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  


  useEffect(() => {
    userThemes.current().then((res) => {
      const activeData = res.data;
      if (!activeData || !activeData.theme_id) {
        router.push('/app/themes');
        return;
      }
      setThemeId(activeData.theme_id);
      setThemeDetail(activeData.theme);
    }).catch(() => {
      router.push('/app/themes');
    }).finally(() => {
      setLoading(false);
    });
  }, [router]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!themeId) { setError('Belum ada tema yang diaktifkan'); return; }
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== '') {
          fd.append(key, form[key]);
        }
      });
      fd.append('theme_id', themeId);
      
      const res = await invitations.create(fd);
      router.push(`/app/invitations/${res.data?.id || res.id}/edit`);
    } catch (err) { setError(err.message || 'Gagal membuat undangan'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'slide-up 0.4s ease-out' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>Buat Undangan Baru</h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Isi detail dasar untuk undangan Anda</p>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626', fontSize: '14px', marginBottom: '20px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {themeDetail && (
        <div className="card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
            {themeDetail.thumbnail ? (
              <img src={themeDetail.thumbnail.startsWith('http') ? themeDetail.thumbnail : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${themeDetail.thumbnail}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Palette size={24} color="#94a3b8" /></div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tema Terpilih</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{themeDetail.name}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button type="button" onClick={() => router.push('/app/themes')} className="btn btn-ghost btn-sm">Ganti Tema</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '600', margin: '0 0 16px' }}>Detail Dasar Pernikahan</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label className="label">Judul Undangan</label>
              <input className="input" placeholder="The Wedding of..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Nama Mempelai Wanita</label>
                <input className="input" placeholder="Nama Lengkap" value={form.bride_name} onChange={(e) => setForm({ ...form, bride_name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Nama Mempelai Pria</label>
                <input className="input" placeholder="Nama Lengkap" value={form.groom_name} onChange={(e) => setForm({ ...form, groom_name: e.target.value })} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label className="label">Tanggal Pernikahan (Acara Utama)</label><input className="input" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required /></div>
              <div><label className="label">Lokasi / Tempat Acara Utama</label><input className="input" placeholder="Gedung / Rumah" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
            </div>
          </div>
        </div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Membuat...' : <><Rocket size={18} /> Buat Undangan</>}
        </button>
      </form>
    </div>
  );
}

export default function CreateInvitationPage() {
  return (
    <Suspense fallback={<div className="page-loading"><div className="spinner" /></div>}>
      <CreateInvitationForm />
    </Suspense>
  );
}
