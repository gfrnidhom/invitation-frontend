'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { publicInvitation } from '@/lib/api';
import Head from 'next/head';
import toast from 'react-hot-toast';

// We will import themes dynamically or statically here soon
import ModernMinimalist from '@/components/themes/ModernMinimalist';
// ... other imports ...
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
import SereneGarden from '@/components/themes/SereneGarden';
import MotionGardenPremium from '@/components/themes/MotionGardenPremium';
import PavilionGarden from '@/components/themes/PavilionGarden';
import MotionIslamic from '@/components/themes/MotionIslamic';
import MakrisLulu from '@/components/themes/MakrisLulu';
import AdatJawa from '@/components/themes/AdatJawa';

export default function PublicInvitationViewer() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get('to') || '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ── Global Audio Engine ──
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioController = {
    isPlaying,
    play: () => {
      if (!audioRef.current) return;
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Playback failed:", err);
          });
      }
    },
    pause: () => {
      if (!audioRef.current) return;
      audioRef.current.pause();
      setIsPlaying(false);
    },
    toggle: () => {
      if (isPlaying) {
        audioController.pause();
      } else {
        audioController.play();
      }
    }
  };

  useEffect(() => {
    publicInvitation.get(slug, token)
      .then(async (res) => {
        if (res.success && res.data) {
          // Fetch guestbook messages and attach to invitation
          const inv = res.data.invitation;
          if (inv?.id) {
            try {
              const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://app.digitvitation.my.id/api';
              const gbRes = await fetch(`${API_URL}/invitations/${inv.id}/guestbook`, {
                headers: { 'Accept': 'application/json' }
              });
              if (gbRes.ok) {
                const gbData = await gbRes.json();
                // Support both paginated (data.data) and flat (data) array responses
                inv.guestMessages = Array.isArray(gbData.data) ? gbData.data
                  : Array.isArray(gbData) ? gbData : [];
              }
            } catch (e) {
              console.warn('Failed to fetch guestbook:', e);
              inv.guestMessages = [];
            }
          }
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

  const invitation = data.invitation;
  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://app.digitvitation.my.id/storage';

  // Normalize photo fields
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
    const props = { payload: data, audioController };
    switch (themeSlug) {
      case 'modern-minimalist':
        return <ModernMinimalist {...props} />;
      case 'elegant-white':
        return <ElegantWhite {...props} />;
      case 'floral-dream':
        return <FloralDream {...props} />;
      case 'classic-javanese':
        return <ClassicJavanese {...props} />;
      case 'rustic-garden':
        return <RusticGarden {...props} />;
      case 'royal-gold':
        return <RoyalGold {...props} />;
      case 'birthday-bash':
        return <BirthdayBash {...props} />;
      case 'tropical-paradise':
        return <TropicalParadise {...props} />;
      case 'modern-romance':
        return <ModernRomance {...props} />;
      case 'eksklusif-modern':
        return <EksklusifModern {...props} />;
      case 'aurelia-luxe':
        return <AureliaLuxe {...props} />;
      case 'botanical-sage':
        return <BotanicalSage {...props} />;
      case 'minimalist-black':
        return <MinimalistBlack {...props} />;
      case 'midnight-gold':
        return <MidnightGold {...props} />;
      case 'earthy-nature':
        return <EarthyNature {...props} />;
      case 'frosted-elegance':
        return <FrostedElegance {...props} />;
      case 'blush-romantic':
        return <BlushRomantic {...props} />;
      case 'monochrome':
        return <MonoChrome {...props} />;
      case 'monochrome-ii':
        return <MonoChromeII {...props} />;
      case 'monochrome-iii':
        return <MonoChromeIII {...props} />;
      case 'monochrome-iv':
        return <MonoChromeIV {...props} />;
      case 'monochrome-v':
        return <MonoChromeV {...props} />;
      case 'cinematic-vow':
        return <CinematicVow {...props} />;
      case 'minimalist-navy':
        return <MinimalistNavy {...props} />;
      case 'garden-parallax':
        return <GardenParallax {...props} />;
      case 'enchanted-garden':
        return <EnchantedGarden {...props} />;
      case 'serene-garden':
        return <SereneGarden {...props} />;
      case 'motion-garden-premium':
        return <MotionGardenPremium {...props} />;
      case 'pavilion-garden':
        return <PavilionGarden {...props} />;
      case 'motion-islamic':
        return <MotionIslamic {...props} />;
      case 'makris-lulu':
        return <MakrisLulu {...props} />;
      case 'adat-jawa':
        return <AdatJawa {...props} />;
      default:
        return <ModernMinimalist {...props} />;
    }
  };

  const getCleanUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const cleanPath = url.replace(/^\/storage\//, '').replace(/^\//, '');
    return `${storageUrl}/${cleanPath}`;
  };

  const finalMusicUrl = getCleanUrl(invitation?.music_url);

  return (
    <>
      <Head>
        <title>{`${invitation.groom_name} & ${invitation.bride_name} | Wedding Invitation`}</title>
      </Head>

      {/* ── SINGLE GLOBAL AUDIO ELEMENT ── */}
      {finalMusicUrl && (
        <audio
          ref={audioRef}
          src={finalMusicUrl}
          loop
          preload="auto"
        />
      )}

      {renderTheme()}
    </>
  );
}
