'use client';

import React, { useEffect } from 'react';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
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

const serif = Cormorant_Garamond({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'] 
});

const sans = Montserrat({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600'] 
});

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function ElegantWhite({ payload }) {
  const { invitation, guest, guestName } = payload;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          entry.target.style.opacity = '1';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      el.style.animationPlayState = 'paused';
      el.style.opacity = '0';
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Theme Constants
  const colors = {
    cream: '#faf8f5',
    gold200: '#e8d5b7',
    gold400: '#c9a96e',
    gold600: '#a0824a'
  };

  return (
    <div className={`min-h-screen bg-[#faf8f5] text-gray-800 antialiased ${sans.className}`}>
      
      <style jsx global>{`
        .fade-in { animation: fadeIn 1.2s ease-out forwards; }
        .fade-in-delay { animation: fadeIn 1.2s ease-out 0.4s forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .slide-up { animation: slideUp 0.8s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Cover Overlay */}
      <CoverOverlay 
        invitation={invitation} 
        guestName={guestName} 
        overlayBg="bg-[#faf8f5]"
        titleFont={serif.className}
        subtitleFont={sans.className}
        accentColor="text-[#c9a96e]"
        btnBg="bg-[#a0824a] hover:bg-[#c9a96e]"
      />

      {/* Music Player */}
      {invitation.music_url && (
        <MusicPlayer musicUrl={invitation.music_url} btnBg="bg-white" btnColor="text-[#a0824a]" btnBorder="border border-[#e8d5b7]" />
      )}

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {(() => { const cp = invitation.cover_photo ? (Array.isArray(invitation.cover_photo) ? invitation.cover_photo[0] : invitation.cover_photo) : null; return cp ? (
          <div className="absolute inset-0">
            <img src={cp.startsWith?.('http') ? cp : `${STORAGE_URL}/${cp}`} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/80"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMEwzMCA2ME0wIDMwTDYwIDMwIiBzdHJva2U9IiNlOGQ1YjciIHN0cm9rZS13aWR0aD0iMC4zIiBmaWxsPSJub25lIi8+PC9zdmc+')] opacity-20"></div>
        ); })()}

        <div className="relative z-10">
          {guestName && (
            <>
              <p className={`fade-in text-sm tracking-[0.3em] uppercase text-[#c9a96e] mb-4`}>Dear</p>
              <p className={`fade-in ${serif.className} text-2xl text-[#a0824a] mb-10 italic`}>{guestName}</p>
            </>
          )}

          <p className="fade-in text-xs tracking-[0.4em] uppercase text-gray-500 mb-6">The Wedding Of</p>

          <h1 className={`fade-in ${serif.className} text-6xl md:text-8xl font-light text-gray-800 leading-tight drop-shadow-sm`}>
            {invitation.groom_name}
          </h1>
          <div className="fade-in-delay my-4">
            <svg className="w-8 h-8 mx-auto text-[#c9a96e]" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>
          </div>
          <h1 className={`fade-in-delay ${serif.className} text-6xl md:text-8xl font-light text-gray-800 leading-tight drop-shadow-sm`}>
            {invitation.bride_name}
          </h1>

          <div className="fade-in-delay mt-12 text-sm tracking-wider text-gray-600">
            {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="absolute bottom-10 animate-bounce z-10">
          <svg className="w-6 h-6 text-[#c9a96e]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
        </div>
      </section>

      {/* Couple Profile */}
      <CoupleProfile 
        invitation={invitation}
        sectionBg="bg-[#faf8f5]"
        titleFont={sans.className} 
        nameFont={serif.className}
        accentText="text-[#c9a96e]"
        borderColor="border-[#e8d5b7]/30"
      />

      {/* Story / Description */}
      {invitation.description && (
        <section className="px-6 py-20 max-w-2xl mx-auto text-center animate-on-scroll slide-up">
          <p className="text-xs tracking-[0.4em] uppercase text-[#c9a96e] mb-6">Our Story</p>
          <div className="w-12 h-px bg-[#c9a96e] mx-auto mb-8"></div>
          <p className={`${serif.className} text-xl leading-relaxed text-gray-600 italic`}>
            &quot;{invitation.description}&quot;
          </p>
        </section>
      )}

      {/* Multi Events */}
      <div id="events"></div>
      <Events 
        invitation={invitation}
        sectionBg="bg-white"
        cardBg="bg-[#faf8f5]"
        titleFont={sans.className}
        nameFont={serif.className}
        accentText="text-[#c9a96e]"
        btnBg="bg-[#a0824a]"
        btnHoverBg="hover:bg-[#c9a96e]"
      />

      {/* Love Story Timeline */}
      {(invitation.loveStories || invitation.love_stories) && (invitation.loveStories || invitation.love_stories).length > 0 && (
        <LoveStory 
          invitation={invitation}
          sectionBg="bg-[#faf8f5]"
          titleFont={serif.className}
          accentText="text-[#c9a96e]"
          borderColor="border-[#e8d5b7]"
          cardBg="bg-white border border-[#e8d5b7]/50"
        />
      )}

      {/* Countdown */}
      <section className="px-6 py-20 bg-[#faf8f5] text-center">
        <p className="text-xs tracking-[0.4em] uppercase text-[#c9a96e] mb-6">Counting Down</p>
        <CountdownTimer 
          eventDate={invitation.event_date} 
          eventTime={invitation.event_time}
          numberFont={serif.className}
          labelFont={sans.className}
          textColor="text-gray-800"
          accentColor="text-[#c9a96e]"
        />
      </section>

      {/* Gallery */}
      <Gallery 
        invitation={invitation}
        sectionBg="bg-white"
        titleFont={serif.className}
        accentText="text-[#c9a96e]"
        borderColor="border-[#e8d5b7]"
      />

      {/* Gift Accounts */}
      <div id="gift"></div>
      {(invitation.giftAccounts || invitation.gift_accounts) && (invitation.giftAccounts || invitation.gift_accounts).length > 0 && (
        <GiftAccounts 
          invitation={invitation}
          sectionBg="bg-[#faf8f5]"
          titleFont={serif.className}
          accentText="text-[#c9a96e]"
          cardBg="bg-white border border-[#e8d5b7]/50"
          btnBg="bg-[#a0824a] hover:bg-[#c9a96e]"
        />
      )}

      {/* RSVP & Guestbook */}
      <div id="wishes"></div>
      <section className="px-6 py-20 bg-white">
        <div className="max-w-2xl mx-auto">
          
          
          <QrCheckin guest={guest} sectionBg='bg-transparent' />
            <Guestbook 
            invitation={invitation}
            guestName={guestName}
            guestToken={guest?.token}
            btnClasses="w-full bg-[#a0824a] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#c9a96e] transition-colors tracking-wider"
            inputClasses="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 bg-white outline-none"
            msgCardClasses="bg-[#faf8f5] rounded-xl p-5"
            nameFont={sans.className}
            msgFont={serif.className}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 text-center bg-[#faf8f5] border-t border-[#e8d5b7]/50">
        <p className={`${serif.className} text-2xl text-gray-800 mb-2`}>{invitation.groom_name} & {invitation.bride_name}</p>
        <p className="text-xs tracking-widest text-gray-400 uppercase">Thank you for your blessings</p>
      </footer>

      {/* Bottom Navigation */}
      <BottomNav 
        navBg="bg-white/90"
        navActive="text-[#a0824a]"
        navInactive="text-gray-400 hover:text-[#c9a96e]"
        navBorder="border-[#e8d5b7]/50"
      />

    </div>
  );
}
