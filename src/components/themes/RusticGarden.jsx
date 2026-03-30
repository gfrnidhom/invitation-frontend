'use client';

import React, { useEffect } from 'react';
import { Playfair_Display, Lora } from 'next/font/google';
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

const displayFont = Playfair_Display({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'] 
});

const bodyFont = Lora({ 
  subsets: ['latin'], 
  weight: ['400', '500'],
  style: ['normal', 'italic']
});

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function RusticGarden({ payload }) {
  const { invitation, guest, guestName } = payload;

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
    <div className={`min-h-screen bg-[#f5efe6] text-gray-800 antialiased ${bodyFont.className}`}>
      
      <style jsx global>{`
        .leaf-bg { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 20c-5 0-15 8-15 20s10 20 15 20 15-8 15-20-10-20-15-20z' fill='none' stroke='%238aab75' stroke-width='0.3' opacity='0.25'/%3E%3C/svg%3E"); }
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.7s ease-out; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* Cover Overlay */}
      <CoverOverlay 
        invitation={invitation} 
        guestName={guestName} 
        overlayBg="bg-[#f2f5f0]" // sage-50
        titleFont={displayFont.className}
        subtitleFont={bodyFont.className}
        accentColor="text-[#3e5233]" // sage-800
        btnBg="bg-[#5e7a4c] shadow-lg shadow-[#5e7a4c]/30 hover:bg-[#3e5233]"
      />

      {/* Music Player */}
      {invitation.music_url && (
        <MusicPlayer musicUrl={invitation.music_url} btnBg="bg-[#5e7a4c]" btnColor="text-white" btnBorder="border-none shadow-lg shadow-[#5e7a4c]/40" />
      )}

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 leaf-bg overflow-hidden">
        {/* Decorative corners */}
        <div className="absolute top-8 left-8 w-24 h-24 border-t-2 border-l-2 border-[#8aab75]/40 rounded-tl-3xl z-0"></div>
        <div className="absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-[#8aab75]/40 rounded-tr-3xl z-0"></div>
        <div className="absolute bottom-8 left-8 w-24 h-24 border-b-2 border-l-2 border-[#8aab75]/40 rounded-bl-3xl z-0"></div>
        <div className="absolute bottom-8 right-8 w-24 h-24 border-b-2 border-r-2 border-[#8aab75]/40 rounded-br-3xl z-0"></div>

        <div className="relative z-10 w-full flex flex-col items-center justify-center">
          {guestName && (
            <>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#5e7a4c]/70 mb-2 reveal">Teruntuk</p>
              <p className={`${displayFont.className} text-xl italic text-[#3e5233] mb-6 reveal`}>{guestName}</p>
            </>
          )}

          {/* Couple Photo */}
          {invitation.cover_photo && (() => { const cp = Array.isArray(invitation.cover_photo) ? invitation.cover_photo[0] : invitation.cover_photo; return cp ? (
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white shadow-2xl mb-8 reveal">
              <img src={cp.startsWith?.('http') ? cp : `${STORAGE_URL}/${cp}`} alt="Cover" className="w-full h-full object-cover" />
            </div>
          ) : null; })()}

          <p className="text-xs tracking-[0.4em] uppercase text-[#c4a87c] mb-4 reveal">You Are Invited To</p>
          <p className="text-xs tracking-[0.3em] uppercase text-[#5e7a4c] mb-2 reveal">The Wedding Celebration Of</p>

          <h1 className={`${displayFont.className} text-5xl md:text-7xl font-semibold text-[#3e5233] leading-tight mt-4 reveal`}>
            {invitation.groom_name}
          </h1>
          <div className="my-5 flex items-center justify-center gap-4 reveal">
            <div className="w-12 h-px bg-[#8aab75]"></div>
            <svg className="w-6 h-6 text-[#8aab75]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>
            <div className="w-12 h-px bg-[#8aab75]"></div>
          </div>
          <h1 className={`${displayFont.className} text-5xl md:text-7xl font-semibold text-[#3e5233] leading-tight reveal`}>
            {invitation.bride_name}
          </h1>
          <p className="mt-10 text-sm text-[#c4a87c] reveal">
            {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Couple Profile */}
      <CoupleProfile 
        invitation={invitation}
        sectionBg="bg-[#f2f5f0]" 
        titleFont={bodyFont.className} 
        nameFont={displayFont.className}
        accentText="text-[#3e5233]"
        subtitleText="text-[#8aab75]"
        borderColor="border-[#e4eadf]"
      />

      {/* Story / Description */}
      {invitation.description && (
        <section className="px-6 py-20 max-w-2xl mx-auto text-center reveal">
          <svg className="w-10 h-10 mx-auto text-[#8aab75] mb-6" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/></svg>
          <p className={`${displayFont.className} text-xl italic leading-relaxed text-gray-600`}>
            &quot;{invitation.description}&quot;
          </p>
        </section>
      )}

      {/* Event Details */}
      <div id="events"></div>
      <section className="px-6 py-20 bg-[#f2f5f0] reveal">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.4em] uppercase text-[#5e7a4c] mb-8">Wedding Details</p>

          <div className="bg-white rounded-3xl p-10 shadow-sm border border-[#e4eadf]">
            <div className="grid md:grid-cols-2 gap-10 divide-y md:divide-y-0 md:divide-x divide-[#e4eadf]">
              <div className="pb-6 md:pb-0 md:pr-10">
                <svg className="w-8 h-8 mx-auto text-[#8aab75] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
                <h3 className={`${displayFont.className} text-xl text-[#3e5233] mb-2`}>Waktu</h3>
                <p className="text-sm text-gray-500">
                  {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {invitation.event_time && <p className="text-sm text-gray-500 mt-1">Pukul {invitation.event_time} WIB</p>}
              </div>
              <div className="pt-6 md:pt-0 md:pl-10">
                <svg className="w-8 h-8 mx-auto text-[#8aab75] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                <h3 className={`${displayFont.className} text-xl text-[#3e5233] mb-2`}>Lokasi</h3>
                <p className="text-sm text-gray-500">{invitation.location}</p>
                {invitation.latitude && invitation.longitude && (
                  <a href={`https://maps.google.com/?q=${invitation.latitude},${invitation.longitude}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#5e7a4c] text-xs mt-3 hover:underline font-medium w-fit mx-auto">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                    Buka di Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-14 max-w-lg mx-auto">
            <CountdownTimer 
              eventDate={invitation.event_date} 
              eventTime={invitation.event_time}
              numberFont={`${displayFont.className} font-bold text-[#3e5233] text-3xl`}
              labelFont="font-sans"
              textColor=""
              accentColor="bg-white rounded-2xl p-5 shadow-sm border border-[#e4eadf]"
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      {invitation.gallery && invitation.gallery.length > 0 && (
        <Gallery 
          invitation={invitation}
          sectionBg="bg-[#f5efe6]"
          titleFont={displayFont.className}
          accentText="text-[#5e7a4c]"
          borderColor="border-[#e4eadf]"
        />
      )}

      {/* Multi Events List */}
      <Events 
        invitation={invitation}
        sectionBg="bg-[#f2f5f0]"
        cardBg="bg-white"
        titleFont={bodyFont.className}
        nameFont={displayFont.className}
        accentText="text-[#3e5233]"
        btnBg="bg-[#5e7a4c]"
        btnHoverBg="hover:bg-[#3e5233]"
        btnBorder="border-[#8aab75]"
        iconBg="bg-[#e4eadf] text-[#3e5233]"
      />

      {/* Love Story Timeline */}
      {(invitation.loveStories || invitation.love_stories) && (invitation.loveStories || invitation.love_stories).length > 0 && (
        <LoveStory 
          invitation={invitation}
          sectionBg="bg-[#f5efe6]"
          titleFont={displayFont.className}
          accentText="text-[#5e7a4c]"
          borderColor="border-[#8aab75]/40"
          cardBg="bg-white border border-[#e4eadf]"
        />
      )}

      {/* Gift Accounts */}
      <div id="gift"></div>
      {(invitation.giftAccounts || invitation.gift_accounts) && (invitation.giftAccounts || invitation.gift_accounts).length > 0 && (
        <GiftAccounts 
          invitation={invitation}
          sectionBg="bg-[#f2f5f0]"
          titleFont={displayFont.className}
          accentText="text-[#3e5233]"
          cardBg="bg-white border border-[#e4eadf]"
          btnBg="bg-[#5e7a4c] hover:bg-[#3e5233]"
        />
      )}

      {/* RSVP & Guestbook */}
      <div id="wishes"></div>
      <section className="px-6 py-20 bg-[#f5efe6] reveal">
        <div className="max-w-xl mx-auto">
          
          
          <QrCheckin guest={guest} sectionBg='bg-transparent' />
            <Guestbook 
            invitation={invitation}
            guestName={guestName}
            guestToken={guest?.token}
            btnClasses="w-full bg-[#5e7a4c] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#3e5233] transition-colors"
            inputClasses="w-full border border-[#c9d5bf] rounded-xl px-4 py-3 text-sm bg-white focus:border-[#5e7a4c] outline-none mb-3"
            msgCardClasses="bg-[#f2f5f0] rounded-xl p-5 border border-[#e4eadf] mb-3"
            nameFont="font-sans"
            msgFont={bodyFont.className}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 text-center bg-[#f2f5f0] border-t border-[#e4eadf]">
        <p className={`${displayFont.className} text-2xl text-[#3e5233]`}>{invitation.groom_name} & {invitation.bride_name}</p>
        <p className="text-xs text-[#8aab75] mt-2">With love and gratitude</p>
      </footer>

      {/* Bottom Navigation */}
      <BottomNav 
        navBg="bg-[#f2f5f0]/95"
        navActive="text-[#3e5233]"
        navInactive="text-[#8aab75] hover:text-[#5e7a4c]"
        navBorder="border-[#e4eadf]"
      />

    </div>
  );
}
