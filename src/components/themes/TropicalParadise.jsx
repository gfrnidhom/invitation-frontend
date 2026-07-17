'use client';

import React, { useEffect, useState } from 'react';
import { Josefin_Sans, Poppins } from 'next/font/google';
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
import { MapLocationButton, getMapUrl } from './partials/MapLocation';
import TurutMengundang from './partials/TurutMengundang';

const displayFont = Josefin_Sans({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'] 
});

const bodyFont = Poppins({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic']
});

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function TropicalParadise({ payload, audioController }) {
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

  // Extract first cover photo safely (cover_photo can be array or string)
  const coverPhotoUrl = (() => {
    const cp = invitation?.cover_photo ? (Array.isArray(invitation.cover_photo) ? invitation.cover_photo[0] : invitation.cover_photo) : null;
    if (!cp) return null;
    return cp.startsWith?.('http') ? cp : `${STORAGE_URL}/${cp}`;
  })();

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
    <div className={`min-h-screen bg-[#fffbf0] text-gray-800 antialiased ${bodyFont.className}`}>
      
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
        overlayBg="bg-[#fffbf0]" // sand-50
        titleFont={displayFont.className}
        subtitleFont={bodyFont.className}
        accentColor="text-[#0f766e]" // tropic-700
        btnBg="bg-[#14b8a6] shadow-lg shadow-[#14b8a6]/30 hover:bg-[#0d9488] text-white"
        coverGreeting="Aloha,"
      />

      {/* Music Player */}
      {invitation.music_url && (
        <MusicPlayer 
          audioController={audioController} 
          btnBg="bg-[#14b8a6] shadow-lg shadow-[#14b8a6]/30" 
          btnColor="text-white" 
          btnBorder="border-none" 
        />
      )}

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {coverPhotoUrl ? (
          <div className="absolute inset-0 z-0">
            <img src={coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#115e59]/40 via-[#115e59]/30 to-[#fffbf0]/90"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#99f6e4]/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#fecdd3]/20 rounded-full blur-3xl"></div>
          </div>
        )}

        <div className="relative z-10 w-full flex flex-col items-center justify-center reveal">
          {guestName && (
            <>
              <p className={`font-sans text-sm uppercase tracking-widest ${coverPhotoUrl ? 'text-white/80' : 'text-[#0d9488]'} mb-2`}>Aloha,</p>
              <p className={`${displayFont.className} text-xl font-semibold ${coverPhotoUrl ? 'text-white' : 'text-[#0f766e]'} mb-10`}>{guestName}</p>
            </>
          )}

          <p className={`text-xs tracking-[0.4em] uppercase ${coverPhotoUrl ? 'text-white/60' : 'text-[#2dd4bf]'} mb-6`}>You Are Invited To</p>

          <h1 className={`${displayFont.className} text-6xl md:text-8xl font-bold ${coverPhotoUrl ? 'text-white drop-shadow-lg' : 'text-[#0f766e]'} leading-tight tracking-tight`}>
            {invitation.groom_name}
          </h1>
          
          <div className="my-5 flex items-center justify-center gap-4">
            <div className="w-14 h-0.5 bg-gradient-to-r from-[#2dd4bf] to-[#fb7185] rounded-full"></div>
            <span className={`${displayFont.className} text-xl ${coverPhotoUrl ? 'text-[#fecdd3]' : 'text-[#fb7185]'}`}>&</span>
            <div className="w-14 h-0.5 bg-gradient-to-l from-[#2dd4bf] to-[#fb7185] rounded-full"></div>
          </div>
          
          <h1 className={`${displayFont.className} text-6xl md:text-8xl font-bold ${coverPhotoUrl ? 'text-white drop-shadow-lg' : 'text-[#0f766e]'} leading-tight tracking-tight`}>
            {invitation.bride_name}
          </h1>

          <p className={`mt-10 text-sm ${coverPhotoUrl ? 'text-white/70' : 'text-gray-400'}`}>
            {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Couple Profile */}
      <CoupleProfile 
        invitation={invitation}
        sectionBg="bg-[#f0fdfa]" // tropic-50
        titleFont={bodyFont.className} 
        nameFont={displayFont.className}
        accentText="text-[#0f766e]"
        subtitleText="text-[#2dd4bf]"
        borderColor="border-[#ccfbf1]"
      />

      {/* Turut Mengundang */}
      <TurutMengundang 
        invitation={invitation}
        sectionBg="bg-[#fffbf0]"
        accentText="text-gray-700"
        subtitleText="text-[#0d9488]"
        borderColor="border-[#2dd4bf]"
      />

      {/* Story / Description */}
      {invitation.quotes && (
        <section className="px-6 py-20 max-w-2xl mx-auto text-center reveal">
          <div className="w-12 h-1 bg-gradient-to-r from-[#2dd4bf] to-[#fb7185] rounded-full mx-auto mb-8"></div>
          <p className="text-lg leading-relaxed text-gray-500">
            &quot;{invitation.quotes}&quot;
          </p>
          {invitation.quotes_name && <p className="text-[10px] text-[#0d9488] tracking-widest uppercase mt-4">{invitation.quotes_name}</p>}
        </section>
      )}

      {/* Event Details */}
      <div id="events"></div>
      <section className="px-6 py-20 bg-gradient-to-br from-[#0d9488] to-[#0f766e] text-white reveal">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.4em] uppercase text-[#99f6e4] mb-10">Event Details</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <svg className="w-8 h-8 mx-auto text-[#99f6e4] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
              <h3 className={`${displayFont.className} text-xl font-semibold mb-2`}>Waktu</h3>
              <p className="text-sm text-white/70">
                {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {invitation.event_time && <p className="text-sm text-white/70 mt-1">{invitation.event_time} WIB</p>}
            </div>
            
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <svg className="w-8 h-8 mx-auto text-[#99f6e4] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
              <h3 className={`${displayFont.className} text-xl font-semibold mb-2`}>Lokasi</h3>
              <p className="text-sm text-white/70">{invitation.location}</p>
              {getMapUrl(invitation) && (
                <MapLocationButton
                  item={invitation}
                  className="inline-flex items-center gap-1 text-[#99f6e4] text-xs mt-3 hover:text-white transition-colors w-fit mx-auto"
                  buttonText="Buka Maps"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                  <span>Buka Maps</span>
                </MapLocationButton>
              )}
            </div>
          </div>

          <div className="mt-14 max-w-lg mx-auto">
            <CountdownTimer 
              eventDate={invitation.event_date} 
              eventTime={invitation.event_time}
              numberFont={`${displayFont.className} font-bold text-white text-4xl md:text-5xl`}
              labelFont="font-sans text-[#99f6e4] uppercase tracking-widest text-[10px]"
              textColor=""
              accentColor="bg-transparent" 
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <Gallery 
        layout="masonry" 
        invitation={invitation}
        sectionBg="bg-[#fffbf0]"
        titleFont={displayFont.className}
        accentText="text-[#0f766e]"
        borderColor="border-[#fef7e6]"
      />

      {/* Multi Events List */}
      <Events 
        invitation={invitation}
        sectionBg="bg-[#f0fdfa]" // tropic-50
        cardBg="bg-white"
        titleFont={bodyFont.className}
        nameFont={displayFont.className}
        accentText="text-[#0d9488]"
        btnBg="bg-[#14b8a6]"
        btnHoverBg="hover:bg-[#0d9488]"
        btnBorder="border-[#2dd4bf]"
        iconBg="bg-[#ccfbf1] text-[#0f766e]"
      />

      {/* Love Story Timeline */}
      {(invitation.loveStories || invitation.love_stories) && (invitation.loveStories || invitation.love_stories).length > 0 && (
        <LoveStory 
          invitation={invitation}
          sectionBg="bg-[#fffbf0]"
          titleFont={displayFont.className}
          accentText="text-[#0f766e]"
          borderColor="border-[#2dd4bf]/40"
          cardBg="bg-white border border-[#ccfbf1]"
        />
      )}

      {/* Gift Accounts */}
      <div id="gift"></div>
      {(invitation.giftAccounts || invitation.gift_accounts) && (invitation.giftAccounts || invitation.gift_accounts).length > 0 && (
        <GiftAccounts variant="TropicalParadise" 
          invitation={invitation}
          sectionBg="bg-[#f0fdfa]"
          titleFont={displayFont.className}
          accentText="text-[#0f766e]"
          cardBg="bg-white border border-[#ccfbf1]"
          btnBg="bg-[#14b8a6] hover:bg-[#0d9488] text-white"
        />
      )}

      {/* RSVP & Guestbook */}
      <div id="wishes"></div>
      
      {/* RSVP Removed */}

      <section className="px-6 py-20 reveal">
        <div className="max-w-xl mx-auto">
          
          
          <QrCheckin guest={guest} sectionBg='bg-transparent' />
            <Guestbook 
            invitation={invitation}
            guestName={guestName}
            guestToken={guest?.token}
            btnClasses={`w-full bg-[#14b8a6] text-white py-3 rounded-xl ${bodyFont.className} text-sm font-semibold hover:bg-[#0f766e] transition-colors`}
            inputClasses="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-[#14b8a6] outline-none mb-3"
            msgCardClasses="bg-[#f0fdfa] rounded-xl p-5 mb-3"
            nameFont="font-sans"
            msgFont={bodyFont.className}
          />
        </div>
      </section>

      {/* Footer */}
      {/* ── FOOTER ── */}
                <footer className="bg-[#f0fdfa] text-[#0f766e] pt-64 pb-24 px-8 text-center relative overflow-hidden">
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 z-0">
                        {invitation?.footer_image ? (
                            <img src={getPhoto(invitation.footer_image)} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof landingPhoto !== 'undefined' && landingPhoto ? (
                            <img src={landingPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof coverPhoto !== 'undefined' && coverPhoto ? (
                            <img src={coverPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : (
                            <div className="w-full h-full bg-[#f0fdfa] opacity-40"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#f0fdfa] via-[#f0fdfa]/60 to-transparent" />
                    </div>
                    
                    {/* Content Layer */}
                    <div className="relative z-10 pt-10">
                        <p className={`${poppins.className} text-[10px] text-black/50 tracking-[0.3em] uppercase font-bold mb-4`}>
                            Thank you for being part of our special day
                        </p>
                        <h2 className={`${cormorant.className} text-5xl mb-4 text-[#0f766e] drop-shadow-sm`}>
                            {invitation?.groom_name?.split(' ')[0]} <span className="text-black/50 font-light mx-2">&</span> {invitation?.bride_name?.split(' ')[0]}
                        </h2>
                        
                        {/* Branding */}
                        <div className="border-t border-[#0f766e]/10 pt-8 mt-12">
                            <p className="text-[9px] text-[#0f766e]/40 tracking-[0.2em] uppercase mb-2">Digital Invitation by</p>
                            <a href="https://digitvitation.my.id" target="_blank" rel="noreferrer" className="inline-block text-black/80 hover:text-black transition-colors">
                                <span className={`${cormorant.className} text-lg font-bold tracking-wider uppercase`}>Digivitation</span>
                            </a>
                            <p className="text-[8px] text-[#0f766e]/30 mt-2 tracking-wider">© {new Date().getFullYear()} Digivitation. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

      {/* Bottom Navigation */}
      <BottomNav 
        navBg="bg-[#fffbf0]/95 border-t border-[#fef7e6]"
        navActive="text-[#0f766e]"
        navInactive="text-[#2dd4bf] hover:text-[#0f766e]"
        navBorder="border-none"
      />

    </div>
  );
}
