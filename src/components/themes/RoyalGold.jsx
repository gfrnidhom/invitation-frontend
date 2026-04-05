'use client';

import React, { useEffect, useState } from 'react';
import { Cinzel, EB_Garamond } from 'next/font/google';
import CoverOverlay from './partials/CoverOverlay';
import CoupleProfile from './partials/CoupleProfile';
import Events from './partials/Events';
import LoveStory from './partials/LoveStory';
import Gallery from './partials/Gallery';
import GiftAccounts from './partials/GiftAccounts';
import Guestbook from './partials/Guestbook';
import QrCheckin from './partials/QrCheckin';
import BottomNav from './partials/BottomNav';
import CountdownTimer from './partials/CountdownTimer';
import MusicPlayer from './partials/MusicPlayer';

const displayFont = Cinzel({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal'] 
});

const bodyFont = EB_Garamond({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600'],
  style: ['normal', 'italic']
});

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function RoyalGold({ payload }) {
  const { invitation, guest, guestName } = payload;
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`min-h-screen bg-[#0a0a0f] text-[#e8d5a8] antialiased ${bodyFont.className}`}>
      
      <style jsx global>{`
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .shimmer { 
          background: linear-gradient(110deg, transparent 20%, rgba(201,168,76,0.1) 40%, rgba(201,168,76,0.2) 50%, rgba(201,168,76,0.1) 60%, transparent 80%);
          background-size: 200% 100%; 
          animation: shimmer 3s ease-in-out infinite; 
        }
        @keyframes shimmer { 0% { background-position: 200%; } 100% { background-position: -200%; } }
      `}</style>

      {/* Cover Overlay */}
      <CoverOverlay 
        invitation={invitation} 
        guestName={guestName} 
        onOpen={() => setIsOpened(true)}
        overlayBg="bg-[#0a0a0f]" // royal-900
        titleFont={displayFont.className}
        subtitleFont={bodyFont.className}
        accentColor="text-[#d4b96a]" // gold-300
        btnBg="bg-[#c9a84c] text-[#0a0a0f] shadow-lg shadow-[#c9a84c]/20 hover:bg-[#d4b96a]" // gold-400
      />

      {/* Music Player */}
      {invitation.music_url && (
        <MusicPlayer 
          musicUrl={invitation.music_url} 
          shouldPlay={isOpened}
          btnBg="bg-[#c9a84c]/20 backdrop-blur-sm" 
          btnColor="text-[#c9a84c]" 
          btnBorder="border border-[#c9a84c]/30" 
        />
      )}

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {invitation.cover_photo && (() => { const cp = Array.isArray(invitation.cover_photo) ? invitation.cover_photo[0] : invitation.cover_photo; return cp ? (
          <div className="absolute inset-0 z-0">
            <img src={cp.startsWith?.('http') ? cp : `${STORAGE_URL}/${cp}`} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/70 via-[#0a0a0f]/50 to-[#0a0a0f]/80"></div>
          </div>
        ) : null; })()}

        {/* Gold corner ornaments */}
        <div className="absolute top-6 left-6 w-20 h-20 border-t border-l border-[#c9a84c]/30 z-10"></div>
        <div className="absolute top-6 right-6 w-20 h-20 border-t border-r border-[#c9a84c]/30 z-10"></div>
        <div className="absolute bottom-6 left-6 w-20 h-20 border-b border-l border-[#c9a84c]/30 z-10"></div>
        <div className="absolute bottom-6 right-6 w-20 h-20 border-b border-r border-[#c9a84c]/30 z-10"></div>

        <div className="relative z-10 w-full flex flex-col items-center justify-center">
          {guestName && (
            <>
              <p className="text-sm text-[#c9a84c]/80 mb-2 uppercase tracking-widest text-[10px] reveal">Teruntuk Bapak/Ibu/Saudara/i</p>
              <p className={`${displayFont.className} text-lg text-[#d4b96a] tracking-wider mb-12 reveal`}>{guestName}</p>
            </>
          )}

          <p className={`${displayFont.className} text-[10px] tracking-[0.6em] uppercase text-[#c9a84c]/60 mb-8 reveal`}>
            The Wedding Of
          </p>

          <h1 className={`${displayFont.className} text-5xl md:text-8xl font-bold text-[#d4b96a] tracking-wider leading-tight shimmer reveal`}>
            {invitation.groom_name}
          </h1>
          <div className="my-6 flex items-center justify-center gap-6 reveal">
            <div className="w-20 h-px bg-gradient-to-r from-transparent to-[#c9a84c]/50"></div>
            <span className={`${displayFont.className} text-2xl text-[#c9a84c]`}>&</span>
            <div className="w-20 h-px bg-gradient-to-l from-transparent to-[#c9a84c]/50"></div>
          </div>
          <h1 className={`${displayFont.className} text-5xl md:text-8xl font-bold text-[#d4b96a] tracking-wider leading-tight shimmer reveal`}>
            {invitation.bride_name}
          </h1>

          <div className="mt-14 py-3 px-8 border border-[#c9a84c]/20 rounded-full reveal">
            <p className={`${displayFont.className} text-sm tracking-[0.3em] text-[#c9a84c]/80`}>
              {new Date(invitation.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Couple Profile */}
      <CoupleProfile 
        invitation={invitation}
        sectionBg="bg-[#121218]" // royal-800
        titleFont={bodyFont.className} 
        nameFont={displayFont.className}
        accentText="text-[#d4b96a]"
        subtitleText="text-[#c9a84c]/50"
        borderColor="border-[#c9a84c]/10"
      />

      {/* Story / Description */}
      {invitation.description && (
        <section className="px-6 py-20 max-w-2xl mx-auto text-center reveal">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/50 to-transparent mx-auto mb-8"></div>
          <p className="text-xl italic leading-relaxed text-[#e8d5a8]/70">
            &quot;{invitation.description}&quot;
          </p>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/50 to-transparent mx-auto mt-8"></div>
        </section>
      )}

      {/* Event Details */}
      <div id="events"></div>
      <section className="px-6 py-20 reveal">
        <div className="max-w-3xl mx-auto text-center">
          <p className={`${displayFont.className} text-[10px] tracking-[0.5em] uppercase text-[#c9a84c]/60 mb-10`}>Save The Date</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#121218] rounded-2xl p-8 border border-[#c9a84c]/10">
              <svg className="w-8 h-8 mx-auto text-[#c9a84c] mb-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
              <h3 className={`${displayFont.className} text-lg text-[#d4b96a] tracking-wider mb-3`}>Waktu</h3>
              <p className="text-[#e8d5a8]/50 text-sm">
                {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {invitation.event_time && <p className="text-[#e8d5a8]/50 text-sm mt-1">{invitation.event_time} WIB</p>}
            </div>
            <div className="bg-[#121218] rounded-2xl p-8 border border-[#c9a84c]/10">
              <svg className="w-8 h-8 mx-auto text-[#c9a84c] mb-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
              <h3 className={`${displayFont.className} text-lg text-[#d4b96a] tracking-wider mb-3`}>Lokasi</h3>
              <p className="text-[#e8d5a8]/50 text-sm">{invitation.location}</p>
              {invitation.latitude && invitation.longitude && (
                <a href={`https://maps.google.com/?q=${invitation.latitude},${invitation.longitude}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#c9a84c] text-xs mt-3 hover:text-[#d4b96a] transition-colors w-fit mx-auto">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                  Buka Maps
                </a>
              )}
            </div>
          </div>

          <div className="mt-16 max-w-md mx-auto">
            <CountdownTimer 
              eventDate={invitation.event_date} 
              eventTime={invitation.event_time}
              numberFont={`${displayFont.className} font-bold text-[#d4b96a] text-3xl md:text-4xl`}
              labelFont={`${displayFont.className} tracking-[0.3em] uppercase`}
              textColor=""
              accentColor="bg-[#121218] rounded-xl p-4 border border-[#c9a84c]/10"
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <Gallery 
        layout="abstract" 
        invitation={invitation}
        sectionBg="bg-[#0a0a0f]"
        titleFont={displayFont.className}
        accentText="text-[#d4b96a]"
        borderColor="border-[#c9a84c]/10"
      />

      {/* Multi Events List */}
      <Events 
        invitation={invitation}
        sectionBg="bg-[#121218]"
        cardBg="bg-[#1a1a22]"
        titleFont={bodyFont.className}
        nameFont={displayFont.className}
        accentText="text-[#d4b96a]"
        btnBg="bg-[#c9a84c] text-[#0a0a0f]"
        btnHoverBg="hover:bg-[#d4b96a]"
        btnBorder="border-[#c9a84c]/20"
        iconBg="text-[#c9a84c]"
      />

      {/* Love Story Timeline */}
      {(invitation.loveStories || invitation.love_stories) && (invitation.loveStories || invitation.love_stories).length > 0 && (
        <LoveStory 
          invitation={invitation}
          sectionBg="bg-[#0a0a0f]"
          titleFont={displayFont.className}
          accentText="text-[#d4b96a]"
          borderColor="border-[#c9a84c]/20"
          cardBg="bg-[#121218] border border-[#c9a84c]/10"
        />
      )}

      {/* Gift Accounts */}
      <div id="gift"></div>
      {(invitation.giftAccounts || invitation.gift_accounts) && (invitation.giftAccounts || invitation.gift_accounts).length > 0 && (
        <GiftAccounts 
          invitation={invitation}
          sectionBg="bg-[#121218]"
          titleFont={displayFont.className}
          accentText="text-[#d4b96a]"
          cardBg="bg-[#1a1a22] border border-[#c9a84c]/10"
          btnBg="bg-[#c9a84c] text-[#0a0a0f] hover:bg-[#d4b96a]"
        />
      )}

      {/* RSVP & Guestbook */}
      <div id="wishes"></div>
      
      {/* RSVP Removed */}

      <section className="px-6 pb-20 reveal">
        <div className="max-w-xl mx-auto">
          
          
          <QrCheckin guest={guest} sectionBg='bg-transparent' />
            <Guestbook 
            invitation={invitation}
            guestName={guestName}
            guestToken={guest?.token}
            btnClasses={`w-full bg-[#c9a84c] text-[#0a0a0f] py-3 rounded-xl ${displayFont.className} text-sm tracking-wider font-semibold hover:bg-[#d4b96a] transition-colors`}
            inputClasses="w-full bg-[#121218] border border-[#c9a84c]/20 rounded-xl px-4 py-3 text-sm text-[#e8d5a8] placeholder:text-[#e8d5a8]/30 focus:border-[#c9a84c] outline-none mb-3"
            msgCardClasses="bg-[#121218] rounded-xl p-5 border border-[#c9a84c]/10 mb-3"
            nameFont="font-sans"
            msgFont={bodyFont.className}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 text-center border-t border-[#c9a84c]/10 bg-[#0a0a0f]">
        <p className={`${displayFont.className} text-2xl text-[#d4b96a] tracking-wider`}>{invitation.groom_name} & {invitation.bride_name}</p>
        <p className="text-xs text-[#c9a84c]/40 mt-3 italic">With eternal love and gratitude</p>
      </footer>

      {/* Bottom Navigation */}
      <BottomNav 
        navBg="bg-[#0a0a0f]/95 border-t border-[#c9a84c]/20 shadow-[0_-4px_20px_rgba(201,168,76,0.1)]"
        navActive="text-[#d4b96a]"
        navInactive="text-[#c9a84c]/40 hover:text-[#c9a84c]/70"
        navBorder="border-none"
      />

    </div>
  );
}
