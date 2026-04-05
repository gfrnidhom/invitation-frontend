'use client';

import React, { useEffect, useState } from 'react';
import { Fredoka, Nunito } from 'next/font/google';
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

const displayFont = Fredoka({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal'] 
});

const bodyFont = Nunito({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic']
});

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function BirthdayBash({ payload, audioController }) {
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
    <div className={`min-h-screen bg-gradient-to-b from-[#fdf4ff] via-white to-[#e0f2fe] text-gray-800 antialiased ${bodyFont.className}`}>
      
      <style jsx global>{`
        .reveal { opacity: 0; transform: translateY(25px); transition: all 0.7s ease-out; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .confetti { position: absolute; width: 10px; height: 10px; border-radius: 50%; animation: confetti-fall linear infinite; }
        @keyframes confetti-fall { 
          0% { transform: translateY(-100vh) rotate(0); opacity: 1; } 
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } 
        }
      `}</style>

      {/* Cover Overlay */}
      <CoverOverlay 
        invitation={invitation} 
        guestName={guestName} 
        onOpen={() => {
          setIsOpened(true);
          audioController?.play();
        }}
        overlayBg="bg-[#fdf4ff]" // party-50
        titleFont={displayFont.className}
        subtitleFont={bodyFont.className}
        accentColor="text-[#d946ef]" // party-500
        btnBg="bg-gradient-to-r from-[#d946ef] to-[#0ea5e9] text-white shadow-lg hover:opacity-90"
      />

      {/* Music Player */}
      {invitation.music_url && (
        <MusicPlayer 
          audioController={audioController} 
          btnBg="bg-gradient-to-r from-[#d946ef] to-[#0ea5e9]" 
          btnColor="text-white" 
          btnBorder="border-none shadow-lg shadow-[#0ea5e9]/30" 
        />
      )}

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {invitation.cover_photo && (() => { const cp = Array.isArray(invitation.cover_photo) ? invitation.cover_photo[0] : invitation.cover_photo; return cp ? (
          <div className="absolute inset-0 z-0">
            <img src={cp.startsWith?.('http') ? cp : `${STORAGE_URL}/${cp}`} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/80"></div>
          </div>
        ) : null; })()}

        {/* Confetti dots */}
        <div className="confetti bg-[#e879f9] left-[10%] z-0" style={{ animationDuration: '4s', animationDelay: '0s' }}></div>
        <div className="confetti bg-[#38bdf8] left-[30%] z-0" style={{ animationDuration: '5s', animationDelay: '1s', width: '8px', height: '8px' }}></div>
        <div className="confetti bg-[#facc15] left-[50%] z-0" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}></div>
        <div className="confetti bg-[#e879f9] left-[70%] z-0" style={{ animationDuration: '4.5s', animationDelay: '2s', width: '12px', height: '12px' }}></div>
        <div className="confetti bg-[#38bdf8] left-[85%] z-0" style={{ animationDuration: '3s', animationDelay: '1.5s' }}></div>

        <div className="relative z-10 w-full flex flex-col items-center justify-center reveal">
          {guestName && (
            <>
              <p className="font-sans text-sm uppercase tracking-[0.2em] text-[#d946ef]/80 mb-2">To our special guest:</p>
              <p className={`${displayFont.className} text-2xl text-[#c026d3] mb-8`}>{guestName}!</p>
            </>
          )}

          <p className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">You&apos;re invited to</p>
          
          <h1 className={`${displayFont.className} text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#d946ef] via-[#0ea5e9] to-[#eab308] bg-clip-text text-transparent leading-tight pb-2`}>
            {invitation.title || 'Birthday Bash!'}
          </h1>

          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="w-10 h-1 rounded-full bg-gradient-to-r from-[#e879f9] to-[#38bdf8]"></div>
            <svg className="w-8 h-8 text-[#facc15]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <div className="w-10 h-1 rounded-full bg-gradient-to-l from-[#e879f9] to-[#38bdf8]"></div>
          </div>

          <p className={`${displayFont.className} mt-6 text-2xl text-gray-700`}>{invitation.groom_name}{invitation.bride_name ? ` & ${invitation.bride_name}` : ''}</p>

          <p className="mt-8 text-sm text-gray-500">
            {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Profile (Usually singular for Birthday) */}
      <CoupleProfile 
        invitation={invitation}
        sectionBg="bg-transparent" 
        titleFont={bodyFont.className} 
        nameFont={displayFont.className}
        accentText="text-[#c026d3]"
        subtitleText="text-[#0ea5e9]"
        borderColor="border-[#fae8ff]"
      />

      {/* Story / Description */}
      {invitation.description && (
        <section className="px-6 py-16 max-w-2xl mx-auto text-center reveal">
          <p className="text-lg leading-relaxed text-gray-500">
            &quot;{invitation.description}&quot;
          </p>
        </section>
      )}

      {/* Event Details */}
      <div id="events"></div>
      <section className="px-6 py-20 bg-gradient-to-r from-[#d946ef] via-[#0ea5e9] to-[#d946ef] text-white reveal">
        <div className="max-w-3xl mx-auto text-center">
          <p className={`${displayFont.className} text-3xl font-bold mb-10`}>Event Details</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/15 rounded-2xl p-8 backdrop-blur-sm shadow-sm border border-white/20">
              <svg className="w-8 h-8 mx-auto mb-4 text-[#facc15]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
              <h3 className={`${displayFont.className} text-xl font-semibold mb-2`}>Kapan</h3>
              <p className="text-sm text-white/80">
                {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {invitation.event_time && <p className="text-sm text-white/80 mt-1">{invitation.event_time} WIB</p>}
            </div>
            
            <div className="bg-white/15 rounded-2xl p-8 backdrop-blur-sm shadow-sm border border-white/20">
              <svg className="w-8 h-8 mx-auto mb-4 text-[#facc15]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
              <h3 className={`${displayFont.className} text-xl font-semibold mb-2`}>Di Mana</h3>
              <p className="text-sm text-white/80">{invitation.location}</p>
              {invitation.latitude && invitation.longitude && (
                <a href={`https://maps.google.com/?q=${invitation.latitude},${invitation.longitude}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#facc15] text-xs mt-3 hover:text-white transition-colors w-fit mx-auto">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                  Buka Maps
                </a>
              )}
            </div>
          </div>

          <div className="mt-14 max-w-lg mx-auto">
            <CountdownTimer 
              eventDate={invitation.event_date} 
              eventTime={invitation.event_time}
              numberFont={`${displayFont.className} font-bold text-white text-3xl`}
              labelFont="font-sans text-white/60 uppercase tracking-widest text-[9px]"
              textColor=""
              accentColor="bg-white/15 rounded-2xl p-4 backdrop-blur-sm shadow-md border-t border-white/30" 
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <Gallery 
        layout="masonry" 
        invitation={invitation}
        sectionBg="bg-transparent"
        titleFont={displayFont.className}
        accentText="text-[#d946ef]"
        borderColor="border-[#fae8ff]"
      />

      {/* Multi Events List */}
      <Events 
        invitation={invitation}
        sectionBg="bg-[#f0f9ff]" // sky-50
        cardBg="bg-white"
        titleFont={bodyFont.className}
        nameFont={displayFont.className}
        accentText="text-[#0ea5e9]"
        btnBg="bg-gradient-to-r from-[#d946ef] to-[#0ea5e9]"
        btnHoverBg="hover:opacity-90"
        btnBorder="border-none shadow-md"
        iconBg="bg-[#e0f2fe] text-[#0ea5e9]"
      />

      {/* Love Story Timeline */}
      {(invitation.loveStories || invitation.love_stories) && (invitation.loveStories || invitation.love_stories).length > 0 && (
        <LoveStory 
          invitation={invitation}
          sectionBg="bg-white/50"
          titleFont={displayFont.className}
          accentText="text-[#c026d3]"
          borderColor="border-[#e879f9]/40"
          cardBg="bg-white border md:border-2 border-[#f5d0fe]"
        />
      )}

      {/* Gift Accounts */}
      <div id="gift"></div>
      {(invitation.giftAccounts || invitation.gift_accounts) && (invitation.giftAccounts || invitation.gift_accounts).length > 0 && (
        <GiftAccounts 
          invitation={invitation}
          sectionBg="bg-transparent"
          titleFont={displayFont.className}
          accentText="text-[#d946ef]"
          cardBg="bg-white border-2 border-[#f5d0fe]"
          btnBg="bg-gradient-to-r from-[#d946ef] to-[#0ea5e9] text-white hover:opacity-90 shadow-md"
        />
      )}

      {/* RSVP & Guestbook */}
      <div id="wishes"></div>
      
      {/* RSVP Removed */}

      <section className="px-6 pb-20 pt-8 reveal">
        <div className="max-w-xl mx-auto">
          
          
          <QrCheckin guest={guest} sectionBg='bg-transparent' />
            <Guestbook 
            invitation={invitation}
            guestName={guestName}
            guestToken={guest?.token}
            btnClasses={`w-full bg-gradient-to-r from-[#d946ef] to-[#0ea5e9] text-white py-3 rounded-xl ${bodyFont.className} text-sm font-bold hover:opacity-90 transition-opacity shadow-md`}
            inputClasses="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-[#0ea5e9] outline-none mb-3"
            msgCardClasses="bg-[#fcfcfc] rounded-xl p-5 border border-gray-100 shadow-sm mb-3"
            nameFont="font-sans"
            msgFont={bodyFont.className}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 text-center bg-gradient-to-r from-[#d946ef] via-[#0ea5e9] to-[#d946ef] text-white relative">
        <p className={`${displayFont.className} text-2xl font-bold`}>{invitation.title}</p>
        <p className={`${bodyFont.className} text-xs text-white/80 mt-2`}>See you there!</p>
      </footer>

      {/* Bottom Navigation */}
      <BottomNav 
        navBg="bg-white/95 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        navActive="text-[#d946ef]"
        navInactive="text-gray-400 hover:text-[#0ea5e9]"
        navBorder="border-none"
      />

    </div>
  );
}
