'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { packages as packagesApi, payments, subscriptions } from '@/lib/api';
import { ShieldCheck, ArrowLeft, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeSub, setActiveSub] = useState(null);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/checkout/${slug}`);
    }
  }, [user, authLoading, router, slug]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPkg, resSub] = await Promise.all([
          packagesApi.list(),
          subscriptions.current().catch(() => ({ data: null }))
        ]);
        
        const packages = resPkg.data || [];
        const selectedPlan = packages.find(p => p.slug === slug);
        
        let currentSub = null;
        if (resSub.data && resSub.data.status === 'active') {
           currentSub = resSub.data;
           setActiveSub(currentSub);
        }

        if (selectedPlan) {
          setPlan(selectedPlan);
          
          if (currentSub && currentSub.package && currentSub.package_id !== selectedPlan.id) {
             setDiscount(Number(currentSub.package.price));
          }
        } else {
          toast.error('Paket tidak ditemukan');
          router.push('/app/subscriptions');
        }
      } catch (err) {
        toast.error('Gagal mengambil data paket');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [slug, user, router]);

  const handlePay = async () => {
    if (!plan) return;
    setProcessing(true);
    
    try {
      const res = await payments.create({ 
        package_id: plan.id,
        notes: notes 
      });

      const transaction = res.data?.transaction || res.transaction;
      const snapToken = transaction?.snap_token;
      const orderId = transaction?.order_id;

      if (snapToken) {
        toast.success('Pesanan dibuat. Silakan selesaikan pembayaran.');
        if (typeof window !== 'undefined' && window.snap) {
          window.snap.pay(snapToken, {
            onSuccess: async function(result) {
              const oid = result.order_id || orderId;
              try {
                await payments.checkStatus(oid);
              } catch {
                try { await payments.syncStatus(oid, result.transaction_status || 'settlement'); } catch {}
              }
              toast.success('Pembayaran berhasil!');
              setTimeout(() => router.push('/app/subscriptions'), 500);
            },
            onPending: async function(result) {
              const oid = result.order_id || orderId;
              try {
                await payments.checkStatus(oid);
              } catch {
                try { await payments.syncStatus(oid, result.transaction_status || 'pending'); } catch {}
              }
              toast('Menunggu pembayaran Anda...');
              setTimeout(() => router.push('/app/subscriptions'), 500);
            },
            onError: function() {
              toast.error('Gagal memproses pembayaran di Midtrans');
              router.push('/app/subscriptions');
            },
            onClose: async function() {
              try {
                await payments.checkStatus(orderId);
              } catch {}
              toast('Pembayaran belum diselesaikan.');
              setTimeout(() => router.push('/app/subscriptions'), 500);
            }
          });
        } else {
          toast.error('Sistem pembayaran sedang dimuat, silakan coba lagi nanti.');
          router.push('/app/subscriptions');
        }
      } else {
        toast.success('Transaksi berhasil dibuat!');
        router.push('/app/subscriptions');
      }
    } catch (err) { 
      let errorMessage = 'Gagal memproses pesanan';
      if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
      } else if (err.status) {
          errorMessage = `Error ${err.status}`;
      }
      toast.error(errorMessage); 
      setProcessing(false);
    }
  };

  if (authLoading || loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!plan) return null;

  let features = Array.isArray(plan.features) ? plan.features : [];
  if (!Array.isArray(plan.features)) {
    try { features = JSON.parse(plan.features) || []; } catch { features = []; }
  }
  if (features.length === 0) features = ['Akses Semua Tema', 'Buku Tamu', 'Galeri Foto'];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'var(--font-sans)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '32px', fontWeight: '500' }}>
          <ArrowLeft size={18} /> Kembali
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 12px' }}>Checkout Detail</h1>
          <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>Selesaikan pembayaran untuk mengaktifkan paket Anda.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', md: { flexDirection: 'row' } }} className="checkout-grid">
          
          <style>{`
            .checkout-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
            @media (min-width: 768px) { .checkout-grid { grid-template-columns: 1.2fr 1fr; } }
          `}</style>
          
          {/* Form Section */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Informasi Pemesanan
            </h2>
            
            {plan.name.toLowerCase().includes('custom') && (
              <div style={{ marginBottom: '24px' }}>
                <label className="label" style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Catatan / Request Tema Kustom</label>
                <textarea 
                  className="input" 
                  placeholder="Tuliskan catatan khusus atau request kustomisasi tema untuk admin..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  maxLength={1000}
                />
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Maksimal 1000 karakter. Request desain custom akan ditinjau oleh tim kami.</p>
              </div>
            )}
            
            <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>Pembayaran Aman</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', lineHeight: '1.5' }}>Gunakan berbagai metode pembayaran melalui sistem yang dilindungi oleh Midtrans.</div>
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div>
            <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '24px', padding: '32px', color: 'white', position: 'sticky', top: '24px', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#f8fafc' }}>Ringkasan Pesanan</h2>
              
              <div style={{ paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>Paket {plan.name}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#fb7185', textDecoration: 'line-through', marginBottom: '2px' }}>
                      Rp {Number(plan.original_price && Number(plan.original_price) > Number(plan.price) ? plan.original_price : (Number(plan.price) === 0 ? 149000 : Number(plan.price) + 50000)).toLocaleString('id-ID')}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#34d399' }}>Rp {Number(plan.price).toLocaleString('id-ID')}</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#cbd5e1' }}>Masa aktif: {plan.duration}</div>

                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', color: '#34d399', fontWeight: '500' }}>
                    <div style={{ fontSize: '14px' }}>Potongan Sisa {activeSub?.package?.name}</div>
                    <div style={{ fontSize: '16px' }}>- Rp {discount.toLocaleString('id-ID')}</div>
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px' }}>Yang akan Anda dapatkan:</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
                  {features.map((f, j) => (
                    <li key={j} style={{ fontSize: '14px', color: '#cbd5e1', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <Check size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} strokeWidth={3} /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '16px', color: '#cbd5e1' }}>Total Pembayaran</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '800' }}>Rp {Math.max(1000, Number(plan.price) - discount).toLocaleString('id-ID')}</div>
              </div>

              <button 
                onClick={handlePay}
                disabled={processing}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', background: 'white', color: '#0f172a', border: 'none' }}
              >
                {processing ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Loader2 size={18} className="animate-spin" /> Sedang Memproses...
                  </span>
                ) : 'Bayar Sekarang'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
