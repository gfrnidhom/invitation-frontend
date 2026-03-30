'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { publicInvitation } from '@/lib/api';
import Head from 'next/head';

import ModernMinimalist from '@/components/themes/ModernMinimalist';
import ElegantWhite from '@/components/themes/ElegantWhite';
import FloralDream from '@/components/themes/FloralDream';
import ClassicJavanese from '@/components/themes/ClassicJavanese';
import RusticGarden from '@/components/themes/RusticGarden';
import RoyalGold from '@/components/themes/RoyalGold';
import BirthdayBash from '@/components/themes/BirthdayBash';
import TropicalParadise from '@/components/themes/TropicalParadise';
import ModernRomance from '@/components/themes/ModernRomance';
import EksklusifModern from '@/components/themes/EksklusifModern';
import AureliaLuxe from '@/components/themes/AureliaLuxe';
import BotanicalSage from '@/components/themes/BotanicalSage';
import MinimalistBlack from '@/components/themes/MinimalistBlack';
import MidnightGold from '@/components/themes/MidnightGold';
import EarthyNature from '@/components/themes/EarthyNature';
import FrostedElegance from '@/components/themes/FrostedElegance';
import BlushRomantic from '@/components/themes/BlushRomantic';
import MonoChrome from '@/components/themes/MonoChrome';
import MonoChromeII from '@/components/themes/MonoChromeII';
import MonoChromeIII from '@/components/themes/MonoChromeIII';
import MonoChromeIV from '@/components/themes/MonoChromeIV';
import MonoChromeV from '@/components/themes/MonoChromeV';
import CinematicVow from '@/components/themes/CinematicVow';

export default function ThemePreviewPage() {
  const { slug } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    publicInvitation.preview(slug)
      .then(res => {
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Memuat Pratinjau Tema...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Tema Tidak Ditemukan</h1>
        </div>
      </div>
    );
  }

  const invitation = data.invitation;
  // Memaksa menggunakan slug dari URL (nama tema yang ingin dipreview), 
  // bukan tema bawaan (invitation.theme.slug) dari data dummy.
  const themeSlug = slug;

  const renderTheme = () => {
    switch (themeSlug) {
      case 'modern-minimalist':
        return <ModernMinimalist payload={data} />;
      case 'elegant-white':
        return <ElegantWhite payload={data} />;
      case 'floral-dream':
        return <FloralDream payload={data} />;
      case 'classic-javanese':
        return <ClassicJavanese payload={data} />;
      case 'rustic-garden':
        return <RusticGarden payload={data} />;
      case 'royal-gold':
        return <RoyalGold payload={data} />;
      case 'birthday-bash':
        return <BirthdayBash payload={data} />;
      case 'tropical-paradise':
        return <TropicalParadise payload={data} />;
      case 'modern-romance':
        return <ModernRomance payload={data} />;
      case 'eksklusif-modern':
        return <EksklusifModern payload={data} />;
      case 'aurelia-luxe':
        return <AureliaLuxe payload={data} />;
      case 'botanical-sage':
        return <BotanicalSage payload={data} />;
      case 'minimalist-black':
        return <MinimalistBlack payload={data} />;
      case 'midnight-gold':
        return <MidnightGold payload={data} />;
      case 'earthy-nature':
        return <EarthyNature payload={data} />;
      case 'frosted-elegance':
        return <FrostedElegance payload={data} />;
      case 'blush-romantic':
        return <BlushRomantic payload={data} />;
      case 'monochrome':
        return <MonoChrome payload={data} />;
      case 'monochrome-ii':
        return <MonoChromeII payload={data} />;
      case 'monochrome-iii':
        return <MonoChromeIII payload={data} />;
      case 'monochrome-iv':
        return <MonoChromeIV payload={data} />;
      case 'monochrome-v':
        return <MonoChromeV payload={data} />;
      case 'cinematic-vow':
        return <CinematicVow payload={data} />;
      default:
        return (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '24px' }}>
            <div style={{ textAlign: 'center', maxWidth: '400px', background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M15.36 15.36l2.83-2.83m-12.7 0l2.83 2.83"/></svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Sedang Diterjemahkan</h1>
              <p className="text-slate-500 mb-6">Pratinjau untuk tema <strong>{themeSlug.replace('-', ' ')}</strong> versi React/Next.js sedang dalam tahap pemindahan. Silakan cek kembali nanti!</p>
              <button onClick={() => window.close()} className="px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors">Tutup Tab</button>
            </div>
          </div>
        ); 
    }
  };

  return (
    <>
      <title>Preview Tema {slug}</title>
      
      {/* Absolute Preview Disclaimer Badge */}
      <div className="fixed top-4 left-4 z-[99999] bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-medium tracking-widest uppercase flex items-center gap-2 shadow-2xl">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Frontend Preview Mode
      </div>

      {renderTheme()}
    </>
  );
}
