'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Cormorant_Upright, Lora, Great_Vibes } from 'next/font/google';

import CoverOverlay from './partials/CoverOverlay';
import CoupleProfile from './partials/CoupleProfile';
import LoveStory from './partials/LoveStory';
import Events from './partials/Events';
import Gallery from './partials/Gallery';
import GiftAccounts from './partials/GiftAccounts';
import Guestbook from './partials/Guestbook';
import QrCheckin from './partials/QrCheckin';

const cormorant = Cormorant_Upright({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });
const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const vibes = Great_Vibes({ subsets: ['latin'], weight: ['400'] });

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function AureliaLuxe({ payload }) {
  const { invitation, guest, guestName } = payload;
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal');
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 50;
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add('active');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log('Audio play failed', e));
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className={`min-h-screen bg-white text-[#2a2a2a] ${lora.className} overflow-x-hidden aurelia-luxe-theme`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .aurelia-luxe-theme .reveal { opacity: 0; transform: translateY(40px); transition: all 1s cubic-bezier(0.5, 0, 0, 1); }
        .aurelia-luxe-theme .reveal.active { opacity: 1; transform: translateY(0); }
        .glass-burgundy { background: rgba(99, 37, 41, 0.95); backdrop-filter: blur(10px); }
        .text-gold { color: #A99D87; }
        .bg-gold { background-color: #A99D87; }
        .border-gold { border-color: #A99D87; }
        .bg-burgundy { background-color: #632529; }
        .text-burgundy { color: #632529; }
        
        .ornament-top { position: absolute; top: 0; left: 0; width: 100%; height: 150px; background: url('${STORAGE_URL}/themes/aurelia-luxe/floral-top.png') top center no-repeat; background-size: cover; opacity: 0.8; z-index: 1; pointer-events: none;}
        .ornament-bottom { position: absolute; bottom: 0; left: 0; width: 100%; height: 150px; background: url('${STORAGE_URL}/themes/aurelia-luxe/floral-bottom.png') bottom center no-repeat; background-size: cover; opacity: 0.8; z-index: 1; pointer-events: none;}
      `}} />

      <CoverOverlay 
        invitation={invitation} 
        guestName={guestName} 
        onOpen={handleOpenInvitation}
        isOpen={isOpen}
      >
        <div className="text-center z-10 px-6 max-w-2xl mx-auto w-full relative">
          <p className={`${cormorant.className} text-xl tracking-[0.3em] uppercase text-white/80 mb-6 drop-shadow-md`}>The Wedding Of</p>
          <h1 className={`${vibes.className} text-6xl md:text-8xl text-white mb-6 drop-shadow-lg`}>
            {invitation.groom_name} & {invitation.bride_name}
          </h1>
          <div className="h-px w-24 bg-[#A99D87] mx-auto mb-6"></div>
          <p className={`${lora.className} text-sm tracking-widest uppercase text-[#A99D87] drop-shadow-md`}>
            {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          
          {guestName && (
            <div className="mt-16 pt-8 border-t border-white/20">
              <p className="text-xs uppercase tracking-widest text-[#A99D87] mb-2 drop-shadow-sm">Kepada Yth.</p>
              <p className={`${cormorant.className} text-2xl text-white font-medium drop-shadow-md`}>{guestName}</p>
            </div>
          )}
        </div>
      </CoverOverlay>

      {invitation?.background_video_url && (
        <video 
          className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-50 mix-blend-overlay"
          src={invitation.background_video_url} 
          autoPlay 
          loop 
          muted 
          playsInline 
        />
      )}

      {invitation?.music_url && (
        <audio ref={audioRef} src={invitation.music_url.startsWith('http') ? invitation.music_url : `${STORAGE_URL}/${invitation.music_url}`} loop />
      )}

      {/* Audio Toggle */}
      {invitation?.music_url && (
        <button 
          onClick={toggleAudio}
          className="fixed bottom-6 right-6 w-12 h-12 glass-burgundy rounded-full flex items-center justify-center text-[#A99D87] z-50 shadow-2xl border border-[#A99D87]/30 hover:scale-110 transition-transform"
        >
          {isPlaying ? (
             <svg className="w-5 h-5 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
          )}
        </button>
      )}

      <main className={`transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        
        {/* Intro */}
        <section className="py-24 px-6 relative bg-[#fdfbf7]">
          <div className="max-w-3xl mx-auto text-center reveal">
            <h2 className={`${vibes.className} text-5xl md:text-6xl text-burgundy mb-8`}>The Journey of Two Souls in Love</h2>
            <p className="text-sm leading-loose text-gray-600 mb-8 max-w-xl mx-auto">
              "{invitation.description}"
            </p>
            <div className="h-px w-20 bg-gold mx-auto"></div>
          </div>
        </section>

        {/* Profile */}
        <CoupleProfile 
           invitation={invitation} 
           sectionBg="bg-white" 
           titleFont={cormorant.className} 
           accentText="text-burgundy" 
           accentBg="bg-burgundy" 
           particleColor="bg-gold"
        />

        {/* Love Story */}
        <LoveStory 
          invitation={invitation} 
          sectionBg="bg-[#fdfbf7]" 
          accentText="text-burgundy" 
          accentBg="bg-gold" 
          lineBg="bg-[#e8e4db]"
          dotBg="bg-burgundy"
          cardBg="bg-white border border-[#A99D87]/20 shadow-sm"
        />

        {/* Events */}
        <Events 
          invitation={invitation} 
          sectionBg="bg-white" 
          accentText="text-burgundy" 
          accentBg="bg-burgundy text-white" 
          cardBg="bg-[#fdfbf7] border border-[#A99D87]/30" 
          iconBg="bg-gold/10 text-gold" 
          btnBorder="border-gold text-burgundy hover:bg-gold hover:text-white"
          btnHoverBg="bg-gold"
        />

        {/* Gallery */}
        <Gallery 
          invitation={invitation} 
          sectionBg="bg-[#632529]" 
          titleFont={cormorant.className} 
          titleSize="text-5xl md:text-6xl"
          accentText="text-[#A99D87]" 
          borderColor="border-[#A99D87]/30"
          imgClasses="rounded-lg shadow-xl"
        />

        {/* Gifts */}
        <GiftAccounts 
          invitation={invitation} 
          sectionBg="bg-[#fdfbf7]" 
          accentText="text-burgundy" 
          accentBg="bg-gold" 
          cardBg="bg-white border border-[#A99D87]/30 shadow-sm rounded-xl"
          iconBg="bg-burgundy/5 text-burgundy" 
          btnBorder="border-burgundy text-burgundy" 
          btnHoverBg="bg-burgundy text-white hover:text-white"
        />

        {/* QrCheckin */}
        <QrCheckin 
          guest={guest} 
          sectionBg='bg-white' 
          titleFont={cormorant.className}
          textColor='text-burgundy'
          borderStyle='border-gold/30'
        />

        {/* Guestbook */}
        <Guestbook 
          invitation={invitation} 
          guestName={guestName} 
          guestToken={guest?.token} 
        />

        {/* Footer */}
        <footer className="bg-burgundy py-16 px-6 text-center text-[#A99D87]">
          <h2 className={`${vibes.className} text-5xl mb-6 text-white`}>
            {invitation.groom_name} & {invitation.bride_name}
          </h2>
          <p className="text-xs tracking-widest uppercase mb-8 text-white/50">
            {new Date(invitation.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          <div className="h-px w-24 bg-gold mx-auto mb-8 opacity-50"></div>
          <p className="text-[10px] uppercase tracking-widest opacity-60 text-white">&copy; 2026 Ulemanti Premium. All rights reserved.</p>
        </footer>

      </main>
    </div>
  );
}
