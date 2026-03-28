'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gem, Check, ShoppingCart, Clock, CheckCircle, XCircle, CreditCard, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { packages as packagesApi, payments, subscriptions } from '@/lib/api';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    Promise.all([
      packagesApi.list().then((res) => setPlans(res.data || [])).catch(() => {}),
      payments.history().then((res) => setHistory(res.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const hasTransactions = history.length > 0;
  const showCards = !hasTransactions || showPricing;

  const handleSubscribe = (packageId) => {
    // Navigate to checkout page instead of instant payment
    window.location.href = `/checkout/${packageId}`;
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
      // Retry with new transaction
      handleSubscribe(transaction.package_id);
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
          <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
            {history.map((tx, i) => {
              const status = statusConfig[tx.status] || statusConfig['pending'];
              const StatusIcon = status.icon;
              const isPending = tx.status === 'pending';
              const packageName = tx.package?.name || tx.package_name || `Paket #${tx.package_id}`;
              const amount = tx.amount || tx.total || tx.gross_amount || 0;

              return (
                <div key={tx.id || i} className="card" style={{ padding: '24px', animation: `slide-up 0.4s ease-out ${i * 0.05}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <StatusIcon size={22} color={status.color} />
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '16px', color: '#1e293b' }}>{packageName}</div>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: status.color, background: status.bg, padding: '2px 10px', borderRadius: '20px' }}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                        <div>ID Transaksi: <span style={{ fontFamily: 'monospace', color: '#475569' }}>{tx.order_id || tx.id}</span></div>
                        {amount > 0 && <div>Total: <span style={{ fontWeight: '600', color: '#1e293b' }}>Rp {Number(amount).toLocaleString('id-ID')}</span></div>}
                        {tx.created_at && <div>Tanggal: {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>}
                      </div>
                    </div>

                    {isPending && (
                      <button className="btn btn-primary" onClick={() => handlePayExisting(tx)} disabled={processing === tx.id}
                        style={{ whiteSpace: 'nowrap' }}>
                        <CreditCard size={16} /> {processing === tx.id ? 'Memproses...' : 'Bayar Sekarang'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn btn-secondary" onClick={() => setShowPricing(true)} style={{ width: '100%' }}>
            <ShoppingCart size={16} /> Beli Paket Baru
          </button>
        </div>
      )}

      {/* ─── Pricing Cards View ─── */}
      {showCards && (
        <>
          {plans.length === 0 ? (
            <div className="card empty-state"><Gem size={48} strokeWidth={1.5} color="#94a3b8" /><div className="empty-title" style={{ marginTop: '16px' }}>Paket Belum Tersedia</div><div className="empty-text">Paket langganan akan segera tersedia.</div></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
              {plans.map((plan, i) => {
                const color = planColors[i % planColors.length]; const isPopular = i === 1;
                let features = Array.isArray(plan.features) ? plan.features : (() => { try { return JSON.parse(plan.features) || []; } catch { return []; } })();
                if (features.length === 0) features = ['Akses Semua Tema Premium', 'Buku Tamu & RSVP Tanpa Batas', 'Galeri Foto Lengkap', 'Pengelolaan Love Story & Acara', 'Custom Music & Teks'];
                return (
                  <div key={plan.id} className="card" style={{ overflow: 'hidden', animation: `slide-up 0.4s ease-out ${i * 0.1}s both`, border: isPopular ? '2px solid var(--color-primary-400)' : '1px solid transparent', position: 'relative' }}>
                    {isPopular && (<div style={{ position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em' }}>POPULER</div>)}
                    <div style={{ background: color.gradient, padding: '28px', color: 'white' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.8 }}>{plan.name}</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: '800', marginTop: '8px' }}>{plan.price === 0 ? 'Gratis' : `Rp ${Number(plan.price).toLocaleString('id-ID')}`}</div>
                      {plan.duration && <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '4px' }}>{plan.duration}</div>}
                    </div>
                    <div style={{ padding: '24px' }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'grid', gap: '10px' }}>
                        {features.map((f, j) => (
                          <li key={j} style={{ fontSize: '14px', color: '#475569', display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="#10b981" strokeWidth={3} /> {f}</li>
                        ))}
                      </ul>
                      <Link href={`/checkout/${plan.slug}`} className={`btn ${isPopular ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                        {plan.price === 0 ? 'Mulai Gratis' : <><ShoppingCart size={16} style={{display:'inline', marginRight:'6px', verticalAlign:'text-bottom'}} /> Berlangganan</>}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
