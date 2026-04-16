'use client';

import GiftAtmCard from './partials/GiftAtmCard';
import React, { useEffect, useRef, useState } from 'react';
import { Playfair_Display, Inter, Great_Vibes } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'] });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: ['400'] });

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

/* ─── Inline SVG Ornaments ─────────────────────────────── */
const LeafOrnament = ({ className = '', flip = false }) => (
    <svg className={className} viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={flip ? { transform: 'scaleX(-1)' } : {}}>
        <path d="M100 280C100 280 20 220 20 140C20 60 80 20 100 10C120 20 180 60 180 140C180 220 100 280 100 280Z" fill="#5f7364" opacity="0.12" />
        <path d="M100 280C100 280 40 230 40 150C40 70 85 30 100 20" stroke="#5f7364" strokeWidth="1.5" opacity="0.4" fill="none" />
        <path d="M100 280C100 280 160 230 160 150C160 70 115 30 100 20" stroke="#5f7364" strokeWidth="1.5" opacity="0.4" fill="none" />
        <path d="M100 20V280" stroke="#4a5d4e" strokeWidth="1.5" opacity="0.3" />
        <path d="M100 60C80 80 55 85 40 80" stroke="#5f7364" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M100 60C120 80 145 85 160 80" stroke="#5f7364" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M100 110C75 130 50 132 35 125" stroke="#5f7364" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M100 110C125 130 150 132 165 125" stroke="#5f7364" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M100 160C80 175 58 178 42 170" stroke="#5f7364" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M100 160C120 175 142 178 158 170" stroke="#5f7364" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M100 210C85 220 65 222 50 218" stroke="#5f7364" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M100 210C115 220 135 222 150 218" stroke="#5f7364" strokeWidth="1" opacity="0.3" fill="none" />
    </svg>
);

const WeddingRings = ({ className = '' }) => (
    <svg className={className} viewBox="0 0 80 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="25" r="16" stroke="#4a5d4e" strokeWidth="1.5" opacity="0.5" />
        <circle cx="52" cy="25" r="16" stroke="#4a5d4e" strokeWidth="1.5" opacity="0.5" />
        <circle cx="28" cy="25" r="13" stroke="#5f7364" strokeWidth="0.5" opacity="0.3" />
        <circle cx="52" cy="25" r="13" stroke="#5f7364" strokeWidth="0.5" opacity="0.3" />
    </svg>
);

const FloralDivider = ({ className = '' }) => (
    <svg className={className} viewBox="0 0 400 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="20" x2="160" y2="20" stroke="#cddbcf" strokeWidth="1" />
        <line x1="240" y1="20" x2="400" y2="20" stroke="#cddbcf" strokeWidth="1" />
        <path d="M185 20C185 12 192 5 200 5C208 5 215 12 215 20C215 28 208 35 200 35C192 35 185 28 185 20Z" stroke="#5f7364" strokeWidth="1.2" fill="none" />
        <path d="M200 5C200 5 195 12 195 20C195 28 200 35 200 35" stroke="#5f7364" strokeWidth="0.8" fill="none" />
        <path d="M200 5C200 5 205 12 205 20C205 28 200 35 200 35" stroke="#5f7364" strokeWidth="0.8" fill="none" />
        <circle cx="200" cy="20" r="3" fill="#5f7364" opacity="0.3" />
        <path d="M170 20C175 14 180 12 185 15" stroke="#cddbcf" strokeWidth="1" fill="none" />
        <path d="M230 20C225 14 220 12 215 15" stroke="#cddbcf" strokeWidth="1" fill="none" />
        <path d="M170 20C175 26 180 28 185 25" stroke="#cddbcf" strokeWidth="1" fill="none" />
        <path d="M230 20C225 26 220 28 215 25" stroke="#cddbcf" strokeWidth="1" fill="none" />
    </svg>
);

const CornerOrnament = ({ className = '', position = 'top-left' }) => {
    const rotations = { 'top-left': '', 'top-right': 'scaleX(-1)', 'bottom-left': 'scaleY(-1)', 'bottom-right': 'scale(-1)' };
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: rotations[position] }}>
            <path d="M5 95C5 95 5 50 5 30C5 15 15 5 30 5C50 5 95 5 95 5" stroke="#cddbcf" strokeWidth="1.5" fill="none" />
            <path d="M10 90C10 90 10 50 10 35C10 20 20 10 35 10C50 10 90 10 90 10" stroke="#5f7364" strokeWidth="0.5" opacity="0.3" fill="none" />
            <circle cx="30" cy="5" r="3" fill="#5f7364" opacity="0.2" />
            <path d="M5 70C15 65 20 55 18 45" stroke="#5f7364" strokeWidth="0.8" opacity="0.25" fill="none" />
            <path d="M5 55C12 52 15 45 14 38" stroke="#5f7364" strokeWidth="0.6" opacity="0.2" fill="none" />
        </svg>
    );
};

export default function BotanicalSage({ payload, audioController }) {
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
    const videoRef = useRef(null);

    const [guestNameInput, setGuestNameInput] = useState(guestName || '');
    const [wishInput, setWishInput] = useState('');
    const [wishes, setWishes] = useState(invitation?.guestMessages || []);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const reveals = document.querySelectorAll('.bs-reveal');
            for (let i = 0; i < reveals.length; i++) {
                const windowHeight = window.innerHeight;
                const elementTop = reveals[i].getBoundingClientRect().top;
                if (elementTop < windowHeight - 60) {
                    reveals[i].classList.add('active');
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getPhoto = (p) => {
        if (!p) return null;
        let photo = p;
        if (typeof photo === 'string' && photo.startsWith('[')) {
            try { const parsed = JSON.parse(photo); if (Array.isArray(parsed) && parsed.length > 0) photo = parsed[0]; } catch (e) {}
        }
        if (Array.isArray(photo)) photo = photo[0];
        if (typeof photo === 'object' && photo !== null) {
            if (photo.photo) photo = photo.photo;
            else if (photo.url) photo = photo.url;
            else return null;
        }
        if (typeof photo !== 'string') return null;
        photo = photo.replace(/\\/g, '/');
        if (!photo.startsWith('http') && !photo.startsWith('/')) photo = `${STORAGE_URL}/${photo}`;
        return photo;
    };

    const handleOpenInvitation = () => {
        setIsOpen(true);
        audioController?.play();
        setTimeout(() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' }), 100);
    };



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
    const photos = invitation?.gallery?.length > 0 ? invitation.gallery.map(g => g.photo) : (invitation?.photos || []);

    // Cover photos array handling
    let coverPhotosArray = [];
    if (invitation?.cover_photo) {
        let raw = invitation.cover_photo;
        try {
            if (typeof raw === 'string') {
                const idx = raw.indexOf('[');
                raw = idx >= 0 ? JSON.parse(raw.substring(idx)) : [raw];
            }
            if (Array.isArray(raw)) {
                raw.forEach(item => {
                    if (typeof item === 'string' && item.startsWith('[')) {
                        try { const p = JSON.parse(item); if (Array.isArray(p)) coverPhotosArray.push(...p); } catch { coverPhotosArray.push(item); }
                    } else coverPhotosArray.push(item);
                });
            }
        } catch { coverPhotosArray = [invitation.cover_photo]; }
    }
    if (coverPhotosArray.length === 0 && invitation?.cover_photo) coverPhotosArray = [invitation.cover_photo];

    const initialCover = getPhoto(coverPhotosArray[0]) || getPhoto(photos[0]);
    const [activeCover, setActiveCover] = useState(initialCover);
    const groomPhoto = getPhoto(invitation?.groom_photo);
    const bridePhoto = getPhoto(invitation?.bride_photo);

    // Background video URL
    const bgVideoUrl = invitation?.background_video_url || null;
    const isYoutube = bgVideoUrl && (bgVideoUrl.includes('youtube.com') || bgVideoUrl.includes('youtu.be'));
    const youtubeEmbedUrl = bgVideoUrl ? (bgVideoUrl.includes('watch?v=') ? bgVideoUrl.replace('watch?v=', 'embed/').split('&')[0] : bgVideoUrl.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0]) : '';
    const videoSrc = bgVideoUrl && !isYoutube ? (bgVideoUrl.startsWith('http') ? bgVideoUrl : `${STORAGE_URL}/${bgVideoUrl}`) : null;

    return (
        <div className={`min-h-screen bg-[#f0f4f0] text-[#334036] ${inter.className} overflow-x-hidden relative botanical-sage-theme`}>
            <style dangerouslySetInnerHTML={{ __html: `
                .botanical-sage-theme .bs-reveal { opacity: 0; transform: translateY(40px); transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
                .botanical-sage-theme .bs-reveal.active { opacity: 1; transform: translateY(0); }
                .botanical-sage-theme .bs-reveal[data-delay="1"] { transition-delay: 0.1s; }
                .botanical-sage-theme .bs-reveal[data-delay="2"] { transition-delay: 0.2s; }
                .botanical-sage-theme .bs-reveal[data-delay="3"] { transition-delay: 0.3s; }
                .sage-glass { background: rgba(255,255,255,0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(205,219,207,0.5); }
                .sage-glass-dark { background: rgba(74,93,78,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
                .sage-btn { background: linear-gradient(135deg, #4a5d4e 0%, #3a4d3e 100%); color: white; transition: all 0.4s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 4px 20px rgba(74,93,78,0.3); }
                .sage-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(74,93,78,0.4); }
                .sage-btn:active { transform: translateY(0); }
                .olive-text { color: #3a4d3e; }
                .cover-fade { animation: coverFade 8s ease-in-out infinite alternate; }
                @keyframes coverFade { 0% { opacity: 0.85; } 100% { opacity: 1; } }
                .float-slow { animation: floatSlow 6s ease-in-out infinite; }
                @keyframes floatSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
                .float-slow-delay { animation: floatSlow 7s ease-in-out infinite; animation-delay: 2s; }
                .spin-slow { animation: spinSlow 20s linear infinite; }
                @keyframes spinSlow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .timeline-line::before { content: ''; position: absolute; left: 15px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, rgba(74,93,78,0), #cddbcf, rgba(74,93,78,0)); }
                @media (min-width: 768px) { .timeline-line::before { left: 50%; transform: translateX(-50%); } }
                .photo-frame { box-shadow: 0 20px 60px rgba(74,93,78,0.15), 0 0 0 1px rgba(205,219,207,0.4); }
                .card-hover { transition: all 0.5s cubic-bezier(0.16,1,0.3,1); }
                .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(74,93,78,0.12); }
            `}} />

            {/* ── MUSIC TOGGLE ── */}
            {invitation?.music_url && (
                <MusicPlayer audioController={audioController} btnBg="sage-btn" btnColor="text-white" btnBorder="border-none" />
            )}

            {/* ══════════════════════════════ 1. HERO SECTION ══════════════════════════════ */}
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
                {/* Background: Video or Cover Image */}
                <div className="absolute inset-0 z-0">
                    {bgVideoUrl ? (
                        isYoutube ? (
                            <iframe className="absolute inset-0 w-full h-full" src={`${youtubeEmbedUrl}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&modestbranding=1&playsinline=1`} title="Background Video" frameBorder="0" allow="autoplay" allowFullScreen />
                        ) : (
                            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" src={videoSrc} autoPlay muted loop playsInline />
                        )
                    ) : activeCover ? (
                        <img src={activeCover} alt="Cover" className="w-full h-full object-cover cover-fade" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#c9d5bf] via-[#d9e3db] to-[#e8ede9]" />
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#2a362c]/70 via-[#2a362c]/50 to-[#f0f4f0]" />
                </div>

                {/* Decorative Leaf Ornaments */}
                <LeafOrnament className="absolute -top-10 -left-8 w-28 md:w-40 opacity-40 float-slow" />
                <LeafOrnament className="absolute -top-10 -right-8 w-28 md:w-40 opacity-40 float-slow-delay" flip />
                <CornerOrnament className="absolute top-4 left-4 w-20 md:w-28 opacity-60" position="top-left" />
                <CornerOrnament className="absolute top-4 right-4 w-20 md:w-28 opacity-60" position="top-right" />

                {/* Hero Content */}
                <div className="relative z-10 text-center px-6 w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen py-20">
                    <p className={`${greatVibes.className} text-3xl md:text-4xl text-white/90 mb-6 drop-shadow-lg`}>Wedding Invitation</p>

                    <WeddingRings className="w-20 h-12 mx-auto mb-6 opacity-60" />

                    <h1 className={`${playfair.className} text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-2 drop-shadow-xl`}>
                        {invitation?.groom_name}
                    </h1>
                    <div className="flex items-center justify-center gap-4 my-3">
                        <div className="w-16 h-px bg-white/40" />
                        <span className={`${playfair.className} text-4xl text-[#cddbcf] italic font-light`}>&</span>
                        <div className="w-16 h-px bg-white/40" />
                    </div>
                    <h1 className={`${playfair.className} text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-8 drop-shadow-xl`}>
                        {invitation?.bride_name}
                    </h1>

                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-white/70 mb-8 font-medium">
                        {eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>

                    {guestName && (
                        <div className="sage-glass rounded-xl px-8 py-4 mb-8 max-w-xs mx-auto">
                            <p className="text-[10px] text-[#5f7364] uppercase tracking-[0.3em] mb-1">Dear</p>
                            <p className={`${playfair.className} text-lg font-bold olive-text`}>{guestName}</p>
                        </div>
                    )}

                    <button onClick={handleOpenInvitation} className="sage-btn px-12 py-4 rounded-full text-[11px] uppercase font-bold tracking-[0.25em]">
                        <span className="flex items-center gap-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                            Open Invitation
                        </span>
                    </button>

                    {/* Cover Photo Thumbnails */}
                    {(() => {
                        let allPhotos = coverPhotosArray.map(p => getPhoto(p)).filter(Boolean);
                        if (allPhotos.length < 3 && photos.length > 0) allPhotos = [...allPhotos, ...photos.map(p => getPhoto(p))].filter(Boolean);
                        allPhotos = [...new Set(allPhotos)];
                        if (allPhotos.length > 1) {
                            return (
                                <div className="flex gap-3 mt-10">
                                    {allPhotos.slice(0, 4).map((thumb, idx) => (
                                        <div key={idx} onClick={() => setActiveCover(thumb)}
                                            className={`w-14 h-14 md:w-18 md:h-18 rounded-lg overflow-hidden border-2 cursor-pointer hover:scale-105 transition-all duration-300 ${activeCover === thumb ? 'border-white shadow-lg shadow-white/30 scale-105' : 'border-white/30 opacity-70'}`}>
                                            <img src={thumb} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f0f4f0] to-transparent z-10" />
            </section>

            {/* ══════════════════════════════ MAIN CONTENT ══════════════════════════════ */}
            <main className={`transition-all duration-[1500ms] ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-32 pointer-events-none'}`}>

                {/* ── 2. BRIDE & GROOM ── */}
                <section className="py-28 bg-[#f0f4f0] relative bs-reveal overflow-hidden">
                    {/* Background leaf ornaments */}
                    <LeafOrnament className="absolute -top-16 -right-10 w-40 md:w-56 opacity-15 -rotate-12" />
                    <LeafOrnament className="absolute -bottom-16 -left-10 w-40 md:w-56 opacity-15 rotate-12" flip />

                    <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
                        <p className={`${greatVibes.className} text-2xl text-[#5f7364] mb-2`}>Together with their families</p>
                        <h2 className={`${playfair.className} text-5xl md:text-6xl olive-text font-bold mb-4`}>The Bride & Groom</h2>
                        <FloralDivider className="w-64 md:w-80 mx-auto mb-20" />

                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 w-full">
                            {/* Bride */}
                            <div className="flex flex-col items-center gap-6 w-full md:w-auto bs-reveal" data-delay="1">
                                <div className="relative">
                                    <LeafOrnament className="absolute -top-12 -left-10 w-24 md:w-32 opacity-30 -rotate-45" flip />
                                    <div className="w-56 h-72 md:w-64 md:h-80 rounded-[50%] overflow-hidden border-[6px] border-white bg-white shadow-2xl photo-frame relative z-10">
                                        {bridePhoto ? <img src={bridePhoto} className="w-full h-full object-cover" alt="Bride" /> : <div className="w-full h-full bg-gradient-to-b from-[#d9e3db] to-[#cddbcf]" />}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className={`${playfair.className} text-3xl md:text-4xl olive-text font-bold mb-1`}>{invitation?.bride_name}</h3>
                                    <p className="text-xs text-[#5f7364] tracking-widest uppercase">The Bride</p>
                                    {invitation?.bride_father && <p className="text-xs text-[#5f7364] mt-2">Putri {invitation?.bride_child_order ? `${invitation.bride_child_order} ` : ""}dari {invitation.bride_father} & {invitation.bride_mother}</p>}
                                </div>
                            </div>

                            {/* Center ornament */}
                            <div className="flex flex-col items-center shrink-0 my-4 md:my-0 md:mx-6">
                                <WeddingRings className="w-16 h-10 mb-2 opacity-40" />
                                <span className={`${playfair.className} text-6xl md:text-8xl olive-text font-bold opacity-50`}>&</span>
                            </div>

                            {/* Groom */}
                            <div className="flex flex-col items-center gap-6 w-full md:w-auto bs-reveal" data-delay="2">
                                <div className="relative">
                                    <LeafOrnament className="absolute -top-12 -right-10 w-24 md:w-32 opacity-30 -rotate-45" />
                                    <div className="w-56 h-72 md:w-64 md:h-80 rounded-[50%] overflow-hidden border-[6px] border-white bg-white shadow-2xl photo-frame relative z-10">
                                        {groomPhoto ? <img src={groomPhoto} className="w-full h-full object-cover" alt="Groom" /> : <div className="w-full h-full bg-gradient-to-b from-[#d9e3db] to-[#cddbcf]" />}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className={`${playfair.className} text-3xl md:text-4xl olive-text font-bold mb-1`}>{invitation?.groom_name}</h3>
                                    <p className="text-xs text-[#5f7364] tracking-widest uppercase">The Groom</p>
                                    {invitation?.groom_father && <p className="text-xs text-[#5f7364] mt-2">Putra {invitation?.groom_child_order ? `${invitation.groom_child_order} ` : ""}dari {invitation.groom_father} & {invitation.groom_mother}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 3. QUOTE / DESCRIPTION ── */}
                {invitation?.quotes && (
                    <section className="py-20 bg-[#4a5d4e] relative bs-reveal overflow-hidden">
                        <CornerOrnament className="absolute top-2 left-2 w-16 md:w-24 opacity-40 invert" position="top-left" />
                        <CornerOrnament className="absolute bottom-2 right-2 w-16 md:w-24 opacity-40 invert" position="bottom-right" />
                        <div className="max-w-3xl mx-auto px-8 text-center relative z-10">
                            <svg className="w-10 h-10 mx-auto mb-6 text-[#8ba891] opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                            <p className={`${playfair.className} text-xl md:text-2xl font-medium leading-relaxed italic text-white/90`}>
                                "{invitation.quotes}"
                            </p>
                            {invitation?.quotes_name && <p className="text-[10px] text-white/50 tracking-widest uppercase mt-4 font-bold">{invitation.quotes_name}</p>}
                            <FloralDivider className="w-48 mx-auto mt-8 opacity-30 invert" />
                        </div>
                    </section>
                )}

                {/* Turut Mengundang */}
                {(() => {
                    let tmItems = invitation?.turut_mengundang || [];
                    if (typeof tmItems === 'string') { try { tmItems = JSON.parse(tmItems); } catch { tmItems = []; } }
                    if (!Array.isArray(tmItems)) tmItems = [];
                    tmItems = tmItems.filter(t => t && String(t).trim() !== '');
                    if (tmItems.length === 0) return null;
                    return (
                        <section className="py-16 px-6 text-center bg-[#e8ede9] bs-reveal">
                            <p className="text-[10px] text-[#5f7364] uppercase tracking-[0.3em] font-bold mb-6">Turut Mengundang</p>
                            <div className="w-12 h-px bg-[#5f7364]/30 mx-auto mb-8" />
                            <div className="space-y-2">
                                {tmItems.map((name, i) => (
                                    <p key={i} className={`${playfair.className} text-base text-[#3a4a3c] font-medium`}>{name}</p>
                                ))}
                            </div>
                        </section>
                    );
                })()}

                {/* ── 4. WEDDING DAY EVENTS ── */}
                <section className="py-24 bg-[#e8ede9] text-center px-6 bs-reveal relative overflow-hidden">
                    <LeafOrnament className="absolute top-0 right-0 w-32 opacity-10 rotate-45" />
                    <div className="max-w-5xl mx-auto relative z-10">
                        <p className={`${greatVibes.className} text-2xl text-[#5f7364] mb-2`}>Save the Date</p>
                        <h2 className={`${playfair.className} text-5xl md:text-6xl olive-text mb-4 font-bold`}>Wedding Day</h2>
                        <FloralDivider className="w-64 md:w-80 mx-auto mb-16" />

                        <div className="grid md:grid-cols-2 gap-8 mb-10">
                            {invitation?.events && invitation.events.length > 0 ? (
                                [...invitation.events].sort((a,b) => a.sort_order - b.sort_order).map((event, idx) => (
                                    <div key={idx} className="sage-glass rounded-2xl p-10 relative card-hover group">
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4a5d4e] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                                        <h3 className={`${playfair.className} text-3xl text-[#3a4d3e] font-bold mb-5`}>{event.name}</h3>
                                        <div className="text-xs text-[#5f7364] font-medium tracking-widest uppercase space-y-2 mb-6 border-y border-[#cddbcf]/50 py-5">
                                            <p className="flex items-center justify-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
                                                {event.date ? new Date(event.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'}) : ''}
                                            </p>
                                            <p className="flex items-center justify-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                                {event.time_start?.substring(0, 5) || 'TBA'} {event.time_start && !event.time_start.includes('WIB') && 'WIB'} {event.time_end ? ` - ${event.time_end.substring(0, 5)} WIB` : ''}
                                            </p>
                                            <p className="flex items-center justify-center gap-2 mt-2">
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                                                {event.location}
                                                <span className="block text-[9px] opacity-70 max-w-[200px] mx-auto text-center mt-1">{event.address || }</span>
                                            </p>
                                        </div>
                                        {(event.latitude && event.longitude) && (
                                            <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer" className="sage-btn inline-flex items-center gap-2 px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"/></svg>
                                                View on Map
                                            </a>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 sage-glass rounded-2xl p-10 text-[#5f7364] text-sm">Agenda pernikahan belum ditambahkan.</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── 5. BACKGROUND VIDEO / CINEMATIC SECTION ── */}
                <section className="relative w-full bs-reveal">
                    <div className="w-full h-[60vh] md:h-[80vh] relative bg-[#2a362c] flex items-center justify-center overflow-hidden">
                        {bgVideoUrl ? (
                            isYoutube ? (
                                <iframe className="absolute inset-0 w-full h-full" src={`${youtubeEmbedUrl}?autoplay=0&controls=1&modestbranding=1`} title="Wedding Video" frameBorder="0" allowFullScreen />
                            ) : (
                                <video controls className="absolute inset-0 w-full h-full object-cover" src={videoSrc} />
                            )
                        ) : (
                            <>
                                {activeCover && <img src={activeCover} alt="Cinematic" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                                <div className="absolute inset-0 bg-[#2a362c]/60" />
                                <div className="relative z-10 text-center px-6">
                                    <WeddingRings className="w-24 h-14 mx-auto mb-4 opacity-40" />
                                    <p className={`${playfair.className} text-2xl md:text-3xl text-white/80 italic`}>Our Love Story</p>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* ── 6. OUR MOMENTS GALLERY ── */}
                <Gallery 
                    layout="masonry"
                    invitation={invitation}
                    sectionBg="bg-white"
                    titleFont={playfair.className}
                    titleSize="text-5xl md:text-6xl font-bold"
                    accentText="olive-text"
                    subtitleText="text-[#5f7364]"
                    borderColor="border-[#cddbcf]"
                />

                {/* ── 7. LOVE STORY TIMELINE ── */}
                <section className="py-24 bg-[#f0f4f0] px-6 bs-reveal relative overflow-hidden">
                    <LeafOrnament className="absolute -bottom-20 -right-10 w-48 opacity-10" />
                    <div className="max-w-4xl mx-auto relative z-10">
                        <div className="text-center mb-16">
                            <p className={`${greatVibes.className} text-2xl text-[#5f7364] mb-2`}>Our Journey</p>
                            <h2 className={`${playfair.className} text-5xl md:text-6xl olive-text font-bold mb-4`}>Love Story</h2>
                            <FloralDivider className="w-56 mx-auto" />
                        </div>

                        <div className="relative timeline-line pt-4 pb-12">
                            {invitation?.love_stories && invitation.love_stories.length > 0 ? (
                                [...invitation.love_stories].sort((a,b) => a.sort_order - b.sort_order).map((story, i) => {
                                    const isEven = i % 2 === 0;
                                    return (
                                        <div key={story.id || i} className={`relative mb-12 pl-12 md:pl-0 w-full flex ${isEven ? 'md:justify-start' : 'md:justify-end'} bs-reveal`}>
                                            <div className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 bg-[#4a5d4e] rounded-full z-10 mt-6 shadow-md shadow-[#4a5d4e]/30" />
                                            <div className={`w-full md:w-[45%] sage-glass p-8 rounded-2xl card-hover`}>
                                                <p className="text-[10px] text-[#5f7364] uppercase tracking-widest font-bold mb-2">
                                                    {story.date ? new Date(story.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase() : 'MEMORIES'}
                                                </p>
                                                <h3 className={`${playfair.className} text-2xl font-bold olive-text mb-4`}>{story.title}</h3>
                                                <p className="text-sm text-[#5f7364] leading-relaxed">{story.description}</p>
                                                {story.photo && (
                                                    <img src={getPhoto(story.photo)} alt="Memory" className="w-full h-44 object-cover mt-6 rounded-xl" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-sm text-[#5f7364] py-10">Belum ada cerita yang ditambahkan.</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── QR CHECKIN ── */}
                <QrCheckin guest={guest} sectionBg="bg-[#f0f4f0]" titleFont={playfair.className} textColor="olive-text" borderStyle="border-[#cddbcf]" />

                {/* ── 8. RSVP / GUESTBOOK ── */}
                <section className="py-24 px-6 relative flex items-center justify-center bs-reveal overflow-hidden">
                    <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#d9e3db] via-[#e8ede9] to-[#cddbcf]" />
                    <LeafOrnament className="absolute -top-16 left-1/4 w-32 opacity-10 rotate-12" />
                    <LeafOrnament className="absolute -bottom-16 right-1/4 w-32 opacity-10 -rotate-12" flip />

                    <div className="relative z-10 w-full max-w-5xl mx-auto sage-glass rounded-3xl overflow-hidden p-8 md:p-14">
                        <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-2/5 mb-10 md:mb-0 pr-0 md:pr-10 border-b md:border-b-0 md:border-r border-[#cddbcf]/40 pb-8 md:pb-0">
                            <WeddingRings className="w-16 h-10 mb-4 opacity-40" />
                            <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-2 olive-text`}>RSVP</h2>
                            <p className="text-[10px] uppercase tracking-widest text-[#5f7364] mb-6">Or Send A Wish</p>
                            <p className="text-sm text-[#5f7364] leading-relaxed max-w-xs">We would love to know if you can join us. Leave your wishes below.</p>
                        </div>
                        <div className="w-full md:w-3/5 md:pl-10 flex flex-col gap-5">
                            <form onSubmit={async (e) => { e.preventDefault(); if(!guestNameInput.trim()||!wishInput.trim())return; setSubmitting(true); try{ const API_URL=process.env.NEXT_PUBLIC_API_URL||'https://app.digitvitation.my.id/api'; await fetch(`${API_URL}/invitations/${invitation.id}/guestbook`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:guestNameInput,message:wishInput})}); setWishes([{name:guestNameInput,message:wishInput,created_at:new Date().toISOString()},...wishes]); setWishInput(''); toast.success('Ucapan terkirim!'); }catch{toast.error('Gagal mengirim ucapan');}finally{setSubmitting(false);} }} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-[9px] uppercase tracking-widest font-bold mb-2 text-[#5f7364]">Your Name</label>
                                <input type="text" className="w-full bg-white/70 border border-[#cddbcf] px-5 py-3.5 text-sm text-[#334036] focus:outline-none focus:border-[#4a5d4e] focus:ring-2 focus:ring-[#4a5d4e]/10 transition-all rounded-xl" placeholder="Full Name..." value={guestNameInput} onChange={(e) => setGuestNameInput(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-[9px] uppercase tracking-widest font-bold mb-2 text-[#5f7364]">Your Message</label>
                                <textarea className="w-full bg-white/70 border border-[#cddbcf] px-5 py-3.5 text-sm text-[#334036] focus:outline-none focus:border-[#4a5d4e] focus:ring-2 focus:ring-[#4a5d4e]/10 transition-all h-28 resize-none rounded-xl" placeholder="Write something beautiful..." value={wishInput} onChange={(e) => setWishInput(e.target.value)} />
                            </div>
                            <button type="submit" disabled={submitting} className="self-end sage-btn px-10 py-3.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase disabled:opacity-50">
                                {submitting ? 'Mengirim...' : 'Send Message'}
                            </button>
                            </form>
                        </div>
                        </div>
                        {wishes.length > 0 && (
                            <div className="mt-10 pt-8 border-t border-[#cddbcf]/40 space-y-3 max-h-[400px] overflow-y-auto">
                                {wishes.map((m, i) => (
                                    <div key={i} className="bg-white/50 rounded-2xl p-4 border border-[#cddbcf]/30">
                                        <p className="text-sm text-[#334036]/70">{m.message}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-6 h-6 rounded-full bg-[#4a5d4e]/15 flex items-center justify-center">
                                                <span className="olive-text text-[10px] font-bold">{m.name?.charAt(0)?.toUpperCase()}</span>
                                            </div>
                                            <p className="text-xs text-[#5f7364]">{m.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── 9. SEND YOUR GIFT ── */}
                <section className="py-24 bg-[#f0f4f0] text-center px-6 bs-reveal relative overflow-hidden">
                    <LeafOrnament className="absolute top-0 left-0 w-36 opacity-8" flip />
                    <div className="max-w-5xl mx-auto relative z-10">
                        <p className={`${greatVibes.className} text-2xl text-[#5f7364] mb-2`}>Wedding Gift</p>
                        <h2 className={`${playfair.className} text-4xl md:text-5xl olive-text font-bold mb-4`}>Send Your Gift</h2>
                        <FloralDivider className="w-56 mx-auto mb-16" />

                        <div className="grid md:grid-cols-3 gap-6">
                            {invitation?.gift_accounts && invitation.gift_accounts.length > 0 ? (
                                invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={`${(i % 3) + 1}`} variant="BotanicalSage" />
                            ))
                            ) : (
                                <div className="col-span-3 sage-glass rounded-2xl p-10 text-[#5f7364] text-sm">Belum ada informasi rekening yang ditambahkan.</div>
                            )}
                        </div>

                        {(invitation?.groom_address || invitation?.bride_address) && (
                            <div className="mt-10 sage-glass rounded-2xl p-8 max-w-2xl mx-auto text-center">
                                <p className="text-[10px] text-[#5f7364] mb-3 uppercase tracking-widest font-bold">Kirim Kado Fisik</p>
                                <p className="text-sm text-[#3a4d3e] font-medium leading-relaxed">{invitation.bride_address || invitation.groom_address}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── 10. FOOTER ── */}
                {/* ── FOOTER ── */}
                <footer className="bg-[#3a4d3e] text-white pt-64 pb-24 px-8 text-center relative overflow-hidden">
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 z-0">
                        {invitation?.footer_image ? (
                            <img src={getPhoto(invitation.footer_image)} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof landingPhoto !== 'undefined' && landingPhoto ? (
                            <img src={landingPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof coverPhoto !== 'undefined' && coverPhoto ? (
                            <img src={coverPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : (
                            <div className="w-full h-full bg-[#3a4d3e] opacity-40"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#3a4d3e] via-[#3a4d3e]/60 to-transparent" />
                    </div>
                    
                    {/* Content Layer */}
                    <div className="relative z-10 pt-10">
                        <p className={`${poppins.className} text-[10px] text-white/50 tracking-[0.3em] uppercase font-bold mb-4`}>
                            Thank you for being part of our special day
                        </p>
                        <h2 className={`${greatVibes.className} text-5xl mb-4 text-white drop-shadow-sm`}>
                            {invitation?.groom_name?.split(' ')[0]} <span className="text-white/50 font-light mx-2">&</span> {invitation?.bride_name?.split(' ')[0]}
                        </h2>
                        
                        {/* Branding */}
                        <div className="border-t border-white/10 pt-8 mt-12">
                            <p className="text-[9px] text-white/40 tracking-[0.2em] uppercase mb-2">Digital Invitation by</p>
                            <a href="https://digitvitation.my.id" target="_blank" rel="noreferrer" className="inline-block text-white/80 hover:text-white transition-colors">
                                <span className={`${playfair.className} text-lg font-bold tracking-wider uppercase`}>Digivitation</span>
                            </a>
                            <p className="text-[8px] text-white/30 mt-2 tracking-wider">© {new Date().getFullYear()} Digivitation. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
