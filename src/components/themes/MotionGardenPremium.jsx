'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Cormorant_Infant, Poppins, Great_Vibes } from 'next/font/google';
import toast from 'react-hot-toast';

const cormorant = Cormorant_Infant({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600'] });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: ['400'] });

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://digitvitation.my.id/storage';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://digitvitation.my.id/api';

export default function MotionGardenPremium({ payload, audioController }) {
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
            document.querySelectorAll('.g1-reveal').forEach(el => {
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

    const ORNAMENT_BOUQUET = 'https://hiialfivitation.com/wp-content/uploads/2025/11/garden-v2-05-bouquet-1.png';
    const VIDEO_BG = 'https://hiialfivitation.com/wp-content/uploads/2025/11/motion-garden-v2-05-compress.mp4';
    
    return (
        <div className={`min-h-screen bg-[#FDFBF7] text-[#4A4A4A] ${poppins.className} ${isOpen ? 'overflow-visible' : 'h-[100dvh] overflow-hidden'} motion-garden-premium-theme`}>
            <style dangerouslySetInnerHTML={{ __html: `
                .motion-garden-premium-theme .g1-reveal { opacity: 0; transform: translateY(35px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
                .motion-garden-premium-theme .g1-reveal.active { opacity: 1; transform: translateY(0); }
                .motion-garden-premium-theme .g1-reveal[data-delay="1"] { transition-delay: 0.15s; }
                .motion-garden-premium-theme .g1-reveal[data-delay="2"] { transition-delay: 0.3s; }
                .motion-garden-premium-theme .g1-reveal[data-delay="3"] { transition-delay: 0.45s; }

                /* Custom Scrollbar scoped */
                .motion-garden-premium-theme::-webkit-scrollbar { width: 6px; }
                .motion-garden-premium-theme::-webkit-scrollbar-track { background: #FDFBF7; }
                .motion-garden-premium-theme::-webkit-scrollbar-thumb { background: #c9ad93; border-radius: 10px; }
                
                /* Split Layout */
                @media (min-width: 1024px) {
                    .g1-split-left { position: fixed; top: 0; left: 0; width: 70%; height: 100vh; z-index: 10; }
                    .g1-split-right { margin-left: 70%; width: 30%; }
                }

                .motion-garden-premium-theme .text-green-accent { color: #A57B52; }
                .motion-garden-premium-theme .bg-green-accent { background-color: #A57B52; border-color: #A57B52; }
                .motion-garden-premium-theme .border-green-accent { border-color: #A57B52; }
                
                .motion-garden-premium-theme .g1-glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.5); }
            `}} />

            {invitation?.music_url && (
                <button 
                    onClick={() => audioController?.toggle()}
                    className={`fixed bottom-6 right-6 z-50 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-[#A57B52]/20 flex items-center justify-center text-[#A57B52] transition-all hover:scale-110 ${audioController?.isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}
                >
                    {audioController?.isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    )}
                </button>
            )}

            {/* ══════════════════════ LEFT PANE (DESKTOP) ══════════════════════ */}
            <div className="hidden lg:block g1-split-left bg-[#9e7a4b] relative overflow-hidden">
                <div className="absolute inset-0">
                    {coverPhoto ? (
                        <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover object-center" />
                    ) : (
                        <video className="w-full h-full object-cover" autoPlay muted loop playsInline poster="/themes/motion-garden-premium/garden-v2-05-fallback.jpeg">
                            <source src={VIDEO_BG} type="video/mp4" />
                        </video>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#9e7a4b] via-[#9e7a4b]/60 to-transparent" />
                </div>
                
                <div className="absolute bottom-16 right-16 text-right text-white drop-shadow-lg">
                    <p className={`${greatVibes.className} text-4xl mb-1`}>The Wedding of</p>
                    <h1 className={`${cormorant.className} text-5xl font-bold uppercase tracking-wider mb-2`}>
                        {invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}
                    </h1>
                    <p className={`${poppins.className} text-sm font-semibold tracking-widest uppercase`}>
                        {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* ══════════════════════ RIGHT PANE (MOBILE / CONTENT) ══════════════════════ */}
            <div className="g1-split-right relative min-h-screen shadow-2xl">
                
                {/* ── COVER SECTION ── */}
                <section className={`absolute top-0 inset-x-0 h-[100dvh] lg:h-screen z-[60] flex flex-col items-center justify-between py-16 transition-all duration-[1200ms] ease-in-out ${isOpen ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 bg-[#42382e]'}`}>
                    <div className="absolute inset-0">
                        {landingPhoto ? (
                            <img src={landingPhoto} alt="Cover Right" className="w-full h-full object-cover" />
                        ) : coverPhoto ? (
                            <img src={coverPhoto} alt="Cover Right" className="w-full h-full object-cover" />
                        ) : (
                            <video className="w-full h-full object-cover" autoPlay muted loop playsInline poster="/themes/motion-garden-premium/garden-v2-05-fallback.jpeg">
                                <source src={VIDEO_BG} type="video/mp4" />
                            </video>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#2a2119]/80 via-transparent to-[#9e7a4b]/90" />
                    </div>

                    <div className="relative z-10 text-center px-8 w-full mt-4">
                        <p className={`${greatVibes.className} text-3xl text-white/90 mb-1 drop-shadow-md`}>The Wedding of</p>
                        <h1 className={`${cormorant.className} text-4xl font-bold text-white tracking-widest uppercase drop-shadow-md`}>
                            {invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}
                        </h1>
                    </div>

                    <div className="relative z-10 text-center px-8 w-full mt-auto">
                        {guestName && (
                            <div className="mb-6">
                                <p className="text-xs text-white/80 tracking-widest mb-2 font-medium">Kepada Yth:</p>
                                <p className={`${cormorant.className} text-2xl text-white font-bold drop-shadow-lg`}>{guestName}</p>
                            </div>
                        )}

                        <button onClick={handleOpen} className="bg-[#bda57b] hover:bg-[#a68f68] text-[#2a2a2a] px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-xl inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                            Buka Undangan
                        </button>
                    </div>
                </section>

                {/* ── MAIN CONTENT ── */}
                <main className={`transition-all duration-[1000ms] w-full bg-white relative ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

                {/* ── Section 0: Motion Hero ── */}
                <section className="relative w-full h-screen overflow-hidden bg-[#2a2a2a]">
                    <video 
                        ref={heroVideoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                        muted
                        preload="auto"
                    >
                        <source src="/themes/motion-garden-premium/motion-garden-v2-05-compress.mp4" type="video/mp4" />
                    </video>
                    <div className={`absolute inset-0 bg-black/10 transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
                    
                    <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none`}>
                        <p className={`${cormorant.className} text-sm md:text-base text-[#1a1a1a] tracking-[0.25em] uppercase mb-6 font-medium drop-shadow-sm transition-all duration-1000 delay-300 ease-out ${showMotionText ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                            The Wedding Of
                        </p>
                        
                        <div className={`flex flex-col items-center gap-1 mb-8 transition-all duration-1000 delay-500 ease-out ${showMotionText ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
                            <h1 className={`${cormorant.className} text-5xl md:text-6xl text-[#c5a059] uppercase tracking-widest leading-none drop-shadow-sm`}>
                                {invitation?.groom_name?.split(' ')[0]}
                            </h1>
                            
                            <span className={`${greatVibes.className} text-4xl md:text-5xl text-[#c5a059] drop-shadow-sm my-1`}>
                                &
                            </span>
                            
                            <h1 className={`${cormorant.className} text-5xl md:text-6xl text-[#c5a059] uppercase tracking-widest leading-none drop-shadow-sm`}>
                                {invitation?.bride_name?.split(' ')[0]}
                            </h1>
                        </div>

                        <p className={`${cormorant.className} text-base md:text-lg font-bold text-[#1a1a1a] tracking-[0.4em] mb-12 drop-shadow-sm transition-all duration-1000 delay-700 ease-out ${showMotionText ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                            {`${String(eventDate.getDate()).padStart(2, '0')} . ${String(eventDate.getMonth() + 1).padStart(2, '0')} . ${String(eventDate.getFullYear()).slice(2)}`}
                        </p>

                        <div className={`transition-all duration-1000 delay-1000 ease-out ${showMotionText ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="animate-bounce border border-[#1a1a1a] rounded-[20px] w-[26px] h-[40px] flex items-center justify-center shadow-sm">
                                <svg className="w-3 h-3 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* ── Section 0.5: Cover Image with Top Gradient ── */}
                <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
                    {coverPhoto ? (
                        <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                    ) : photos.length > 0 ? (
                        <img src={getPhoto(photos[0])} alt="Gallery Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[#e8ebe8]" />
                    )}
                    {/* Gradient bawah halus menuju Quotes */}
                    <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/70 to-transparent z-10" />
                </section>

                {/* ── Section 1: Intro Verse ── */}
                <section className="py-20 px-8 text-center relative overflow-hidden bg-gradient-to-b from-[#FDFBF7] to-[#f9f6f0]">
                    <div className="relative z-10 g1-reveal">
                        <div className="flex justify-center items-center gap-3 mb-6">
                            <h2 className={`${cormorant.className} text-4xl text-green-accent uppercase font-bold`}>{invitation?.groom_name?.charAt(0)}</h2>
                            <span className={`${greatVibes.className} text-3xl text-green-accent`}>&</span>
                            <h2 className={`${cormorant.className} text-4xl text-green-accent uppercase font-bold`}>{invitation?.bride_name?.charAt(0)}</h2>
                        </div>
                        <p className="text-sm leading-[2] text-[#4A4A4A]/80 italic max-w-[280px] mx-auto">
                            "{invitation?.quotes || 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.'}"
                        </p>
                        <p className="text-xs text-[#4A4A4A]/60 mt-4 tracking-widest font-semibold uppercase">{invitation?.quotes_name || '- QS. Ar-Rum : 21 -'}</p>
                    </div>
                </section>

                {/* ── Section 2: Couple ── */}
                <section className="py-24 px-4 text-center relative overflow-hidden" style={{ backgroundImage: `url('/themes/motion-garden-premium/garden-v2-05-fallback.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'top' }}>
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
                    
                    <div className="relative z-10 w-full max-w-[360px] mx-auto border-2 border-[#bd9a5f] rounded-t-[250px] rounded-b-[250px] py-16 px-4">
                        <div className="g1-reveal mb-12 mt-4">
                            <img src={ORNAMENT_BOUQUET} alt="Bouquet" className="w-48 mx-auto mb-10 drop-shadow-xl hover:scale-105 transition-transform duration-700" />
                            <h2 className={`${greatVibes.className} text-[2.5rem] tracking-wide text-[#1a1a1a] leading-none mb-1`}>
                                We Are
                            </h2>
                            <h2 className={`${greatVibes.className} text-[2.5rem] tracking-wide text-[#1a1a1a] leading-none mb-8`}>
                                Getting Married!
                            </h2>
                            <p className="text-[11px] leading-[1.8] text-[#1a1a1a] max-w-[260px] mx-auto font-medium">
                                Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Ya Allah semoga ridho-Mu tercurah mengiringi pernikahan kami:
                            </p>
                        </div>

                        <div className="g1-reveal" data-delay="1">
                            <div className="relative w-56 mx-auto mb-10">
                                <img src="/themes/motion-garden-premium/garden-v2-05-couple-belakang-1.png" alt="" className="absolute left-[-20%] bottom-0 w-32 h-auto z-0 pointer-events-none drop-shadow-sm opacity-90" />
                                
                                <div className="w-56 h-80 mx-auto rounded-t-[200px] rounded-b-[200px] overflow-hidden shadow-2xl border-2 border-[#bd9a5f] relative z-10">
                                    {bridePhoto ? <img src={bridePhoto} className="w-full h-full object-cover" alt="Bride" /> : <div className="w-full h-full bg-[#e8ebe8]" />}
                                </div>

                                <img src="/themes/motion-garden-premium/garden-v2-05-couple-depan-1.png" alt="" className="absolute right-[-20%] -bottom-6 w-48 h-auto z-20 pointer-events-none drop-shadow-xl" />
                            </div>
                            <p className={`${greatVibes.className} text-[2.5rem] text-[#1a1a1a] mb-1 tracking-wide`}>{invitation?.bride_name?.split(' ')[0]}</p>
                            <h3 className={`${cormorant.className} text-xl font-bold uppercase tracking-widest text-[#1a1a1a] mb-2`}>{invitation?.bride_name}</h3>
                            <p className="text-[10px] text-[#1a1a1a]/80 leading-[1.8] mb-4 font-medium uppercase tracking-widest">
                                Putri dari Bapak {invitation?.bride_father || '...'} <br/> & Ibu {invitation?.bride_mother || '...'}
                            </p>
                            <a href="#" className="inline-flex items-center gap-1.5 bg-[#bd9a5f] text-white px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase font-semibold hover:bg-[#a88647] transition-all shadow-md">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                @username
                            </a>
                        </div>

                        <div className="flex justify-center my-10 g1-reveal">
                            <span className={`${greatVibes.className} text-6xl text-[#1a1a1a] drop-shadow-sm`}>&</span>
                        </div>

                        <div className="g1-reveal" data-delay="2" style={{ paddingBottom: '2rem' }}>
                            <div className="relative w-56 mx-auto mb-10">
                                <img src="/themes/motion-garden-premium/garden-v2-05-couple-belakang-flip-1.png" alt="" className="absolute right-[-20%] bottom-8 w-32 h-auto z-0 pointer-events-none drop-shadow-sm opacity-90" />
                                
                                <div className="w-56 h-80 mx-auto rounded-t-[200px] rounded-b-[200px] overflow-hidden shadow-2xl border-2 border-[#bd9a5f] relative z-10">
                                    {groomPhoto ? <img src={groomPhoto} className="w-full h-full object-cover" alt="Groom" /> : <div className="w-full h-full bg-[#e8ebe8]" />}
                                </div>

                                <img src="/themes/motion-garden-premium/garden-v2-05-couple-depan-flip-1.png" alt="" className="absolute left-[-20%] -bottom-6 w-48 h-auto z-20 pointer-events-none drop-shadow-xl" />
                            </div>
                            <p className={`${greatVibes.className} text-[2.5rem] text-[#1a1a1a] mb-1 tracking-wide`}>{invitation?.groom_name?.split(' ')[0]}</p>
                            <h3 className={`${cormorant.className} text-xl font-bold uppercase tracking-widest text-[#1a1a1a] mb-2`}>{invitation?.groom_name}</h3>
                            <p className="text-[10px] text-[#1a1a1a]/80 leading-[1.8] mb-4 font-medium uppercase tracking-widest">
                                Putra dari Bapak {invitation?.groom_father || '...'} <br/> & Ibu {invitation?.groom_mother || '...'}
                            </p>
                            <a href="#" className="inline-flex items-center gap-1.5 bg-[#bd9a5f] text-white px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase font-semibold hover:bg-[#a88647] transition-all shadow-md">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                @username
                            </a>
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
                        <section className="py-16 px-8 text-center bg-[#f9f6f0]">
                            <div className="g1-reveal">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-green-accent font-semibold mb-6">Turut Mengundang</p>
                                <div className="w-10 h-px bg-green-accent/30 mx-auto mb-8" />
                                <div className="space-y-2">
                                    {tmItems.map((name, i) => (
                                        <p key={i} className={`${cormorant.className} text-lg text-[#4A4A4A] font-medium`}>{name}</p>
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                })()}

                {/* ── Section 3: Save The Date ── */}
                <section className="py-20 px-8 text-center bg-gradient-to-b from-[#f9f6f0] to-white relative pb-32">
                    <div className="g1-reveal mb-12">
                        <img src={ORNAMENT_BOUQUET} alt="Bouquet" className="w-40 mx-auto mb-8 drop-shadow-xl opacity-80" />
                        <h2 className={`${cormorant.className} text-4xl text-green-accent font-bold uppercase tracking-widest mb-10`}>Save The Date</h2>
                        
                        {/* Countdown elements matching Elementor Garden */}
                        <div className="grid grid-cols-4 gap-2 mb-10 max-w-[300px] mx-auto">
                            {[
                                { val: countdown.days, label: 'Hari' },
                                { val: countdown.hours, label: 'Jam' },
                                { val: countdown.minutes, label: 'Menit' },
                                { val: countdown.seconds, label: 'Detik' },
                            ].map((item, i) => (
                                <div key={i} className="text-center bg-white py-3 rounded-lg shadow-sm border border-black/5">
                                    <p className={`${cormorant.className} text-2xl font-bold text-green-accent leading-none`}>{item.val}</p>
                                    <p className="text-[9px] text-[#4A4A4A]/60 tracking-wider uppercase mt-1">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-sm leading-relaxed text-[#4A4A4A]/70 max-w-[280px] mx-auto">
                            Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i, untuk menghadiri acara pernikahan kami:
                        </p>
                    </div>

                    {invitation?.events && invitation.events.length > 0 && (
                        <div className="space-y-6">
                            {[...invitation.events].sort((a, b) => a.sort_order - b.sort_order).map((event, idx) => (
                                <div key={idx} className="bg-white rounded-[40px] p-8 shadow-xl border border-[#A57B52]/10 g1-reveal mx-auto text-center" data-delay={`${(idx % 3) + 1}`}>
                                    <h3 className={`${cormorant.className} text-3xl font-bold text-green-accent mb-6 leading-tight`}>{event.name.split(' ').map((word,i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}</h3>
                                    
                                    <div className={`${cormorant.className} text-[#4A4A4A] font-bold text-lg mb-2 capitalize`}>
                                        {event.date ? new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long' }) : ''} <br/>
                                        <span className="text-2xl mt-1 block">{event.date ? new Date(event.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</span>
                                    </div>
                                    
                                    <p className="text-sm text-[#4A4A4A]/70 font-medium mb-6">
                                        {event.time_start?.substring(0, 5) || 'TBA'} WIB - {event.time_end ? event.time_end.substring(0, 5) + ' WIB' : 'Selesai'}
                                    </p>

                                    <div className="w-8 h-8 rounded-full bg-green-accent text-white flex items-center justify-center mx-auto mb-4 shadow-md">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 384 512"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>
                                    </div>

                                    <h4 className={`${cormorant.className} text-xl font-bold text-[#4A4A4A] mb-2`}>{event.location}</h4>
                                    <p className="text-xs text-[#4A4A4A]/60 leading-relaxed max-w-[200px] mx-auto mb-6">
                                        {event.address || ''}
                                    </p>

                                    {(event.latitude && event.longitude) && (
                                        <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer"
                                            className="bg-green-accent hover:bg-[#465b4b] text-white py-3 px-8 rounded-full text-xs tracking-widest uppercase inline-block shadow-md transition-colors">
                                            Google Map
                                        </a>
                                    )}
                                </div>
                            ))}
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
                        
                        {/* Gradient bawah halus menuju Live Streaming */}
                        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/70 to-transparent z-10" />
                    </section>
                )}

                {/* ── Section 4: Live Streaming ── */}
                <section className="py-20 px-8 text-center bg-[#FDFBF7]">
                    <div className="g1-reveal">
                        <h2 className={`${cormorant.className} text-4xl text-green-accent font-bold uppercase tracking-widest mb-6`}>Live Streaming</h2>
                        <p className="text-sm leading-relaxed text-[#4A4A4A]/70 max-w-[280px] mx-auto mb-8">
                            Temui kami secara virtual untuk menyaksikan acara pernikahan kami melalui tautan di bawah ini:
                        </p>
                        <a href={invitation?.live_stream_url || '#'} target="_blank" rel="noreferrer"
                            className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-full text-xs tracking-widest uppercase inline-flex items-center gap-2 shadow-md transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                            Tonton Live
                        </a>
                    </div>
                </section>

                {/* ── Section 5: Gallery ── */}
                {/* ── Section 5: Gallery ── */}
                {invitation?.gallery && invitation.gallery.length > 0 && (
                    <section className="bg-white py-20 px-8 relative">
                        <div className="text-center mb-12 g1-reveal">
                            <h2 className={`${cormorant.className} text-4xl text-[#A57B52] font-bold uppercase tracking-widest mb-4`}>Gallery</h2>
                            <p className="text-sm text-[#4A4A4A]/70">Moments to remember</p>
                        </div>
                        <div className="columns-2 gap-2 max-w-[360px] mx-auto">
                            {invitation.gallery.map((img, i) => (
                                <div key={i} className="break-inside-avoid mb-2 rounded-xl overflow-hidden g1-reveal relative group" data-delay={`${(i % 3) + 1}`}>
                                    <div className="absolute inset-0 bg-[#A57B52]/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                                    <img src={getPhoto(img)} className="w-full h-auto object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110 align-middle" alt={`Gallery ${i}`} loading="lazy" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Section 6: Love Story ── */}
                {invitation?.love_stories && invitation.love_stories.length > 0 && (
                    <section className="bg-gradient-to-b from-[#f9f6f0] to-[#FDFBF7] py-24 px-6 relative overflow-hidden">
                        <div className="text-center mb-16 g1-reveal">
                            <p className={`${greatVibes.className} text-2xl text-[#bd9a5f] mb-2`}>Our Journey</p>
                            <h2 className={`${cormorant.className} text-4xl text-[#A57B52] font-bold uppercase tracking-widest`}>Love Story</h2>
                        </div>
                        
                        {/* Timeline */}
                        <div className="relative max-w-[340px] mx-auto">
                            {/* Vertical Line */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#bd9a5f]/40 via-[#A57B52]/30 to-[#bd9a5f]/40 -translate-x-1/2" />
                            
                            {[...invitation.love_stories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((story, i) => (
                                <div key={story.id || i} className={`relative mb-16 last:mb-0 g1-reveal`} data-delay={`${(i % 3) + 1}`}>
                                    {/* Dot Connector */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-0 z-10">
                                        <div className="w-4 h-4 rounded-full bg-[#bd9a5f] border-[3px] border-white shadow-lg" />
                                    </div>
                                    
                                    {/* Date Badge */}
                                    <div className="text-center mb-4 pt-8">
                                        <span className="inline-block bg-[#A57B52] text-white text-[9px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full shadow-sm">
                                            {story.date ? new Date(story.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : `Chapter ${i + 1}`}
                                        </span>
                                    </div>
                                    
                                    {/* Card */}
                                    <div className="bg-white/90 backdrop-blur-sm rounded-[1.5rem] overflow-hidden shadow-xl border border-[#A57B52]/10 mx-2">
                                        {story.photo && (
                                            <div className="relative w-full h-48 overflow-hidden">
                                                <img src={getPhoto(story.photo)} alt={story.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                            </div>
                                        )}
                                        <div className="p-6 text-center">
                                            <h4 className={`${cormorant.className} text-2xl font-bold text-[#1a1a1a] mb-3 leading-tight`}>{story.title}</h4>
                                            <p className="text-xs text-[#4A4A4A]/70 leading-[1.9]">{story.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* End dot */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
                                <div className="w-3 h-3 rounded-full bg-[#bd9a5f]/50 border-2 border-white shadow" />
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Section 7: QR Checkin (VIP PASS STYLE) ── */}
                {guest && (
                    <section className="bg-gradient-to-b from-[#FDFBF7] to-[#eaddce] py-24 px-8 text-center relative border-y border-[#A57B52]/20">
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                        <div className="g1-reveal relative z-10">
                            <h2 className={`${cormorant.className} text-4xl text-[#A57B52] font-bold uppercase tracking-widest mb-4 drop-shadow-sm`}>Access Pass</h2>
                            <p className="text-xs text-[#4A4A4A]/70 leading-relaxed max-w-[260px] mx-auto mb-10 tracking-widest uppercase">
                                Please present this pass at the reception
                            </p>
                            
                            <div className="relative mx-auto w-full max-w-[280px]">
                                {/* Outer Glow */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#bd9a5f] via-[#f9e5b8] to-[#bd9a5f] rounded-[2rem] blur opacity-40"></div>
                                
                                {/* VIP Pass Card */}
                                <div className="relative bg-[#1a1411] rounded-[2rem] shadow-2xl border flex flex-col overflow-hidden" style={{ borderColor: 'rgba(189, 154, 95, 0.4)' }}>
                                    
                                    {/* Gold Top Border */}
                                    <div className="h-6 w-full bg-gradient-to-r from-[#bd9a5f] via-[#eaddce] to-[#bd9a5f]"></div>
                                    
                                    <div className="p-8 pb-4">
                                        {/* Logo / Header */}
                                        <div className="flex justify-between items-center mb-6">
                                            <span className={`${cormorant.className} text-[#A57B52] font-bold tracking-[0.2em] uppercase text-xs`}>VIP</span>
                                            <span className={`${greatVibes.className} text-[#f9e5b8] text-2xl`}>Admit One</span>
                                        </div>
                                        
                                        {/* QR Container */}
                                        <div className="bg-white p-3 rounded-2xl mx-auto shadow-[0_0_20px_rgba(189,154,95,0.15)] inline-block relative">
                                            {/* Cutout notches */}
                                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#1a1411] rounded-full -translate-y-1/2"></div>
                                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#1a1411] rounded-full -translate-y-1/2"></div>
                                            
                                            {guest.qr_code ? (
                                                <img src={guest.qr_code.startsWith('http') ? guest.qr_code : `${STORAGE_URL}/${guest.qr_code}`} alt="QR Code" className="w-[160px] h-[160px] object-contain relative z-10 mix-blend-multiply" />
                                            ) : (
                                                <div className="w-[160px] h-[160px] bg-slate-100 flex items-center justify-center flex-col relative z-10 border border-dashed border-slate-300 rounded-lg">
                                                    <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>
                                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Unavailable</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Dashed Separator */}
                                    <div className="w-full flex items-center px-4">
                                        <div className="w-3 h-6 bg-transparent border-r-[2px] border-r-[rgba(189,154,95,0.4)] rounded-r-full -ml-4" style={{ backgroundColor: '#FDFBF7' }}></div>
                                        <div className="flex-1 border-t-[1.5px] border-dashed" style={{ borderColor: 'rgba(189, 154, 95, 0.3)' }}></div>
                                        <div className="w-3 h-6 bg-transparent border-l-[2px] border-l-[rgba(189,154,95,0.4)] rounded-l-full -mr-4" style={{ backgroundColor: '#FDFBF7' }}></div>
                                    </div>
                                    
                                    {/* Footer Info */}
                                    <div className="px-6 pt-4 pb-8">
                                        <p className="text-[10px] text-[#A57B52] uppercase tracking-[0.3em] font-semibold mb-1">GUEST NAME</p>
                                        <p className={`${cormorant.className} text-2xl font-bold text-[#f9e5b8] uppercase tracking-wider truncate px-2`}>{guest.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Section 8: Wedding Gift ── */}
                <section className="bg-white py-20 px-8 text-center relative overflow-hidden">
                    <div className="g1-reveal mb-12">
                        <img src={ORNAMENT_BOUQUET} alt="Bouquet" className="w-32 mx-auto mb-6 opacity-60" />
                        <h2 className={`${cormorant.className} text-4xl text-green-accent font-bold uppercase tracking-widest mb-4`}>Wedding Gift</h2>
                        <p className="text-sm text-[#4A4A4A]/70 leading-relaxed max-w-[280px] mx-auto">
                            Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Dan jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless.
                        </p>
                    </div>

                    <div className="space-y-10 max-w-[340px] mx-auto">
                        {invitation?.gift_accounts && invitation.gift_accounts.length > 0 ? (
                            invitation.gift_accounts.map((acc, i) => {
                                const bankName = acc.bank?.name || acc.bank_name || 'Bank';
                                const bankLogo = getPhoto(acc.bank?.logo);
                                return (
                                <div key={acc.id || i} className="g1-reveal" data-delay={`${(i % 3) + 1}`}>
                                    {/* ATM Card UI */}
                                    <div className="relative w-full aspect-[1.586/1] rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-tr from-[#1a1411] via-[#3a2c24] to-[#1a1411] border border-[#bd9a5f]/40">
                                        
                                        {/* Background pattern & glow */}
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                                        <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#bd9a5f]/20 rounded-full blur-3xl pointer-events-none"></div>
                                        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[#bd9a5f]/20 rounded-full blur-3xl pointer-events-none"></div>

                                        {/* Card Top: Chip & Bank Info */}
                                        <div className="flex justify-between items-start relative z-10 w-full">
                                            {/* EMV Chip SVG */}
                                            <svg className="w-10 h-8 text-[#d4af37] opacity-90" viewBox="0 0 512 512" fill="currentColor">
                                                <path d="M416 112H96c-17.67 0-32 14.33-32 32v224c0 17.67 14.33 32 32 32h320c17.67 0 32-14.33 32-32V144c0-17.67-14.33-32-32-32zm-288 32h80v64h-80v-64zm0 128h80v64h-80v-64zm160-128h128v64H288v-64zm0 128h128v64H288v-64z"/>
                                            </svg>
                                            
                                            {/* Dynamic Bank Logo from API */}
                                            {bankLogo ? (
                                                <img src={bankLogo} alt={bankName} className="h-10 max-w-[160px] object-contain drop-shadow-md brightness-0 invert opacity-95" />
                                            ) : (
                                                <span className={`${cormorant.className} text-2xl font-bold text-white uppercase tracking-widest drop-shadow`}>{bankName}</span>
                                            )}
                                        </div>

                                        {/* Card Middle: Account Number */}
                                        <div className="relative z-10 text-left mt-4">
                                            <p className={`${poppins.className} text-xl tracking-[0.25em] font-medium text-white drop-shadow-md whitespace-nowrap`}>
                                                {String(acc.account_number).match(/.{1,4}/g)?.join(' ') || acc.account_number}
                                            </p>
                                        </div>

                                        {/* Card Bottom: Holder Name */}
                                        <div className="flex justify-between items-end relative z-10">
                                            <div className="text-left w-full">
                                                <p className="text-[8px] text-white/50 uppercase tracking-[0.2em] mb-1">Card Holder</p>
                                                <p className={`${poppins.className} text-sm text-white uppercase tracking-widest font-semibold drop-shadow truncate pr-2`}>{acc.account_holder}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                {/* Generic Master/Visa-like circles */}
                                                <div className="flex -space-x-3 opacity-80">
                                                    <div className="w-6 h-6 rounded-full bg-white/40 mix-blend-screen"></div>
                                                    <div className="w-6 h-6 rounded-full bg-white/40 mix-blend-screen"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button onClick={() => { navigator.clipboard.writeText(acc.account_number); toast.success('Nomor rekening disalin!'); }}
                                        className="mt-5 bg-gradient-to-r from-[#A57B52] to-[#8c6742] hover:opacity-90 text-white w-full py-3.5 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                        Salin Rekening {bankName}
                                    </button>
                                </div>
                                );
                            })
                        ) : (
                            <div className="bg-[#f9f6f0] rounded-2xl p-8 text-[#4A4A4A]/50 text-sm">Belum ada informasi rekening.</div>
                        )}
                    </div>
                </section>

                {/* ── Section 9: Wishes ── */}
                <section className="bg-gradient-to-b from-white to-[#f9f6f0] py-20 px-8 relative">
                    <div className="text-center mb-10 g1-reveal">
                        <h2 className={`${cormorant.className} text-4xl text-green-accent font-bold uppercase tracking-widest mb-4`}>Kirim Ucapan</h2>
                        <p className="text-sm text-[#4A4A4A]/70">Tuliskan doa & ucapan untuk kedua mempelai</p>
                    </div>

                    <div className="max-w-[300px] mx-auto">
                        <form onSubmit={submitWish} className="space-y-4 mb-10 g1-reveal" data-delay="1">
                            <div>
                                <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                                    className="w-full bg-white border border-green-accent/20 rounded-xl px-4 py-3 text-sm text-[#4A4A4A] focus:outline-none focus:border-green-accent shadow-sm transition-colors" placeholder="Nama Anda" />
                            </div>
                            <div>
                                <textarea value={messageInput} onChange={e => setMessageInput(e.target.value)}
                                    className="w-full bg-white border border-green-accent/20 rounded-xl px-4 py-3 text-sm text-[#4A4A4A] focus:outline-none focus:border-green-accent shadow-sm transition-colors h-28 resize-none" placeholder="Berikan ucapan dan doa" />
                            </div>
                            <button type="submit" disabled={submitting}
                                className="bg-green-accent hover:bg-[#465b4b] text-white w-full py-3.5 rounded-full text-xs tracking-widest uppercase font-bold shadow-lg disabled:opacity-50 transition-colors">
                                {submitting ? 'Mengirim...' : 'Kirim Ucapan'}
                            </button>
                        </form>

                        {/* Wishes list */}
                        {wishes.length > 0 && (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 g1-reveal" data-delay="2">
                                {wishes.map((w, i) => (
                                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-black/5">
                                        <p className={`${cormorant.className} text-lg font-bold text-green-accent mb-0 leading-none`}>{w.name}</p>
                                        <p className="text-[10px] text-[#4A4A4A]/40 mb-2">{new Date(w.created_at).toLocaleDateString('id-ID')}</p>
                                        <p className="text-xs text-[#4A4A4A]/80 leading-relaxed">{w.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="bg-[#2a2119] text-white pt-64 pb-24 px-8 text-center relative overflow-hidden">
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 z-0">
                        {invitation?.footer_image ? (
                            <img src={getPhoto(invitation.footer_image)} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof landingPhoto !== 'undefined' && landingPhoto ? (
                            <img src={landingPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : typeof coverPhoto !== 'undefined' && coverPhoto ? (
                            <img src={coverPhoto} alt="Footer BG" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                        ) : (
                            <div className="w-full h-full bg-[#2a2119] opacity-40"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2a2119] via-[#2a2119]/60 to-transparent" />
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
