'use client';

import { useState, useEffect } from 'react';
import { packages as packagesApi, payments } from '@/lib/api';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    packagesApi.list()
      .then((res) => setPlans(res.data || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (packageId) => {
    setProcessing(packageId);
    try {
      const res = await payments.create({ package_id: packageId });
      const paymentUrl = res.data?.payment_url || res.payment_url || res.redirect_url;
      if (paymentUrl) {
        window.open(paymentUrl, '_blank');
      } else {
        alert('Pembayaran berhasil dibuat!');
      }
    } catch {
      alert('Gagal memproses pembayaran');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  const planColors = [
    { gradient: 'linear-gradient(135deg, #64748b, #475569)', badge: '#f1f5f9' },
    { gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', badge: '#eef2ff' },
    { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', badge: '#fffbeb' },
  ];

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>
          Pilih Paket Anda
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
          Upgrade untuk fitur premium dan buat undangan yang tak terlupakan
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">💎</div>
          <div className="empty-title">Paket Belum Tersedia</div>
          <div className="empty-text">Paket langganan akan segera tersedia.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
          {plans.map((plan, i) => {
            const color = planColors[i % planColors.length];
            const isPopular = i === 1;
            return (
              <div key={plan.id} className="card" style={{
                overflow: 'hidden',
                animation: `slide-up 0.4s ease-out ${i * 0.1}s both`,
                border: isPopular ? '2px solid var(--color-primary-400)' : '1px solid transparent',
                position: 'relative',
              }}>
                {isPopular && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white', padding: '4px 12px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em',
                  }}>
                    POPULER
                  </div>
                )}
                <div style={{ background: color.gradient, padding: '28px', color: 'white' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.8 }}>{plan.name}</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: '800', marginTop: '8px' }}>
                    {plan.price === 0 ? 'Gratis' : `Rp ${Number(plan.price).toLocaleString('id-ID')}`}
                  </div>
                  {plan.duration && (
                    <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '4px' }}>{plan.duration}</div>
                  )}
                </div>
                <div style={{ padding: '24px' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'grid', gap: '10px' }}>
                    {(plan.features || []).map((f, j) => (
                      <li key={j} style={{ fontSize: '14px', color: '#475569', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`btn ${isPopular ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%' }}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={processing === plan.id}
                  >
                    {processing === plan.id ? 'Memproses...' : plan.price === 0 ? 'Mulai Gratis' : '🛒 Berlangganan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
