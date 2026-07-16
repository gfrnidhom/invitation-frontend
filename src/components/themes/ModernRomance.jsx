'use client';

import React, { useEffect, useState } from 'react';
import { Alex_Brush, Montserrat, Playfair_Display } from 'next/font/google';
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

const scriptFont = Alex_Brush({ 
  subsets: ['latin'], 
  weight: ['400'],
  style: ['normal'] 
});

const sansFont = Montserrat({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600'],
  style: ['normal']
});

const serifFont = Playfair_Display({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700'],
  style: ['normal', 'italic']
});

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function ModernRomance({ payload, audioController }) {
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

  const dividerImage = (invitation.photos && invitation.photos.length > 0) 
    ? `${STORAGE_URL}/${invitation.photos[0]}` 
    : 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2670&auto=format&fit=crop';
    
  const footerImage = (invitation.photos && invitation.photos.length > 1) 
    ? `${STORAGE_URL}/${invitation.photos[1]}` 
    : dividerImage;

  return (
    <div className={`min-h-screen bg-[#fcfaf9] text-gray-800 antialiased overflow-x-hidden ${sansFont.className}`}>
      
      <style jsx global>{`
        .reveal { opacity: 0; transform: translateY(30px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .parallax { background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover; }
        .glass-dark { background: rgba(20, 20, 20, 0.6); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .glass-light { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .animate-fade-in { animation: fadeIn 1.5s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Cover Overlay */}
      <CoverOverlay 
        invitation={invitation} 
        guestName={guestName} 
        onOpen={() => {
          setIsOpened(true);
          audioController?.play();
        }}
        overlayBg="bg-[#fcfaf9]" // romance-50
        titleFont={serifFont.className}
        subtitleFont={sansFont.className}
        accentColor="text-[#875b3d]" // romance-700
        btnBg="bg-[#c5a587] text-white shadow-lg hover:bg-[#a3714b]" // romance-400
      />

      {/* Music Player */}
      {invitation.music_url && (
        <MusicPlayer 
          audioController={audioController} 
          btnBg="glass-light backdrop-blur-md border border-[#e6dacd]" 
          btnColor="text-[#a3714b]" 
          btnBorder="" 
        />
      )}

      {/* Hero Section */}
      <section 
        id="home" 
        className="min-h-screen relative flex flex-col items-center justify-center text-center px-6 parallax"
        style={{ backgroundImage: `url('${(() => { const cp = invitation.cover_photo ? (Array.isArray(invitation.cover_photo) ? invitation.cover_photo[0] : invitation.cover_photo) : null; return cp ? (cp.startsWith?.('http') ? cp : `${STORAGE_URL}/${cp}`) : 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2669&auto=format&fit=crop'; })()}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        
        <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
          {guestName && (
            <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-xs uppercase tracking-[0.3em] text-[#d7c4af] mb-2">Teruntuk</p>
              <p className={`${serifFont.className} text-2xl text-white italic`}>{guestName}</p>
              <div className="h-px w-24 bg-[#c5a587] mx-auto mt-4"></div>
            </div>
          )}

          <p className="text-xs tracking-[0.5em] uppercase text-[#e6dacd] mb-6">The Wedding Of</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8 w-full">
            <h1 className={`${serifFont.className} text-5xl md:text-7xl !leading-tight text-white tracking-wide`}>
              {invitation.groom_name?.split(' ')[0]}
            </h1>
            <span className={`${scriptFont.className} text-5xl md:text-7xl text-[#c5a587]`}>&</span>
            <h1 className={`${serifFont.className} text-5xl md:text-7xl !leading-tight text-white tracking-wide`}>
              {invitation.bride_name?.split(' ')[0]}
            </h1>
          </div>

          <p className="text-sm text-[#f5f0ec] tracking-[0.3em] uppercase">
            {new Date(invitation.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' . ')}
          </p>

          <svg className="w-16 h-16 text-[#c5a587] mt-12 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 22S4 16 4 9a8 8 0 0 1 16 0c0 7-8 13-8 13z"/><path d="M12 22V9"/></svg>
        </div>
      </section>


      {/* Turut Mengundang */}
      <TurutMengundang 
        invitation={invitation}
        sectionBg="bg-[#fcfaf9]"
        titleFont={serifFont.className}
        accentText="text-gray-700"
        subtitleText="text-[#a3714b]"
        borderColor="border-[#d7c4af]"
      />

      {/* Quote */}
      {invitation.quotes && (
        <section className="py-24 px-6 bg-white reveal">
          <div className="max-w-3xl mx-auto text-center relative">
            <div className="flex justify-center mb-8 opacity-40 text-[#b68b64]">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
                <circle cx="9" cy="12" r="6" />
                <circle cx="15" cy="12" r="6" />
              </svg>
            </div>
            <p className={`${serifFont.className} text-xl md:text-2xl leading-loose text-gray-600 italic`}>
              &quot;{invitation.quotes}&quot;
            </p>
            {invitation.quotes_name && <p className="text-[10px] text-[#a3714b] tracking-widest uppercase mt-4">{invitation.quotes_name}</p>}
          </div>
        </section>
      )}

      {/* Couple Profiles */}
      <section className="py-24 px-6 bg-[#fcfaf9] relative reveal overflow-hidden">
        <svg className="absolute top-0 right-0 w-64 h-64 text-[#e6dacd] opacity-20 transform translate-x-1/3 -translate-y-1/3" viewBox="0 0 100 100"><path fill="currentColor" d="M50 0 C77.6 0 100 22.4 100 50 C100 77.6 77.6 100 50 100 C22.4 100 0 77.6 0 50 C0 22.4 22.4 0 50 0 Z M50 5 C25.1 5 5 25.1 5 50 C5 74.9 25.1 95 50 95 C74.9 95 95 74.9 95 50 C95 25.1 74.9 5 50 5 Z"/></svg>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className={`${scriptFont.className} text-5xl md:text-6xl text-[#a3714b] mb-4`}>Groom & Bride</h2>
            <div className="h-px w-20 bg-[#d7c4af] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 md:gap-8 items-center">
            {/* Groom */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-64 h-[22rem] overflow-hidden mb-8 relative bg-white p-3 shadow-xl transform transition duration-700 group-hover:-translate-y-2">
                <div className="absolute inset-x-3 top-3 bottom-12 border border-[#e6dacd] z-10 pointer-events-none"></div>
                {invitation.groom_photo ? (
                  <img src={`${STORAGE_URL}/${invitation.groom_photo}`} alt="Groom" className="w-full h-full object-cover filter contrast-[0.9] sepia-[0.1]" />
                ) : (
                  <div className="w-full h-full bg-[#f5f0ec] flex items-center justify-center text-[#d7c4af]">
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </div>
                )}
              </div>
              <h3 className={`${serifFont.className} text-3xl text-gray-800 mb-2`}>{invitation.groom_full_name ?? invitation.groom_name}</h3>
              <p className="text-sm text-gray-500 tracking-widest uppercase mb-4">The Groom</p>
              <p className="text-sm text-gray-500">Putra {invitation?.groom_child_order ? `${invitation.groom_child_order} ` : ""}dari<br/><span className={`${serifFont.className} italic text-gray-700`}>{invitation.groom_father} & {invitation.groom_mother}</span></p>
              {invitation?.groom_instagram && (
                <a href={`https://instagram.com/${invitation.groom_instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#a3714b] hover:text-[#825636] transition-colors font-medium">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  @{invitation.groom_instagram}
                </a>
              )}
            </div>

            {/* Bride */}
            <div className="flex flex-col items-center text-center group md:mt-24">
              <div className="w-64 h-[22rem] overflow-hidden mb-8 relative bg-white p-3 shadow-xl transform transition duration-700 group-hover:-translate-y-2">
                <div className="absolute inset-x-3 top-3 bottom-12 border border-[#e6dacd] z-10 pointer-events-none"></div>
                {invitation.bride_photo ? (
                  <img src={`${STORAGE_URL}/${invitation.bride_photo}`} alt="Bride" className="w-full h-full object-cover filter contrast-[0.9] sepia-[0.1]" />
                ) : (
                  <div className="w-full h-full bg-[#f5f0ec] flex items-center justify-center text-[#d7c4af]">
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </div>
                )}
              </div>
              <h3 className={`${serifFont.className} text-3xl text-gray-800 mb-2`}>{invitation.bride_full_name ?? invitation.bride_name}</h3>
              <p className="text-sm text-gray-500 tracking-widest uppercase mb-4">The Bride</p>
              <p className="text-sm text-gray-500">Putri {invitation?.bride_child_order ? `${invitation.bride_child_order} ` : ""}dari<br/><span className={`${serifFont.className} italic text-gray-700`}>{invitation.bride_father} & {invitation.bride_mother}</span></p>
              {invitation?.bride_instagram && (
                <a href={`https://instagram.com/${invitation.bride_instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#a3714b] hover:text-[#825636] transition-colors font-medium">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  @{invitation.bride_instagram}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Divider */}
      <section className="h-[60vh] min-h-[400px] parallax relative flex items-center justify-center bg-gray-900" style={{ backgroundImage: `url('${dividerImage}')` }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-6">
          <h2 className={`${scriptFont.className} text-6xl text-white mb-6`}>Wedding Events</h2>
          <div className="h-px w-24 bg-white/50 mx-auto"></div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24 px-6 bg-white reveal">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {invitation.events?.length > 0 ? invitation.events.map((event, idx) => (
              <div key={idx} className="border border-[#e6dacd] p-10 text-center relative bg-[#fcfaf9]/30">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#d7c4af] to-transparent"></div>
                <svg className="w-10 h-10 mx-auto text-[#c5a587] mb-6" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                
                <h3 className={`${serifFont.className} text-2xl text-gray-800 mb-2`}>{event.name}</h3>
                <p className="text-xs uppercase tracking-widest text-[#a3714b] mb-6">
                  {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                
                <div className="space-y-4 text-sm text-gray-600 mb-8">
                  <p className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-[#c5a587]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {event.time_start?.substring(0, 5)} - {event.time_end?.substring(0, 5)} WIB
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-[#c5a587] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {event.location}
                    <span className="block text-[9px] opacity-70 max-w-[200px] mx-auto text-center mt-1">{event.address || ''}</span>
                  </p>
                </div>

                {event.latitude && event.longitude && (
                  <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer" className="inline-block border border-[#a3714b] text-[#a3714b] px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-[#a3714b] hover:text-white transition-colors">
                    Buka di Google Maps
                  </a>
                )}
              </div>
            )) : (
              <div className="col-span-full border border-[#e6dacd] p-10 text-center bg-[#fcfaf9]/30">
                <h3 className={`${serifFont.className} text-2xl text-gray-800 mb-2`}>Acara Pernikahan</h3>
                <p className="text-xs uppercase tracking-widest text-[#a3714b] mb-6">
                  {new Date(invitation.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-sm text-gray-600 mb-8">{invitation.location}</p>
                {invitation.latitude && invitation.longitude && (
                  <a href={`https://maps.google.com/?q=${invitation.latitude},${invitation.longitude}`} target="_blank" rel="noreferrer" className="inline-block border border-[#a3714b] text-[#a3714b] px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-[#a3714b] hover:text-white transition-colors">
                    Buka di Maps
                  </a>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-16 max-w-lg mx-auto">
            <CountdownTimer 
              eventDate={invitation.event_date} 
              eventTime={invitation.event_time}
              numberFont={`${serifFont.className} text-4xl sm:text-5xl text-gray-800`}
              labelFont="text-[9px] uppercase tracking-widest text-gray-500"
              textColor=""
              accentColor="bg-transparent border-t border-[#e6dacd] pt-4"
              layout="divider" // Custom prop we could add, or relying on our default Grid. We'll use default Grid which works out.
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <Gallery 
        layout="abstract" 
        invitation={invitation}
        sectionBg="bg-[#fcfaf9]"
        titleFont={scriptFont.className}
        titleSize="text-5xl md:text-6xl"
        accentText="text-[#a3714b]"
        borderColor="border-[#d7c4af]"
        imgClasses="bg-white p-2 shadow-md filter contrast-[0.95]"
      />

      {/* Love Story Timeline */}
      {(invitation.loveStories || invitation.love_stories) && (invitation.loveStories || invitation.love_stories).length > 0 && (
        <LoveStory 
          invitation={invitation}
          sectionBg="bg-white"
          titleFont={scriptFont.className}
          titleSize="text-5xl md:text-6xl"
          accentText="text-[#a3714b]"
          borderColor="border-[#c5a587]/40"
          cardBg="bg-[#fcfaf9] border border-[#e6dacd]"
        />
      )}

      {/* Gift Packages / Amplop Digital */}
      <div id="gift"></div>
      {(invitation.giftAccounts || invitation.gift_accounts) && (invitation.giftAccounts || invitation.gift_accounts).length > 0 && (
        <GiftAccounts variant="ModernRomance" 
          invitation={invitation}
          sectionBg="bg-[#fcfaf9]"
          titleFont={scriptFont.className}
          titleSize="text-5xl md:text-6xl"
          accentText="text-[#a3714b]"
          cardBg="bg-white border border-[#e6dacd]"
          btnBg="border border-[#a3714b] text-[#a3714b] hover:bg-[#a3714b] hover:text-white bg-transparent"
        />
      )}

      {/* RSVP & Guestbook */}
      <div id="wishes"></div>
      
      <section className="py-24 px-6 parallax relative bg-gray-900 reveal" style={{ backgroundImage: `url('${footerImage}')` }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          {/* RSVP Removed */}

          <div className="glass-dark rounded-sm p-8 md:p-12">
            

            <QrCheckin guest={guest} sectionBg='bg-transparent' />
            <Guestbook 
              invitation={invitation}
              guestName={guestName}
              guestToken={guest?.token}
              btnClasses="w-full bg-white text-gray-900 text-xs uppercase tracking-widest py-4 hover:bg-gray-200 transition-colors"
              inputClasses="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 px-5 py-4 focus:outline-none focus:border-white/50 transition-colors text-sm mb-4"
              msgCardClasses="bg-white/5 border border-white/10 p-6 mb-4"
              nameClasses="text-[10px] uppercase tracking-widest text-[#d7c4af]"
              msgClasses={`${serifFont.className} text-white/90 italic mb-4`}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* ── FOOTER ── */}
                <footer className="bg-[#fcfaf9] text-gray-800 pt-64 pb-24 px-8 text-center relative overflow-hidden">
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 z-0">
                        {invitation?.footer_image ? (
                            <img src={getPhoto(invitation.footer_image)} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof landingPhoto !== 'undefined' && landingPhoto ? (
                            <img src={landingPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof coverPhoto !== 'undefined' && coverPhoto ? (
                            <img src={coverPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : (
                            <div className="w-full h-full bg-[#fcfaf9] opacity-40"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf9] via-[#fcfaf9]/60 to-transparent" />
                    </div>
                    
                    {/* Content Layer */}
                    <div className="relative z-10 pt-10">
                        <p className={`${poppins.className} text-[10px] text-black/50 tracking-[0.3em] uppercase font-bold mb-4`}>
                            Thank you for being part of our special day
                        </p>
                        <h2 className={`${cormorant.className} text-5xl mb-4 text-gray-800 drop-shadow-sm`}>
                            {invitation?.groom_name?.split(' ')[0]} <span className="text-black/50 font-light mx-2">&</span> {invitation?.bride_name?.split(' ')[0]}
                        </h2>
                        
                        {/* Branding */}
                        <div className="border-t border-gray-800/10 pt-8 mt-12">
                            <p className="text-[9px] text-gray-800/40 tracking-[0.2em] uppercase mb-2">Digital Invitation by</p>
                            <a href="https://digitvitation.my.id" target="_blank" rel="noreferrer" className="inline-block text-black/80 hover:text-black transition-colors">
                                <span className={`${cormorant.className} text-lg font-bold tracking-wider uppercase`}>Digivitation</span>
                            </a>
                            <p className="text-[8px] text-gray-800/30 mt-2 tracking-wider">© {new Date().getFullYear()} Digivitation. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

      {/* Bottom Navigation */}
      <BottomNav 
        navBg="bg-[#fcfaf9]/95 border-t border-[#e6dacd] shadow-[0_-4px_25px_rgba(0,0,0,0.03)]"
        navActive="text-[#a3714b]"
        navInactive="text-gray-400 hover:text-[#b68b64]"
        navBorder="border-none"
      />

    </div>
  );
}
