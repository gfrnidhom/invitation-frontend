'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Palette, Gem, Eye, Plus, Check, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { themes, userThemes, subscriptions } from '@/lib/api';
import { getInvitationUrl, getThemePreviewUrl, APP_CONFIG } from '@/lib/constants';

const CATEGORY_COLORS = {
  'Elegant': { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
  'Floral': { bg: '#fdf2f8', text: '#db2777', border: '#fbcfe8' },
  'Minimalist': { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
  'Monochrome': { bg: '#f9fafb', text: '#374151', border: '#e5e7eb' },
  'Rustic': { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  'Luxury': { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
  'Nature': { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  'Romantic': { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' },
  'Cinematic': { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' },
  'Cultural': { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  'Birthday': { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' },
};

export default function ThemesPage() {
  const [themeList, setThemeList] = useState([]);
  const [groupedThemes, setGroupedThemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [invitationSlug, setInvitationSlug] = useState(null);
  const [activating, setActivating] = useState(null);

  useEffect(() => {
    Promise.all([
      themes.list().then((res) => {
        setThemeList(res.data || []);
        if (res.grouped) setGroupedThemes(res.grouped);
        if (res.categories) setCategories(res.categories);
      }).catch(() => setThemeList([])),
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

  // Get filtered groups based on active category
  const getDisplayGroups = () => {
    if (activeCategory === 'all') {
      return groupedThemes;
    }
    return groupedThemes.filter(g => g.category === activeCategory);
  };

  // Count themes per category
  const getCategoryCount = (cat) => {
    const group = groupedThemes.find(g => g.category === cat);
    return group ? group.themes.length : 0;
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const displayGroups = getDisplayGroups();

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Katalog Tema</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Pilih tema yang sempurna untuk undangan pernikahan Anda</p>
      </div>

      {themeList.length === 0 ? (
        <div className="card empty-state"><Palette size={48} strokeWidth={1.5} color="#94a3b8" /><div className="empty-title" style={{ marginTop: '16px' }}>Belum Ada Tema</div><div className="empty-text">Tema akan segera tersedia.</div></div>
      ) : (
        <>
        <style>{`
          .category-tabs {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 32px;
            padding-bottom: 16px;
            border-bottom: 1px solid #f1f5f9;
          }
          .category-tab {
            padding: 10px 20px;
            border-radius: 14px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
            border: 1px solid #e2e8f0;
            background: white;
            color: #64748b;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            user-select: none;
          }
          .category-tab:hover {
            border-color: var(--color-primary-300);
            color: var(--color-primary-600);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          }
          .category-tab.active {
            background: var(--color-primary-600);
            color: white;
            border-color: var(--color-primary-600);
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
          }
          .category-tab .count {
            padding: 2px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            background: rgba(0,0,0,0.06);
            color: inherit;
          }
          .category-tab.active .count {
            background: rgba(255,255,255,0.2);
          }
          .category-section {
            margin-bottom: 48px;
            animation: slide-up 0.4s ease-out;
          }
          .category-header {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 24px;
          }
          .category-icon {
            width: 42px;
            height: 42px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          }
          .category-line {
            flex: 1;
            height: 1px;
            background: linear-gradient(to right, #e2e8f0, transparent);
          }
          .theme-card {
             background: white;
             border-radius: 20px;
             overflow: hidden;
             box-shadow: 0 2px 10px rgba(0,0,0,0.03);
             transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
             border: 1px solid #f1f5f9;
             display: flex;
             flex-direction: column;
             height: 100%;
          }
          .theme-card:hover {
             transform: translateY(-8px);
             box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          }
          .theme-card.active {
             border-color: var(--color-primary-400);
             box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15), 0 4px 6px -1px rgba(0,0,0,0.1);
          }
          .glass-badge {
             background: rgba(15, 23, 42, 0.6);
             backdrop-filter: blur(8px);
             -webkit-backdrop-filter: blur(8px);
             border: 1px solid rgba(255, 255, 255, 0.2);
             color: white;
             padding: 6px 12px;
             border-radius: 20px;
             font-size: 11px;
             font-weight: 700;
             letter-spacing: 0.05em;
             display: inline-flex;
             align-items: center;
             gap: 6px;
             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .glass-badge.premium {
             background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9));
             border-color: rgba(255, 255, 255, 0.3);
          }
          .glass-badge.active-badge {
             background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9));
             border-color: rgba(255, 255, 255, 0.3);
          }
          .theme-thumbnail-wrapper {
             aspect-ratio: 16/9;
             position: relative;
             overflow: hidden;
             background: #f8fafc;
          }
          .theme-thumbnail {
             width: 100%;
             height: 100%;
             object-fit: cover;
             transition: transform 0.5s ease;
          }
          .theme-card:hover .theme-thumbnail {
             transform: scale(1.05);
          }
        `}</style>

        {/* Category Filter Tabs */}
        <div className="category-tabs">
          <button
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <Layers size={15} />
            Semua
            <span className="count">{themeList.length}</span>
          </button>
          {groupedThemes.map(group => {
            const colors = CATEGORY_COLORS[group.category] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
            return (
              <button
                key={group.category}
                className={`category-tab ${activeCategory === group.category ? 'active' : ''}`}
                onClick={() => setActiveCategory(group.category)}
                style={activeCategory !== group.category ? { borderColor: colors.border, color: colors.text } : {}}
              >
                {group.category}
                <span className="count">{group.themes.length}</span>
              </button>
            );
          })}
        </div>

        {/* Grouped Theme Sections */}
        {displayGroups.map((group, gi) => {
          const colors = CATEGORY_COLORS[group.category] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
          return (
            <div key={group.category} className="category-section" style={{ animationDelay: `${gi * 0.08}s` }}>
              {/* Category Header */}
              <div className="category-header">
                <div className="category-icon" style={{ background: colors.bg, color: colors.text }}>
                  <Palette size={20} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 2px' }}>{group.category}</h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{group.themes.length} tema tersedia</p>
                </div>
                <div className="category-line" />
              </div>

              {/* Theme Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                {group.themes.map((theme, i) => (
                  <div key={theme.id} className={`theme-card ${activeTheme == theme.id ? 'active' : ''}`} style={{ animation: `slide-up 0.4s ease-out ${(gi * 0.08) + (i * 0.05)}s both` }}>
                    <div className="theme-thumbnail-wrapper" style={{ aspectRatio: '16/9' }}>
                      {theme.thumbnail ? (
                        <img src={theme.thumbnail.startsWith('http') ? theme.thumbnail : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${theme.thumbnail}`} alt={theme.name} className="theme-thumbnail" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)' }}>
                          <Palette size={48} color="rgba(255,255,255,0.7)" />
                        </div>
                      )}
                      
                      <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        {theme.is_premium && (
                          <span className="glass-badge premium">
                            <Gem size={12} strokeWidth={2.5} /> PREMIUM
                          </span>
                        )}
                        {activeTheme == theme.id && (
                          <span className="glass-badge active-badge">
                             <Check size={12} strokeWidth={3} /> AKTIF
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{theme.name}</h3>
                      </div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: colors.text,
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        padding: '3px 10px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        width: 'fit-content',
                      }}>
                        {group.category}
                      </span>
                      <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px', lineHeight: '1.6', flex: 1 }}>{theme.description || 'Tema undangan pernikahan yang elegan dan modern.'}</p>
                      
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {activeTheme == theme.id ? (
                          <div style={{ display: 'flex', flex: 1, gap: '12px' }}>
                            <button className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#94a3b8', border: 'none', fontWeight: '600' }} disabled>Sedang Dipakai</button>
                            {invitationSlug && (
                              <a href={getInvitationUrl(invitationSlug)} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '0 16px', borderRadius: '12px' }} title="Preview Undangan">
                                 <Eye size={18} />
                              </a>
                            )}
                          </div>
                        ) : theme.is_premium && !hasSubscription ? (
                          <Link href="/app/subscriptions" className="btn btn-ghost" style={{ flex: 1, border: '1px solid #f59e0b', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', borderRadius: '12px', background: '#fffbeb' }}>
                            <Gem size={16} /> Upgrade Paket
                          </Link>
                        ) : (
                          <button onClick={() => handleActivate(theme.id)} disabled={activating === theme.id} className="btn btn-secondary" style={{ flex: 1, borderRadius: '12px', fontWeight: '600' }}>
                            {activating === theme.id ? 'Memproses...' : <><Plus size={16} /> Gunakan Tema ini</>}
                          </button>
                        )}
                        
                        {activeTheme != theme.id && (
                           <a href={getThemePreviewUrl(theme.slug)} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 16px' }} title="Preview Tema">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                           </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        </>
      )}
    </div>
  );
}
