'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { publicInvitation } from '@/lib/api';
import Head from 'next/head';

// We will import themes dynamically or statically here soon
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
import MinimalistNavy from '@/components/themes/MinimalistNavy';
import GardenParallax from '@/components/themes/GardenParallax';
import EnchantedGarden from '@/components/themes/EnchantedGarden';

export default function PublicInvitationViewer() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get('to') || '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    publicInvitation.get(slug, token)
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
  }, [slug, token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Membuka Undangan...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ fontSize: '24px' }}>💔</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Undangan Tidak Ditemukan</h1>
          <p className="text-slate-500">Tautan yang Anda tuju mungkin sudah kadaluarsa atau tidak valid.</p>
        </div>
      </div>
    );
  }

  // Inject Meta Data to Document Head dynamically
  const invitation = data.invitation;

  // Normalize photo fields: backend returns arrays (JSON cast)
  // bride_photo & groom_photo are single photos → flatten to string
  // cover_photo is intentionally an array (slideshow/thumbnails) → keep as array
  if (invitation) {
    ['bride_photo', 'groom_photo'].forEach(field => {
      if (Array.isArray(invitation[field])) {
        invitation[field] = invitation[field][0] || null;
      }
    });
  }

  const themeSlug = invitation?.theme?.slug || 'modern-minimalist';

  // THEME SWITCHER
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
      case 'minimalist-navy':
        return <MinimalistNavy payload={data} />;
      case 'garden-parallax':
        return <GardenParallax payload={data} />;
      case 'enchanted-garden':
        return <EnchantedGarden payload={data} />;
      // Future themes will be added here!
      default:
        // Fallback or elegantly handle unsupported themes
        return <ModernMinimalist payload={data} />; 
    }
  };

  return (
    <>
      <title>{`${invitation.groom_name} & ${invitation.bride_name} | Wedding Invitation`}</title>
      <meta name="description" content={invitation.description || 'Anda diundang ke acara pernikahan kami!'} />
      {/* 
        NOTE: For true OpenGraph preview features in WhatsApp, Next.js 'generateMetadata' is needed. 
        Because this is a strictly Client Component for now, we set basic head.
      */}
      {renderTheme()}
    </>
  );
}
