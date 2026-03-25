'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { analytics } from '@/lib/api';

export default function AnalyticsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analytics.get(id)
      .then((res) => setData(res.data || res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  const stats = [
    { icon: '👁️', label: 'Total Views', value: data?.total_views || 0, color: '#6366f1', bg: '#eef2ff' },
    { icon: '👥', label: 'Unique Visitors', value: data?.unique_visitors || 0, color: '#8b5cf6', bg: '#f5f3ff' },
    { icon: '✅', label: 'RSVP Hadir', value: data?.rsvp_confirmed || 0, color: '#10b981', bg: '#ecfdf5' },
    { icon: '❌', label: 'RSVP Tidak Hadir', value: data?.rsvp_declined || 0, color: '#ef4444', bg: '#fef2f2' },
    { icon: '💬', label: 'Ucapan', value: data?.total_wishes || 0, color: '#f59e0b', bg: '#fffbeb' },
    { icon: '🔗', label: 'Link Dibuka', value: data?.link_clicks || 0, color: '#06b6d4', bg: '#ecfeff' },
  ];

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => router.push('/invitations')} style={{ marginBottom: '8px' }}>
        ← Kembali
      </button>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>
        Statistik Undangan
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
        Pantau performa undangan Anda
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ animation: `slide-up 0.4s ease-out ${i * 0.1}s both` }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value.toLocaleString()}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Daily Views Chart Placeholder */}
      {data?.daily_views && data.daily_views.length > 0 && (
        <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '600', margin: '0 0 20px' }}>
            📈 Views Harian
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '200px', padding: '0 8px' }}>
            {data.daily_views.map((day, i) => {
              const max = Math.max(...data.daily_views.map((d) => d.count || d.views || 0));
              const val = day.count || day.views || 0;
              const height = max > 0 ? (val / max) * 180 : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{val}</span>
                  <div style={{
                    width: '100%', maxWidth: '40px', height: `${height}px`,
                    background: 'linear-gradient(to top, var(--color-primary-500), var(--color-primary-300))',
                    borderRadius: '6px 6px 0 0', minHeight: '4px',
                  }} />
                  <span style={{ fontSize: '10px', color: '#94a3b8', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                    {day.date?.slice(5) || ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
