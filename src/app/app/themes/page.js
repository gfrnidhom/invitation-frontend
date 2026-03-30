'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Palette, Gem, Eye, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { themes, userThemes, subscriptions } from '@/lib/api';
import { getInvitationUrl, getThemePreviewUrl, APP_CONFIG } from '@/lib/constants';

export default function ThemesPage() {
  const [themeList, setThemeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [invitationSlug, setInvitationSlug] = useState(null);
  const [activating, setActivating] = useState(null);

  useEffect(() => {
    Promise.all([
      themes.list().then((res) => setThemeList(res.data || [])).catch(() => setThemeList([])),
      userThemes.current().then((res) => {
        if (res.data?.theme_id) setActiveTheme(res.data.theme_id);
      }).catch(() => {}),
      subscriptions.current().then((res) => {
        if (res?.data && res.data.status === 'active') {
          setHasSubscription(true);
        }
      }).catch(() => {}),
      import('@/lib/api').then(m => m.invitations.list().then(res => {
         if (res.data && res.data.length > 0) setInvitationSlug(res.data[0].slug);
      }).catch(() => {}))
    ]).finally(() => setLoading(false));
  }, []);

  const handleActivate = async (themeId) => {
    setActivating(themeId);
    try {
      await userThemes.set(themeId);
      setActiveTheme(themeId);
      toast.success('Tema berhasil diaktifkan!');
    } catch (err) {
      toast.error('Gagal mengaktifkan tema: ' + (err.message || JSON.stringify(err)));
    } finally {
      setActivating(null);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Katalog Tema</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Pilih tema yang sempurna untuk undangan pernikahan Anda</p>
      </div>
      {themeList.length === 0 ? (
        <div className="card empty-state"><Palette size={48} strokeWidth={1.5} color="#94a3b8" /><div className="empty-title" style={{ marginTop: '16px' }}>Belum Ada Tema</div><div className="empty-text">Tema akan segera tersedia.</div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {themeList.map((theme, i) => (
            <div key={theme.id} className="card card-interactive" style={{ overflow: 'hidden', animation: `slide-up 0.4s ease-out ${i * 0.05}s both`, border: activeTheme == theme.id ? '2px solid var(--color-primary-500)' : 'none' }}>
              <div style={{ height: '200px', background: 'linear-gradient(135deg, #667eea, #764ba2)', position: 'relative', overflow: 'hidden' }}>
                {theme.thumbnail ? (
                  <img src={theme.thumbnail.startsWith('http') ? theme.thumbnail : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${theme.thumbnail}`} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                ) : (<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Palette size={48} color="rgba(255,255,255,0.5)" /></div>)}
                {theme.is_premium && (<div style={{ position: 'absolute', top: '12px', right: '12px' }}><span className="badge" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}><Gem size={12} /> Premium</span></div>)}
                {activeTheme == theme.id && (<div style={{ position: 'absolute', top: '12px', left: '12px' }}><span className="badge" style={{ background: 'var(--color-primary-500)', color: 'white' }}>Aktif</span></div>)}
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: '600', color: '#1e293b', margin: '0 0 6px' }}>{theme.name}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px', lineHeight: '1.5' }}>{theme.description || 'Tema undangan pernikahan elegan'}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {activeTheme == theme.id ? (
                    <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1, opacity: 0.8 }} disabled>Sedang Aktif</button>
                      {invitationSlug && (
                        <a href={getInvitationUrl(invitationSlug)} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ padding: '0 12px' }} title="Preview Undangan Saya">
                           <Eye size={14} />
                        </a>
                      )}
                    </div>
                  ) : theme.is_premium && !hasSubscription ? (
                    <Link href="/subscriptions" className="btn btn-ghost btn-sm" style={{ flex: 1, border: '1px solid #e2e8f0', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '500' }}>
                      <Gem size={14} /> Upgrade
                    </Link>
                  ) : (
                    <button onClick={() => handleActivate(theme.id)} disabled={activating === theme.id} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                      {activating === theme.id ? 'Memproses...' : <><Plus size={14} /> Aktifkan</>}
                    </button>
                  )}
                  {theme.preview_url ? (
                    <a href={getThemePreviewUrl(theme.slug)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ border: '1px solid #e2e8f0' }} title="Preview Template"><Eye size={14} /></a>
                  ) : (
                    <a href={getThemePreviewUrl(theme.slug)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ border: '1px solid #e2e8f0' }} title="Preview Template"><Eye size={14} /></a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
