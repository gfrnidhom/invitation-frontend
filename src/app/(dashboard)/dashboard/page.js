'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboard } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard.stats()
      .then((res) => setStats(res.data || res))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: '💌', label: 'Total Undangan', value: stats?.total_invitations || 0, color: '#6366f1', bg: '#eef2ff' },
    { icon: '👥', label: 'Total Tamu', value: stats?.total_guests || 0, color: '#8b5cf6', bg: '#f5f3ff' },
    { icon: '✅', label: 'RSVP Hadir', value: stats?.confirmed_guests || 0, color: '#10b981', bg: '#ecfdf5' },
    { icon: '👁️', label: 'Total Views', value: stats?.total_views || 0, color: '#f59e0b', bg: '#fffbeb' },
  ];

  const quickActions = [
    { icon: '➕', title: 'Buat Undangan', desc: 'Mulai buat undangan baru', href: '/invitations/create', color: '#6366f1' },
    { icon: '🎨', title: 'Pilih Tema', desc: 'Jelajahi koleksi tema', href: '/themes', color: '#ec4899' },
    { icon: '💎', title: 'Langganan', desc: 'Upgrade paket Anda', href: '/subscriptions', color: '#f59e0b' },
  ];

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          Selamat datang kembali! Berikut ringkasan undangan Anda.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {statCards.map((card, i) => (
          <div key={i} className="stat-card" style={{ animation: `slide-up 0.4s ease-out ${i * 0.1}s both` }}>
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-value">{card.value.toLocaleString()}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
        Aksi Cepat
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {quickActions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="card card-interactive"
            style={{
              padding: '24px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              animation: `slide-up 0.4s ease-out ${(i + 4) * 0.1}s both`,
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: `${action.color}15`, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '22px',
            }}>
              {action.icon}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '15px', color: '#1e293b' }}>
                {action.title}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                {action.desc}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
