'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Users, UserCheck, MessageCircle, Plus, Palette, Gem } from 'lucide-react';
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
    { icon: Mail, label: 'Total Undangan', value: stats?.invitations?.total || 0, color: '#6366f1', bg: '#eef2ff' },
    { icon: Users, label: 'Total Tamu', value: stats?.guests?.total || 0, color: '#8b5cf6', bg: '#f5f3ff' },
    { icon: UserCheck, label: 'RSVP Hadir', value: stats?.guests?.confirmed || 0, color: '#10b981', bg: '#ecfdf5' },
    { icon: MessageCircle, label: 'Pesan & Doa', value: stats?.messages || 0, color: '#f59e0b', bg: '#fffbeb' },
  ];

  const quickActions = [
    { icon: Plus, title: 'Buat Undangan', desc: 'Mulai buat undangan baru', href: '/app/invitations/create', color: '#6366f1' },
    { icon: Palette, title: 'Pilih Tema', desc: 'Jelajahi koleksi tema', href: '/app/themes', color: '#ec4899' },
    { icon: Gem, title: 'Langganan', desc: 'Upgrade paket Anda', href: '/app/subscriptions', color: '#f59e0b' },
  ];

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Selamat datang kembali! Berikut ringkasan undangan Anda.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="stat-card" style={{ 
              animation: `slide-up 0.4s ease-out ${i * 0.1}s both`,
              background: `linear-gradient(135deg, #ffffff 0%, ${card.bg}90 100%)`,
              border: '1px solid #f1f5f9',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03), 0 8px 10px -6px rgba(0,0,0,0.01)',
              borderRadius: '24px',
              padding: '26px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 25px -5px ${card.color}15, 0 8px 10px -6px rgba(0,0,0,0.01)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.03), 0 8px 10px -6px rgba(0,0,0,0.01)'; }}
            >
              <div className="stat-icon" style={{ background: card.bg, color: card.color, width: '52px', height: '52px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Icon size={26} strokeWidth={2.5} />
              </div>
              <div className="stat-value" style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', fontFamily: 'var(--font-heading)', lineHeight: '1.2' }}>{card.value.toLocaleString()}</div>
              <div className="stat-label" style={{ fontSize: '15px', fontWeight: '500', color: '#64748b', marginTop: '6px' }}>{card.label}</div>
            </div>
          );
        })}
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Aksi Cepat</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link key={i} href={action.href}
              style={{
                padding: '24px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '20px',
                animation: `slide-up 0.4s ease-out ${(i + 4) * 0.1}s both`,
                background: `linear-gradient(to right, #ffffff, #f8fafc)`,
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 24px -8px ${action.color}30, 0 4px 6px -2px rgba(0,0,0,0.02)`; e.currentTarget.style.borderColor = `${action.color}30`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div style={{
                width: '60px', height: '60px', borderRadius: '20px',
                background: `linear-gradient(135deg, ${action.color}20 0%, ${action.color}10 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: action.color,
                boxShadow: `inset 0 0 0 1px ${action.color}20`
              }}>
                <Icon size={28} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '17px', color: '#0f172a' }}>{action.title}</div>
                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>{action.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
