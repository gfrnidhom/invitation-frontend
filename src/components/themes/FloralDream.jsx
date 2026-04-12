'use client';

import React, { useEffect, useState } from 'react';
import { Great_Vibes, Quicksand } from 'next/font/google';
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
import TurutMengundang from './partials/TurutMengundang';

const script = Great_Vibes({ 
  subsets: ['latin'], 
  weight: ['400'],
  style: ['normal'] 
});

const bodyFont = Quicksand({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'] 
});

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function FloralDream({ payload, audioController }) {
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
    <div className={`min-h-screen bg-[#fef7f7] text-gray-700 antialiased ${bodyFont.className}`}>
      
      <style jsx global>{`
        .reveal { opacity: 0; transform: translateY(25px); transition: all 0.7s ease-out; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .float { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>

      {/* Cover Overlay */}
      <CoverOverlay 
        invitation={invitation} 
        guestName={guestName} 
        onOpen={() => {
          setIsOpened(true);
          audioController?.play();
        }}
        overlayBg="bg-[#fef7f7]"
        titleFont={script.className}
        subtitleFont={bodyFont.className}
        accentColor="text-[#db2777]"
        btnBg="bg-[#f472b6] shadow-lg shadow-[#f472b6]/30 hover:bg-[#db2777]"
      />

      {/* Music Player */}
      {invitation.music_url && (
        <MusicPlayer audioController={audioController} btnBg="bg-[#f472b6]" btnColor="text-white" btnBorder="border-none shadow-lg shadow-[#f472b6]/30" />
      )}

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#fbcfe8]/30 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#fbd5d5]/40 rounded-full blur-3xl float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-[#fce7f3]/30 rounded-full blur-2xl float" style={{ animationDelay: '4s' }}></div>

        <div className="relative z-10 w-full flex flex-col items-center justify-center">
          {guestName && (
            <>
              <p className="text-sm text-[#f472b6] tracking-wider mb-1">Kepada Yth.</p>
              <p className="text-lg font-semibold text-[#db2777] mb-6">{guestName}</p>
            </>
          )}

          {/* Couple Photo */}
          {invitation.cover_photo && (() => { const cp = Array.isArray(invitation.cover_photo) ? invitation.cover_photo[0] : invitation.cover_photo; return cp ? (
            <div className="relative mb-8">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-[#fce7f3] shadow-xl shadow-[#fbcfe8]/40 bg-white">
                <img src={cp.startsWith?.('http') ? cp : `${STORAGE_URL}/${cp}`} alt="Cover" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10">
                <svg className="w-full h-full text-[#f9a8d4]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
            </div>
          ) : null; })()}

          <p className="text-xs tracking-[0.4em] uppercase text-[#f48a8a] mb-4">The Wedding Of</p>

          <h1 className={`${script.className} text-6xl md:text-8xl text-[#db2777] leading-tight drop-shadow-sm`}>
            {invitation.groom_name}
          </h1>
          <div className="my-4 flex items-center justify-center gap-4">
            <div className="w-12 h-px bg-[#fbcfe8]"></div>
            <svg className="w-6 h-6 text-[#f472b6]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <div className="w-12 h-px bg-[#fbcfe8]"></div>
          </div>
          <h1 className={`${script.className} text-6xl md:text-8xl text-[#db2777] leading-tight drop-shadow-sm`}>
            {invitation.bride_name}
          </h1>

          <div className="mt-10 text-sm tracking-wider text-[#f48a8a] font-medium">
            {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </section>

      {/* Couple Profile */}
      <CoupleProfile 
        invitation={invitation}
        sectionBg="bg-[#fef7f7]"
        titleFont={bodyFont.className} 
        nameFont={script.className}
        accentText="text-[#f472b6]"
        borderColor="border-[#fce7f3]"
      />

      {/* Turut Mengundang */}
      <TurutMengundang 
        invitation={invitation}
        sectionBg="bg-[#fef7f7]"
        accentText="text-gray-600"
        subtitleText="text-[#f472b6]"
        borderColor="border-[#fce7f3]"
      />

      {/* Story / Description */}
      {invitation.quotes && (
        <section className="px-6 py-20 max-w-2xl mx-auto text-center reveal">
          <svg className="w-8 h-8 mx-auto text-[#f9a8d4] mb-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <p className={`text-lg leading-relaxed text-gray-500 italic`}>
            &quot;{invitation.quotes}&quot;
          </p>
          {invitation.quotes_name && <p className="text-[10px] text-[#f472b6] tracking-widest uppercase mt-4">{invitation.quotes_name}</p>}
        </section>
      )}

      {/* Multi Events */}
      <div id="events"></div>
      <Events 
        invitation={invitation}
        sectionBg="bg-white"
        cardBg="bg-[#fef7f7]" /* blush-50 */
        titleFont={bodyFont.className}
        nameFont={script.className}
        accentText="text-[#f472b6]"
        btnBg="bg-[#f472b6]"
        btnHoverBg="hover:bg-[#db2777]"
        btnBorder="border-[#fbcfe8]"
        iconBg="text-[#f472b6]"
      />

      {/* Countdown Timer Overrides */}
      <section className="px-6 pb-20 bg-white text-center reveal">
        <CountdownTimer 
          eventDate={invitation.event_date} 
          eventTime={invitation.event_time}
          numberFont={bodyFont.className}
          labelFont={bodyFont.className}
          textColor="text-[#db2777] font-bold text-3xl"
          accentColor="text-[#db2777]"
        />
      </section>

      {/* Gallery */}
      <Gallery 
        layout="masonry" 
        invitation={invitation}
        sectionBg="bg-[#fef7f7]"
        titleFont={script.className}
        accentText="text-[#f472b6]"
        borderColor="border-[#fce7f3]"
      />

      {/* Love Story Timeline */}
      {(invitation.loveStories || invitation.love_stories) && (invitation.loveStories || invitation.love_stories).length > 0 && (
        <LoveStory 
          invitation={invitation}
          sectionBg="bg-white"
          titleFont={script.className}
          accentText="text-[#f472b6]"
          borderColor="border-[#fce7f3]"
          cardBg="bg-[#fef7f7] border border-[#fce7f3]"
        />
      )}

      {/* Gift Accounts */}
      <div id="gift"></div>
      {(invitation.giftAccounts || invitation.gift_accounts) && (invitation.giftAccounts || invitation.gift_accounts).length > 0 && (
        <GiftAccounts 
          invitation={invitation}
          sectionBg="bg-[#fef7f7]"
          titleFont={script.className}
          accentText="text-[#f472b6]"
          cardBg="bg-white border border-[#fce7f3]"
          btnBg="bg-[#f472b6] shadow-md shadow-[#f472b6]/20 hover:bg-[#db2777]"
        />
      )}

      {/* RSVP & Guestbook */}
      <div id="wishes"></div>
      <section className="px-6 py-20 bg-white reveal">
        <div className="max-w-xl mx-auto border border-[#fce7f3] rounded-3xl p-6 lg:p-10 shadow-sm bg-white">
          
          
          <QrCheckin guest={guest} sectionBg='bg-transparent' />
            <Guestbook 
            invitation={invitation}
            guestName={guestName}
            guestToken={guest?.token}
            btnClasses="w-full bg-[#f472b6] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#db2777] transition-colors shadow-md shadow-[#f472b6]/20"
            inputClasses="w-full border border-[#fce7f3] rounded-full px-5 py-3 text-sm focus:border-[#f472b6] outline-none bg-white mb-3"
            msgCardClasses="bg-white rounded-2xl p-5 border border-[#fce7f3] mb-3"
            nameFont={bodyFont.className}
            msgFont={bodyFont.className}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 text-center bg-white border-t border-[#fce7f3]">
        <p className={`${script.className} text-4xl text-[#db2777]`}>{invitation.groom_name} & {invitation.bride_name}</p>
        <p className="text-xs text-[#f48a8a] mt-3">With love</p>
      </footer>

      {/* Bottom Navigation */}
      <BottomNav 
        navBg="bg-[#fef7f7]/95"
        navActive="text-[#db2777]"
        navInactive="text-[#f48a8a] hover:text-[#f472b6]"
        navBorder="border-[#fce7f3]"
      />

    </div>
  );
}
