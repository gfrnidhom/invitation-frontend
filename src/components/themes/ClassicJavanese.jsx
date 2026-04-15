'use client';

import React, { useEffect, useState } from 'react';
import { Cinzel_Decorative, Libre_Baskerville } from 'next/font/google';
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

const displayFont = Cinzel_Decorative({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  style: ['normal'] 
});

const bodyFont = Libre_Baskerville({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  style: ['normal', 'italic']
});

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function ClassicJavanese({ payload, audioController }) {
    const landingPhoto = (() => {
        const lp = payload.invitation?.landing_photo;
        if (!lp) return null;
        let photo = Array.isArray(lp) ? lp[0] : lp;
        if (typeof photo === 'object' && photo !== null) photo = photo.photo || photo.url;
        if (typeof photo !== 'string') return null;
        if (!photo.startsWith('http') && !photo.startsWith('/')) photo = `${process.env.NEXT_PUBLIC_STORAGE_URL || 'https://digitvitation.my.id/storage'}/${photo}`;
        return photo;
    })();

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
    <div className={`min-h-screen bg-[#fdf8f0] text-[#2d1810] antialiased ${bodyFont.className}`}>
      
      <style jsx global>{`
        .reveal { opacity: 0; transform: translateY(25px); transition: all 0.7s ease-out; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* Cover Overlay */}
      <CoverOverlay 
        invitation={invitation} 
        guestName={guestName} 
        onOpen={() => {
          setIsOpened(true);
          audioController?.play();
        }}
        overlayBg="bg-[#f0d5a8]" // A warm golden beige overlay
        titleFont={displayFont.className}
        subtitleFont={bodyFont.className}
        accentColor="text-[#5a3a0a]"
        btnBg="bg-[#8a5f1a] shadow-lg shadow-[#8a5f1a]/30 hover:bg-[#5a3a0a]"
      />

      {/* Music Player */}
      {invitation.music_url && (
        <MusicPlayer audioController={audioController} btnBg="bg-[#a67626]" btnColor="text-white" btnBorder="border-none shadow-lg shadow-[#a67626]/40" />
      )}

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-4 border-2 border-[#f0d5a8]/50 rounded-3xl pointer-events-none"></div>
        <div className="absolute inset-8 border border-[#f0d5a8]/30 rounded-2xl pointer-events-none"></div>

        <div className="relative z-10 w-full flex flex-col items-center justify-center">
          {guestName && (
            <>
              <p className="font-sans text-xs uppercase tracking-widest text-[#8b5a2b] mb-1 reveal">Katur Dhumateng</p>
              <p className="text-2xl text-[#5c4033] mb-10 reveal">{guestName}</p>
            </>
          )}

          <p className="text-xs tracking-[0.4em] uppercase text-[#c4913b] mb-6 reveal">Undangan Pernikahan</p>

          {/* Couple Photo */}
          {invitation.cover_photo && (() => { const cp = Array.isArray(invitation.cover_photo) ? invitation.cover_photo[0] : invitation.cover_photo; return cp ? (
            <div className="relative mb-8 reveal">
              <div className="w-52 h-52 md:w-64 md:h-64 rounded-2xl overflow-hidden border-4 border-[#f9ecd8] shadow-xl rotate-3">
                <img src={cp.startsWith?.('http') ? cp : `${STORAGE_URL}/${cp}`} alt="Cover" className="w-full h-full object-cover -rotate-3 scale-110" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#fdf8f0] border-2 border-[#f0d5a8] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#c4913b]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
            </div>
          ) : null; })()}

          <h1 className={`${displayFont.className} text-4xl md:text-6xl text-[#2d1810] leading-tight reveal`}>
            {invitation.groom_name}
          </h1>
          <div className="my-5 flex items-center gap-6 reveal">
            <div className="w-16 h-px bg-[#c4913b]"></div>
            <span className={`${displayFont.className} text-2xl text-[#c4913b]`}>&</span>
            <div className="w-16 h-px bg-[#c4913b]"></div>
          </div>
          <h1 className={`${displayFont.className} text-4xl md:text-6xl text-[#2d1810] leading-tight reveal`}>
            {invitation.bride_name}
          </h1>

          <div className="mt-10 inline-flex items-center gap-3 border border-[#f0d5a8] rounded-full px-6 py-3 reveal">
            <svg className="w-4 h-4 text-[#c4913b]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
            <p className="text-sm text-[#8a5f1a]">
              {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Couple Profile */}
      <CoupleProfile 
        invitation={invitation}
        sectionBg="bg-[#fef7f7] bg-opacity-0" 
        titleFont={bodyFont.className} 
        nameFont={displayFont.className}
        accentText="text-[#2d1810]"
        subtitleText="text-[#c4913b]"
        borderColor="border-[#f9ecd8]"
      />

      {/* Turut Mengundang */}
      <TurutMengundang 
        invitation={invitation}
        sectionBg="bg-[#fdf8f0]"
        titleFont={bodyFont.className}
        accentText="text-[#2d1810]"
        subtitleText="text-[#c4913b]"
        borderColor="border-[#c4913b]"
      />

      {/* Story / Description */}
      {invitation.quotes && (
        <section className="px-6 py-20 max-w-2xl mx-auto text-center reveal">
          <div className="w-8 h-px bg-[#c4913b] mx-auto mb-4"></div>
          <p className="text-xs tracking-[0.3em] uppercase text-[#c4913b] mb-6">Bismillahirrahmanirrahim</p>
          <div className="w-8 h-px bg-[#c4913b] mx-auto mb-8"></div>
          <p className="text-base italic leading-relaxed text-gray-600">
            &quot;{invitation.quotes}&quot;
          </p>
          {invitation.quotes_name && <p className="text-[10px] text-[#c4913b] tracking-widest uppercase mt-4">{invitation.quotes_name}</p>}
        </section>
      )}

      {/* Event Details */}
      <div id="events"></div>
      <section className="px-6 py-20 bg-[#1a0f0a] text-white reveal">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.4em] uppercase text-[#c4913b] mb-10">Waktu & Tempat</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-[#c4913b]/20 rounded-2xl p-8">
              <svg className="w-8 h-8 mx-auto text-[#c4913b] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
              <h3 className={`${displayFont.className} text-lg text-[#f0d5a8] mb-3`}>Hari & Waktu</h3>
              <p className="text-sm text-white/60">
                {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {invitation.event_time && <p className="text-sm text-white/60 mt-1">Pukul {invitation.event_time} WIB</p>}
            </div>
            
            <div className="border border-[#c4913b]/20 rounded-2xl p-8">
              <svg className="w-8 h-8 mx-auto text-[#c4913b] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
              <h3 className={`${displayFont.className} text-lg text-[#f0d5a8] mb-3`}>Tempat</h3>
              <p className="text-sm text-white/60">{invitation.location}</p>
              {invitation.latitude && invitation.longitude && (
                <a href={`https://maps.google.com/?q=${invitation.latitude},${invitation.longitude}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#c4913b] text-xs mt-3 hover:text-[#f0d5a8] transition-colors font-sans w-fit mx-auto">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                  Lihat di Maps
                </a>
              )}
            </div>
          </div>

          <div className="mt-14 max-w-sm mx-auto">
            <CountdownTimer 
              eventDate={invitation.event_date} 
              eventTime={invitation.event_time}
              numberFont={displayFont.className}
              labelFont="font-sans"
              textColor="text-[#f0d5a8] text-3xl"
              accentColor="text-[#c4913b]/60"
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <Gallery 
        layout="abstract" 
        invitation={invitation}
        sectionBg="bg-[#f0d5a8]/10"
        titleFont={displayFont.className}
        accentText="text-[#5a3a0a]"
        borderColor="border-[#c4913b]/30"
      />

      {/* Multi Events List */}
      <Events 
        invitation={invitation}
        sectionBg="bg-[#fdf8f0]"
        cardBg="bg-white"
        titleFont={bodyFont.className}
        nameFont={displayFont.className}
        accentText="text-[#8a5f1a]"
        btnBg="bg-[#8a5f1a]"
        btnHoverBg="hover:bg-[#5a3a0a]"
        btnBorder="border-[#c4913b]"
        iconBg="bg-[#f0d5a8] text-[#5a3a0a]"
      />

      {/* Love Story Timeline */}
      {(invitation.loveStories || invitation.love_stories) && (invitation.loveStories || invitation.love_stories).length > 0 && (
        <LoveStory 
          invitation={invitation}
          sectionBg="bg-white"
          titleFont={displayFont.className}
          accentText="text-[#8a5f1a]"
          borderColor="border-[#c4913b]/40"
          cardBg="bg-[#fdf8f0] border border-[#f9ecd8]"
        />
      )}

      {/* Gift Accounts */}
      <div id="gift"></div>
      {(invitation.giftAccounts || invitation.gift_accounts) && (invitation.giftAccounts || invitation.gift_accounts).length > 0 && (
        <GiftAccounts variant="ClassicJavanese" 
          invitation={invitation}
          sectionBg="bg-[#f0d5a8]/10"
          titleFont={displayFont.className}
          accentText="text-[#8a5f1a]"
          cardBg="bg-white border border-[#c4913b]/30"
          btnBg="bg-[#8a5f1a] hover:bg-[#5a3a0a]"
        />
      )}

      {/* RSVP & Guestbook */}
      <div id="wishes"></div>
      <section className="px-6 py-20 bg-white reveal">
        <div className="max-w-xl mx-auto">
          
          
          <QrCheckin guest={guest} sectionBg='bg-transparent' />
            <Guestbook 
            invitation={invitation}
            guestName={guestName}
            guestToken={guest?.token}
            btnClasses="w-full bg-[#a67626] text-white py-3 rounded-xl text-sm font-sans font-semibold hover:bg-[#8a5f1a] transition-colors"
            inputClasses="w-full border border-[#f0d5a8] rounded-xl px-4 py-3 text-sm bg-white focus:border-[#a67626] outline-none mb-3"
            msgCardClasses="bg-[#fdf8f0] rounded-xl p-5 border border-[#f9ecd8] mb-3"
            nameFont="font-sans"
            msgFont={bodyFont.className}
          />
        </div>
      </section>

      {/* Footer */}
      {/* ── FOOTER ── */}
                <footer className="bg-[#1a0f0a] text-white pt-64 pb-24 px-8 text-center relative overflow-hidden">
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 z-0">
                        {invitation?.footer_image ? (
                            <img src={getPhoto(invitation.footer_image)} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof landingPhoto !== 'undefined' && landingPhoto ? (
                            <img src={landingPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof coverPhoto !== 'undefined' && coverPhoto ? (
                            <img src={coverPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : (
                            <div className="w-full h-full bg-[#1a0f0a] opacity-40"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a] via-[#1a0f0a]/60 to-transparent" />
                    </div>
                    
                    {/* Content Layer */}
                    <div className="relative z-10 pt-10">
                        <p className={`${poppins.className} text-[10px] text-white/50 tracking-[0.3em] uppercase font-bold mb-4`}>
                            Thank you for being part of our special day
                        </p>
                        <h2 className={`${cormorant.className} text-5xl mb-4 text-white drop-shadow-sm`}>
                            {invitation?.groom_name?.split(' ')[0]} <span className="text-white/50 font-light mx-2">&</span> {invitation?.bride_name?.split(' ')[0]}
                        </h2>
                        
                        {/* Branding */}
                        <div className="border-t border-white/10 pt-8 mt-12">
                            <p className="text-[9px] text-white/40 tracking-[0.2em] uppercase mb-2">Digital Invitation by</p>
                            <a href="https://digitvitation.my.id" target="_blank" rel="noreferrer" className="inline-block text-white/80 hover:text-white transition-colors">
                                <span className={`${cormorant.className} text-lg font-bold tracking-wider uppercase`}>Digivitation</span>
                            </a>
                            <p className="text-[8px] text-white/30 mt-2 tracking-wider">© {new Date().getFullYear()} Digivitation. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

      {/* Bottom Navigation */}
      <BottomNav 
        navBg="bg-[#fdf8f0]/95"
        navActive="text-[#8a5f1a]"
        navInactive="text-[#c4913b]/70 hover:text-[#a67626]"
        navBorder="border-[#f0d5a8]"
      />

    </div>
  );
}
