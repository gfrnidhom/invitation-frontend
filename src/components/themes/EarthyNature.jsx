'use client';

import GiftAtmCard from './partials/GiftAtmCard';
import React, { useEffect, useRef, useState } from 'react';
import { Cormorant_Garamond, Sacramento, Nunito_Sans } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import VideoEmbed from './partials/VideoEmbed';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';
import { MapLocationButton, getMapUrl } from './partials/MapLocation';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });
const sacramento = Sacramento({ subsets: ['latin'], weight: ['400'] });
const nunito = Nunito_Sans({ subsets: ['latin'], weight: ['300', '400', '600', '700'] });

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function EarthyNature({ payload, audioController }) {
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
    const rightPanelRef = useRef(null);

    const [nameInput, setNameInput] = useState(guestName || '');
    const [messageInput, setMessageInput] = useState('');
    const [wishes, setWishes] = useState(invitation?.guestMessages || []);
    const [submitting, setSubmitting] = useState(false);

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
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date(); const diff = eventDate - now;
            if (diff > 0) {
                setCountdown({ days: Math.floor(diff / (1000*60*60*24)), hours: Math.floor((diff/(1000*60*60))%24), minutes: Math.floor((diff/(1000*60))%60), seconds: Math.floor((diff/1000)%60) });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleScroll = () => { document.querySelectorAll('.en-reveal').forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight - 50) el.classList.add('active'); }); };
        const panel = rightPanelRef.current;
        if (panel) panel.addEventListener('scroll', handleScroll);
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => { if (panel) panel.removeEventListener('scroll', handleScroll); window.removeEventListener('scroll', handleScroll); };
    }, [isOpen]);

    const getPhoto = (p) => {
        if (!p) return null; let photo = p;
        if (typeof photo === 'string' && photo.startsWith('[')) { try { const parsed = JSON.parse(photo); if (Array.isArray(parsed) && parsed.length > 0) photo = parsed[0]; } catch {} }
        if (Array.isArray(photo)) photo = photo[0];
        if (typeof photo === 'object' && photo !== null) { if (photo.photo) photo = photo.photo; else if (photo.url) photo = photo.url; else return null; }
        if (typeof photo !== 'string') return null;
        photo = photo.replace(/\\/g, '/');
        if (!photo.startsWith('http') && !photo.startsWith('/')) photo = `${STORAGE_URL}/${photo}`;
        return photo;
    };

    const handleOpen = () => { setIsOpen(true); audioController?.play(); };


    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const submitWish = async (e) => {
        e.preventDefault(); if (!nameInput.trim() || !messageInput.trim()) return; setSubmitting(true);
        try {
            await fetch(`${API_URL}/invitations/${invitation.id}/guestbook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ name: nameInput, message: messageInput }) });
            setWishes([{ name: nameInput, message: messageInput, created_at: new Date().toISOString() }, ...wishes]); setMessageInput(''); toast.success('Ucapan terkirim!');
        } catch { toast.error('Gagal mengirim ucapan'); } finally { setSubmitting(false); }
    };

    const coverPhoto = (() => { const cp = invitation?.cover_photo; if (!cp) return null; return getPhoto(Array.isArray(cp) ? cp[0] : cp); })();
    const groomPhoto = getPhoto(invitation?.groom_photo);
    const bridePhoto = getPhoto(invitation?.bride_photo);
    const photos = invitation?.gallery?.length > 0 ? invitation.gallery.map(g => g.photo) : (invitation?.photos || []);

    return (
        <div className={`min-h-screen bg-[#3d2b1f] text-[#f5f1eb] ${nunito.className} overflow-hidden earthy-nature-theme`}>
            <style dangerouslySetInnerHTML={{ __html: `
                .earthy-nature-theme .en-reveal { opacity: 0; transform: translateY(35px); transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1); }
                .earthy-nature-theme .en-reveal.active { opacity: 1; transform: translateY(0); }
                .earthy-nature-theme .en-reveal[data-delay="1"] { transition-delay: 0.15s; }
                .earthy-nature-theme .en-reveal[data-delay="2"] { transition-delay: 0.3s; }
                .earthy-nature-theme .en-reveal[data-delay="3"] { transition-delay: 0.45s; }
                .nature-glow {
                    position: absolute; width: 400px; height: 400px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(138,154,91,0.2) 0%, rgba(138,154,91,0.05) 50%, transparent 70%);
                    pointer-events: none; z-index: 1; animation: natureGlow 7s ease-in-out infinite alternate;
                }
                @keyframes natureGlow { 0% { opacity: 0.5; } 100% { opacity: 1; } }
                .earthy-card { background: rgba(245,241,235,0.06); border: 1px solid rgba(245,241,235,0.1); backdrop-filter: blur(8px); }
                .cream-card { background: #f5f1eb; color: #3d2b1f; }
                .terracotta { color: #c67a5c; }
                .sage { color: #8a9a5b; }
                .split-left-en { position: sticky; top: 0; height: 100vh; }
                @media (max-width: 1023px) { .split-left-en { position: relative; height: auto; min-height: 100vh; } }
                .cover-overlay-en { position: fixed; inset: 0; z-index: 9999; transition: transform 1s cubic-bezier(0.16,1,0.3,1); }
                .cover-overlay-en.open { transform: translateY(-100%); }
                .music-spin-en { animation: musicSpinEn 4s linear infinite; }
                @keyframes musicSpinEn { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .circle-frame { border-radius: 50%; overflow: hidden; }
                .grain-overlay { position: relative; }
                .grain-overlay::after { content: ''; position: absolute; inset: 0; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); pointer-events: none; z-index: 2; }
            `}} />



            {/* ═══════ COVER OVERLAY ═══════ */}
            <div className={`cover-overlay-en ${isOpen ? 'open' : ''}`}>
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#2a1e15] grain-overlay">
                    {coverPhoto && <img src={landingPhoto || coverPhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#2a1e15]/40 via-[#2a1e15]/60 to-[#2a1e15]/95" />
                    <div className="nature-glow" style={{ top: '15%', left: '10%' }} />
                    <div className="nature-glow" style={{ bottom: '20%', right: '10%' }} />

                    <div className="relative z-10 text-center px-6 flex flex-col items-center">
                        {/* Leaf icon */}
                        <svg className="w-10 h-10 sage mb-6 opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
                        <p className={`${cormorant.className} text-[11px] tracking-[0.5em] uppercase text-[#c67a5c]/70 mb-4`}>The Wedding Of</p>
                        <h1 className={`${sacramento.className} text-6xl md:text-8xl lg:text-9xl text-[#f5f1eb] mb-4`}>
                            {invitation?.groom_name?.split(' ')[0]} <span className="terracotta">&</span> {invitation?.bride_name?.split(' ')[0]}
                        </h1>
                        <p className="text-xs text-[#f5f1eb]/40 tracking-[0.3em] uppercase mb-10">
                            {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        {guestName && (
                            <div className="mb-8">
                                <p className="text-[10px] text-[#f5f1eb]/30 uppercase tracking-widest mb-1">Kepada Yth.</p>
                                <p className={`${sacramento.className} text-3xl terracotta`}>{guestName}</p>
                            </div>
                        )}

                        <button onClick={handleOpen} className={`${cormorant.className} border border-[#c67a5c]/40 px-10 py-4 text-[10px] tracking-[0.3em] uppercase terracotta hover:bg-[#c67a5c] hover:text-[#2a1e15] transition-all duration-500`}>
                            Buka Undangan
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════ MAIN SPLIT LAYOUT ═══════ */}
            <div className={`transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col lg:flex-row min-h-screen">

                    {/* LEFT PANEL */}
                    <div className="split-left-en w-full lg:w-[70%] bg-[#3d2b1f] relative flex flex-col justify-end p-8 md:p-12 lg:p-16 grain-overlay">
                        {coverPhoto && <img src={coverPhoto} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-55" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#3d2b1f] via-[#3d2b1f]/50 to-transparent" />
                        <div className="nature-glow" style={{ top: '10%', right: '5%' }} />

                        <div className="relative z-10">
                            <svg className="w-8 h-8 sage mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
                            <p className={`${cormorant.className} text-[10px] tracking-[0.4em] uppercase text-[#8a9a5b]/60 mb-6`}>Our Wedding</p>
                            <h1 className={`${sacramento.className} text-6xl md:text-7xl lg:text-8xl text-[#f5f1eb] leading-[1.1] mb-8`}>
                                {invitation?.groom_name?.split(' ')[0]} <span className="terracotta opacity-60">&</span> {invitation?.bride_name?.split(' ')[0]}
                            </h1>

                            {invitation?.quotes && (
                                <p className="text-sm text-[#f5f1eb]/40 leading-relaxed max-w-lg mb-10 italic">"{invitation.description}"</p>
                            )}
                            {guestName && (
                                <div className="mb-6">
                                    <p className="text-[10px] text-[#f5f1eb]/25 tracking-widest uppercase mb-1">Kepada Yth.</p>
                                    <p className={`${sacramento.className} text-3xl terracotta`}>{guestName}</p>
                                </div>
                            )}
                        </div>

                        {invitation?.music_url && (
                            <MusicPlayer audioController={audioController} btnBg="bg-[#3d2b1f]" btnColor="sage" btnBorder="border-[#8a9a5b]/30 shadow-2xl" />
                        )}
                    </div>

                    {/* RIGHT PANEL */}
                    <div ref={rightPanelRef} className="w-full lg:w-[30%] lg:h-screen lg:overflow-y-auto scrollbar-hide bg-[#3d2b1f]">

                        {/* Countdown */}
                        <section className="py-20 px-8 text-center en-reveal">
                            <p className={`${cormorant.className} text-[10px] tracking-[0.4em] uppercase text-[#c67a5c]/50 mb-4`}>Save The Date</p>
                            <h2 className={`${cormorant.className} text-3xl font-bold tracking-wider text-[#f5f1eb] mb-2`}>
                                {invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}
                            </h2>
                            <p className="text-xs text-[#f5f1eb]/30 mb-10">
                                {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mb-12">
                                {[{ val: countdown.days, label: 'Hari' }, { val: countdown.hours, label: 'Jam' }, { val: countdown.minutes, label: 'Menit' }, { val: countdown.seconds, label: 'Detik' }].map((item, i) => (
                                    <div key={i} className="earthy-card rounded-2xl py-4 px-2">
                                        <p className={`${cormorant.className} text-2xl font-bold terracotta`}>{item.val}</p>
                                        <p className="text-[9px] uppercase tracking-widest text-[#f5f1eb]/20 mt-1">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Opening Quote */}
                        <section className="px-8 pb-20 en-reveal">
                            <div className="cream-card rounded-3xl p-8 text-center">
                                <svg className="w-8 h-8 text-[#8a9a5b] mx-auto mb-4 opacity-40" fill="currentColor" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
                                <p className="text-sm leading-relaxed text-[#3d2b1f]/60 italic mb-4">
                                    {invitation?.quotes || '"Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu."'}
                                </p>
                                <p className="text-[10px] text-[#8a9a5b] tracking-widest uppercase">{invitation?.quotes_name || 'QS. Ar-Rum Ayat 21'}</p>
                            </div>
                        </section>

                        {/* BRIDE & GROOM — Circular overlapping */}
                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 en-reveal">
                                <h2 className={`${cormorant.className} text-2xl font-bold tracking-[0.15em] uppercase text-[#f5f1eb]`}>Bride & Groom</h2>
                                <p className="text-xs text-[#f5f1eb]/25 mt-2">Assalamualaikum Wr. Wb.</p>
                                <p className="text-xs text-[#f5f1eb]/35 mt-3 max-w-md mx-auto leading-relaxed">Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:</p>
                            </div>

                            {/* Bride */}
                            <div className="cream-card rounded-3xl p-8 text-center mb-6 en-reveal" data-delay="1">
                                {bridePhoto && (
                                    <div className="w-36 h-36 mx-auto mb-6 circle-frame border-4 border-[#8a9a5b]/30">
                                        <img src={bridePhoto} alt="Bride" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <p className={`${sacramento.className} text-3xl text-[#c67a5c] mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p>
                                <h3 className={`${cormorant.className} text-xl font-bold tracking-wider text-[#3d2b1f] mb-3`}>{invitation?.bride_full_name || invitation?.bride_name}</h3>
                                <p className="text-sm text-[#3d2b1f]/50">Putri {invitation?.bride_child_order ? `${invitation.bride_child_order} ` : ""}dari</p>
                                <p className="text-sm text-[#3d2b1f]/70 font-medium">{invitation?.bride_father || 'Bapak'} & {invitation?.bride_mother || 'Ibu'}</p>
                                {invitation?.bride_instagram && (
                                    <a href={`https://instagram.com/${invitation.bride_instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#3d2b1f]/70 hover:text-[#c67a5c] transition-colors font-medium">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                        @{invitation.bride_instagram}
                                    </a>
                                )}
                            </div>

                            <div className="text-center my-4 en-reveal"><span className={`${sacramento.className} text-6xl text-[#c67a5c]/40`}>&</span></div>

                            {/* Groom */}
                            <div className="cream-card rounded-3xl p-8 text-center en-reveal" data-delay="2">
                                {groomPhoto && (
                                    <div className="w-36 h-36 mx-auto mb-6 circle-frame border-4 border-[#8a9a5b]/30">
                                        <img src={groomPhoto} alt="Groom" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <p className={`${sacramento.className} text-3xl text-[#c67a5c] mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p>
                                <h3 className={`${cormorant.className} text-xl font-bold tracking-wider text-[#3d2b1f] mb-3`}>{invitation?.groom_full_name || invitation?.groom_name}</h3>
                                <p className="text-sm text-[#3d2b1f]/50">Putra {invitation?.groom_child_order ? `${invitation.groom_child_order} ` : ""}dari</p>
                                <p className="text-sm text-[#3d2b1f]/70 font-medium">{invitation?.groom_father || 'Bapak'} & {invitation?.groom_mother || 'Ibu'}</p>
                                {invitation?.groom_instagram && (
                                    <a href={`https://instagram.com/${invitation.groom_instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#3d2b1f]/70 hover:text-[#c67a5c] transition-colors font-medium">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                        @{invitation.groom_instagram}
                                    </a>
                                )}
                            </div>
                        </section>

                        {/* Events */}
                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 en-reveal">
                                <h2 className={`${cormorant.className} text-2xl font-bold tracking-[0.15em] uppercase text-[#f5f1eb]`}>Wedding</h2>
                                <p className={`${sacramento.className} text-4xl terracotta -mt-1`}>Event</p>
                            </div>
                            {invitation?.events && invitation.events.length > 0 ? (
                                [...invitation.events].sort((a,b) => (a.sort_order||0) - (b.sort_order||0)).map((event, idx) => (
                                    <div key={idx} className="cream-card rounded-3xl p-8 mb-6 text-center en-reveal" data-delay={`${idx+1}`}>
                                        <h3 className={`${cormorant.className} text-xl font-bold tracking-[0.15em] uppercase text-[#3d2b1f] mb-4`}>{event.name}</h3>
                                        <p className="text-sm text-[#3d2b1f]/50 mb-1">{event.date ? new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
                                        <p className="text-sm text-[#3d2b1f]/50 mb-3">Pukul : {event.time_start?.substring(0, 5) || 'TBA'} {event.time_end ? `- ${event.time_end.substring(0, 5)}` : '- Selesai'} WIB</p>
                                        {event.location && <p className="text-sm text-[#3d2b1f]/60 font-medium pt-3 border-t border-[#3d2b1f]/10">{event.location}</p>}
                                        {getMapUrl(event) && (
                                            <MapLocationButton
                                                item={event}
                                                className={`${cormorant.className} inline-flex items-center gap-2 border border-[#8a9a5b]/40 px-6 py-3 text-[10px] tracking-[0.2em] uppercase text-[#8a9a5b] hover:bg-[#8a9a5b] hover:text-white transition-all duration-500 mt-4 rounded-lg`}
                                                buttonText="Lihat Lokasi"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                                                <span>Lihat Lokasi</span>
                                            </MapLocationButton>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="cream-card rounded-3xl p-10 text-center">
                                    <h3 className={`${cormorant.className} text-xl font-bold tracking-wider text-[#3d2b1f] mb-2`}>Acara Pernikahan</h3>
                                    <p className="text-sm text-[#3d2b1f]/40">{eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            )}
                        </section>

                        {/* Love Story */}
                        {invitation?.love_stories && invitation.love_stories.length > 0 && (
                            <section className="px-8 pb-20">
                                <div className="text-center mb-12 en-reveal">
                                    <h2 className={`${cormorant.className} text-2xl font-bold tracking-[0.15em] uppercase text-[#f5f1eb]`}>Our</h2>
                                    <p className={`${sacramento.className} text-4xl terracotta -mt-1`}>Love Story</p>
                                </div>
                                {[...invitation.love_stories].sort((a,b) => (a.sort_order||0) - (b.sort_order||0)).map((story, i) => (
                                    <div key={story.id || i} className="cream-card rounded-3xl p-8 text-center mb-6 en-reveal" data-delay={`${i+1}`}>
                                        <h3 className={`${cormorant.className} text-lg font-bold tracking-[0.15em] uppercase text-[#3d2b1f] mb-4`}>{story.title}</h3>
                                        <p className="text-sm text-[#3d2b1f]/60 leading-relaxed">{story.description}</p>
                                        {story.photo && <div className="mt-6 rounded-xl overflow-hidden"><img src={getPhoto(story.photo)} alt={story.title} className="w-full h-44 object-cover" /></div>}
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Gallery */}
                        <Gallery 
                            layout="masonry"
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={cormorant.className}
                            titleSize="text-2xl font-bold tracking-[0.15em] uppercase"
                            accentText="text-[#f5f1eb]"
                            subtitleText="terracotta"
                            borderColor="border-[#c67a5c]/20"
                        />

                        {/* QR Checkin */}
                        <div className="px-8"><QrCheckin guest={guest} sectionBg="bg-transparent" titleFont={cormorant.className} textColor="text-[#f5f1eb]" borderStyle="border-[#c67a5c]/20" /></div>

                        {/* Wishes */}
                        <section className="px-8 pb-20 en-reveal">
                            <div className="text-center mb-12">
                                <h2 className={`${cormorant.className} text-2xl font-bold tracking-[0.15em] uppercase text-[#f5f1eb]`}>Wedding</h2>
                                <p className={`${sacramento.className} text-4xl terracotta -mt-1`}>Wishes</p>
                            </div>
                            <div className="cream-card rounded-3xl p-8">
                                <form onSubmit={submitWish} className="space-y-4">
                                    <div>
                                        <label className={`${cormorant.className} block text-[9px] tracking-[0.2em] uppercase text-[#3d2b1f]/40 mb-2 font-bold`}>Nama</label>
                                        <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} className="w-full bg-[#3d2b1f]/5 border border-[#3d2b1f]/15 rounded-xl px-5 py-3.5 text-sm text-[#3d2b1f] focus:outline-none focus:border-[#8a9a5b]/50 transition-colors" placeholder="Nama Anda..." />
                                    </div>
                                    <div>
                                        <label className={`${cormorant.className} block text-[9px] tracking-[0.2em] uppercase text-[#3d2b1f]/40 mb-2 font-bold`}>Ucapan</label>
                                        <textarea value={messageInput} onChange={e => setMessageInput(e.target.value)} className="w-full bg-[#3d2b1f]/5 border border-[#3d2b1f]/15 rounded-xl px-5 py-3.5 text-sm text-[#3d2b1f] h-28 resize-none focus:outline-none focus:border-[#8a9a5b]/50 transition-colors" placeholder="Tulis ucapan..." />
                                    </div>
                                    <button type="submit" disabled={submitting} className={`${cormorant.className} w-full bg-[#8a9a5b] text-white py-4 rounded-xl text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-[#7a8a4b] transition-colors disabled:opacity-50`}>
                                        {submitting ? 'Mengirim...' : 'Kirim Ucapan'}
                                    </button>
                                </form>
                                {wishes.length > 0 && (
                                    <div className="mt-8 space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
                                        {wishes.map((msg, i) => (
                                            <div key={i} className="bg-[#3d2b1f]/5 rounded-2xl p-4 border border-[#3d2b1f]/10">
                                                <p className="text-sm text-[#3d2b1f]/70">{msg.message}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="w-6 h-6 rounded-full bg-[#8a9a5b]/20 flex items-center justify-center"><span className="sage text-[10px] font-bold">{msg.name?.charAt(0)?.toUpperCase()}</span></div>
                                                    <p className="text-xs text-[#3d2b1f]/40">{msg.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Gift */}
                        {invitation?.gift_accounts && invitation.gift_accounts.length > 0 && (
                            <section className="px-8 pb-20 en-reveal">
                                <div className="text-center mb-12">
                                    <h2 className={`${cormorant.className} text-2xl font-bold tracking-[0.15em] uppercase text-[#f5f1eb]`}>Wedding</h2>
                                    <p className={`${sacramento.className} text-4xl terracotta -mt-1`}>Gift</p>
                                </div>
                                <div className="space-y-4">
                                    {invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={`${(i % 3) + 1}`} variant="EarthyNature" />
                            ))}
                                </div>
                            </section>
                        )}

                        {/* Footer */}
                        {/* ── FOOTER ── */}
                <footer className="bg-[#1a1a1a] text-[#c67a5c] pt-64 pb-24 px-8 text-center relative overflow-hidden">
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 z-0">
                        {invitation?.footer_image ? (
                            <img src={getPhoto(invitation.footer_image)} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof landingPhoto !== 'undefined' && landingPhoto ? (
                            <img src={landingPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof coverPhoto !== 'undefined' && coverPhoto ? (
                            <img src={coverPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : (
                            <div className="w-full h-full bg-[#1a1a1a] opacity-40"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/60 to-transparent" />
                    </div>
                    
                    {/* Content Layer */}
                    <div className="relative z-10 pt-10">
                        <p className={`${poppins.className} text-[10px] text-black/50 tracking-[0.3em] uppercase font-bold mb-4`}>
                            Thank you for being part of our special day
                        </p>
                        <h2 className={`${cormorant.className} text-5xl mb-4 text-[#c67a5c] drop-shadow-sm`}>
                            {invitation?.groom_name?.split(' ')[0]} <span className="text-black/50 font-light mx-2">&</span> {invitation?.bride_name?.split(' ')[0]}
                        </h2>
                        
                        {/* Branding */}
                        <div className="border-t border-[#c67a5c]/10 pt-8 mt-12">
                            <p className="text-[9px] text-[#c67a5c]/40 tracking-[0.2em] uppercase mb-2">Digital Invitation by</p>
                            <a href="https://digitvitation.my.id" target="_blank" rel="noreferrer" className="inline-block text-black/80 hover:text-black transition-colors">
                                <span className={`${cormorant.className} text-lg font-bold tracking-wider uppercase`}>Digivitation</span>
                            </a>
                            <p className="text-[8px] text-[#c67a5c]/30 mt-2 tracking-wider">© {new Date().getFullYear()} Digivitation. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
