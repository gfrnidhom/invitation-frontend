'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Cormorant_Infant, Poppins, Great_Vibes } from 'next/font/google';
import toast from 'react-hot-toast';

const cormorant = Cormorant_Infant({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600'] });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: ['400'] });

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://digitvitation.my.id/storage';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://digitvitation.my.id/api';

const ASSETS = {
    video: '/themes/serene-garden/motion-serene-garden.mp4',
    fallback: '/themes/serene-garden/garden-v2-01-fallback.jpeg',
    ayat: '/themes/motion-islamic/Islamic-01-Background.webp',
    bouquet: '/themes/motion-islamic/ISLAMIC-01-Bouquet-1000x1024.webp',
    couple1: '/themes/motion-islamic/ISLAMIC-01-Couple-Depan.webp',
    couple2: '/themes/motion-islamic/ISLAMIC-01-Couple-Belakang.webp',
    overlay: '/themes/motion-islamic/Islamic-01-Background.webp'
};

export default function MakrisLulu({ payload, audioController }) {
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
            try { const parsed = JSON.parse(photo); if (Array.isArray(parsed) && parsed.length > 0) photo = parsed[0]; } catch { }
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
        }, 11000);
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
        <div className={`min-h-screen bg-[#061510] text-[#D5E5DF] ${poppins.className} ${isOpen ? 'overflow-visible' : 'h-[100dvh] overflow-hidden'} makris-lulu-theme`}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .makris-lulu-theme .pg-reveal { opacity: 0; transform: translateY(35px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
                .makris-lulu-theme .pg-reveal.active { opacity: 1; transform: translateY(0); }
                .makris-lulu-theme .pg-reveal[data-delay="1"] { transition-delay: 0.15s; }
                .makris-lulu-theme .pg-reveal[data-delay="2"] { transition-delay: 0.3s; }
                .makris-lulu-theme .pg-reveal[data-delay="3"] { transition-delay: 0.45s; }

                /* Custom Scrollbar scoped */
                .makris-lulu-theme::-webkit-scrollbar { width: 6px; }
                .makris-lulu-theme::-webkit-scrollbar-track { background: #061510; }
                .makris-lulu-theme::-webkit-scrollbar-thumb { background: #CFB53B; border-radius: 10px; }
                
                /* Split Layout */
                @media (min-width: 1024px) {
                    .pg-split-left { position: fixed; top: 0; left: 0; width: 70%; height: 100vh; z-index: 10; }
                    .pg-split-right { margin-left: 70%; width: 30%; }
                }

                .makris-lulu-theme .text-pg-accent { color: #CFB53B; }
                .makris-lulu-theme .bg-pg-accent { background-color: #0C3826; border-color: #0C3826; }
                .makris-lulu-theme .border-pg-accent { border-color: #0C3826; }
                .makris-lulu-theme .text-pg-gold { color: #CFB53B; }
                .makris-lulu-theme .bg-pg-gold { background-color: #CFB53B; }
                
                .makris-lulu-theme .pg-glass { background: rgba(6, 21, 16, 0.8); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(207, 181, 59, 0.2); }
                
                .makris-lulu-theme .grayscale { 
                    filter: grayscale(1) opacity(0.2); 
                }
                
                .makris-lulu-theme .no-grayscale {
                    filter: grayscale(0) !important;
                }

                .makris-lulu-theme .pg-arch-card {
                    border-radius: 200px 200px 40px 40px;
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .makris-lulu-theme .vertical-text {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                }
                
                .makris-lulu-theme .text-outline {
                    -webkit-text-stroke: 1px rgba(255,255,255,0.1);
                    color: transparent;
                }
                
                .makris-lulu-theme .bg-invert .text-outline {
                    -webkit-text-stroke: 1px rgba(207,181,59,0.3);
                }
                
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .makris-lulu-theme .animate-marquee {
                    display: inline-block;
                    white-space: nowrap;
                    animation: marquee 25s linear infinite;
                }
            `}} />


            {invitation?.music_url && (
                <button
                    onClick={() => audioController?.toggle()}
                    className={`fixed bottom-6 right-6 z-50 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-black/10 flex items-center justify-center text-black transition-all hover:scale-110 ${audioController?.isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}
                >
                    {audioController?.isPlaying ? (
                        <svg className="w-5 h-5 no-grayscale" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                    ) : (
                        <svg className="w-5 h-5 no-grayscale" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    )}
                </button>
            )}

            {/* ══════════════════════ LEFT PANE (DESKTOP) ══════════════════════ */}
            <div className="hidden lg:block pg-split-left bg-black relative overflow-hidden">
                <div className="absolute inset-0">
                    {coverPhoto ? (
                        <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover object-center" />
                    ) : (
                        <video className="w-full h-full object-cover" autoPlay muted loop playsInline poster={ASSETS.fallback}>
                            <source src={ASSETS.video} type="video/mp4" />
                        </video>
                    )}
                    {/* High contrast black gradient at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                </div>

                {/* Floral overlay decoration at bottom */}
                <img src={ASSETS.overlay} alt="" className="absolute bottom-0 left-0 right-0 w-full h-auto object-cover pointer-events-none opacity-30 mix-blend-screen grayscale" />

                <div className="absolute bottom-16 left-16 text-left text-white drop-shadow-xl z-10">
                    <p className={`${greatVibes.className} text-5xl mb-2 text-white/90`}>The Wedding of</p>
                    <h1 className={`${cormorant.className} text-6xl font-bold uppercase tracking-wider mb-3`}>
                        {invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}
                    </h1>
                    <p className={`${poppins.className} text-sm font-medium tracking-widest capitalize text-white/80`}>
                        {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* ══════════════════════ RIGHT PANE (MOBILE / CONTENT) ══════════════════════ */}
            <div className="pg-split-right relative min-h-screen shadow-2xl">

                {/* ── COVER SECTION (Envelope) ── */}
                <section className={`absolute top-0 inset-x-0 h-[100dvh] lg:h-screen z-[60] overflow-hidden flex flex-col transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'opacity-0 pointer-events-none scale-105 blur-2xl' : 'opacity-100 scale-100 blur-0'} bg-[#061510]`}>
                    {/* Video Background */}
                    <video className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 scale-102 -translate-y-[1%]" autoPlay muted loop playsInline poster="/themes/makris-lulu/emerald-bg.png">
                        <source src="/themes/makris-lulu/emerald-bg.mp4" type="video/mp4" />
                    </video>

                    {/* Content Container */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-4 px-6 sm:px-8 py-10 overflow-hidden">

                        {/* Top Typography - "The Wedding Of" */}
                        <div className="text-center shrink-0 mb-4">
                            <p className={`${poppins.className} text-[9px] sm:text-[10px] text-white/60 tracking-[0.3em] mb-2 font-semibold uppercase`}>The Wedding Of</p>
                            <h1 className={`${greatVibes.className} text-4xl sm:text-5xl text-[#CFB53B] drop-shadow-lg leading-tight`}>
                                {invitation?.groom_name?.split(' ')[0]} <span className="text-white/80 mx-1">&</span> {invitation?.bride_name?.split(' ')[0]}
                            </h1>
                            <div className="w-16 h-px bg-[#CFB53B]/40 mx-auto mt-3" />
                        </div>

                        {/* Photo Frame - Elegant Rounded with Gold Border */}
                        <div className="relative mx-auto shrink-0 mb-2">
                            <div className="w-[200px] h-[260px] sm:w-[220px] sm:h-[290px] rounded-t-[120px] rounded-b-[20px] overflow-hidden border-2 border-[#CFB53B]/50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative">
                                {coverPhoto ? (
                                    <img src={coverPhoto} alt="Couple" className="w-full h-full object-cover" />
                                ) : landingPhoto ? (
                                    <img src={landingPhoto} alt="Couple" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#0A2219]" />
                                )}
                            </div>
                        </div>

                        {/* Glassmorphism Guest Panel */}
                        <div className="relative z-30 w-full mx-auto max-w-[280px] shrink-0 mt-6">
                            <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-4 sm:p-5 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
                                <p className={`${poppins.className} text-[7px] sm:text-[8px] tracking-[0.2em] text-white/50 mb-0.5 font-semibold uppercase`}>Kepada Yth.</p>
                                <p className={`${poppins.className} text-[7px] sm:text-[8px] tracking-[0.1em] text-white/50 mb-2 font-semibold uppercase`}>Bapak/Ibu/Saudara/i</p>
                                {guestName ? (
                                    <p className={`${cormorant.className} text-lg sm:text-xl text-[#DFB969] font-bold mb-3 tracking-wide`}>{guestName}</p>
                                ) : (
                                    <p className={`${cormorant.className} text-lg sm:text-xl text-[#DFB969] font-bold mb-3 tracking-wide`}>Nama Tamu</p>
                                )}

                                <button onClick={handleOpen} className="bg-[#B58D45] hover:bg-[#977335] text-white w-full py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-300 shadow-xl flex items-center justify-center gap-2 rounded-sm active:scale-95 border border-white/10">
                                    <svg className="w-3.5 h-3.5 no-grayscale" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                    Open Invitation
                                </button>
                            </div>
                        </div>

                    </div>
                </section>

                {/* ── MAIN CONTENT ── */}
                <main className={`transition-all duration-[1000ms] w-full bg-[#061510] relative ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

                    {/* ── Section 0: Motion Hero (Video) ── */}
                    <section className="relative w-full h-screen overflow-hidden bg-black">
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

                        <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none`}>
                            <p className={`${cormorant.className} text-[10px] md:text-xs text-black tracking-[0.3em] uppercase mb-4 font-medium transition-all duration-1000 delay-300 ease-out ${showMotionText ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                The Wedding Of
                            </p>

                            <div className={`flex flex-col items-center gap-0 mb-6 transition-all duration-1000 delay-500 ease-out ${showMotionText ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
                                <h1 className={`${cormorant.className} text-3xl md:text-4xl text-black uppercase tracking-[0.2em] leading-none`}>
                                    {invitation?.groom_name?.split(' ')[0]}
                                </h1>

                                <span className={`${greatVibes.className} text-2xl md:text-3xl text-black my-0.5`}>
                                    &
                                </span>

                                <h1 className={`${cormorant.className} text-3xl md:text-4xl text-black uppercase tracking-[0.2em] leading-none`}>
                                    {invitation?.bride_name?.split(' ')[0]}
                                </h1>
                            </div>

                            <p className={`${cormorant.className} text-xs md:text-sm font-bold text-black tracking-[0.3em] mb-10 transition-all duration-1000 delay-700 ease-out ${showMotionText ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                {`${String(eventDate.getDate()).padStart(2, '0')} . ${String(eventDate.getMonth() + 1).padStart(2, '0')} . ${String(eventDate.getFullYear()).slice(2)}`}
                            </p>

                            <div className={`transition-all duration-1000 delay-1000 ease-out ${showMotionText ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="animate-bounce border border-black rounded-[16px] w-[22px] h-[34px] flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-black no-grayscale" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Section 0.5: Cinematic Slideshow Cover Image ── */}
                    <section className="relative w-full bg-[#061510] overflow-hidden pb-12">
                        <div className="relative w-full h-[70vh] md:h-[80vh] pg-reveal overflow-hidden">

                            {/* Full Bleed Slideshow */}
                            {photos.length > 0 ? (
                                photos.map((photo, i) => (
                                    <div
                                        key={i}
                                        className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${i === (slideIndex % photos.length) ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                                            }`}
                                    >
                                        <img src={getPhoto(photo)} alt={`Cover Slide ${i}`} className="w-full h-full object-cover no-grayscale" />
                                    </div>
                                ))
                            ) : coverPhoto ? (
                                <img src={coverPhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover no-grayscale scale-105" />
                            ) : (
                                <div className="absolute inset-0 w-full h-full bg-[#030e0a]" />
                            )}

                            {/* Light gradient overlays to match the white theme */}
                            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#061510] via-[#061510]/80 to-transparent z-10 pointer-events-none" />
                        </div>
                    </section>

                    {/* ── Section 1: Intro Verse ── */}
                    <section className="py-20 px-8 text-center relative overflow-hidden bg-gradient-to-b from-[#061510] to-[#0A2219]">
                        <div className="relative z-10 pg-reveal">
                            <div className="flex justify-center items-center gap-3 mb-6">
                                <h2 className={`${cormorant.className} text-4xl text-[#CFB53B] uppercase font-bold`}>{invitation?.groom_name?.charAt(0)}</h2>
                                <span className={`${greatVibes.className} text-3xl text-white`}>&</span>
                                <h2 className={`${cormorant.className} text-4xl text-[#CFB53B] uppercase font-bold`}>{invitation?.bride_name?.charAt(0)}</h2>
                            </div>
                            <p className="text-sm leading-[2] text-[#D5E5DF]/70 italic max-w-[280px] mx-auto">
                                "{invitation?.quotes || 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.'}"
                            </p>
                            <p className="text-xs text-[#CFB53B] mt-4 tracking-widest font-semibold uppercase">{invitation?.quotes_name || '- QS. Ar-Rum : 21 -'}</p>
                        </div>
                    </section>

                    {/* ── Section 2: Couple ── */}
                    <section id="couple" className="py-24 px-4 text-center relative overflow-hidden" style={{ backgroundImage: `url('${ASSETS.fallback}')`, backgroundSize: 'cover', backgroundPosition: 'top' }}>
                        <div className="absolute inset-0 bg-[#0A2219]/90 backdrop-blur-[2px] grayscale" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#061510] via-transparent to-[#061510]" />

                        <div className="relative z-10 w-full max-w-[360px] mx-auto border border-[#CFB53B]/30 bg-[#061510]/80 backdrop-blur-sm rounded-t-[250px] rounded-b-[250px] py-16 px-4 shadow-[0_0_50px_rgba(207,181,59,0.05)]">
                            <div className="pg-reveal mb-12 mt-4">
                                <img src={ASSETS.bouquet} alt="Bouquet" className="w-48 mx-auto mb-10 drop-shadow-xl hover:scale-105 transition-transform duration-700 opacity-60 mix-blend-screen invert hue-rotate-[160deg] brightness-125 saturate-50" />
                                <h2 className={`${greatVibes.className} text-[2.5rem] tracking-wide text-[#CFB53B] leading-none mb-1`}>
                                    We Are
                                </h2>
                                <h2 className={`${greatVibes.className} text-[2.5rem] tracking-wide text-[#CFB53B] leading-none mb-8`}>
                                    Getting Married!
                                </h2>
                                <p className="text-[11px] leading-[1.8] text-white/70 max-w-[260px] mx-auto font-medium">
                                    Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Ya Allah semoga ridho-Mu tercurah mengiringi pernikahan kami:
                                </p>
                            </div>

                            <div className="pg-reveal" data-delay="1">
                                <div className="relative w-56 mx-auto mb-10">
                                    <img src={ASSETS.couple1} alt="" className="absolute left-[-15%] -bottom-4 w-20 h-auto z-0 pointer-events-none drop-shadow-sm opacity-50 mix-blend-screen invert hue-rotate-[160deg]" />

                                    <div className="w-56 h-80 mx-auto rounded-t-[200px] rounded-b-[200px] overflow-hidden shadow-2xl border border-[#CFB53B]/50 relative z-10">
                                        {bridePhoto ? <img src={bridePhoto} className="w-full h-full object-cover" alt="Bride" /> : <div className="w-full h-full bg-[#030e0a]" />}
                                    </div>

                                    <img src={ASSETS.couple2} alt="" className="absolute right-[-15%] -bottom-4 w-24 h-auto z-20 pointer-events-none drop-shadow-xl opacity-60 mix-blend-screen invert hue-rotate-[160deg]" />
                                </div>
                                <p className={`${greatVibes.className} text-[2.5rem] text-[#CFB53B] mb-1 tracking-wide drop-shadow-sm`}>{invitation?.bride_name?.split(' ')[0]}</p>
                                <h3 className={`${cormorant.className} text-xl font-bold uppercase tracking-widest text-white mb-2`}>{invitation?.bride_name}</h3>
                                <p className="text-[10px] text-white/50 leading-[1.8] mb-4 font-medium uppercase tracking-widest">
                                    Putri dari Bapak {invitation?.bride_father || '...'} <br /> & Ibu {invitation?.bride_mother || '...'}
                                </p>
                                {invitation?.bride_instagram && (
                                    <a href={`https://instagram.com/${invitation.bride_instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-[#CFB53B] text-black px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase font-semibold hover:bg-[#b89f30] transition-all shadow-md">
                                        <svg className="w-3 h-3 no-grayscale" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                        @{invitation.bride_instagram}
                                    </a>
                                )}
                            </div>

                            <div className="flex justify-center my-10 pg-reveal">
                                <span className={`${greatVibes.className} text-6xl text-white drop-shadow-sm`}>&</span>
                            </div>

                            <div className="pg-reveal" data-delay="2" style={{ paddingBottom: '2rem' }}>
                                <div className="relative w-56 mx-auto mb-10">
                                    <img src={ASSETS.couple2} alt="" className="absolute right-[-15%] -bottom-2 w-20 h-auto z-0 pointer-events-none drop-shadow-sm opacity-50 scale-x-[-1] mix-blend-screen invert hue-rotate-[160deg]" />

                                    <div className="w-56 h-80 mx-auto rounded-t-[200px] rounded-b-[200px] overflow-hidden shadow-2xl border border-[#CFB53B]/50 relative z-10">
                                        {groomPhoto ? <img src={groomPhoto} className="w-full h-full object-cover" alt="Groom" /> : <div className="w-full h-full bg-[#030e0a]" />}
                                    </div>

                                    <img src={ASSETS.couple1} alt="" className="absolute left-[-15%] -bottom-4 w-24 h-auto z-20 pointer-events-none drop-shadow-xl scale-x-[-1] opacity-60 mix-blend-screen invert hue-rotate-[160deg]" />
                                </div>
                                <p className={`${greatVibes.className} text-[2.5rem] text-[#CFB53B] mb-1 tracking-wide`}>{invitation?.groom_name?.split(' ')[0]}</p>
                                <h3 className={`${cormorant.className} text-xl font-bold uppercase tracking-widest text-white mb-2`}>{invitation?.groom_name}</h3>
                                <p className="text-[10px] text-white/50 leading-[1.8] mb-4 font-medium uppercase tracking-widest">
                                    Putra dari Bapak {invitation?.groom_father || '...'} <br /> & Ibu {invitation?.groom_mother || '...'}
                                </p>
                                {invitation?.groom_instagram && (
                                    <a href={`https://instagram.com/${invitation.groom_instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-[#CFB53B] text-black px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase font-semibold hover:bg-[#b89f30] transition-all shadow-md">
                                        <svg className="w-3 h-3 no-grayscale" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                        @{invitation.groom_instagram}
                                    </a>
                                )}
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
                            <section className="py-16 px-8 text-center bg-[#071a14]">
                                <div className="pg-reveal">
                                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#CFB53B] font-semibold mb-6">Turut Mengundang</p>
                                    <div className="w-10 h-px bg-white/20 mx-auto mb-8" />
                                    <div className="space-y-2">
                                        {tmItems.map((name, i) => (
                                            <p key={i} className={`${cormorant.className} text-lg text-white font-medium`}>{name}</p>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );
                    })()}

                    {/* ── Section 3: Save The Date (Full Visual, like Landing) ── */}
                    <section id="event" className="relative w-full min-h-[85vh] overflow-hidden flex flex-col items-center justify-center py-20 px-8 bg-gradient-to-b from-[#061510] to-[#0A2219]">

                        {/* Dark Emerald Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0b2b1f]/90 via-transparent to-black/70 pointer-events-none z-[1]" />
                        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-[#145C43]/20 blur-[100px] pointer-events-none rounded-full transform translate-x-1/4 -translate-y-1/4 z-[1]" />

                        {/* Monstera Leaves */}
                        <img src="/themes/makris-lulu/monstera.png" alt="" className="absolute -top-16 -right-16 w-[18rem] opacity-40 pointer-events-none mix-blend-lighten invert hue-rotate-[160deg] brightness-[2] saturate-50 z-[3]" />
                        <img src="/themes/makris-lulu/monstera.png" alt="" className="absolute -bottom-16 -left-16 w-[22rem] opacity-30 pointer-events-none mix-blend-lighten invert hue-rotate-[160deg] brightness-[2] saturate-50 rotate-[200deg] z-[3]" />

                        {/* Gradient top/bottom blend */}
                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#061510] to-transparent z-[5] pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#061510] to-transparent z-[5] pointer-events-none" />

                        {/* Content */}
                        <div className="relative z-10 text-center pg-reveal">

                            <p className={`${poppins.className} text-[10px] text-[#CFB53B] tracking-[0.5em] uppercase font-bold mb-3`}>Mark Your Calendar</p>
                            <h2 className={`${cormorant.className} text-5xl text-white font-bold uppercase tracking-[0.2em] mb-12 drop-shadow-lg`}>Save The Date</h2>

                            {/* Countdown Boxes with Glassmorphism */}
                            <div className="grid grid-cols-4 gap-3 mb-12 max-w-[320px] mx-auto">
                                {[
                                    { val: countdown.days, label: 'Hari' },
                                    { val: countdown.hours, label: 'Jam' },
                                    { val: countdown.minutes, label: 'Menit' },
                                    { val: countdown.seconds, label: 'Detik' },
                                ].map((item, i) => (
                                    <div key={i} className="text-center bg-black/40 backdrop-blur-md py-4 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-[#CFB53B]/30 relative overflow-hidden">
                                        {/* Subtle shine */}
                                        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                                        <p className={`${cormorant.className} text-3xl font-bold text-white leading-none relative z-10`}>{item.val}</p>
                                        <p className="text-[9px] text-[#CFB53B] tracking-wider uppercase mt-1.5 font-semibold relative z-10">{item.label}</p>
                                    </div>
                                ))}
                            </div>

                            <p className="text-sm leading-relaxed text-white/70 max-w-[280px] mx-auto">
                                Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i, untuk menghadiri acara pernikahan kami:
                            </p>
                        </div>
                    </section>

                    {/* ── Section 3b: Event Cards ── */}
                    <section className="py-20 px-8 text-center relative pb-32 overflow-hidden" style={{ backgroundImage: `url('${ASSETS.fallback}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div className="absolute inset-0 bg-[#0A2219]/90 backdrop-blur-[2px] grayscale" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#061510] via-transparent to-[#061510]" />

                        {invitation?.events && invitation.events.length > 0 && (
                            <div className="space-y-12 relative z-10">
                                {[...invitation.events].sort((a, b) => a.sort_order - b.sort_order).map((event, idx) => {
                                    const isEven = idx % 2 === 0;
                                    const dateObj = event.date ? new Date(event.date) : new Date();
                                    const dayNum = dateObj.getDate();
                                    const monthName = dateObj.toLocaleDateString('id-ID', { month: 'short' });
                                    const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });

                                    return (
                                        <div key={idx} className={`relative pg-reveal mx-auto max-w-[340px]`} data-delay={`${(idx % 3) + 1}`}>
                                            {/* Vertical Date Accent (Floating) */}
                                            <div className={`absolute -left-4 top-12 z-20 flex flex-col items-center gap-1 transition-transform group-hover:-translate-y-2`}>
                                                <span className={`${cormorant.className} vertical-text text-[10px] uppercase font-bold tracking-[0.4em] text-[#CFB53B]/70`}>
                                                    {dayName} . {monthName}
                                                </span>
                                                <div className={`w-px h-12 bg-white/20`} />
                                            </div>

                                            {/* Main Arch Card */}
                                            <div className={`relative pg-arch-card overflow-hidden shadow-2xl ${isEven ? 'bg-[#1b4333] text-white bg-invert' : 'bg-[#030907] text-[#D5E5DF]'} border border-[#CFB53B]/20`}>

                                                {/* Large Background Decorative Day Number */}
                                                <div className="absolute top-10 right-[-20px] z-0 leading-none select-none pointer-events-none">
                                                    <span className={`${cormorant.className} text-[180px] font-bold text-outline opacity-10`}>
                                                        {String(dayNum).padStart(2, '0')}
                                                    </span>
                                                </div>

                                                {/* Content Overlay */}
                                                <div className="relative z-10 p-10 pt-20 flex flex-col items-center">
                                                    {/* Initials / Stamp */}
                                                    <div className={`w-12 h-12 rounded-full border border-[#CFB53B]/50 flex items-center justify-center mb-8`}>
                                                        <span className={`${cormorant.className} text-xs font-bold tracking-widest text-[#CFB53B]`}>
                                                            {invitation?.groom_name?.charAt(0)}{invitation?.bride_name?.charAt(0)}
                                                        </span>
                                                    </div>

                                                    <p className="text-[10px] tracking-[0.4em] uppercase font-bold mb-4 opacity-60">The Wedding Event</p>

                                                    <h3 className={`${cormorant.className} text-4xl font-light uppercase tracking-widest mb-8 text-center leading-[1.1]`}>
                                                        {event.name}
                                                    </h3>

                                                    <div className="w-full h-px bg-current opacity-10 mb-8" />

                                                    <div className="space-y-6 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <p className="text-[11px] font-bold uppercase tracking-[0.2em]">{dayName}</p>
                                                            <p className={`${cormorant.className} text-2xl font-bold`}>
                                                                {dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col items-center gap-1">
                                                            <p className="text-[10px] font-medium tracking-[0.2em] opacity-60 italic">Time Of Reception</p>
                                                            <p className="text-sm font-bold tracking-widest">
                                                                {event.time_start?.substring(0, 5) || 'TBA'} — {event.time_end ? event.time_end.substring(0, 5) : 'END'}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col items-center pt-4 gap-2">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border border-[#CFB53B]/40`}>
                                                                <svg className="w-3 h-3 no-grayscale" fill="currentColor" viewBox="0 0 384 512"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className={`${cormorant.className} text-xl font-bold uppercase tracking-wider text-[#CFB53B]`}>{event.location}</h4>
                                                                <p className="text-[10px] leading-relaxed max-w-[200px] mx-auto opacity-70">
                                                                    {event.address || ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {(event.latitude && event.longitude) && (
                                                        <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer"
                                                            className={`mt-10 px-10 py-3.5 rounded-full text-[10px] tracking-[0.3em] uppercase font-bold transition-all border ${isEven ? 'bg-[#CFB53B] text-black border-[#CFB53B]' : 'bg-[#061510] text-[#CFB53B] border-[#CFB53B]'} hover:scale-105 shadow-xl`}>
                                                            View Map
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* ── Section 3.5: Gallery Slideshow ── */}
                    {photos.length > 1 && (
                        <section className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden pointer-events-none">
                            {photos.slice(1).map((photo, i) => (
                                <div
                                    key={i}
                                    className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${i === slideIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                                >
                                    <img src={getPhoto(photo)} alt={`Slide ${i}`} className="w-full h-full object-cover" />
                                </div>
                            ))}

                            <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#061510] via-[#061510]/70 to-transparent z-10" />
                        </section>
                    )}

                    {/* ── Section 4: Live Streaming ── */}
                    {invitation?.live_stream_url && (
                        <section className="py-20 px-8 text-center bg-[#061510]">
                            <div className="pg-reveal">
                                <h2 className={`${cormorant.className} text-4xl text-[#CFB53B] font-bold uppercase tracking-widest mb-6`}>Live Streaming</h2>
                                <p className="text-sm leading-relaxed text-[#D5E5DF]/60 max-w-[280px] mx-auto mb-8">
                                    Temui kami secara virtual untuk menyaksikan acara pernikahan kami melalui tautan di bawah ini:
                                </p>
                                <a href={invitation?.live_stream_url || '#'} target="_blank" rel="noreferrer"
                                    className="bg-[#1b4333] hover:bg-[#143226] text-[#D5E5DF] border border-[#CFB53B]/50 py-3 px-8 rounded-full text-xs tracking-widest uppercase inline-flex items-center gap-2 shadow-md transition-colors">
                                    <svg className="w-4 h-4 no-grayscale text-[#CFB53B]" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                    Tonton Live
                                </a>
                            </div>
                        </section>
                    )}

                    {/* ── Section 5: Gallery ── */}
                    {invitation?.gallery && invitation.gallery.length > 0 && (
                        <section id="gallery" className="bg-gradient-to-b from-[#061510] to-[#0A2219] py-20 px-8 relative">
                            <div className="text-center mb-12 pg-reveal">
                                <h2 className={`${cormorant.className} text-4xl text-[#CFB53B] font-bold uppercase tracking-widest mb-4`}>Gallery</h2>
                                <p className="text-sm text-[#D5E5DF]/50">Moments to remember</p>
                            </div>
                            <div className="columns-2 gap-2 max-w-[360px] mx-auto">
                                {invitation.gallery.map((img, i) => (
                                    <div key={i} className="break-inside-avoid mb-2 rounded-xl overflow-hidden pg-reveal relative group" data-delay={`${(i % 3) + 1}`}>
                                        <div className="absolute inset-0 bg-[#061510]/30 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                                        <img src={getPhoto(img)} className="w-full h-auto object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110 align-middle no-grayscale" alt={`Gallery ${i}`} loading="lazy" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Section 6: Love Story (Editorial Magazine Layout) ── */}
                    {invitation?.love_stories && invitation.love_stories.length > 0 && (
                        <section className="bg-black py-24 px-0 relative overflow-hidden">
                            {/* Section Header */}
                            <div className="text-center mb-20 px-8 pg-reveal">
                                <p className="text-[10px] tracking-[0.5em] uppercase text-[#CFB53B] font-bold mb-4">Our Journey Together</p>
                                <h2 className={`${cormorant.className} text-5xl text-[#D5E5DF] font-light uppercase tracking-[0.3em]`}>Love Story</h2>
                                <div className="w-12 h-px bg-[#CFB53B]/50 mx-auto mt-6" />
                            </div>

                            {/* Stories */}
                            <div className="space-y-0">
                                {[...invitation.love_stories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((story, i) => {
                                    const isOdd = i % 2 !== 0;
                                    const chapterNum = String(i + 1).padStart(2, '0');

                                    return (
                                        <div key={story.id || i} className="pg-reveal" data-delay={`${(i % 3) + 1}`}>
                                            {/* Full-Width Photo Strip */}
                                            {story.photo && (
                                                <div className="relative w-full h-[50vh] overflow-hidden group border-y border-[#CFB53B]/20">
                                                    <img
                                                        src={getPhoto(story.photo)}
                                                        alt={story.title}
                                                        className="w-full h-full object-cover no-grayscale transition-transform duration-[3000ms] ease-out group-hover:scale-105"
                                                    />
                                                    {/* Overlay with large chapter number */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                                                    <div className={`absolute bottom-8 z-20 ${isOdd ? 'right-8 text-right' : 'left-8 text-left'}`}>
                                                        <span className={`${cormorant.className} text-[100px] md:text-[140px] font-bold text-[#CFB53B]/20 leading-none block`}>
                                                            {chapterNum}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Text Content Block */}
                                            <div className={`relative px-8 py-12 ${isOdd ? 'text-right' : 'text-left'} max-w-[400px] ${isOdd ? 'ml-auto' : 'mr-auto'}`}>
                                                {/* Date Badge */}
                                                <div className={`flex items-center gap-3 mb-6 ${isOdd ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`h-px w-12 bg-[#CFB53B]/50 ${isOdd ? 'order-2' : ''}`} />
                                                    <span className="text-[9px] tracking-[0.3em] uppercase text-[#CFB53B] font-bold">
                                                        {story.date ? new Date(story.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : `Chapter ${chapterNum}`}
                                                    </span>
                                                </div>

                                                <h4 className={`${cormorant.className} text-3xl font-light text-white uppercase tracking-widest mb-4 leading-tight`}>
                                                    {story.title}
                                                </h4>
                                                <p className="text-[11px] text-[#D5E5DF]/70 leading-[2.2] font-light">
                                                    {story.description}
                                                </p>
                                            </div>

                                            {/* Separator Line */}
                                            {i < invitation.love_stories.length - 1 && (
                                                <div className="flex items-center justify-center py-4">
                                                    <div className="w-px h-16 bg-[#CFB53B]/20" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bottom Seal */}
                            <div className="text-center mt-16 pg-reveal">
                                <div className="w-16 h-16 rounded-full border border-[#CFB53B]/40 flex items-center justify-center mx-auto bg-[#0A2219]">
                                    <span className={`${greatVibes.className} text-2xl text-[#CFB53B]`}>&</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── Section 7: QR Checkin (VIP PASS STYLE) ── */}
                    {guest && (
                        <section className="bg-gradient-to-b from-[#0A2219] to-[#061510] py-24 px-8 text-center relative border-y border-[#CFB53B]/20">
                            <div className="pg-reveal relative z-10">
                                <h2 className={`${cormorant.className} text-4xl text-[#CFB53B] font-bold uppercase tracking-widest mb-4 drop-shadow-sm`}>Access Pass</h2>
                                <p className="text-xs text-[#D5E5DF]/50 leading-relaxed max-w-[260px] mx-auto mb-10 tracking-widest uppercase">
                                    Please present this pass at the reception
                                </p>

                                <div className="relative mx-auto w-full max-w-[280px]">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[#061510] via-[#1b4333] to-[#061510] rounded-[2rem] blur opacity-50"></div>

                                    <div className="relative bg-[#030907] rounded-[2rem] shadow-2xl border border-[#CFB53B]/30 flex flex-col overflow-hidden">
                                        <div className="h-6 w-full bg-gradient-to-r from-[#061510] via-[#145C43] to-[#061510]"></div>

                                        <div className="p-8 pb-4">
                                            <div className="flex justify-between items-center mb-6">
                                                <span className={`${cormorant.className} text-[#CFB53B] font-bold tracking-[0.2em] uppercase text-xs`}>VIP</span>
                                                <span className={`${greatVibes.className} text-white text-2xl`}>Admit One</span>
                                            </div>

                                            <div className="bg-[#E5E5E5] p-3 rounded-2xl mx-auto shadow-[0_0_20px_rgba(207,181,59,0.2)] inline-block relative border border-[#CFB53B]">
                                                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#030907] rounded-full -translate-y-1/2 border-r border-[#CFB53B]/30"></div>
                                                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#030907] rounded-full -translate-y-1/2 border-l border-[#CFB53B]/30"></div>

                                                {guest.qr_code ? (
                                                    <img src={guest.qr_code.startsWith('http') ? guest.qr_code : `${STORAGE_URL}/${guest.qr_code}`} alt="QR Code" className="w-[160px] h-[160px] object-contain relative z-10 mix-blend-multiply no-grayscale" />
                                                ) : (
                                                    <div className="w-[160px] h-[160px] bg-slate-100 flex items-center justify-center flex-col relative z-10 border border-dashed border-slate-300 rounded-lg">
                                                        <svg className="w-8 h-8 text-slate-300 mb-2 no-grayscale" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>
                                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Unavailable</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-full flex items-center px-4">
                                            <div className="w-3 h-6 bg-[#0A2219] border-r-[2px] border-[#CFB53B]/30 rounded-r-full -ml-4"></div>
                                            <div className="flex-1 border-t border-dashed border-[#CFB53B]/30"></div>
                                            <div className="w-3 h-6 bg-[#0A2219] border-l-[2px] border-[#CFB53B]/30 rounded-l-full -mr-4"></div>
                                        </div>

                                        <div className="px-6 pt-4 pb-8">
                                            <p className="text-[10px] text-[#CFB53B]/60 uppercase tracking-[0.3em] font-semibold mb-1">GUEST NAME</p>
                                            <p className={`${cormorant.className} text-2xl font-bold text-[#CFB53B] uppercase tracking-wider truncate px-2 drop-shadow-sm`}>{guest.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── Section 8: Wedding Gift ── */}
                    <section id="gift" className="bg-[#061510] py-20 px-8 text-center relative overflow-hidden">
                        <div className="pg-reveal mb-12">
                            <img src={ASSETS.bouquet} alt="Bouquet" className="w-32 mx-auto mb-6 opacity-60 mix-blend-screen invert hue-rotate-[160deg] brightness-125 saturate-50" />
                            <h2 className={`${cormorant.className} text-4xl text-[#CFB53B] font-bold uppercase tracking-widest mb-4`}>Wedding Gift</h2>
                            <p className="text-sm text-[#D5E5DF]/70 leading-relaxed max-w-[280px] mx-auto">
                                Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Dan jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless.
                            </p>
                        </div>

                        <div className="space-y-10 max-w-[340px] mx-auto">
                            {invitation?.gift_accounts && invitation.gift_accounts.length > 0 ? (
                                invitation.gift_accounts.map((acc, i) => {
                                    const bankName = acc.bank?.name || acc.bank_name || 'Bank';
                                    const bankLogo = getPhoto(acc.bank?.logo);
                                    return (
                                        <div key={acc.id || i} className="pg-reveal" data-delay={`${(i % 3) + 1}`}>
                                            <div className="relative w-full aspect-[1.586/1] rounded-2xl shadow-[0_10px_40px_rgba(207,181,59,0.15)] p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-tr from-[#030907] via-[#0A2219] to-[#030907] border border-[#CFB53B]/30">

                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
                                                <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#CFB53B]/10 rounded-full blur-3xl pointer-events-none"></div>
                                                <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[#CFB53B]/10 rounded-full blur-3xl pointer-events-none"></div>

                                                <div className="flex justify-between items-start relative z-10 w-full">
                                                    <svg className="w-10 h-8 text-[#CFB53B]/80 no-grayscale" viewBox="0 0 512 512" fill="currentColor">
                                                        <path d="M416 112H96c-17.67 0-32 14.33-32 32v224c0 17.67 14.33 32 32 32h320c17.67 0 32-14.33 32-32V144c0-17.67-14.33-32-32-32zm-288 32h80v64h-80v-64zm0 128h80v64h-80v-64zm160-128h128v64H288v-64zm0 128h128v64H288v-64z" />
                                                    </svg>

                                                    {bankLogo ? (
                                                        <img src={bankLogo} alt={bankName} className="h-10 max-w-[160px] object-contain drop-shadow-md brightness-0 invert opacity-95 no-grayscale" />
                                                    ) : (
                                                        <span className={`${cormorant.className} text-2xl font-bold text-[#CFB53B] uppercase tracking-widest drop-shadow`}>{bankName}</span>
                                                    )}
                                                </div>

                                                <div className="relative z-10 text-left mt-4">
                                                    <p className={`${poppins.className} text-xl tracking-[0.25em] font-medium text-white drop-shadow-md whitespace-nowrap`}>
                                                        {String(acc.account_number).match(/.{1,4}/g)?.join(' ') || acc.account_number}
                                                    </p>
                                                </div>

                                                <div className="flex justify-between items-end relative z-10">
                                                    <div className="text-left w-full">
                                                        <p className="text-[8px] text-[#CFB53B]/70 uppercase tracking-[0.2em] mb-1">Card Holder</p>
                                                        <p className={`${poppins.className} text-sm text-white uppercase tracking-widest font-semibold drop-shadow truncate pr-2`}>{acc.account_holder}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="flex -space-x-3 opacity-80">
                                                            <div className="w-6 h-6 rounded-full bg-[#CFB53B]/50 mix-blend-screen"></div>
                                                            <div className="w-6 h-6 rounded-full bg-[#CFB53B]/50 mix-blend-screen"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <button onClick={() => { navigator.clipboard.writeText(acc.account_number); toast.success('Nomor rekening disalin!'); }}
                                                className="mt-5 bg-[#CFB53B] hover:bg-[#b59e31] text-black w-full py-3.5 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2">
                                                <svg className="w-4 h-4 no-grayscale" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                Salin Rekening {bankName}
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-[#030907] rounded-2xl p-8 text-[#D5E5DF]/30 text-sm border border-[#CFB53B]/10">Belum ada informasi rekening.</div>
                            )}
                        </div>
                    </section>

                    {/* ── Section 9: Wishes ── */}
                    <section className="bg-gradient-to-b from-[#061510] to-[#0A2219] py-20 px-8 relative">
                        <div className="text-center mb-10 pg-reveal">
                            <h2 className={`${cormorant.className} text-4xl text-[#CFB53B] font-bold uppercase tracking-widest mb-4`}>Kirim Ucapan</h2>
                            <p className="text-sm text-[#D5E5DF]/70">Tuliskan doa & ucapan untuk kedua mempelai</p>
                        </div>

                        <div className="max-w-[300px] mx-auto">
                            <form onSubmit={submitWish} className="space-y-4 mb-10 pg-reveal" data-delay="1">
                                <div>
                                    <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                                        className="w-full bg-[#030907] border border-[#CFB53B]/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CFB53B] shadow-sm transition-colors" placeholder="Nama Anda" />
                                </div>
                                <div>
                                    <textarea value={messageInput} onChange={e => setMessageInput(e.target.value)}
                                        className="w-full bg-[#030907] border border-[#CFB53B]/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CFB53B] shadow-sm transition-colors h-28 resize-none" placeholder="Berikan ucapan dan doa" />
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="bg-[#CFB53B] hover:bg-[#b59e31] text-black w-full py-3.5 rounded-full text-xs tracking-widest uppercase font-bold shadow-[0_0_20px_rgba(207,181,59,0.3)] disabled:opacity-50 transition-colors">
                                    {submitting ? 'Mengirim...' : 'Kirim Ucapan'}
                                </button>
                            </form>

                            {wishes.length > 0 && (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pg-reveal" data-delay="2">
                                    {wishes.map((w, i) => (
                                        <div key={i} className="bg-[#030907]/80 rounded-xl p-4 shadow-sm border border-[#CFB53B]/20">
                                            <p className={`${cormorant.className} text-lg font-bold text-[#CFB53B] mb-0 leading-none`}>{w.name}</p>
                                            <p className="text-[10px] text-white/30 mb-2">{new Date(w.created_at).toLocaleDateString('id-ID')}</p>
                                            <p className="text-xs text-white/80 leading-relaxed">{w.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── FOOTER ── */}
                    <footer className="bg-[#061510] text-[#D5E5DF] min-h-[90vh] flex flex-col justify-end pb-24 px-8 text-center relative overflow-hidden">
                        {/* Background Image Layer */}
                        <div className="absolute inset-0 z-0">
                            {invitation?.footer_image ? (
                                <img src={getPhoto(invitation.footer_image)} alt="Footer BG" className="w-full h-full object-cover opacity-30 mix-blend-luminosity" />
                            ) : typeof landingPhoto !== 'undefined' && landingPhoto ? (
                                <img src={landingPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-30 mix-blend-luminosity" />
                            ) : typeof coverPhoto !== 'undefined' && coverPhoto ? (
                                <img src={coverPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-30 mix-blend-luminosity" />
                            ) : (
                                <div className="w-full h-full bg-[#030907] opacity-40"></div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#061510] to-transparent" />
                        </div>

                        {/* Content Layer */}
                        <div className="relative z-10 pt-10">
                            <p className={`${poppins.className} text-[10px] text-[#CFB53B] tracking-[0.3em] uppercase font-bold mb-4`}>
                                Thank you for being part of our special day
                            </p>
                            <h2 className={`${greatVibes.className} text-5xl mb-4 text-[#D5E5DF] drop-shadow-sm`}>
                                {invitation?.groom_name?.split(' ')[0]} <span className="text-[#CFB53B] font-light mx-2">&</span> {invitation?.bride_name?.split(' ')[0]}
                            </h2>

                            {/* Branding */}
                            <div className="border-t border-[#CFB53B]/20 pt-8 mt-12">
                                <p className="text-[9px] text-[#D5E5DF]/40 tracking-[0.2em] uppercase mb-2">Digital Invitation by</p>
                                <a href="https://digitvitation.my.id" target="_blank" rel="noreferrer" className="inline-block text-[#CFB53B]/80 hover:text-[#CFB53B] transition-colors">
                                    <span className={`${cormorant.className} text-lg font-bold tracking-wider uppercase`}>Digivitation</span>
                                </a>
                                <p className="text-[8px] text-[#D5E5DF]/30 mt-2 tracking-wider">© {new Date().getFullYear()} Digivitation. All rights reserved.</p>
                            </div>
                        </div>
                    </footer>



                </main>
            </div>
        </div>
    );
}
