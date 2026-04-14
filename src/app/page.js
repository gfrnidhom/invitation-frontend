'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, Palette, Crown, Heart, Check, ArrowRight, LayoutDashboard, Gem, Quote, BookHeart, Star, ChevronDown, ChevronUp, MessageCircle, Users, Music, Camera, Send, Menu, X, Play, Eye, Zap, Shield, Clock, Gift } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { packages as packagesApi, themes, testimonials, faqs } from '@/lib/api';
import { getThemePreviewUrl } from '@/lib/constants';

/* ─────────── Scroll Animation Hook ─────────── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.15, ...options });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isInView];
}

/* ─────────── Animated Section Wrapper ─────────── */
function AnimatedSection({ children, className = '', style = {}, delay = 0 }) {
  const [ref, isInView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────── Floating Particles Component ─────────── */
function FloatingParticles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="landing-particle"
          style={{
            position: 'absolute',
            width: `${8 + i * 4}px`,
            height: `${8 + i * 4}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,255,255,${0.15 + i * 0.03}) 0%, transparent 70%)`,
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `landing-float ${5 + i * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────── COUNTER ANIMATION ─────────── */
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView();

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString('id-ID')}{suffix}</span>;
}


export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState([]);
  const [themeList, setThemeList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [testimonialList, setTestimonialList] = useState([]);
  const [faqList, setFaqList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    Promise.all([
      packagesApi.list().then(res => setPlans(res.data || [])).catch(() => {}),
      themes.list().then(res => {
        setThemeList(res.data || []);
        if (res.categories) setCategories(res.categories);
      }).catch(() => {}),
      testimonials.list().then(res => setTestimonialList(res.data || [])).catch(() => {}),
      faqs.list().then(res => setFaqList(res.data || [])).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const planColors = [
    { gradient: 'linear-gradient(135deg, #64748b, #475569)', glow: 'rgba(100,116,139,0.2)' },
    { gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', glow: 'rgba(99,102,241,0.25)' },
    { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245,158,11,0.25)' },
  ];

  if (authLoading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="landing-root">

      {/* ─── NAVIGATION BAR ─── */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav-scrolled' : ''}`}>
        <div className="landing-nav-inner">
          {/* LOGO */}
          <div className="landing-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="landing-logo-icon">
              <Heart size={20} strokeWidth={2.5} />
            </div>
            <span className="landing-logo-text">Digivitation</span>
          </div>

          {/* MENU LINKS (Desktop) */}
          <div className="landing-nav-links">
            <a href="#fitur">Fitur</a>
            <a href="#tema">Tema</a>
            <a href="#harga">Harga</a>
            <a href="#testimoni">Ulasan</a>
            <a href="#faq">FAQ</a>
          </div>

          {/* AUTH BUTTONS */}
          <div className="landing-nav-actions">
            {user ? (
              <Link href="/app/dashboard" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '12px' }}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="landing-nav-login">Masuk</Link>
                <Link href="/register" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '12px' }}>
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button className="landing-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="landing-mobile-menu">
            <a href="#fitur" onClick={() => setMobileMenuOpen(false)}>Fitur</a>
            <a href="#tema" onClick={() => setMobileMenuOpen(false)}>Tema</a>
            <a href="#harga" onClick={() => setMobileMenuOpen(false)}>Harga</a>
            <a href="#testimoni" onClick={() => setMobileMenuOpen(false)}>Ulasan</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '8px', display: 'flex', gap: '12px' }}>
              {user ? (
                <Link href="/app/dashboard" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Masuk</Link>
                  <Link href="/register" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Daftar</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="landing-hero">
        <FloatingParticles />
        <div className="landing-hero-bg" />
        <div className="landing-hero-content">
          <div className="landing-hero-text">
            <AnimatedSection>
              <div className="landing-badge">
                <Sparkles size={14} /> Platform Undangan Digital #1
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <h1 className="landing-hero-title">
                Buat Undangan
                <span className="landing-hero-title-accent"> Pernikahan Digital </span>
                yang Memukau
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="landing-hero-desc">
                Sebarkan kabar bahagia dengan elegan. Pilih dari koleksi template premium, atur RSVP, kelola tamu, dan bagikan galeri foto — semua dalam satu platform canggih.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <div className="landing-hero-buttons">
                <Link href={user ? "/app/dashboard" : "/register"} className="landing-btn-cta">
                  Mulai Buat Undangan <ArrowRight size={18} />
                </Link>
                <a href="#tema" className="landing-btn-outline">
                  <Play size={16} /> Lihat Demo
                </a>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.4}>
              <div className="landing-hero-stats">
                <div className="landing-hero-stat">
                  <strong><AnimatedCounter end={5000} suffix="+" /></strong>
                  <span>Undangan Dibuat</span>
                </div>
                <div className="landing-hero-stat-divider" />
                <div className="landing-hero-stat">
                  <strong><AnimatedCounter end={15} suffix="+" /></strong>
                  <span>Tema Premium</span>
                </div>
                <div className="landing-hero-stat-divider" />
                <div className="landing-hero-stat">
                  <strong><AnimatedCounter end={99} suffix="%" /></strong>
                  <span>Kepuasan Pelanggan</span>
                </div>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.2} className="landing-hero-image-wrap">
            <div className="landing-hero-image-container">
              <div className="landing-hero-image-glow" />
              <Image
                src="/images/hero-mockup.png"
                alt="Digivitation Wedding Invitation Mockup"
                width={550}
                height={550}
                className="landing-hero-image"
                priority
              />
              {/* Floating badge */}
              <div className="landing-hero-float-badge landing-hero-float-1">
                <Users size={16} color="#6366f1" /> <span>500+ Tamu RSVP</span>
              </div>
              <div className="landing-hero-float-badge landing-hero-float-2">
                <Camera size={16} color="#ec4899" /> <span>Galeri Premium</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── TRUSTED / SOCIAL PROOF BAR ─── */}
      <section className="landing-social-proof">
        <AnimatedSection>
          <p className="landing-social-proof-text">Dipercaya oleh ribuan pasangan untuk hari istimewa mereka</p>
          <div className="landing-social-proof-avatars">
            {[...'ABCDEFGH'].map((letter, i) => (
              <div key={i} className="landing-social-proof-avatar" style={{ 
                background: `hsl(${i * 45}, 60%, 70%)`,
                zIndex: 8 - i,
                marginLeft: i > 0 ? '-10px' : '0',
              }}>
                {letter}
              </div>
            ))}
            <span className="landing-social-proof-count">+5.000 pengguna</span>
          </div>
        </AnimatedSection>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="fitur" className="landing-features">
        <div className="landing-container">
          <AnimatedSection className="landing-section-header">
            <div className="landing-badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
              <Zap size={14} /> Fitur Unggulan
            </div>
            <h2 className="landing-section-title">Semua yang Anda Butuhkan<br/>dalam Satu Platform</h2>
            <p className="landing-section-desc">Lebih dari sekadar undangan gambar — platform kami memberikan pengalaman interaktif dan profesional.</p>
          </AnimatedSection>

          <div className="landing-features-grid">
            {[
              { icon: Palette, title: 'Desain Premium Beragam', desc: 'Pilih dari koleksi tema eksklusif yang bisa disesuaikan dengan konsep warna dan gaya pernikahan Anda.', color: '#6366f1', bg: '#eef2ff' },
              { icon: BookHeart, title: 'Buku Tamu & RSVP', desc: 'Terima doa dan ucapan selamat secara digital, lengkap dengan konfirmasi kehadiran tamu real-time.', color: '#ec4899', bg: '#fdf2f8' },
              { icon: LayoutDashboard, title: 'Dashboard Lengkap', desc: 'Kelola data tamu, lacak pembayaran, dan lihat statistik kunjungan undangan Anda secara real-time.', color: '#f59e0b', bg: '#fffbeb' },
              { icon: Music, title: 'Musik Latar Custom', desc: 'Upload lagu favorit atau pilih dari koleksi musik romantis kami untuk mengiringi undangan digital Anda.', color: '#10b981', bg: '#ecfdf5' },
              { icon: Camera, title: 'Galeri Foto Cantik', desc: 'Tampilkan momen pre-wedding terbaik dalam galeri foto interaktif dengan layout yang memukau.', color: '#8b5cf6', bg: '#f5f3ff' },
              { icon: Send, title: 'Bagikan Mudah', desc: 'Kirim undangan via WhatsApp, Instagram, atau salin link. Satu undangan untuk semua platform.', color: '#3b82f6', bg: '#eff6ff' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="landing-feature-card">
                    <div className="landing-feature-icon" style={{ background: f.bg, color: f.color }}>
                      <Icon size={26} />
                    </div>
                    <h3 className="landing-feature-title">{f.title}</h3>
                    <p className="landing-feature-desc">{f.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="landing-how-it-works">
        <div className="landing-container">
          <AnimatedSection className="landing-section-header">
            <div className="landing-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <Clock size={14} /> Mudah & Cepat
            </div>
            <h2 className="landing-section-title">3 Langkah Mudah<br/>Membuat Undangan</h2>
            <p className="landing-section-desc">Buat undangan digital impian Anda hanya dalam hitungan menit.</p>
          </AnimatedSection>

          <div className="landing-steps">
            {[
              { step: '01', title: 'Pilih Template', desc: 'Jelajahi koleksi tema premium kami dan pilih yang sesuai dengan gaya pernikahan Anda.', icon: Palette },
              { step: '02', title: 'Isi Detail Acara', desc: 'Masukkan informasi pernikahan, foto, love story, dan detail acara melalui dashboard editor.', icon: BookHeart },
              { step: '03', title: 'Bagikan ke Tamu', desc: 'Kirim undangan digital Anda langsung via WhatsApp, media sosial, atau salin link undangan.', icon: Send },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <AnimatedSection key={i} delay={i * 0.15}>
                  <div className="landing-step-card">
                    <div className="landing-step-number">{s.step}</div>
                    <div className="landing-step-icon-wrap">
                      <Icon size={28} />
                    </div>
                    <h3 className="landing-step-title">{s.title}</h3>
                    <p className="landing-step-desc">{s.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SHOWCASE / IMAGE BANNER ─── */}
      <section className="landing-showcase">
        <div className="landing-showcase-overlay" />
        <Image
          src="/images/wedding-scene.png"
          alt="Beautiful wedding ceremony"
          fill
          style={{ objectFit: 'cover' }}
        />
        <div className="landing-showcase-content">
          <AnimatedSection>
            <h2 className="landing-showcase-title">Wujudkan Pernikahan Impian Anda</h2>
            <p className="landing-showcase-desc">
              Dari dekorasi mewah hingga undangan digital yang memukau, kami membantu Anda menyempurnakan setiap detail hari istimewa.
            </p>
            <Link href={user ? "/app/dashboard" : "/register"} className="landing-btn-cta" style={{ display: 'inline-flex' }}>
              Mulai Sekarang <ArrowRight size={18} />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── THEMES SHOWCASE ─── */}
      <section id="tema" className="landing-themes">
        <div className="landing-container">
          <AnimatedSection className="landing-section-header">
            <div className="landing-badge" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
              <Palette size={14} /> Koleksi Tema
            </div>
            <h2 className="landing-section-title">Tema Eksklusif &<br/>Desain Memukau</h2>
            <p className="landing-section-desc">Setiap tema dirancang dengan detail tinggi, responsif di semua perangkat, dan bisa disesuaikan sepenuhnya.</p>
          </AnimatedSection>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
          ) : (
            <>
              {categories && categories.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ borderRadius: '20px', padding: '8px 16px', fontSize: '14px' }}
                  >
                    Semua Tema
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ borderRadius: '20px', padding: '8px 16px', fontSize: '14px' }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            
              <div className="landing-themes-grid">
                {themeList
                  .filter(theme => selectedCategory === 'all' || theme.category_id === selectedCategory)
                  .map((theme, i) => (
                  <AnimatedSection key={theme.id} delay={(i % 4) * 0.1}>
                    <div className="landing-theme-card">
                      <div className="landing-theme-image" style={{ aspectRatio: '16/9' }}>
                        {theme.thumbnail ? (
                          <img src={theme.thumbnail.startsWith('http') ? theme.thumbnail : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${theme.thumbnail}`} alt={theme.name} />
                        ) : (
                          <div className="landing-theme-placeholder"><Palette size={36} color="#94a3b8" /></div>
                        )}
                        {theme.is_premium === 1 && (
                          <div className="landing-theme-premium-badge">
                            <Crown size={12} /> PREMIUM
                          </div>
                        )}
                        <a href={getThemePreviewUrl(theme.slug)} target="_blank" rel="noreferrer" className="landing-theme-overlay">
                          <Eye size={20} />
                          <span>Preview Tema</span>
                        </a>
                      </div>
                      <div className="landing-theme-info">
                        <h3>{theme.name}</h3>
                        <p>{theme.description || `${theme.category || 'Tema elegan'} dengan desain modern dan responsif`}</p>
                        <div style={{ marginTop: '16px' }}>
                          <a href={getThemePreviewUrl(theme.slug)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                            <Eye size={14} /> Lihat Preview
                          </a>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ─── FLATLAY IMAGE SECTION ─── */}
      <section className="landing-flatlay-section">
        <div className="landing-container">
          <div className="landing-flatlay-grid">
            <AnimatedSection className="landing-flatlay-image-wrap">
              <Image
                src="/images/wedding-flatlay.png"
                alt="Premium wedding invitation stationery"
                width={560}
                height={560}
                className="landing-flatlay-image"
              />
            </AnimatedSection>
            <AnimatedSection delay={0.15} className="landing-flatlay-text">
              <div className="landing-badge" style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}>
                <Heart size={14} /> Mengapa Kami
              </div>
              <h2 className="landing-section-title" style={{ textAlign: 'left' }}>Undangan Digital Premium untuk Momen Tak Terlupakan</h2>
              <p className="landing-section-desc" style={{ textAlign: 'left', margin: '0 0 32px' }}>
                Kami menghadirkan pengalaman undangan digital terbaik dengan desain premium, fitur lengkap, dan kemudahan penggunaan yang tidak tertandingi.
              </p>
              <ul className="landing-flatlay-list">
                {[
                  'Desain responsif sempurna di semua perangkat',
                  'Editor drag-and-drop yang mudah digunakan',
                  'Fitur RSVP & buku tamu interaktif',
                  'Integrasi WhatsApp untuk pengiriman instan',
                  'Musik latar kustom untuk suasana romantis',
                  'Dukungan pelanggan 24/7',
                ].map((item, i) => (
                  <li key={i} className="landing-flatlay-list-item">
                    <div className="landing-flatlay-check"><Check size={14} strokeWidth={3} /></div>
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section id="harga" className="landing-pricing">
        <div className="landing-container">
          <AnimatedSection className="landing-section-header">
            <div className="landing-badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
              <Gem size={14} /> Harga Terjangkau
            </div>
            <h2 className="landing-section-title" style={{ color: 'white' }}>Pilih Paket Langganan<br/>yang Tepat</h2>
            <p className="landing-section-desc" style={{ color: '#94a3b8' }}>Investasi sekali untuk momen yang tak akan terlupakan seumur hidup.</p>
          </AnimatedSection>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
          ) : (
            <div className="landing-pricing-grid">
              {plans.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>Paket belum tersedia.</div>
              ) : plans.map((plan, i) => {
                const color = planColors[i % planColors.length];
                const isPopular = i === 1;
                let features = Array.isArray(plan.features) ? plan.features : (() => { try { return JSON.parse(plan.features) || []; } catch { return []; } })();
                if (features.length === 0) features = ['Akses Semua Tema Premium', 'Buku Tamu & RSVP Tanpa Batas', 'Galeri Foto Lengkap', 'Pengelolaan Love Story & Acara', 'Custom Music & Teks'];

                return (
                  <AnimatedSection key={plan.id} delay={i * 0.1}>
                    <div className={`landing-pricing-card ${isPopular ? 'landing-pricing-popular' : ''}`}>
                      {isPopular && (
                        <div className="landing-pricing-popular-badge">
                          <Star size={12} fill="white" /> PALING DIMINATI
                        </div>
                      )}
                      <div className="landing-pricing-header" style={{ background: color.gradient }}>
                        <div className="landing-pricing-name">{plan.name}</div>
                        <div style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', fontWeight: '500', marginBottom: '0', marginTop: '10px' }}>
                          Rp {Number(plan.original_price && Number(plan.original_price) > Number(plan.price) ? plan.original_price : (Number(plan.price) === 0 ? 149000 : Number(plan.price) + 50000)).toLocaleString('id-ID')}
                        </div>
                        <div className="landing-pricing-price">
                          {plan.price === 0 ? 'Gratis' : `Rp ${Number(plan.price).toLocaleString('id-ID')}`}
                        </div>
                        <div className="landing-pricing-duration">Masa Aktif: 1 Tahun</div>
                      </div>
                      <div className="landing-pricing-body">
                        <ul className="landing-pricing-features">
                          {features.map((f, j) => (
                            <li key={j}>
                              <div className="landing-pricing-check"><Check size={12} strokeWidth={3} /></div>
                              {f}
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={user ? `/checkout/${plan.slug}` : `/login?redirect=/checkout/${plan.slug}`}
                          className={`landing-pricing-button ${isPopular ? 'landing-pricing-button-primary' : ''}`}
                        >
                          {plan.price === 0 ? 'Mulai Sekarang' : 'Beli Paket Ini'}
                        </Link>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── TESTIMONIALS SECTION ─── */}
      <section id="testimoni" className="landing-testimonials">
        <div className="landing-container">
          <AnimatedSection className="landing-section-header">
            <div className="landing-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <MessageCircle size={14} /> Kata Mereka
            </div>
            <h2 className="landing-section-title">Dipercaya Ratusan Pasangan<br/>di Seluruh Indonesia</h2>
            <p className="landing-section-desc">Cerita bahagia dari mereka yang telah menggunakan Digivitation untuk hari istimewa mereka.</p>
          </AnimatedSection>

          <div className="landing-testimonials-grid">
            {testimonialList.length === 0 && !loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>Belum ada ulasan saat ini.</div>
            ) : testimonialList.map((testimoni, i) => (
              <AnimatedSection key={testimoni.id} delay={i * 0.1}>
                <div className="landing-testimonial-card">
                  <Quote size={32} className="landing-testimonial-quote-icon" />
                  <div className="landing-testimonial-stars">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={15} fill={j < testimoni.rating ? "#fbbf24" : "none"} color={j < testimoni.rating ? "#fbbf24" : "#cbd5e1"} strokeWidth={j < testimoni.rating ? 0 : 2} />
                    ))}
                  </div>
                  <p className="landing-testimonial-content">&quot;{testimoni.content}&quot;</p>
                  <div className="landing-testimonial-author">
                    <div className="landing-testimonial-avatar">
                      {testimoni.name.charAt(0)}
                    </div>
                    <div>
                      <div className="landing-testimonial-name">{testimoni.name}</div>
                      <div className="landing-testimonial-role">{testimoni.role}</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <section id="faq" className="landing-faq">
        <div className="landing-container" style={{ maxWidth: '800px' }}>
          <AnimatedSection className="landing-section-header">
            <div className="landing-badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
              <MessageCircle size={14} /> FAQ
            </div>
            <h2 className="landing-section-title">Pertanyaan yang Sering<br/>Ditanyakan</h2>
            <p className="landing-section-desc">Temukan jawaban cepat untuk pertanyaan seputar platform kami.</p>
          </AnimatedSection>

          <div className="landing-faq-list">
            {faqList.length === 0 && !loading ? (
              <div style={{ textAlign: 'center', color: '#64748b' }}>FAQ belum tersedia.</div>
            ) : faqList.map((faq, i) => {
              const isOpen = openFaq === faq.id;
              return (
                <AnimatedSection key={faq.id} delay={i * 0.05}>
                  <div className={`landing-faq-item ${isOpen ? 'landing-faq-item-open' : ''}`}>
                    <button className="landing-faq-question" onClick={() => setOpenFaq(isOpen ? null : faq.id)}>
                      <span>{faq.question}</span>
                      <div className={`landing-faq-chevron ${isOpen ? 'landing-faq-chevron-open' : ''}`}>
                        <ChevronDown size={20} />
                      </div>
                    </button>
                    <div className={`landing-faq-answer ${isOpen ? 'landing-faq-answer-open' : ''}`}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="landing-cta">
        <FloatingParticles />
        <div className="landing-cta-content">
          <AnimatedSection>
            <Gift size={48} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 24px', display: 'block' }} />
            <h2 className="landing-cta-title">Siap Mengundang Orang-Orang Tercinta?</h2>
            <p className="landing-cta-desc">
              Bergabung dengan ribuan pasangan yang telah mempercayakan hari istimewa mereka kepada Digivitation.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="landing-btn-cta">
                Daftar Sekarang — Gratis! <ArrowRight size={18} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-brand">
              <div className="landing-logo" style={{ cursor: 'default', marginBottom: '16px' }}>
                <div className="landing-logo-icon" style={{ background: 'rgba(99,102,241,0.2)', boxShadow: 'none' }}>
                  <Heart size={20} strokeWidth={2.5} color="#818cf8" />
                </div>
                <span className="landing-logo-text" style={{ color: 'white' }}>Digivitation</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7', maxWidth: '300px' }}>
                Platform undangan digital modern untuk momen pernikahan Anda yang tak terlupakan.
              </p>
            </div>
            <div className="landing-footer-links">
              <h4>Platform</h4>
              <a href="#fitur">Fitur</a>
              <a href="#tema">Tema</a>
              <a href="#harga">Harga</a>
            </div>
            <div className="landing-footer-links">
              <h4>Dukungan</h4>
              <a href="#faq">FAQ</a>
              <a href="#testimoni">Ulasan</a>
            </div>
            <div className="landing-footer-links">
              <h4>Akun</h4>
              <Link href="/login">Masuk</Link>
              <Link href="/register">Daftar</Link>
            </div>
          </div>
          <div className="landing-footer-bottom">
            &copy; {new Date().getFullYear()} Digivitation Digital Invitation. Hak Cipta Dilindungi.
          </div>
        </div>
      </footer>

    </div>
  );
}
