'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Cormorant_Infant, Poppins, Great_Vibes } from 'next/font/google';
import toast from 'react-hot-toast';
import GiftAtmCard from './partials/GiftAtmCard';

const cormorant = Cormorant_Infant({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600'] });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: ['400'] });

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://digitvitation.my.id/storage';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://digitvitation.my.id/api';

const ASSETS = {
    video: '/themes/adat-jawa/JAVA-1.mp4',
    fallback: '/themes/adat-jawa/JAWA-FALLBACK-1.webp',
    background: '/themes/adat-jawa/JAWA-BACKGROUND-1.webp',
    gunungan: '/themes/adat-jawa/JAWA-GUNUNGAN.webp',
    motifAtas: '/themes/adat-jawa/JAWA-MOTIF-ATAS-2.webp',
    motifBawah: '/themes/adat-jawa/JAWA-MOTIF-BAWAH.webp',
    pattern: '/themes/adat-jawa/JAWA-PATTERN.png',
    couple1: '/themes/adat-jawa/JAWA-COUPLE-1-1.webp',
    couple2: '/themes/adat-jawa/JAWA-COUPLE-2.webp'
};

export default function AdatJawa({ payload, audioController }) {
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
    const [nameInput, setNameInput] = useState(guestName || '');
    const [messageInput, setMessageInput] = useState('');
    const [wishes, setWishes] = useState(invitation?.guestMessages || []);
    const [submitting, setSubmitting] = useState(false);
    const heroVideoRef = useRef(null);
    const [showMotionText, setShowMotionText] = useState(false);

    const eventDate = (() => {
        if (!invitation?.event_date) return new Date();
        let baseDate = new Date(invitation.event_date.replace(' ', 'T'));
        if (isNaN(baseDate)) {
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
    const [slideIndex, setSlideIndex] = useState(0);

    const photos = invitation?.gallery?.length > 0 ? invitation.gallery.map(g => g.photo) : (invitation?.photos || []);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const diff = eventDate - now;
            if (diff > 0) {
                setCountdown({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / (1000 * 60)) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const len = photos.length > 1 ? photos.length - 1 : 0;
        if (len < 1) return;
        const interval = setInterval(() => {
            setSlideIndex(prev => (prev + 1) % len);
        }, 3500);
        return () => clearInterval(interval);
    }, [photos.length]);

    useEffect(() => {
        const handleScroll = () => {
            document.querySelectorAll('.pg-reveal').forEach(el => {
                const top = el.getBoundingClientRect().top;
                if (top < window.innerHeight - 50) el.classList.add('active');
            });
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isOpen]);

    const getPhoto = (p) => {
        if (!p) return null;
        let photo = p;
        if (typeof photo === 'string' && photo.startsWith('[')) {
            try { const parsed = JSON.parse(photo); if (Array.isArray(parsed) && parsed.length > 0) photo = parsed[0]; } catch {}
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

    const handleOpen = () => {
        setIsOpen(true);
        audioController?.play();
        if (heroVideoRef.current) {
            heroVideoRef.current.play().catch(e => console.log('Video play error:', e));
        }
        setTimeout(() => {
            setShowMotionText(true);
        }, 9000); // 9 seconds trigger per user request
    };

    const submitWish = async (e) => {
        e.preventDefault();
        if (!nameInput.trim() || !messageInput.trim()) return toast.error('Nama dan pesan harus diisi');
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/invitations/${invitation.id}/wishes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nameInput, message: messageInput })
            });
            if (res.ok) {
                const data = await res.json();
                setWishes(prev => [data.data || { name: nameInput, message: messageInput, created_at: new Date().toISOString() }, ...prev]);
                setMessageInput('');
                toast.success('Ucapan terkirim! 💌');
            }
        } catch (err) { toast.error('Gagal mengirim ucapan'); }
        setSubmitting(false);
    };

    const coverPhoto = (() => {
        const cp = invitation?.cover_photo;
        if (!cp) return null;
        return getPhoto(Array.isArray(cp) ? cp[0] : cp);
    })();

    const groomPhoto = getPhoto(invitation?.groom_photo);
    const bridePhoto = getPhoto(invitation?.bride_photo);

    return (
        <div className={`min-h-screen bg-[#110e0c] text-[#D8B67D] ${poppins.className} ${isOpen ? 'overflow-visible' : 'h-[100dvh] overflow-hidden'} adat-jawa-theme`}>
            {/* Pattern base applied to root wrapper */}
            {isOpen && (
                <div 
                    className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-screen" 
                    style={{ backgroundImage: `url('${ASSETS.pattern}')`, backgroundSize: '200px' }} 
                />
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                .adat-jawa-theme .pg-reveal { opacity: 0; transform: translateY(35px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
                .adat-jawa-theme .pg-reveal.active { opacity: 1; transform: translateY(0); }
                .adat-jawa-theme .pg-reveal[data-delay="1"] { transition-delay: 0.15s; }
                .adat-jawa-theme .pg-reveal[data-delay="2"] { transition-delay: 0.3s; }
                .adat-jawa-theme .pg-reveal[data-delay="3"] { transition-delay: 0.45s; }

                /* Custom Scrollbar scoped */
                .adat-jawa-theme::-webkit-scrollbar { width: 6px; }
                .adat-jawa-theme::-webkit-scrollbar-track { background: #110e0c; }
                .adat-jawa-theme::-webkit-scrollbar-thumb { background: #D8B67D; border-radius: 10px; }
                
                /* Split Layout */
                @media (min-width: 1024px) {
                    .pg-split-left { position: fixed; top: 0; left: 0; width: 70%; height: 100vh; z-index: 10; }
                    .pg-split-right { margin-left: 70%; width: 30%; }
                }

                .adat-jawa-theme .text-aj-accent { color: #D8B67D; }
                .adat-jawa-theme .bg-aj-accent { background-color: #D8B67D; border-color: #D8B67D; }
                .adat-jawa-theme .border-aj-accent { border-color: #D8B67D; }
                
                .adat-jawa-theme .text-outline {
                    -webkit-text-stroke: 1px rgba(216, 182, 125, 0.5);
                    color: transparent;
                }
            `}} />

            {invitation?.music_url && (
                <button 
                    onClick={() => audioController?.toggle()}
                    className={`fixed bottom-6 right-6 z-50 w-12 h-12 bg-black/60 backdrop-blur-md rounded-full shadow-lg border border-[#D8B67D]/40 flex items-center justify-center text-[#D8B67D] transition-all hover:scale-110 ${audioController?.isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}
                >
                    {audioController?.isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    )}
                </button>
            )}

            {/* ══════════════════════ LEFT PANE (DESKTOP) ══════════════════════ */}
            <div className="hidden lg:block pg-split-left bg-[#110e0c] relative overflow-hidden">
                <div className="absolute inset-0">
                    {coverPhoto ? (
                        <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover object-center" />
                    ) : (
                        <video className="w-full h-full object-cover grayscale opacity-80" autoPlay muted loop playsInline poster={ASSETS.fallback}>
                            <source src={ASSETS.video} type="video/mp4" />
                        </video>
                    )}
                    {/* Deep sepia gradient for authentic feel at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[#110e0c] via-[#110e0c]/50 to-transparent" />
                </div>
                
                {/* Traditional Batik Overlay on Left Screen */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-screen" 
                    style={{ backgroundImage: `url('${ASSETS.pattern}')`, backgroundSize: '300px' }} 
                />
                
                {/* Gunungan Accent at bottom right of the left pane */}
                <img src={ASSETS.gunungan} alt="" className="absolute bottom-[-15vh] right-20 w-[45vh] h-auto object-cover pointer-events-none opacity-40 mix-blend-screen" />
                
                <div className="absolute bottom-16 left-16 text-left text-[#D8B67D] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] z-10 w-full max-w-2xl">
                    <p className={`${greatVibes.className} text-6xl mb-2 text-[#D8B67D]`}>Paugeran Tresna</p>
                    <h1 className={`${cormorant.className} text-7xl font-bold uppercase tracking-wider mb-4`}>
                        {invitation?.groom_name?.split(' ')[0]} <span className="text-outline">&</span> {invitation?.bride_name?.split(' ')[0]}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-[1px] bg-[#D8B67D]" />
                        <p className={`${poppins.className} text-base font-medium tracking-[0.2em] uppercase text-[#D8B67D]/80`}>
                            {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* ══════════════════════ RIGHT PANE (MOBILE / CONTENT) ══════════════════════ */}
            <div className="pg-split-right relative min-h-screen shadow-2xl bg-[#F6F4EE]">
                
                {/* ── COVER SECTION (Envelope) ── */}
                <section className={`absolute top-0 inset-x-0 h-[100dvh] lg:h-screen z-[60] flex flex-col items-center justify-between transition-all duration-[1200ms] ease-in-out bg-[#110e0c] ${isOpen ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100'}`}>
                    
                    {/* Background Layer with Pattern */}
                    <div className="absolute inset-0 bg-[#0C0B0A]" />
                    <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: `url('${ASSETS.pattern}')`, backgroundSize: '150px' }} />

                    <div className="absolute inset-0">
                        {landingPhoto ? (
                            <img src={landingPhoto} alt="Cover Right" className="w-full h-full object-cover opacity-60" />
                        ) : coverPhoto ? (
                            <img src={coverPhoto} alt="Cover Right" className="w-full h-full object-cover opacity-60" />
                        ) : (
                            <img src={ASSETS.background} alt="Background" className="w-full h-full object-cover opacity-60" />
                        )}
                        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#0C0B0A]/90 via-[#0C0B0A]/40 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0C0B0A]/90 via-[#0C0B0A]/50 to-transparent" />
                    </div>

                    {/* TOP MOTIF OVERLAY */}
                    <img src={ASSETS.motifAtas} alt="" className="absolute top-0 inset-x-0 w-[80%] mx-auto max-w-[280px] z-20 pointer-events-none opacity-80" />

                    {/* TOP: "The Wedding of" + Names */}
                    <div className="relative z-10 text-center px-8 w-full pt-20">
                        <p className={`${greatVibes.className} text-4xl text-[#D8B67D] mb-4`}>Paugeran Tresna</p>
                        <h1 className={`${cormorant.className} text-[2.5rem] font-bold text-[#fcfbfa] tracking-widest uppercase`}>
                            {invitation?.groom_name?.split(' ')[0]}
                            <span className="block text-2xl my-1 text-[#D8B67D] font-light">&</span>
                            {invitation?.bride_name?.split(' ')[0]}
                        </h1>
                    </div>

                    {/* GUNUNGAN CENTRAL ART */}
                    <div className="relative z-10 my-auto w-full flex justify-center py-6">
                        <div className="relative w-48 h-48 rounded-full border border-[#D8B67D]/20 flex items-center justify-center p-4">
                            <img src={ASSETS.gunungan} alt="Gunungan" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(216,182,125,0.2)] animate-[pulse_4s_ease-in-out_infinite]" />
                        </div>
                    </div>

                    {/* BOTTOM: "Kepada Yth" + Button */}
                    <div className="relative z-20 text-center px-8 w-full pb-16">
                        <p className={`${poppins.className} text-[9px] tracking-[0.3em] uppercase text-[#D8B67D]/70 mb-2`}>Kepada Yth:</p>
                        {guestName && (
                            <p className={`${cormorant.className} text-2xl text-white font-bold mb-8 tracking-wider`}>{guestName}</p>
                        )}

                        <button onClick={handleOpen} className="bg-[#D8B67D] hover:bg-[#c9a76f] text-[#0C0B0A] px-10 py-3.5 rounded text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_20px_rgba(216,182,125,0.3)] inline-flex items-center gap-3 relative overflow-hidden group">
                           <span className="relative z-10 flex items-center gap-3">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" /></svg>
                                Buka Undangan
                           </span>
                           <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity z-0" />
                        </button>
                    </div>

                    {/* BOTTOM MOTIF OVERLAY */}
                    <img src={ASSETS.motifBawah} alt="" className="absolute bottom-0 inset-x-0 w-[80%] mx-auto max-w-[280px] z-10 pointer-events-none opacity-80" />
                </section>

                {/* ── MAIN CONTENT ── */}
                <main className={`transition-all duration-[1000ms] w-full bg-[#F6F4EE] relative ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

                {/* ── Section 0: Motion Hero (Video) ── */}
                <section className="relative w-full h-screen overflow-hidden bg-[#0C0B0A]">
                    <video 
                        ref={heroVideoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                        muted
                        preload="auto"
                        poster={ASSETS.fallback}
                    >
                        <source src={ASSETS.video} type="video/mp4" />
                    </video>
                    {/* Shadow overlay to make text readable over video */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0C0B0A]/60 via-transparent to-[#0C0B0A]/80 pointer-events-none" />
                    
                    <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10`}>
                        <p className={`${poppins.className} text-[9px] text-[#D8B67D] tracking-[0.5em] uppercase mb-6 font-semibold transition-all duration-1000 delay-300 ease-out ${showMotionText ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                            The Wedding Of
                        </p>
                        
                        <div className={`flex flex-col items-center gap-0 mb-8 transition-all duration-1000 delay-500 ease-out ${showMotionText ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
                            <h1 className={`${cormorant.className} text-[2.5rem] md:text-5xl text-white uppercase tracking-[0.1em] leading-none drop-shadow-xl text-center`}>
                                {invitation?.groom_name?.split(' ')[0]} <br/>
                                <span className={`${greatVibes.className} text-4xl text-[#D8B67D] leading-[0.5] py-2 inline-block`}>&</span> <br/>
                                {invitation?.bride_name?.split(' ')[0]}
                            </h1>
                        </div>

                        <p className={`${cormorant.className} text-sm md:text-base font-bold text-white tracking-[0.4em] mb-12 transition-all duration-1000 delay-700 ease-out ${showMotionText ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                            {`${String(eventDate.getDate()).padStart(2, '0')} . ${String(eventDate.getMonth() + 1).padStart(2, '0')} . ${String(eventDate.getFullYear()).slice(2)}`}
                        </p>

                        <div className={`transition-all duration-1000 delay-1000 ease-out ${showMotionText ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="animate-bounce border border-[#D8B67D]/50 rounded-[16px] w-[24px] h-[38px] flex items-center justify-center bg-black/20 backdrop-blur-sm">
                                <svg className="w-3 h-3 text-[#D8B67D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Section 0.5: Cinematic Slideshow Cover Image ── */}
                <section className="relative w-full bg-[#110e0c] overflow-hidden">
                    <div className="relative w-full h-[60vh] pg-reveal overflow-hidden">
                        {photos.length > 0 ? (
                            photos.map((photo, i) => (
                                <div 
                                    key={i}
                                    className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
                                        i === (slideIndex % photos.length) ? 'opacity-100' : 'opacity-0'
                                    }`}
                                >
                                    <img src={getPhoto(photo)} alt={`Cover Slide ${i}`} className="w-full h-full object-cover" />
                                </div>
                            ))
                        ) : coverPhoto ? (
                            <img src={coverPhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <img src={ASSETS.background} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        
                        {/* Motif overlay */}
                        <img src={ASSETS.motifAtas} alt="" className="absolute top-0 inset-x-0 w-full z-20 pointer-events-none opacity-50 mix-blend-screen scale-y-[-1]" />
                        
                        {/* Deep fade gradient overlays */}
                        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0C0B0A] via-[#0C0B0A]/40 to-transparent z-10 pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#F6F4EE] via-[#F6F4EE]/60 to-transparent z-10 pointer-events-none" />
                    </div>
                </section>

                {/* ── Section 1: Intro Verse ── */}
                <section className="py-24 px-8 text-center relative overflow-hidden bg-[#F6F4EE]">
                    {/* Background Pattern Watermark */}
                    <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url('${ASSETS.pattern}')`, backgroundSize: '150px' }} />
                    
                    <div className="relative z-10 pg-reveal">
                        <img src={ASSETS.gunungan} alt="Gunungan outline" className="w-20 mx-auto mb-8 opacity-20 invert" />
                        
                        <p className="text-[13px] leading-[2.2] text-[#2C1E16]/80 max-w-[300px] mx-auto font-medium">
                            "{invitation?.quotes || 'Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Ya Allah semoga ridho-Mu tercurah mengiringi pernikahan kami.'}"
                        </p>
                        <p className={`${poppins.className} text-[9px] text-[#D8B67D] mt-8 tracking-[0.2em] font-semibold uppercase`}>
                            {invitation?.quotes_name || '- Doa Pernikahan -'}
                        </p>
                    </div>
                </section>

                {/* ── Section 2: Couple ── */}
                <section className="pt-16 pb-32 px-6 text-center relative bg-[#F6F4EE] border-t border-[#D8B67D]/20">
                    <div className="relative z-10 max-w-[360px] mx-auto">
                        <div className="pg-reveal mb-20 text-center">
                            <p className={`${greatVibes.className} text-4xl text-[#D8B67D] mb-4`}>Sang Mempelai</p>
                            <h2 className={`${cormorant.className} text-3xl font-bold uppercase tracking-[0.15em] text-[#2C1E16]`}>
                                Dua Jiwa, <br/> Satu Tujuan
                            </h2>
                        </div>

                        {/* Bride */}
                        <div className="pg-reveal relative mb-24">
                            <div className="relative w-full max-w-[280px] mx-auto">
                                <div className="w-full aspect-[4/5] mx-auto relative bg-[#EAE5D9] group">
                                    <div className="absolute inset-0 border-[6px] border-[#D8B67D] opacity-30 transform translate-x-3 translate-y-3 pointer-events-none transition-transform duration-700 group-hover:translate-x-4 group-hover:translate-y-4" />
                                    <div className="w-full h-full border-4 border-[#2C1E16] relative overflow-hidden z-10 shadow-[5px_5px_15px_rgba(44,30,22,0.15)]">
                                        {bridePhoto ? (
                                            <img src={bridePhoto} className="w-full h-full object-cover sepia-[0.3] transition-all duration-1000 group-hover:scale-105 group-hover:sepia-0" alt="Bride" />
                                        ) : (
                                            <img src={ASSETS.couple1} className="w-full h-full object-cover sepia-[0.3] transition-all duration-1000 group-hover:scale-105 group-hover:sepia-0" alt="Bride Fallback" />
                                        )}
                                        <div className="absolute inset-2 border border-[#D8B67D]/60 pointer-events-none" />
                                    </div>
                                    <div className="absolute -top-8 -left-8 w-24 h-24 opacity-60 mix-blend-multiply z-20 pointer-events-none rotate-90">
                                        <img src={ASSETS.motifBawah} alt="" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-14 relative z-20 bg-[#F6F4EE] shadow-[0_-15px_15px_#F6F4EE]">
                                <h3 className={`${cormorant.className} text-4xl font-bold tracking-widest text-[#2C1E16] mb-3`}>
                                    {invitation?.bride_name}
                                </h3>
                                <p className={`${poppins.className} text-[10px] text-[#2C1E16]/70 leading-[2] uppercase tracking-[0.1em] font-medium`}>
                                    Putri dari <br/> {invitation?.bride_father || '...'} & {invitation?.bride_mother || '...'}
                                </p>
                                {invitation?.bride_instagram && (
                                    <a href={`https://instagram.com/${invitation.bride_instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-5 bg-[#2C1E16] text-[#D8B67D] px-6 py-2 rounded-full text-[10px] tracking-wider uppercase font-semibold shadow-md">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204... (truncated for clarity, reuse insta icon) ... 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                        @{invitation.bride_instagram}
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center my-20 pg-reveal pt-8 relative">
                            <div className="absolute inset-x-0 top-1/2 h-px bg-[#D8B67D]/30" />
                            <span className="relative z-10 bg-[#F6F4EE] px-6">
                                <span className={`${greatVibes.className} text-5xl text-[#2C1E16]`}>&</span>
                            </span>
                        </div>

                        {/* Groom */}
                        <div className="pg-reveal relative mt-16">
                            <div className="relative w-full max-w-[280px] mx-auto">
                                <div className="w-full aspect-[4/5] mx-auto relative bg-[#EAE5D9] group">
                                    <div className="absolute inset-0 border-[6px] border-[#D8B67D] opacity-30 transform -translate-x-3 translate-y-3 pointer-events-none transition-transform duration-700 group-hover:-translate-x-4 group-hover:translate-y-4" />
                                    <div className="w-full h-full border-4 border-[#2C1E16] relative overflow-hidden z-10 shadow-[-5px_5px_15px_rgba(44,30,22,0.15)]">
                                        {groomPhoto ? (
                                            <img src={groomPhoto} className="w-full h-full object-cover sepia-[0.3] transition-all duration-1000 group-hover:scale-105 group-hover:sepia-0" alt="Groom" />
                                        ) : (
                                            <img src={ASSETS.couple2} className="w-full h-full object-cover sepia-[0.3] transition-all duration-1000 group-hover:scale-105 group-hover:sepia-0" alt="Groom Fallback" />
                                        )}
                                        <div className="absolute inset-2 border border-[#D8B67D]/60 pointer-events-none" />
                                    </div>
                                    <div className="absolute -top-8 -right-8 w-24 h-24 opacity-60 mix-blend-multiply z-20 pointer-events-none scale-x-[-1] rotate-90">
                                        <img src={ASSETS.motifBawah} alt="" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-14 relative z-20 bg-[#F6F4EE] shadow-[0_-15px_15px_#F6F4EE]">
                                <h3 className={`${cormorant.className} text-4xl font-bold tracking-widest text-[#2C1E16] mb-3`}>
                                    {invitation?.groom_name}
                                </h3>
                                <p className={`${poppins.className} text-[10px] text-[#2C1E16]/70 leading-[2] uppercase tracking-[0.1em] font-medium`}>
                                    Putra dari <br/> {invitation?.groom_father || '...'} & {invitation?.groom_mother || '...'}
                                </p>
                                {invitation?.groom_instagram && (
                                    <a href={`https://instagram.com/${invitation.groom_instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-5 bg-[#2C1E16] text-[#D8B67D] px-6 py-2 rounded-full text-[10px] tracking-wider uppercase font-semibold shadow-md">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                        @{invitation.groom_instagram}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Section 2.5: Turut Mengundang ── */}
                {(() => {
                    let tmItems = invitation?.turut_mengundang || [];
                    if (typeof tmItems === 'string') {
                        try { tmItems = JSON.parse(tmItems); } catch { tmItems = []; }
                    }
                    if (!Array.isArray(tmItems)) tmItems = [];
                    tmItems = tmItems.filter(t => t && String(t).trim() !== '');
                    if (tmItems.length === 0) return null;
                    return (
                        <section className="py-20 px-8 text-center bg-[#110e0c] relative">
                            {/* Texture */}
                            <div className="absolute inset-0 opacity-[0.05] mix-blend-screen pointer-events-none" style={{ backgroundImage: `url('${ASSETS.pattern}')`, backgroundSize: '200px' }} />
                            
                            <div className="pg-reveal relative z-10">
                                <p className="text-[10px] tracking-[0.4em] uppercase text-[#D8B67D] font-bold mb-6">Turut Mengundang</p>
                                <div className="w-10 h-px bg-[#D8B67D]/40 mx-auto mb-10" />
                                <div className="space-y-4">
                                    {tmItems.map((name, i) => (
                                        <p key={i} className={`${cormorant.className} text-xl text-white font-medium tracking-wide`}>{name}</p>
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                })()}

                {/* ── Section 3: Save The Date & Events ── */}
                <section className="py-24 px-6 text-center bg-[#F6F4EE] relative overflow-hidden">
                    <img src={ASSETS.motifAtas} alt="" className="absolute top-0 left-0 w-48 opacity-40 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply pointer-events-none" />
                    
                    <div className="pg-reveal mb-16 relative z-10">
                        <img src={ASSETS.gunungan} alt="Gunungan" className="w-28 mx-auto mb-6 opacity-30 invert" />
                        <h2 className={`${cormorant.className} text-[2.5rem] text-[#2C1E16] font-bold uppercase tracking-[0.15em] mb-4`}>Rangkaian Acara</h2>
                        <p className="text-[11px] leading-relaxed text-[#2C1E16]/70 max-w-[280px] mx-auto uppercase tracking-widest font-medium mb-12">
                            Pahargyan & Resepsi
                        </p>
                        
                        {/* Boxed Countdown */}
                        <div className="bg-[#110e0c] text-[#D8B67D] p-6 rounded-2xl shadow-xl max-w-[320px] mx-auto border border-[#D8B67D]/30 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.05] mix-blend-screen" style={{ backgroundImage: `url('${ASSETS.pattern}')`, backgroundSize: '150px' }} />
                            <div className="flex justify-between items-center relative z-10">
                                {[
                                    { val: countdown.days, label: 'Hari' },
                                    { val: countdown.hours, label: 'Jam' },
                                    { val: countdown.minutes, label: 'Menit' },
                                    { val: countdown.seconds, label: 'Detik' },
                                ].map((item, i) => (
                                    <React.Fragment key={i}>
                                        <div className="flex-1 text-center">
                                            <p className={`${cormorant.className} text-3xl font-bold leading-none mb-1`}>{String(item.val).padStart(2, '0')}</p>
                                            <p className={`${poppins.className} text-[8px] tracking-[0.2em] font-semibold uppercase text-white/50`}>{item.label}</p>
                                        </div>
                                        {i < 3 && <div className="w-[1px] h-8 bg-[#D8B67D]/20" />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    {invitation?.events && invitation.events.length > 0 && (
                        <div className="space-y-16 mt-20 relative z-10">
                            {[...invitation.events].sort((a, b) => a.sort_order - b.sort_order).map((event, idx) => (
                                <div key={idx} className="relative pg-reveal mx-auto text-center max-w-[320px]" data-delay={`${(idx % 3) + 1}`}>
                                    {idx > 0 && <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#2C1E16]/20" />}
                                    
                                    <h3 className={`${greatVibes.className} text-4xl text-[#D8B67D] mb-4`}>{event.name}</h3>
                                    
                                    <div className="bg-white border text-[#2C1E16] rounded-t-full rounded-b-lg pt-12 pb-8 px-8 shadow-lg relative border-[#2C1E16]/10">
                                        <div className={`${cormorant.className} font-bold text-lg mb-2 capitalize tracking-wider`}>
                                            {event.date ? new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long' }) : ''}
                                            <span className="text-3xl mt-1 block tracking-wider">{event.date ? new Date(event.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</span>
                                        </div>
                                        
                                        <div className="w-12 h-[1px] bg-[#D8B67D]/60 mx-auto my-5" />
                                        
                                        <p className={`${poppins.className} text-[10px] text-[#2C1E16]/70 uppercase font-semibold tracking-widest mb-6`}>
                                            {event.time_start?.substring(0, 5) || 'TBA'} WIB — {event.time_end ? event.time_end.substring(0, 5) + ' WIB' : 'Selesai'}
                                        </p>

                                        <h4 className={`${cormorant.className} text-2xl font-bold mb-2`}>{event.location}</h4>
                                        <p className="text-xs text-[#2C1E16]/60 leading-relaxed mx-auto mb-8 font-medium">
                                            {event.address || ''}
                                        </p>

                                        {(event.latitude && event.longitude) && (
                                            <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer"
                                                className="bg-[#2C1E16] hover:bg-black text-[#D8B67D] py-3.5 px-8 rounded-sm text-[9px] font-bold tracking-[0.2em] uppercase inline-block shadow-md transition-colors border border-[#2C1E16]">
                                                Petunjuk Arah Map
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Section 4: Live Streaming ── */}
                {invitation?.live_stream_url && (
                <section className="py-20 px-8 text-center bg-[#110e0c] relative">
                    <div className="absolute inset-0 opacity-[0.05] mix-blend-screen pointer-events-none" style={{ backgroundImage: `url('${ASSETS.pattern}')`, backgroundSize: '150px' }} />
                    <div className="pg-reveal relative z-10">
                        <h2 className={`${cormorant.className} text-3xl text-white font-bold uppercase tracking-[0.1em] mb-4`}>Live Streaming</h2>
                        <div className="w-8 h-[1px] bg-[#D8B67D]/50 mx-auto mb-6" />
                        <p className="text-[11px] leading-relaxed text-white/60 max-w-[280px] mx-auto mb-10 font-medium">
                            Saksikan momen sakral kami secara virtual melalui tautan siaran langsung berikut.
                        </p>
                        <a href={invitation?.live_stream_url || '#'} target="_blank" rel="noreferrer"
                            className="bg-[#D8B67D] text-[#0C0B0A] py-3 px-8 rounded-sm text-[10px] font-bold tracking-[0.2em] uppercase inline-flex items-center gap-2 transition-colors hover:bg-white">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                            Gabung Siaran
                        </a>
                    </div>
                </section>
                )}

                {/* ── Section 4.5: Love Story ── */}
                {invitation?.love_stories && invitation.love_stories.length > 0 && (
                    <section className="py-24 px-8 bg-[#F6F4EE] relative overflow-hidden border-t border-[#D8B67D]/20">
                        <img src={ASSETS.motifBawah} alt="" className="absolute left-[-20%] bottom-[-10%] w-64 opacity-10 mix-blend-multiply pointer-events-none rotate-45" />
                        
                        <div className="text-center mb-16 pg-reveal relative z-10">
                            <h2 className={`${greatVibes.className} text-4xl text-[#D8B67D] mb-3`}>Kisah Cinta</h2>
                            <h3 className={`${cormorant.className} text-3xl font-bold uppercase tracking-[0.1em] text-[#2C1E16]`}>
                                Perjalanan <br/> Kasih Kami
                            </h3>
                            <div className="w-12 h-[1px] bg-[#2C1E16]/20 mx-auto mt-6" />
                        </div>

                        <div className="max-w-[320px] mx-auto space-y-12 relative z-10">
                            {[...invitation.love_stories].sort((a,b) => a.year - b.year).map((story, i) => (
                                <div key={i} className="relative pl-8 pg-reveal border-l-[1.5px] border-[#D8B67D]" data-delay={`${(i % 3) + 1}`}>
                                    <div className="absolute -left-[5px] top-1 w-[9px] h-[9px] bg-[#F6F4EE] border-[1.5px] border-[#D8B67D] rotate-45" />
                                    
                                    <span className={`${poppins.className} text-[9px] font-bold tracking-[0.3em] bg-[#2C1E16] text-[#D8B67D] px-3 py-1 uppercase rounded-sm inline-block mb-3`}>
                                        {story.year}
                                    </span>
                                    
                                    <h4 className={`${cormorant.className} text-xl text-[#2C1E16] font-bold mb-2 tracking-wider`}>
                                        {story.title}
                                    </h4>
                                    
                                    <p className="text-[11px] text-[#2C1E16]/70 leading-relaxed font-medium text-justify">
                                        {story.story}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Section 5: Gallery Masonry ── */}
                {photos && photos.length > 0 && (
                    <section className="bg-[#2C1E16] py-24 px-4 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.05] mix-blend-screen pointer-events-none" style={{ backgroundImage: `url('${ASSETS.pattern}')`, backgroundSize: '150px' }} />
                        <div className="text-center mb-16 pg-reveal relative z-10">
                            <h2 className={`${greatVibes.className} text-5xl text-[#D8B67D] font-bold mb-2`}>Kenangan</h2>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-semibold">Masa Indah Bersama</p>
                            <div className="w-10 h-px bg-[#D8B67D]/40 mx-auto mt-6" />
                        </div>
                        
                        <div className="max-w-[400px] mx-auto relative z-10">
                            <div className="pg-reveal columns-2 gap-4 space-y-4">
                                {photos.map((img, i) => (
                                    <div key={i} className="break-inside-avoid rounded-sm overflow-hidden border border-[#D8B67D]/20 p-1 bg-[#110e0c]" style={{ animationDelay: `${i * 150}ms` }}>
                                        <img src={getPhoto(img)} className="w-full h-auto object-cover sepia-[0.3] hover:sepia-0 transition-all duration-500 hover:scale-105" alt={`Masonry ${i}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Section 7: QR Checkin (VIP PASS) ── */}
                {guest && (
                    <section className="bg-[#F6F4EE] py-28 px-8 text-center relative border-y border-[#2C1E16]/10 overflow-hidden">
                        <img src={ASSETS.motifBawah} alt="" className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-64 opacity-10 mix-blend-multiply pointer-events-none -rotate-90" />
                        
                        <div className="pg-reveal relative z-10 max-w-[320px] mx-auto">
                            <h2 className={`${cormorant.className} text-4xl text-[#2C1E16] font-bold uppercase tracking-[0.1em] mb-3`}>Akses Masuk</h2>
                            <p className="text-[9px] text-[#2C1E16]/60 font-semibold mb-12 tracking-[0.3em] uppercase">
                                Tunjukkan QR ini saat resepsi
                            </p>
                            
                            <div className="bg-white rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-[#2C1E16]/5 relative">
                                <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-[#D8B67D] rounded-tl-xl" />
                                <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-[#D8B67D] rounded-br-xl" />
                                
                                <div className="bg-[#F6F4EE] rounded-2xl p-6 border border-[#2C1E16]/5 mb-6 shadow-inner mx-auto w-fit">
                                    {guest.qr_code ? (
                                        <img src={guest.qr_code.startsWith('http') ? guest.qr_code : `${STORAGE_URL}/${guest.qr_code}`} alt="QR Code" className="w-[180px] h-[180px] object-contain mix-blend-multiply" />
                                    ) : (
                                        <div className="w-[180px] h-[180px] flex items-center justify-center flex-col border-2 border-dashed border-[#2C1E16]/20 rounded-xl">
                                            <span className="text-[10px] text-[#2C1E16]/40 font-bold uppercase tracking-widest">Unavailable</span>
                                        </div>
                                    )}
                                </div>
                                <div className="border-t border-dashed border-[#2C1E16]/20 pt-6 pb-2">
                                    <p className={`${cormorant.className} text-2xl font-bold text-[#2C1E16] uppercase tracking-wider truncate`}>{guest.name}</p>
                                    <p className="text-[9px] text-[#D8B67D] uppercase tracking-[0.2em] font-bold mt-1">Undangan VIP</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Section 8: Wedding Gift ── */}
                <section className="bg-[#110e0c] py-28 px-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.05] mix-blend-screen pointer-events-none" style={{ backgroundImage: `url('${ASSETS.pattern}')`, backgroundSize: '200px' }} />
                    <div className="pg-reveal mb-16 relative z-10">
                        <img src={ASSETS.gunungan} alt="Icon" className="w-16 mx-auto mb-6 opacity-40 invert drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                        <h2 className={`${cormorant.className} text-[2.5rem] text-white font-bold uppercase tracking-[0.1em] mb-4`}>Tanda Kasih</h2>
                        <p className="text-[11px] text-[#D8B67D]/80 leading-relaxed max-w-[280px] mx-auto font-medium">
                            Doa restu Anda tak ternilai harganya. Namun jika Anda bermaksud memberikan tanda kasih, dapat mengirimkan melalui opsi di bawah ini.
                        </p>
                    </div>

                    <div className="space-y-8 max-w-[340px] mx-auto relative z-10">
                        {invitation?.gift_accounts && invitation.gift_accounts.length > 0 ? (
                            invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={(i % 3) + 1} variant="golden" />
                            ))
                        ) : (
                            <div className="bg-[#2C1E16]/40 border border-white/10 rounded-xl p-8 text-white/50 text-xs">Belum ada informasi.</div>
                        )}
                    </div>
                </section>

                {/* ── Section 9: Wishes ── */}
                <section className="bg-[#F6F4EE] py-24 px-8 relative border-t border-[#2C1E16]/10">
                    <div className="text-center mb-12 pg-reveal">
                        <h2 className={`${cormorant.className} text-3xl text-[#2C1E16] font-bold uppercase tracking-[0.1em] mb-4`}>Kirim Doa Restu</h2>
                        <div className="w-8 h-[1px] bg-[#D8B67D] mx-auto mb-4" />
                    </div>

                    <div className="max-w-[320px] mx-auto">
                        <form onSubmit={submitWish} className="space-y-5 mb-12 pg-reveal" data-delay="1">
                            <div>
                                <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                                    className="w-full bg-white border border-[#2C1E16]/20 rounded-md px-5 py-3.5 text-xs text-[#2C1E16] focus:outline-none focus:border-[#D8B67D] shadow-sm transition-colors" placeholder="Nama Lengkap Anda" />
                            </div>
                            <div>
                                <textarea value={messageInput} onChange={e => setMessageInput(e.target.value)}
                                    className="w-full bg-white border border-[#2C1E16]/20 rounded-md px-5 py-3.5 text-xs text-[#2C1E16] focus:outline-none focus:border-[#D8B67D] shadow-sm transition-colors h-32 resize-none leading-relaxed" placeholder="Tuliskan doa dan restu..." />
                            </div>
                            <button type="submit" disabled={submitting}
                                className="bg-[#2C1E16] hover:bg-[#110e0c] text-[#D8B67D] w-full py-4 rounded-md text-[10px] tracking-[0.2em] uppercase font-bold shadow-xl disabled:opacity-50 transition-colors">
                                {submitting ? 'Mengirim...' : 'Kirim Sekarang'}
                            </button>
                        </form>

                        {wishes.length > 0 && (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 pg-reveal" data-delay="2">
                                {wishes.map((w, i) => (
                                    <div key={i} className="bg-white rounded-lg p-5 shadow-sm border border-[#2C1E16]/5 relative">
                                        <h4 className={`${cormorant.className} text-xl font-bold text-[#2C1E16] mb-1 leading-none uppercase tracking-wide`}>{w.name}</h4>
                                        <p className="text-[9px] text-[#D8B67D] font-bold uppercase tracking-widest mb-3">{new Date(w.created_at).toLocaleDateString('id-ID')}</p>
                                        <p className="text-[11px] text-[#2C1E16]/70 leading-[1.8] font-medium">{w.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="bg-[#0C0B0A] text-white pt-64 pb-24 px-8 text-center relative overflow-hidden">
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 z-0">
                        {invitation?.footer_image ? (
                            <img src={getPhoto(invitation.footer_image)} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof landingPhoto !== 'undefined' && landingPhoto ? (
                            <img src={landingPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof coverPhoto !== 'undefined' && coverPhoto ? (
                            <img src={coverPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : (
                            <div className="w-full h-full bg-[#0C0B0A] opacity-40"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A] via-[#0C0B0A]/60 to-transparent" />
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
                                <span className={`${cormorant.className} text-lg font-bold tracking-wider uppercase`}>Digivitation</span>
                            </a>
                            <p className="text-[8px] text-white/30 mt-2 tracking-wider">© {new Date().getFullYear()} Digivitation. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
                </main>
            </div>
        </div>
    );
}
