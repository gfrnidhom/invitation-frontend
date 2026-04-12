'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gem, Check, ShoppingCart, Clock, CheckCircle, XCircle, CreditCard, ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { packages as packagesApi, payments, subscriptions } from '@/lib/api';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    Promise.all([
      packagesApi.list().then((res) => setPlans(res.data || [])).catch(() => {}),
      payments.history().then((res) => setHistory(res.data || [])).catch(() => {}),
      subscriptions.current().then((res) => {
        if (res.data && res.data.status === 'active') setActivePlan(res.data.package);
      }).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  const hasTransactions = history.length > 0;
  const showCards = !hasTransactions || showPricing;

  const handleSubscribe = (packageIdentifier) => {
    window.location.href = `/checkout/${packageIdentifier}`;
  };

  const handlePayExisting = async (transaction) => {
    const snapToken = transaction.snap_token || transaction.token;
    if (snapToken && window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: async (result) => { 
          await payments.checkStatus(result.order_id || transaction.order_id).catch(() => {});
          toast.success('Pembayaran berhasil!'); setTimeout(() => window.location.reload(), 1500); 
        },
        onPending: async (result) => { 
          await payments.checkStatus(result.order_id || transaction.order_id).catch(() => {});
          toast.success('Pembayaran sedang diproses.'); setTimeout(() => window.location.reload(), 1500); 
        },
        onError: () => { toast.error('Pembayaran gagal.'); },
        onClose: async () => { 
          await payments.checkStatus(transaction.order_id).catch(() => {});
          window.location.reload(); 
        },
      });
    } else {
      // Retry with new transaction using slug if available, else id
      handleSubscribe(transaction.package?.slug || transaction.package_slug || transaction.package_id);
    }
  };

  const statusConfig = {
    paid: { label: 'Lunas', icon: CheckCircle, color: '#10b981', bg: '#ecfdf5' },
    success: { label: 'Lunas', icon: CheckCircle, color: '#10b981', bg: '#ecfdf5' },
    settlement: { label: 'Lunas', icon: CheckCircle, color: '#10b981', bg: '#ecfdf5' },
    pending: { label: 'Menunggu Pembayaran', icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
    failed: { label: 'Gagal', icon: XCircle, color: '#ef4444', bg: '#fef2f2' },
    expired: { label: 'Kadaluarsa', icon: XCircle, color: '#94a3b8', bg: '#f1f5f9' },
    cancel: { label: 'Dibatalkan', icon: XCircle, color: '#94a3b8', bg: '#f1f5f9' },
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const planColors = [
    { gradient: 'linear-gradient(135deg, #64748b, #475569)' },
    { gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
    { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  ];

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <div style={{ textAlign: showCards ? 'center' : 'left', marginBottom: showCards ? '40px' : '28px' }}>
        {hasTransactions && showPricing && (
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPricing(false)} style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Kembali ke Riwayat
          </button>
        )}
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: showCards ? '32px' : '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>
          {showCards ? 'Pilih Paket Anda' : 'Langganan Saya'}
        </h1>
        <p style={{ color: '#64748b', fontSize: showCards ? '16px' : '14px', maxWidth: showCards ? '480px' : 'none', margin: showCards ? '0 auto' : '0' }}>
          {showCards ? 'Upgrade untuk fitur premium dan buat undangan yang tak terlupakan' : 'Riwayat transaksi dan status langganan Anda'}
        </p>
      </div>

      {/* ─── Transaction History View ─── */}
      {!showCards && (
        <div>
          <style>{`
            .history-card {
               background: white;
               border-radius: 20px;
               border: 1px solid #f1f5f9;
               box-shadow: 0 4px 12px rgba(0,0,0,0.02);
               transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            .history-card:hover {
               border-color: #e2e8f0;
               box-shadow: 0 12px 24px rgba(0,0,0,0.06);
               transform: scale(1.01);
            }
          `}</style>
          <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
            {history.map((tx, i) => {
              const status = statusConfig[tx.status] || statusConfig['pending'];
              const StatusIcon = status.icon;
              const isPending = tx.status === 'pending';
              const packageName = tx.package?.name || tx.package_name || `Paket #${tx.package_id}`;
              const amount = tx.amount || tx.total || tx.gross_amount || 0;

              return (
                <div key={tx.id || i} className="history-card" style={{ padding: '24px', animation: `slide-up 0.4s ease-out ${i * 0.05}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <StatusIcon size={24} color={status.color} />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '18px', color: '#1e293b', marginBottom: '4px' }}>{packageName}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span>ID: <span style={{ fontFamily: 'monospace', color: '#475569', fontWeight: '500' }}>{tx.order_id || tx.id}</span></span>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span>{tx.created_at ? new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Tagihan</div>
                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '20px' }}>Rp {Number(amount).toLocaleString('id-ID')}</div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', minWidth: '140px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: status.color, background: status.bg, padding: '6px 16px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', letterSpacing: '0.05em' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: status.color }}></div>
                          {status.label.toUpperCase()}
                        </span>
                        {isPending && (
                          <button className="btn btn-primary btn-sm" onClick={() => handlePayExisting(tx)} disabled={processing === tx.id} style={{ width: '100%', borderRadius: '10px', fontSize: '13px' }}>
                            {processing === tx.id ? 'Memproses...' : 'Bayar Sekarang'}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          <div
            onClick={() => setShowPricing(true)}
            style={{ padding: '24px', borderRadius: '20px', background: '#f8fafc', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-400)'; e.currentTarget.style.background = '#eef2ff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
          >
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-primary-600)', fontWeight: '700', fontSize: '16px' }}>
                <Plus size={20} strokeWidth={3} /> Mulai Langganan Paket Baru
             </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#94a3b8' }}>Upgrade paket tidak bisa menggunakan paket yang sama atau lebih rendah.</div>
        </div>
      )}

      {/* ─── Pricing Cards View ─── */}
      {showCards && (
        <>
          {plans.filter(p => !activePlan || Number(p.price) >= Number(activePlan.price)).length === 0 ? (
            <div className="card empty-state">
              <Gem size={48} strokeWidth={1.5} color="#94a3b8" />
              <div className="empty-title" style={{ marginTop: '16px' }}>Anda berada di paket tertinggi!</div>
              <div className="empty-text">Saat ini Anda sudah menikmati seluruh fitur terbaik kami.</div>
            </div>
          ) : (
            <>
            <style>{`
              .pricing-card {
                 background: white;
                 border-radius: 24px;
                 border: 1px solid #e2e8f0;
                 transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                 position: relative;
                 display: flex;
                 flex-direction: column;
                 box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
              }
              .pricing-card:hover {
                 transform: translateY(-8px);
                 box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
                 border-color: #cbd5e1;
              }
              .pricing-card.popular {
                 border: 2px solid var(--color-primary-500);
                 box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.25);
              }
              .pricing-card.popular:hover {
                 box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.4);
                 border: 2px solid var(--color-primary-600);
              }
              .pop-badge {
                 position: absolute;
                 top: -14px;
                 left: 50%;
                 transform: translateX(-50%);
                 background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
                 color: white;
                 padding: 6px 18px;
                 border-radius: 20px;
                 font-size: 11px;
                 font-weight: 800;
                 letter-spacing: 0.1em;
                 box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
                 white-space: nowrap;
                 z-index: 10;
              }
            `}</style>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', maxWidth: '960px', margin: '0 auto', paddingTop: '16px' }}>
              {plans.filter(p => !activePlan || Number(p.price) >= Number(activePlan.price)).map((plan, i) => {
                const isPopular = i === 1 || plan.name.toLowerCase().includes('pro');
                let features = Array.isArray(plan.features) ? plan.features : (() => { try { return JSON.parse(plan.features) || []; } catch { return []; } })();
                if (features.length === 0) features = ['Akses Semua Tema Premium', 'Buku Tamu & RSVP Tanpa Batas', 'Galeri Foto Lengkap', 'Pengelolaan Love Story & Acara', 'Custom Music & Teks'];
                
                return (
                  <div key={plan.id} className={`pricing-card ${isPopular ? 'popular' : ''}`} style={{ animation: `slide-up 0.4s ease-out ${i * 0.1}s both` }}>
                    {isPopular && <div className="pop-badge">PALING POPULER</div>}
                    
                    <div style={{ padding: '40px 32px 24px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: isPopular ? 'var(--color-primary-600)' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{plan.name}</div>
                      
                      <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '16px', color: '#0f172a' }}>
                          <span style={{ fontSize: '18px', fontWeight: '700', marginTop: '6px', marginRight: '4px' }}>Rp</span>
                          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '46px', fontWeight: '800', lineHeight: '1', letterSpacing: '-1px' }}>
                             {plan.price === 0 ? 'Gratis' : Number(plan.price).toLocaleString('id-ID')}
                          </span>
                      </div>
                      
                      {plan.duration && <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', fontWeight: '500' }}>/ {plan.duration === '1 Tahun' ? 'tahun' : plan.duration}</div>}
                    </div>
                    
                    <div style={{ padding: '0 32px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {activePlan && Number(plan.price) === Number(activePlan.price) ? (
                        <button className="btn" style={{ width: '100%', textAlign: 'center', display: 'block', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '800', marginBottom: '32px', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }} disabled>
                          <Check size={16} style={{display:'inline', marginRight:'6px', verticalAlign:'text-bottom'}} />
                          SEDANG AKTIF
                        </button>
                      ) : (
                        <Link href={`/checkout/${plan.slug}`} className={`btn ${isPopular ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'center', display: 'block', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', marginBottom: '32px', boxShadow: isPopular ? '0 8px 20px -8px rgba(99,102,241,0.5)' : 'none' }}>
                          {plan.price === 0 ? 'Mulai Gratis' : 'Pilih Paket Ini'}
                        </Link>
                      )}

                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Yang Anda Dapatkan:</div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '14px' }}>
                        {features.map((f, j) => (
                          <li key={j} style={{ fontSize: '14px', color: '#475569', display: 'flex', gap: '12px', alignItems: 'flex-start', lineHeight: '1.4' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                 <Check size={12} color="#10b981" strokeWidth={3.5} />
                              </div>
                              {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
