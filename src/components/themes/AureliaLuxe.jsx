'use client';

import GiftAtmCard from './partials/GiftAtmCard';
import React, { useEffect, useRef, useState } from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import VideoEmbed from './partials/VideoEmbed';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';

// Google Fonts for Modern Minimalist Look
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'] });

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function AureliaLuxe({ payload, audioController }) {
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
    const [isOpen, setIsOpen] = useState(false);

    // Form Guestbook state
    const [guestNameInput, setGuestNameInput] = useState(guestName || '');
    const [wishInput, setWishInput] = useState('');
    const [wishes, setWishes] = useState(invitation?.guestMessages || []);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Fetch wishes (demo or api hook)
        // In actual implementation it might use SWR or custom fetch
        // For visual sake, we render an empty array or handle it if passed via payload.
    }, []);

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

    // Get primary photo helper
    const getPhoto = (p) => {
        if (!p) return null;
        let photo = Array.isArray(p) ? p[0] : p;
        if (typeof photo === 'object' && photo.photo) photo = photo.photo;
        if (!photo.startsWith('http')) photo = `${STORAGE_URL}/${photo}`;
        return photo;
    };

    const handleOpenInvitation = () => {
        setIsOpen(true);
        audioController?.play();
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };



    // Date formatting helpers
    const eventDate = (() => {
        if (!invitation?.event_date) return new Date();
        
        // Parse the UTC date safely into local time first to avoid timezone subtraction bugs
        let baseDate = new Date(invitation.event_date.replace(' ', 'T'));
        if (isNaN(baseDate)) {
            // Fallback for Safari if strictly YYYY-MM-DD
            baseDate = new Date(invitation.event_date.split('T')[0].split(' ')[0] + 'T00:00:00');
        }
        
        const y = baseDate.getFullYear();
        const m = String(baseDate.getMonth() + 1).padStart(2, '0');
        const day = String(baseDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        
        let timeStr = '08:00';
        if (invitation.event_time) {
            let match = invitation.event_time.replace(/\./g, ':').match(/(\d{1,2}:\d{2})/);
            if (match) {
                timeStr = match[0];
                if (timeStr.length === 4) timeStr = '0' + timeStr;
            }
        }
        
        const d = new Date(`${dateStr}T${timeStr}:00`);
        return isNaN(d) ? baseDate : d;
    })();
    const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const monthName = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dateNum = eventDate.toLocaleDateString('en-US', { day: '2-digit' });
    const yearNum = eventDate.toLocaleDateString('en-US', { year: '2-digit' });
    
    const photos = invitation?.photos || [];
    const coverPhoto = getPhoto(invitation?.cover_photo) || getPhoto(photos[0]);
    const groomPhoto = getPhoto(invitation?.groom_photo);
    const bridePhoto = getPhoto(invitation?.bride_photo);

    return (
        <div className={`min-h-screen bg-white text-gray-900 ${inter.className} overflow-x-hidden relative modern-monochrome`}>
            {/* Global Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .modern-monochrome .reveal { opacity: 0; transform: translateY(30px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
        .modern-monochrome .reveal.active { opacity: 1; transform: translateY(0); }
        .arch-frame { border-radius: 15rem 15rem 0 0; }
        .text-outline { -webkit-text-stroke: 1px rgba(0,0,0,0.1); color: transparent; }
        .masonry { column-count: 2; column-gap: 1rem; }
        @media (min-width: 768px) { .masonry { column-count: 3; } }
        .masonry-item { break-inside: avoid; margin-bottom: 1rem; }
        `}} />

            {/* Audio Toggle */}
            {invitation?.music_url && (
                <MusicPlayer audioController={audioController} btnBg="bg-black" btnColor="text-white" btnBorder="border-none" />
            )}

            {/* HEADER HERO (Full Screen height minus a bit if scrolled) */}
            <section className="relative min-h-screen flex flex-col pt-12 px-6 md:px-20 max-w-7xl mx-auto items-center justify-center overflow-hidden">
                {/* Minimalist Top Nav (Optional visual element) */}
                <div className="absolute top-8 left-0 w-full flex justify-center gap-10 text-[10px] tracking-[0.2em] font-medium text-gray-500 uppercase z-20">
                    <span>Wedding</span>
                    <span>Invitation</span>
                </div>

                <div className="flex flex-col-reverse md:flex-row items-center w-full gap-12 mt-10 md:mt-0 relative z-10">
                    {/* Left Typography */}
                    <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-10">
                        <div className="mb-8">
                            <svg className="w-10 h-10 mx-auto md:mx-0 text-gray-800 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1" d="M12 21.5c-4.5 0-8.5-3.5-8.5-8 0-5.5 8.5-12 8.5-12s8.5 6.5 8.5 12c0 4.5-4 8-8.5 8z" /><circle cx="12" cy="11" r="3" strokeWidth="1" /></svg>
                            <p className="text-[9px] tracking-[0.3em] font-semibold text-gray-400 uppercase">Wedding Invitation</p>
                        </div>

                        <h1 className={`${playfair.className} text-6xl md:text-8xl lg:text-[110px] font-bold leading-[0.9] text-gray-900 mb-8`}>
                            {invitation?.groom_name} <br />
                            <span className="text-gray-400 font-normal italic pr-4">& </span> 
                            {invitation?.bride_name}
                        </h1>

                        <div className="flex flex-col justify-start mb-12">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Request The Honor</p>
                            <p className="text-sm font-medium text-gray-900 tracking-wider">SAVE THE DATE</p>
                        </div>
                        
                        {guestName && (
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-300 pb-2 inline-block">Untuk: <span className="text-gray-900 font-bold">{guestName}</span></p>
                        )}

                        <button onClick={handleOpenInvitation} className="mt-4 px-10 py-3 border border-gray-300 text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all bg-white shadow-sm">
                            Open Invitation
                        </button>
                    </div>

                    {/* Right Arch Image */}
                    <div className="w-full md:w-1/2 relative flex justify-center md:justify-end">
                        {/* Background Giant Text */}
                        <div className={`${playfair.className} absolute right-0 top-1/2 -translate-y-1/2 text-[18vh] md:text-[25vh] leading-[0.7] text-outline font-bold text-right opacity-30 select-none z-0`} style={{ writingMode: 'vertical-rl' }}>
                            {dateNum}<br/>{yearNum}
                        </div>

                        {(landingPhoto || coverPhoto) ? (
                            <div className="relative z-10 w-64 h-[28rem] md:w-80 md:h-[36rem] arch-frame overflow-hidden border border-gray-100 shadow-xl bg-gray-100 mix-blend-multiply filter grayscale contrast-125">
                                <img src={landingPhoto || coverPhoto} alt="Cover" className="w-full h-full object-cover origin-top" />
                            </div>
                        ) : (
                            <div className="relative z-10 w-64 h-[28rem] md:w-80 md:h-[36rem] arch-frame border border-gray-200 bg-gray-50 flex items-center justify-center">
                                <span className="text-gray-300">No Photo</span>
                            </div>
                        )}
                        
                        {/* Botanical line art overlay (Optional) */}
                        <div className="absolute inset-0 z-20 opacity-20 pointer-events-none mix-blend-darken bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT (Revealed by Scroll after click) */}
            <main className={`bg-gray-50 transition-all duration-[1500ms] ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-32 pointer-events-none'}`}>
                
                {/* 2. BRIDE & GROOM SECTION (Two Circles) */}
                <section className="py-24 bg-white relative reveal">
                    <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full">
                            
                            {/* Bride */}
                            <div className="flex flex-col items-center flex-1">
                                <h3 className={`${playfair.className} text-3xl md:text-4xl text-gray-900 mb-6 font-bold`}>{invitation?.bride_name}</h3>
                                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden filter grayscale contrast-125 bg-gray-100 shadow-md">
                                    {bridePhoto ? <img src={bridePhoto} className="w-full h-full object-cover" alt="Bride" /> : <div className="w-full h-full bg-gray-200" />}
                                </div>
                                <div className="flex gap-1 mt-6">
                                    {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full border border-gray-400"></div>)}
                                </div>
                            </div>

                            {/* Center Ampersand */}
                            <div className={`${playfair.className} text-6xl md:text-8xl text-gray-900 font-bold opacity-80 shrink-0 my-8 md:my-0`}>
                                &
                            </div>

                            {/* Groom */}
                            <div className="flex flex-col items-center flex-1">
                                <div className="flex gap-1 mb-6">
                                    {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full border border-gray-400"></div>)}
                                </div>
                                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden filter grayscale contrast-125 bg-gray-100 shadow-md">
                                    {groomPhoto ? <img src={groomPhoto} className="w-full h-full object-cover" alt="Groom" /> : <div className="w-full h-full bg-gray-200" />}
                                </div>
                                <h3 className={`${playfair.className} text-3xl md:text-4xl text-gray-900 mt-6 font-bold`}>{invitation?.groom_name}</h3>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. WEDDING DAY TIMELINE */}
                <section className="py-24 bg-gray-50 text-center px-6 reveal">
                    <div className="max-w-2xl mx-auto">
                        <svg className="w-8 h-8 mx-auto text-gray-800 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        
                        <h2 className={`${playfair.className} text-5xl md:text-6xl text-gray-900 mb-10 font-bold`}>Wedding Day</h2>
                        
                        {/* Calendar Ribbon */}
                        <div className="flex justify-center gap-6 md:gap-12 mb-10 text-gray-900 uppercase font-bold tracking-widest text-[11px] md:text-sm border-y border-gray-300 py-6 w-full max-w-sm mx-auto">
                            <span>{monthName}</span>
                            <span>{dayName}</span>
                            <span>{dateNum}</span>
                            <span>20{yearNum}</span>
                        </div>

                        {/* Divider Ornaments */}
                        <div className="flex items-center justify-center gap-4 text-gray-300 mb-16">
                            <div className="h-px w-16 bg-gray-300"></div>
                            <span>♦</span>
                            <div className="h-px w-16 bg-gray-300"></div>
                        </div>

                        {/* Events Box */}
                        <div className="grid gap-16">
                            {invitation?.events && invitation.events.length > 0 ? (
                                [...invitation.events].sort((a,b) => a.sort_order - b.sort_order).map((event, index, arr) => (
                                    <div key={event.id || index} className={`flex flex-col md:flex-row items-center md:items-start justify-between text-center md:text-left gap-6 ${index !== arr.length - 1 ? 'border-b border-gray-200 pb-12' : 'pb-4'}`}>
                                        <div className="md:w-1/4">
                                            <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] mb-2 uppercase">Time</p>
                                            <p className={`${playfair.className} text-xl md:text-3xl text-gray-900 font-bold`}>{event.time_start?.substring(0, 5) || 'TBA'} {event.time_start && !event.time_start.includes('WIB') && 'WIB'}</p>
                                            {event.time_end && <p className="text-[11px] text-gray-500 mt-1">to {event.time_end.substring(0, 5)} WIB</p>}
                                        </div>
                                        <div className="md:w-1/2 flex flex-col items-center">
                                            <p className="text-xl md:text-2xl font-bold tracking-widest text-gray-900 uppercase mb-4">{event.name}</p>
                                            <p className="text-xs text-gray-600 font-medium uppercase tracking-widest mb-1">
                                                {event.date ? new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'}) : ''}
                                            </p>
                                            <div className="space-y-1">
                                                <p className="text-[11px] text-gray-400 capitalize max-w-[200px] text-center">{event.location}</p>
                                                <p className="text-[9px] leading-relaxed max-w-[200px] mx-auto opacity-70">
                                                    {event.address || ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="md:w-1/4 flex flex-col items-center md:items-end md:justify-center h-full pt-4">
                                           {event.latitude && event.longitude ? (
                                               <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer" className="w-full text-center px-4 py-2 border border-gray-300 text-[9px] uppercase tracking-widest font-bold text-gray-600 hover:bg-black hover:text-white transition-colors bg-white">
                                                   Google Maps
                                               </a>
                                           ) : (
                                               <span className="w-full text-center px-4 py-2 border border-dashed border-gray-300 text-[9px] uppercase tracking-widest font-bold text-gray-400">
                                                   Lokasi Tertutup
                                               </span>
                                           )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-xs text-gray-400">Belum ada agenda acara yang ditambahkan.</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 4. VIDEO EMBED / STREAMING */}
                <VideoEmbed invitation={invitation} sectionBg="bg-gray-100" textColor="text-gray-900" borderColor="border-gray-300" titleFont={playfair.className} />

                {/* 5. OUR MOMENTS (GRID GALLERY) */}
                <Gallery 
                    invitation={invitation}
                    sectionBg="bg-[#333333]"
                    titleFont={playfair.className}
                    titleSize="text-5xl md:text-6xl font-bold"
                    accentText="text-white"
                    subtitleText="text-gray-400"
                    borderColor="border-gray-600"
                />

                {/* 6. QUOTE CARD (OVERLAPPING BG) */}
                <section className="relative h-40 bg-gray-50 flex items-center justify-center reveal">
                    {/* The dark bg from above continues half-way */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-[#333333]" />
                    
                    <div className="relative z-10 bg-white/95 backdrop-blur-sm px-10 py-12 md:py-16 md:px-20 max-w-3xl w-11/12 mx-auto text-center shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100">
                        <p className={`${playfair.className} text-xl md:text-3xl text-gray-900 font-bold italic leading-relaxed`}>
                            "{invitation?.quotes || 'A happy marriage is a long conversation which always seems too short.'}"
                        </p>
                        <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-4 font-bold">{invitation?.quotes_name || ''}</p>
                    </div>
                </section>

                {/* Turut Mengundang */}
                {(() => {
                    let tmItems = invitation?.turut_mengundang || [];
                    if (typeof tmItems === 'string') { try { tmItems = JSON.parse(tmItems); } catch { tmItems = []; } }
                    if (!Array.isArray(tmItems)) tmItems = [];
                    tmItems = tmItems.filter(t => t && String(t).trim() !== '');
                    if (tmItems.length === 0) return null;
                    return (
                        <section className="py-16 px-6 text-center bg-gray-50 reveal">
                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold mb-6">Turut Mengundang</p>
                            <div className="w-12 h-px bg-gray-300 mx-auto mb-8" />
                            <div className="space-y-2">
                                {tmItems.map((name, i) => (
                                    <p key={i} className={`${playfair.className} text-base text-gray-700 font-medium`}>{name}</p>
                                ))}
                            </div>
                        </section>
                    );
                })()}

                {/* 7. OUR LOVE STORY */}
                <section className="py-24 bg-gray-50 px-6 reveal">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-20">
                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold mb-4">Journey</p>
                            <h2 className={`${playfair.className} text-4xl md:text-5xl text-gray-900 font-bold mb-6`}>Our Love Story</h2>
                            <div className="w-16 h-px bg-gray-400 mx-auto"></div>
                        </div>

                        {/* Zig Zag Layout Placeholder or real data */}
                        {(invitation?.love_stories || invitation?.loveStories)?.length > 0 ? (
                           [...(invitation.love_stories || invitation.loveStories)].sort((a,b) => a.sort_order - b.sort_order).map((story, i) => (
                               <div key={story.id || i} className={`flex flex-col md:flex-row items-center gap-10 mb-20 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                                   <div className="w-full md:w-1/2 bg-white p-10 md:p-16 border border-gray-100 relative shadow-sm">
                                       <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3">
                                           {story.date ? new Date(story.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase() : 'MEMORIES'}
                                       </p>
                                       <h3 className={`${playfair.className} text-xl md:text-2xl font-bold text-gray-900 mb-6`}>{story.title}</h3>
                                       <p className="text-xs text-gray-500 leading-loose text-justify">{story.description}</p>
                                   </div>
                                   <div className="w-full md:w-1/2">
                                       {story.photo ? (
                                           <img src={getPhoto(story.photo)} alt={story.title} className="w-full h-80 object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-700" />
                                       ) : (
                                           <div className="w-full h-80 bg-gray-200 border border-gray-300" />
                                       )}
                                   </div>
                               </div>
                           ))
                        ) : (
                            <div className="flex flex-col md:flex-row items-center gap-10 mb-20">
                                <div className="w-full md:w-1/2 bg-white p-10 md:p-16 border border-gray-100 shadow-sm">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3">MARCH 2021</p>
                                    <h3 className={`${playfair.className} text-2xl font-bold text-gray-900 mb-6`}>Until We Meet</h3>
                                    <p className="text-xs text-gray-500 leading-loose text-justify">It was a casual evening when our eyes first locked across a crowded room. Little did we know that simple moment would spark a lifelong journey of love, laughter, and endless conversations.</p>
                                </div>
                                <div className="w-full md:w-1/2">
                                    {getPhoto(photos[1]) ? (
                                        <img src={getPhoto(photos[1])} className="w-full h-80 object-cover filter grayscale contrast-125" alt="Story placeholder"/>
                                    ) : (
                                        <div className="w-full h-80 bg-gray-200 border border-gray-300" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* 8. RSVP / GUESTBOOK FORM OVERLAY */}
                <section className="py-24 px-6 relative flex items-center justify-center reveal overflow-hidden">
                    {/* Background Image Half/Half effect */}
                    <div className="absolute inset-0 z-0 flex">
                        <div className="w-1/3 md:w-1/2 h-full bg-cover bg-center filter grayscale opacity-40 bg-[url('https://images.unsplash.com/photo-1542037104856-11f2d65cd0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80')]"></div>
                        <div className="w-2/3 md:w-1/2 h-full bg-white"></div>
                    </div>

                    <div className="relative z-10 w-full max-w-5xl mx-auto bg-[#6B7280]/95 backdrop-blur-md rounded-tr-3xl rounded-bl-3xl shadow-2xl overflow-hidden p-10 md:p-14 text-white">
                        <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/3 mb-10 md:mb-0">
                           <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-2`}>RSVP</h2>
                           <p className="text-xs uppercase tracking-widest text-white/70 mb-6">Or Send A Wish</p>
                           <p className="text-[10px] text-white/50 border-t border-white/20 pt-4 max-w-[200px] leading-relaxed">Please let us know if you could make it, or feel free to leave a heartfelt message here.</p>
                        </div>
                        <div className="w-full md:w-2/3 flex flex-col gap-6">
                           <form onSubmit={async (e) => { e.preventDefault(); if(!guestNameInput.trim()||!wishInput.trim())return; setSubmitting(true); try{ const API_URL=process.env.NEXT_PUBLIC_API_URL||'https://app.digitvitation.my.id/api'; await fetch(`${API_URL}/invitations/${invitation.id}/guestbook`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:guestNameInput,message:wishInput})}); setWishes([{name:guestNameInput,message:wishInput,created_at:new Date().toISOString()},...wishes]); setWishInput(''); toast.success('Ucapan terkirim!'); }catch{toast.error('Gagal mengirim ucapan');}finally{setSubmitting(false);} }} className="flex flex-col gap-6">
                           <div className="flex flex-col md:flex-row gap-6">
                               <div className="flex-1">
                                   <label className="block text-[9px] uppercase tracking-widest font-bold mb-2 text-white/70">Your Name</label>
                                   <input type="text" className="w-full bg-white/10 border-b border-white/30 px-0 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors" placeholder="Full Name..." value={guestNameInput} onChange={(e) => setGuestNameInput(e.target.value)}/>
                               </div>
                           </div>
                           <div>
                               <label className="block text-[9px] uppercase tracking-widest font-bold mb-2 text-white/70">Your Wish / Message</label>
                               <textarea className="w-full bg-white/10 border-b border-white/30 px-0 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors h-24 resize-none" placeholder="Write something beautiful..." value={wishInput} onChange={(e) => setWishInput(e.target.value)}></textarea>
                           </div>
                           <button type="submit" disabled={submitting} className="self-end px-12 py-3 bg-white text-[#6B7280] text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors disabled:opacity-50">
                               {submitting ? 'MENGIRIM...' : 'SEND MESSAGE'}
                           </button>
                           </form>
                        </div>
                        </div>
                        {wishes.length > 0 && (
                            <div className="mt-10 pt-8 border-t border-white/15 space-y-3 max-h-[400px] overflow-y-auto">
                                {wishes.map((m, i) => (
                                    <div key={i} className="bg-white/8 rounded-2xl p-4 border border-white/10">
                                        <p className="text-sm text-white/70">{m.message}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
                                                <span className="text-white text-[10px] font-bold">{m.name?.charAt(0)?.toUpperCase()}</span>
                                            </div>
                                            <p className="text-xs text-white/40">{m.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* QR CHECKIN */}
                <QrCheckin 
                  guest={guest} 
                  sectionBg="bg-white" 
                  titleFont={playfair.className}
                  textColor="text-gray-900"
                  borderStyle="border-gray-200"
                />

                {/* 9. SEND YOUR GIFT */}
                <section className="py-24 bg-white text-center px-6 reveal">
                    <div className="max-w-4xl mx-auto">
                        <svg className="w-10 h-10 mx-auto text-gray-800 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>
                        <h2 className={`${playfair.className} text-4xl md:text-5xl text-gray-900 font-bold mb-16`}>Send Your Gift</h2>

                        <div className="grid md:grid-cols-3 justify-center gap-8">
                            {invitation?.gift_accounts && invitation.gift_accounts.length > 0 ? (
                                invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={`${(i % 3) + 1}`} variant="AureliaLuxe" />
                            ))
                            ) : (
                                <div className="col-span-3 text-center text-xs text-gray-400 py-10">Belum ada informasi rekening hadiah yang ditambahkan.</div>
                            )}

                            {/* Optional Shipping Address if provided */}
                            {(invitation?.groom_address || invitation?.bride_address) && (
                              <div className="border border-gray-100 p-8 flex flex-col items-center shadow-sm justify-center bg-gray-50 mt-4 md:mt-0 col-span-full md:col-span-1">
                                   <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">Kirim Kado Fisik</p>
                                   <p className="text-[10px] text-gray-600 text-center leading-relaxed">
                                     {invitation.bride_address || invitation.groom_address}
                                   </p>
                              </div>
                            )}
                        </div>

                    </div>
                    {/* Bottom Ornaments */}
                    <div className="w-full max-w-sm mx-auto mt-20 pt-10 border-t border-gray-200 opacity-60">
                        <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80" alt="Gifts pattern" className="w-full h-24 object-cover filter grayscale" />
                    </div>
                </section>

                {/* 10. FOOTER */}
                {/* ── FOOTER ── */}
                <footer className="bg-gray-100 text-gray-400 pt-64 pb-24 px-8 text-center relative overflow-hidden">
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 z-0">
                        {invitation?.footer_image ? (
                            <img src={getPhoto(invitation.footer_image)} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof landingPhoto !== 'undefined' && landingPhoto ? (
                            <img src={landingPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof coverPhoto !== 'undefined' && coverPhoto ? (
                            <img src={coverPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : (
                            <div className="w-full h-full bg-gray-100 opacity-40"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray via-gray/60 to-transparent" />
                    </div>
                    
                    {/* Content Layer */}
                    <div className="relative z-10 pt-10">
                        <p className={`${poppins.className} text-[10px] text-black/50 tracking-[0.3em] uppercase font-bold mb-4`}>
                            Thank you for being part of our special day
                        </p>
                        <h2 className={`${cormorant.className} text-5xl mb-4 text-gray-400 drop-shadow-sm`}>
                            {invitation?.groom_name?.split(' ')[0]} <span className="text-black/50 font-light mx-2">&</span> {invitation?.bride_name?.split(' ')[0]}
                        </h2>
                        
                        {/* Branding */}
                        <div className="border-t border-gray-400/10 pt-8 mt-12">
                            <p className="text-[9px] text-gray-400/40 tracking-[0.2em] uppercase mb-2">Digital Invitation by</p>
                            <a href="https://digitvitation.my.id" target="_blank" rel="noreferrer" className="inline-block text-black/80 hover:text-black transition-colors">
                                <span className={`${cormorant.className} text-lg font-bold tracking-wider uppercase`}>Digivitation</span>
                            </a>
                            <p className="text-[8px] text-gray-400/30 mt-2 tracking-wider">© {new Date().getFullYear()} Digivitation. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

            </main>
        </div>
    );
}
