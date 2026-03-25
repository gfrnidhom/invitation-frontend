'use client';

import { useState, useEffect } from 'react';
import { themes } from '@/lib/api';

export default function ThemesPage() {
  const [themeList, setThemeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    themes.list()
      .then((res) => setThemeList(res.data || []))
      .catch(() => setThemeList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          Katalog Tema
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          Pilih tema yang sempurna untuk undangan pernikahan Anda
        </p>
      </div>

      {themeList.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">🎨</div>
          <div className="empty-title">Belum Ada Tema</div>
          <div className="empty-text">Tema akan segera tersedia.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {themeList.map((theme, i) => (
            <div key={theme.id} className="card card-interactive" style={{ overflow: 'hidden', animation: `slide-up 0.4s ease-out ${i * 0.05}s both` }}>
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {theme.thumbnail ? (
                  <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${theme.thumbnail}`}
                    alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                    🎨
                  </div>
                )}
                {theme.is_premium && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span className="badge" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
                      💎 Premium
                    </span>
                  </div>
                )}
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: '600', color: '#1e293b', margin: '0 0 6px' }}>
                  {theme.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px', lineHeight: '1.5' }}>
                  {theme.description || 'Tema undangan pernikahan elegan'}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {theme.preview_url && (
                    <a href={theme.preview_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                      👁️ Preview
                    </a>
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
