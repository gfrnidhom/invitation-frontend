'use client';

import React, { useEffect, useState } from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
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

const headingFont = Playfair_Display({ 
  subsets: ['latin'], 
  weight: ['400', '600', '800'],
  style: ['normal', 'italic'] 
});

const bodyFont = Inter({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600'],
  style: ['normal']
});

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function EksklusifModern({ payload, audioController }) {
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
    <div className={`min-h-screen bg-[#0a0a0a] text-gray-100 antialiased relative overflow-x-hidden selection:bg-[#d79e60] selection:text-[#0a0a0a] ${bodyFont.className}`}>
      
      <style jsx global>{`
        .glass-panel { background: rgba(20, 20, 20, 0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(225, 185, 132, 0.15); }
        .lux-gradient-text { background: linear-gradient(135deg, #f5e8d1 0%, #d79e60 50%, #ab6535 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .reveal { opacity: 0; transform: translateY(50px); transition: all 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .glow-effect { position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, rgba(215, 158, 96, 0.15) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; pointer-events: none; }
        .border-flair { position: relative; }
        .border-flair::before, .border-flair::after { content: ''; position: absolute; width: 30px; height: 30px; border: 1px solid #d79e60; opacity: 0.5; transition: all 0.5s ease; }
        .border-flair::before { top: -10px; left: -10px; border-right: none; border-bottom: none; }
        .border-flair::after { bottom: -10px; right: -10px; border-left: none; border-top: none; }
        .border-flair:hover::before { top: -15px; left: -15px; opacity: 1; }
        .border-flair:hover::after { bottom: -15px; right: -15px; opacity: 1; }
        .animate-fade-in { animation: fadeIn 1.5s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Background Gradients */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#141414] via-[#0a0a0a] to-black z-[-1]"></div>
      <div className="glow-effect top-0 left-0"></div>
      <div className="glow-effect bottom-1/4 right-0"></div>

      {/* Cover Overlay */}
      <CoverOverlay 
        invitation={invitation} 
        guestName={guestName} 
        onOpen={() => { setIsOpened(true); audioController?.play(); }}
        overlayBg="bg-[#0a0a0a]" // obsidian-950
        titleFont={headingFont.className}
        subtitleFont={bodyFont.className}
        accentColor="text-[#d79e60]" // luxe-500
        btnBg="bg-[#ab6535] text-white shadow-lg shadow-[#ab6535]/20 hover:bg-[#895130]" // luxe-700
      />

      {/* Music Player */}
      {invitation.music_url && (
        <MusicPlayer 
          audioController={audioController} 
          btnBg="glass-panel shadow-[0_0_20px_rgba(215,158,96,0.2)]" 
          btnColor="text-[#e1b984]" 
          btnBorder="" 
        />
      )}

      {/* Hero Section */}
      <section id="home" className="min-h-[100svh] flex flex-col justify-center items-center relative px-6 text-center py-20">
        {invitation.cover_photo && (() => { const cp = Array.isArray(invitation.cover_photo) ? invitation.cover_photo[0] : invitation.cover_photo; return cp ? (
          <div className="absolute inset-0 z-0 opacity-30">
            <img src={cp.startsWith?.('http') ? cp : `${STORAGE_URL}/${cp}`} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
          </div>
        ) : null; })()}

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
          {guestName && (
            <div className="mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#e1b984] mb-2">Exclusive Invitation For</p>
              <p className={`${headingFont.className} text-xl text-[#edd5af] italic`}>{guestName}</p>
            </div>
          )}

          <p className="text-xs text-[#e1b984] uppercase tracking-[0.5em] mb-6">The Wedding Celebration Of</p>
          
          <div className="relative w-full">
            <h1 className={`${headingFont.className} text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white leading-[1.1]`}>
              <span className="block hover:lux-gradient-text transition-all duration-700 cursor-default">{invitation.groom_name}</span>
              <span className="block text-[#d79e60] font-light italic my-2 md:my-0 text-4xl md:text-6xl">&</span>
              <span className="block hover:lux-gradient-text transition-all duration-700 cursor-default">{invitation.bride_name}</span>
            </h1>
          </div>

          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="w-px h-16 bg-gradient-to-b from-[#d79e60] to-transparent"></div>
            <p className="text-sm text-[#f5e8d1] uppercase tracking-widest font-light">
              {new Date(invitation.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' — ')}
            </p>
          </div>
        </div>
      </section>

      {/* Couple Profiles */}
      <CoupleProfile 
        invitation={invitation}
        sectionBg="bg-transparent"
        cardBg="glass-panel border-0 border-t border-[#d79e60]/20"
        titleFont={bodyFont.className} 
        nameFont={`${headingFont.className} text-white`}
        textColor="text-gray-300"
        headingColor="text-[#e1b984]" // luxe-400
        borderColor="border-none"
      />

      {/* Story / Description */}
      {invitation.description && (
        <section className="px-6 py-32 relative reveal">
          <div className="max-w-2xl mx-auto text-center glass-panel p-12 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6f432a]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <svg className="w-8 h-8 mx-auto text-[#d79e60] mb-8" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <p className={`${headingFont.className} text-xl md:text-2xl leading-relaxed text-gray-200 italic font-light`}>
              &quot;{invitation.description}&quot;
            </p>
          </div>
        </section>
      )}

      {/* Event Details */}
      <div id="events"></div>
      <section className="px-6 py-24 relative reveal">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${headingFont.className} text-4xl md:text-5xl text-white mb-4`}>Event Details</h2>
            <div className="w-12 h-px bg-[#d79e60] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative z-10">
            {/* When Panel */}
            <div className="glass-panel p-10 md:p-12 rounded-2xl border-flair hover:-translate-y-2 transition-transform duration-500">
              <div className="w-12 h-12 rounded-full bg-[#6f432a]/30 flex items-center justify-center mb-8 border border-[#d79e60]/30">
                <svg className="w-5 h-5 text-[#e1b984]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
              </div>
              <p className="text-xs text-[#d79e60] uppercase tracking-[0.3em] mb-2">When</p>
              <p className={`${headingFont.className} text-3xl text-white mb-2`}>
                {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long' })}
              </p>
              <p className="text-gray-300 text-lg mb-1">
                {new Date(invitation.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {invitation.event_time && (
                <p className="text-[#f5e8d1] mt-4 px-4 py-2 bg-[#6f432a]/40 inline-block rounded-full text-sm border border-[#d79e60]/20">
                  {invitation.event_time} WIB
                </p>
              )}
            </div>

            {/* Where Panel */}
            <div className="glass-panel p-10 md:p-12 rounded-2xl border-flair hover:-translate-y-2 transition-transform duration-500">
              <div className="w-12 h-12 rounded-full bg-[#6f432a]/30 flex items-center justify-center mb-8 border border-[#d79e60]/30">
                <svg className="w-5 h-5 text-[#e1b984]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
              </div>
              <p className="text-xs text-[#d79e60] uppercase tracking-[0.3em] mb-2">Where</p>
              <p className={`${headingFont.className} text-2xl text-white mb-4 leading-tight`}>{invitation.location}</p>
              {invitation.latitude && invitation.longitude && (
                <a href={`https://maps.google.com/?q=${invitation.latitude},${invitation.longitude}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-[#e1b984] hover:text-[#edd5af] transition-colors mt-4 group">
                  <span className="text-sm uppercase tracking-wider font-medium">Open Map</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
                </a>
              )}
            </div>
          </div>

          <div className="mt-20 glass-panel p-8 md:p-12 rounded-3xl flex flex-wrap items-center justify-center gap-8 md:gap-16 border-t border-[#d79e60]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#cd8343]/10 rounded-full blur-3xl"></div>
            <CountdownTimer 
              eventDate={invitation.event_date} 
              eventTime={invitation.event_time}
              numberFont={`${headingFont.className} font-light text-white text-4xl md:text-6xl`}
              labelFont="text-[10px] tracking-[0.3em] uppercase text-[#d79e60] mt-3 font-semibold"
              textColor=""
              accentColor="bg-transparent"
              layout="divider"
              dividerContent={<div className="text-[#d79e60]/30 font-heading text-5xl font-light hidden md:block">|</div>}
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <Gallery 
        invitation={invitation}
        sectionBg="bg-transparent"
        titleFont={headingFont.className}
        accentText="text-[#e1b984]"
        borderColor="border-[#d79e60]/20"
        imgClasses="shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5"
      />

      {/* Multi Events */}
      <Events 
        invitation={invitation}
        sectionBg="bg-transparent"
        cardBg="glass-panel"
        titleFont={bodyFont.className}
        nameFont={`${headingFont.className} text-white`}
        accentText="text-[#d79e60]"
        btnBg="bg-[#ab6535]"
        btnHoverBg="hover:bg-[#895130]"
        btnBorder="border-[#d79e60]/30"
        iconBg="bg-[#6f432a]/30 text-[#e1b984]"
      />

      {/* Love Story */}
      {(invitation.loveStories || invitation.love_stories) && (invitation.loveStories || invitation.love_stories).length > 0 && (
        <LoveStory 
          invitation={invitation}
          sectionBg="bg-[#0a0a0a]"
          titleFont={headingFont.className}
          accentText="text-[#e1b984]"
          borderColor="border-[#d79e60]/20"
          cardBg="glass-panel text-gray-300"
        />
      )}

      {/* Gift Sections */}
      <div id="gift"></div>
      {(invitation.giftAccounts || invitation.gift_accounts) && (invitation.giftAccounts || invitation.gift_accounts).length > 0 && (
        <GiftAccounts 
          invitation={invitation}
          sectionBg="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#141414] to-[#0a0a0a]"
          titleFont={headingFont.className}
          accentText="text-[#e1b984]"
          cardBg="glass-panel text-gray-300"
          btnBg="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
        />
      )}

      {/* RSVP */}
      <div id="wishes"></div>
      {/* RSVP Removed */}

      {/* Guestbook */}
      <section className="px-6 py-24 mb-16 reveal relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6f432a]/5 to-transparent"></div>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.4em] uppercase text-[#d79e60] mb-3">Leave a Note</p>
            <p className={`${headingFont.className} text-4xl text-white`}>Guestbook</p>
          </div>

          <QrCheckin guest={guest} sectionBg='bg-transparent' />
            <Guestbook 
            invitation={invitation}
            guestName={guestName}
            guestToken={guest?.token}
            btnClasses="w-full bg-white text-[#0a0a0a] py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-[#fbf5eb] transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            inputClasses="w-full bg-[#141414]/80 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:border-[#d79e60] outline-none transition-colors shadow-inner mb-4"
            msgCardClasses="glass-panel rounded-2xl p-6 border-l-2 border-l-[#d79e60] mb-4"
            nameClasses="text-[10px] text-gray-500 uppercase tracking-wider block mt-1"
            msgClasses="text-sm text-gray-300 leading-relaxed"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#141414]"></div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d79e60]/50 to-transparent"></div>
        <div className="relative z-10 max-w-xl mx-auto px-6">
          <h2 className={`${headingFont.className} text-4xl text-white mb-6`}>{invitation.groom_name} & {invitation.bride_name}</h2>
          <p className="text-xs tracking-[0.3em] text-[#d79e60] uppercase mb-8">Elegance in Every Detail</p>
          <div className="w-12 h-12 mx-auto rounded-full border border-white/10 flex items-center justify-center text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
        </div>
      </footer>

      <BottomNav 
        navBg="bg-[#141414]/80 backdrop-blur-xl border-t border-white/5"
        navActive="text-[#d79e60]"
        navInactive="text-gray-500 hover:text-[#e1b984]"
        navBorder="border-none"
      />
    </div>
  );
}
