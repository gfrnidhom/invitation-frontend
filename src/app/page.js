'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Palette, Crown, Heart, Check, ArrowRight, LayoutDashboard, Gem, Quote, BookHeart, Star, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { packages as packagesApi, themes, testimonials, faqs } from '@/lib/api';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [plans, setPlans] = useState([]);
  const [themeList, setThemeList] = useState([]);
  const [testimonialList, setTestimonialList] = useState([]);
  const [faqList, setFaqList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    Promise.all([
      packagesApi.list().then(res => setPlans(res.data || [])).catch(() => {}),
      themes.list().then(res => setThemeList(res.data || [])).catch(() => {}),
      testimonials.list().then(res => setTestimonialList(res.data || [])).catch(() => {}),
      faqs.list().then(res => setFaqList(res.data || [])).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  const planColors = [
    { gradient: 'linear-gradient(135deg, #64748b, #475569)' },
    { gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
    { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  ];

  if (authLoading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'var(--font-sans)', color: '#334155', overflowX: 'hidden' }}>
      
      {/* ─── NAVIGATION BAR ─── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.05)', zIndex: 50, padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* 1. LOGO (LEFT) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
              <Heart size={20} strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.3px' }}>Beringinesia</span>
          </div>

          {/* 2. MENU LINKS (CENTER) */}
          <div className="hidden md:flex items-center gap-7" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <a href="#fitur" style={{ fontSize: '15px', fontWeight: '500', color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}>Fitur</a>
            <a href="#tema" style={{ fontSize: '15px', fontWeight: '500', color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}>Tema</a>
            <a href="#harga" style={{ fontSize: '15px', fontWeight: '500', color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}>Harga</a>
            <a href="#testimoni" style={{ fontSize: '15px', fontWeight: '500', color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}>Ulasan</a>
            <a href="#faq" style={{ fontSize: '15px', fontWeight: '500', color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}>FAQ</a>
          </div>

          {/* 3. AUTH / ACTION BUTTONS (RIGHT) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <Link href="/app/dashboard" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '10px' }}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-primary-600)', textDecoration: 'none', padding: '8px 16px' }}>Masuk</Link>
                <Link href="/register" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '10px' }}>Daftar Gratis</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div style={{ paddingTop: '70px' }}>
        {/* ─── HERO SECTION ─── */}
        <section style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '800px', margin: '0 auto', animation: 'slide-up 0.6s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
            <Sparkles size={14} /> Solusi Undangan Digital Modern
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', margin: '0 0 24px', letterSpacing: '-1px' }}>
            Buat Undangan Pernikahan <span style={{ color: 'var(--color-primary-600)' }}>Impian Anda</span> Dalam Hitungan Menit
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: '#475569', lineHeight: '1.6', margin: '0 auto 40px', maxWidth: '600px' }}>
            Sebarkan kabar bahagia dengan elegan. Template premium, buku tamu interaktif, manajemen kehadiran, dan galeri foto dalam satu platform praktis.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={user ? "/app/dashboard" : "/register"} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px', borderRadius: '12px' }}>
              Buat Undangan Sekarang <ArrowRight size={18} />
            </Link>
            <a href="#tema" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '16px', borderRadius: '12px' }}>
              Lihat Tema Preview
            </a>
          </div>
        </section>

        {/* ─── FEATURES SECTION ─── */}
        <section id="fitur" style={{ padding: '80px 24px', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 16px' }}>Kenapa Memilih Kami?</h2>
              <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>Lebih dari sekadar undangan gambar, platform kami memberikan pengalaman interaktif bagi tamu Anda.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
              {[
                { icon: Palette, title: 'Desain Premium Beragam', desc: 'Pilihan tema eksklusif yang bisa disesuaikan dengan konsep warna dan gaya pernikahan Anda.' },
                { icon: BookHeart, title: 'Buku Tamu Interaktif', desc: 'Terima doa dan harapan secara langsung dari tamu yang hadir, lengkap dengan konfirmasi kehadiran (RSVP).' },
                { icon: LayoutDashboard, title: 'Dashboard Manajemen', desc: 'Kelola data tamu, lacak jadwal pembayaran, dan lihat statistik kunjungan undangan Anda dengan mudah.' }
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} style={{ padding: '32px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }} className="feature-card">
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--color-primary-100)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                      <Icon size={28} />
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>{f.title}</h3>
                    <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── THEMES SHOWCASE ─── */}
        <section id="tema" style={{ padding: '100px 24px', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 16px' }}>Koleksi Tema Eksklusif</h2>
              <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>Sempurna di setiap layar, memukau di setiap pandangan.</p>
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {themeList.slice(0, 4).map((theme, i) => (
                  <div key={theme.id} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', animation: `slide-up 0.5s ease-out ${i * 0.1}s both` }}>
                    <div style={{ aspectRatio: '3/4', position: 'relative', background: '#e2e8f0' }}>
                      {theme.thumbnail ? (
                        <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${theme.thumbnail}`} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Palette size={32} color="#94a3b8" /></div>
                      )}
                      {theme.is_premium === 1 && (
                        <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--color-warning)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Crown size={12} /> PREMIUM
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>{theme.name}</h3>
                      <p style={{ color: '#64748b', fontSize: '13px', margin: '0' }}>{theme.description || 'Tema elegan dengan desain modern'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {themeList.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <Link href={user ? "/app/themes" : "/login"} className="btn btn-secondary" style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '15px' }}>Lihat Semua Tema</Link>
              </div>
            )}
          </div>
        </section>

        {/* ─── PRICING SHOWCASE ─── */}
        <section id="harga" style={{ padding: '100px 24px', background: '#0f172a' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                <Gem size={14} /> Investasi Terbaik
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: '800', color: 'white', margin: '0 0 16px' }}>Pilih Paket Langganan</h2>
              <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>Dapatkan akses ke fitur premium untuk membuat hari spesial Anda menjadi hadiah yang paling dikenang.</p>
            </div>
            
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {plans.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>Paket belum tersedia.</div>
                ) : plans.map((plan, i) => {
                  const color = planColors[i % planColors.length];
                  const isPopular = i === 1;
                  let features = Array.isArray(plan.features) ? plan.features : (() => { try { return JSON.parse(plan.features) || []; } catch { return []; } })();
                  if (features.length === 0) features = ['Akses Semua Tema Premium', 'Buku Tamu & RSVP Tanpa Batas', 'Galeri Foto Lengkap', 'Pengelolaan Love Story & Acara', 'Custom Music & Teks'];
                  
                  return (
                    <div key={plan.id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: isPopular ? '2px solid #8b5cf6' : '1px solid transparent', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                      {isPopular && (<div style={{ position: 'absolute', top: '16px', right: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em' }}>PALING DIMINATI</div>)}
                      <div style={{ background: color.gradient, padding: '32px', color: 'white' }}>
                        <div style={{ fontSize: '15px', fontWeight: '600', opacity: 0.9 }}>{plan.name}</div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '40px', fontWeight: '800', marginTop: '12px', letterSpacing: '-1px' }}>{plan.price === 0 ? 'Gratis' : `Rp ${Number(plan.price).toLocaleString('id-ID')}`}</div>
                        <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>Masa Aktif: {plan.duration}</div>
                      </div>
                      <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'grid', gap: '16px' }}>
                          {features.map((f, j) => (
                            <li key={j} style={{ fontSize: '15px', color: '#475569', display: 'flex', gap: '12px', alignItems: 'flex-start', lineHeight: '1.4' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={12} strokeWidth={3} /></div>
                              {f}
                            </li>
                          ))}
                        </ul>
                        <div style={{ marginTop: 'auto' }}>
                          <Link href={user ? `/checkout/${plan.slug}` : `/login?redirect=/checkout/${plan.slug}`} className={`btn ${isPopular ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '12px', display: 'inline-block', textAlign: 'center' }}>
                            {plan.price === 0 ? 'Mulai Sekarang' : 'Beli Paket Ini'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ─── TESTIMONIALS SECTION ─── */}
        <section id="testimoni" style={{ padding: '100px 24px', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--color-success-100)', color: 'var(--color-success-600)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                <MessageCircle size={14} /> Kata Mereka
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 16px' }}>Dipercaya Ratusan Pasangan</h2>
              <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>Cerita bahagia dari mereka yang telah menggunakan Beringinesia.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              {testimonialList.length === 0 && !loading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>Belum ada ulasan saat ini.</div>
              ) : testimonialList.map((testimoni) => (
                <div key={testimoni.id} style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', position: 'relative' }}>
                  <Quote size={32} color="var(--color-primary-100)" style={{ position: 'absolute', top: '24px', right: '24px' }} />
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < testimoni.rating ? "#fbbf24" : "none"} color={i < testimoni.rating ? "#fbbf24" : "#cbd5e1"} strokeWidth={i < testimoni.rating ? 0 : 2} />
                    ))}
                  </div>
                  <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.7', margin: '0 0 24px', fontStyle: 'italic' }}>&quot;{testimoni.content}&quot;</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)', fontWeight: '700', fontSize: '18px' }}>
                      {testimoni.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{testimoni.name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{testimoni.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ SECTION ─── */}
        <section id="faq" style={{ padding: '100px 24px', background: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 16px' }}>Pertanyaan Seputar Platform Ini</h2>
              <p style={{ color: '#64748b', fontSize: '16px', margin: '0 auto' }}>Temukan jawaban cepat untuk pertanyaan yang sering ditanyakan pengguna.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {faqList.length === 0 && !loading ? (
                <div style={{ textAlign: 'center', color: '#64748b' }}>FAQ belum tersedia.</div>
              ) : faqList.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div key={faq.id} style={{ background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', transition: 'all 0.3s' }}>
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      style={{ width: '100%', background: 'none', border: 'none', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{faq.question}</span>
                      {isOpen ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 24px 24px', color: '#475569', fontSize: '15px', lineHeight: '1.6', animation: 'fadeIn 0.3s' }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── CTA FOOTER ─── */}
        <section style={{ padding: '80px 24px', textAlign: 'center', background: 'white', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Quote size={40} color="var(--color-primary-200)" style={{ margin: '0 auto 24px' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: '0 0 16px' }}>Siap Mengundang Orang-Orang Tercinta?</h2>
            <p style={{ color: '#64748b', fontSize: '16px', margin: '0 0 32px' }}>Bergabung dengan jutaan pasangan yang telah menggunakan Beringinesia untuk memperindah momen pernikahan mereka.</p>
            <Link href="/register" className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '16px', borderRadius: '12px', display: 'inline-block' }}>Daftar Sekarang Secara Gratis</Link>
          </div>
          <div style={{ marginTop: '80px', color: '#94a3b8', fontSize: '14px' }}>
            &copy; {new Date().getFullYear()} Beringinesia Digital Invitation. Hak Cipta Dilindungi.
          </div>
        </section>
      </div>

    </div>
  );
}
