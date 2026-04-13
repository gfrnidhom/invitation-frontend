'use client';

import GiftAtmCard from './partials/GiftAtmCard';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Playfair_Display, Great_Vibes, Jost } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: ['400'] });
const jost = Jost({ subsets: ['latin'], weight: ['200', '300', '400', '500', '600', '700'] });

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const ASSETS = {
    archFrame: '/themes/enchanted-garden/arch_frame.png',
    conservatory: '/themes/enchanted-garden/conservatory.png',
    divider: '/themes/enchanted-garden/divider.png',
};

export default function EnchantedGarden({ payload, audioController }) {
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
    const [scrollY, setScrollY] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const [nameInput, setNameInput] = useState(guestName || '');
    const [messageInput, setMessageInput] = useState('');
    const [wishes, setWishes] = useState(invitation?.guestMessages || []);
    const [submitting, setSubmitting] = useState(false);

    const eventDate = (() => {
        if (!invitation?.event_date) return new Date();
        const dateStr = invitation.event_date.split('T')[0].split(' ')[0];
        let timeStr = '08:00';
        if (invitation.event_time) {
            let match = invitation.event_time.replace(/\./g, ':').match(/(\d{1,2}:\d{2})/);
            if (match) {
                timeStr = match[0];
                if (timeStr.length === 4) timeStr = '0' + timeStr;
            }
        }
        const d = new Date(`${dateStr}T${timeStr}:00`);
        return isNaN(d) ? new Date(dateStr) : d;
    })();
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    /* ─── Countdown Timer ─── */
    useEffect(() => {
        const timer = setInterval(() => {
            const diff = eventDate - new Date();
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

    /* ─── Scroll & Mouse Parallax ─── */
    useEffect(() => {
        const onScroll = () => {
            setScrollY(window.scrollY);
            document.querySelectorAll('.eg-reveal').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 60) el.classList.add('active');
            });
        };
        const onMouse = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 2,
                y: (e.clientY / window.innerHeight - 0.5) * 2,
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('mousemove', onMouse, { passive: true });
        onScroll();
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('mousemove', onMouse);
        };
    }, [isOpen]);

    /* ─── Photo Helper ─── */
    const getPhoto = useCallback((p) => {
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
    }, []);

    const handleOpen = () => {
        setIsOpen(true);
        audioController?.play();
    };


    const submitWish = async (e) => {
        e.preventDefault();
        if (!nameInput.trim() || !messageInput.trim()) return toast.error('Nama dan pesan harus diisi');
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/invitations/${invitation.id}/wishes`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nameInput, message: messageInput }),
            });
            if (res.ok) {
                const data = await res.json();
                setWishes(prev => [data.data || { name: nameInput, message: messageInput, created_at: new Date().toISOString() }, ...prev]);
                setMessageInput('');
                toast.success('Ucapan terkirim! 💌');
            }
        } catch { toast.error('Gagal mengirim ucapan'); }
        setSubmitting(false);
    };

    const coverPhoto = getPhoto(invitation?.cover_photo);
    const groomPhoto = getPhoto(invitation?.groom_photo);
    const bridePhoto = getPhoto(invitation?.bride_photo);
    const photos = invitation?.gallery?.length > 0 ? invitation.gallery.map(g => g.photo) : (invitation?.photos || []);

    return (
        <div className={`min-h-screen ${jost.className} ${isOpen ? 'overflow-visible' : 'overflow-hidden'} enchanted-garden-theme`}
            style={{ background: 'linear-gradient(180deg, #f4f1ec 0%, #e8e4dc 30%, #dfd9cf 60%, #f4f1ec 100%)' }}>
            <style dangerouslySetInnerHTML={{ __html: `
                /* ── Reveal animation ── */
                .enchanted-garden-theme .eg-reveal { opacity: 0; transform: translateY(40px) scale(0.97); transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
                .enchanted-garden-theme .eg-reveal.active { opacity: 1; transform: translateY(0) scale(1); }
                .enchanted-garden-theme .eg-reveal[data-delay="1"] { transition-delay: 0.18s; }
                .enchanted-garden-theme .eg-reveal[data-delay="2"] { transition-delay: 0.36s; }
                .enchanted-garden-theme .eg-reveal[data-delay="3"] { transition-delay: 0.54s; }

                /* ── Parallax layers ── */
                .eg-parallax-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
                .eg-parallax-layer { position: absolute; pointer-events: none; will-change: transform; }

                /* ── Split layout ── */
                @media (min-width: 1024px) {
                    .eg-left { position: fixed; top: 0; left: 0; width: 70%; height: 100vh; z-index: 5; }
                    .eg-right { margin-left: 70%; width: 30%; position: relative; z-index: 10; }
                }

                /* ── Glass card ── */
                .eg-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 12px 40px rgba(0,0,0,0.06); border-radius: 32px; }

                /* ── Arch container ── */
                .eg-arch { position: relative; overflow: visible; }
                .eg-arch-content { border-radius: 999px 999px 24px 24px; overflow: hidden; }

                /* ── Button ── */
                .eg-btn { background: linear-gradient(135deg, #C9A96E 0%, #B8944D 100%); color: #fff; border: none; padding: 14px 36px; border-radius: 50px; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 600; cursor: pointer; transition: all 0.4s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 6px 20px rgba(201,169,110,0.3); }
                .eg-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(201,169,110,0.45); }
                .eg-btn-outline { background: transparent; border: 1.5px solid #C9A96E; color: #C9A96E; padding: 12px 32px; border-radius: 50px; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; cursor: pointer; transition: all 0.4s; }
                .eg-btn-outline:hover { background: #C9A96E; color: #fff; }

                /* ── Section bg ── */
                .eg-sage-bg { background: linear-gradient(180deg, #a8b89c33 0%, #a8b89c15 100%); }
                .eg-cream-bg { background: #faf8f4; }

                /* ── Scrollbar ── */
                .enchanted-garden-theme ::-webkit-scrollbar { width: 5px; }
                .enchanted-garden-theme ::-webkit-scrollbar-track { background: #f4f1ec; }
                .enchanted-garden-theme ::-webkit-scrollbar-thumb { background: #C9A96E55; border-radius: 10px; }

                /* ── Floating leaf animation ── */
                @keyframes floatLeaf { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(8deg); } }
                .eg-float-1 { animation: floatLeaf 6s ease-in-out infinite; }
                .eg-float-2 { animation: floatLeaf 8s ease-in-out infinite 1s; }
                .eg-float-3 { animation: floatLeaf 7s ease-in-out infinite 2s; }

                /* ── Gold text ── */
                .eg-gold { color: #C9A96E; }
                .eg-text { color: #3a3a35; }
                .eg-text-light { color: #6b6b60; }
                .eg-text-muted { color: #9a9a8f; }

                /* ── Love story timeline ── */
                .eg-timeline-line { width: 2px; background: linear-gradient(180deg, #C9A96E, #C9A96E44); }
            `}} />

            {/* ═══ Music Toggle ═══ */}
            {invitation?.music_url && (
                <MusicPlayer audioController={audioController} btnBg="eg-card" btnColor="eg-gold" btnBorder="border-none shadow-2xl" />
            )}

            {/* ═══════════════════ COVER ═══════════════════ */}
            <section className={`fixed inset-0 z-[60] flex items-center justify-center transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'opacity-0 pointer-events-none scale-110' : 'opacity-100 scale-100'}`}>
                {/* Background layers */}
                <div className="absolute inset-0 bg-[#f4f1ec]">
                    {/* Conservatory scene — deepest layer */}
                    <div className="absolute inset-0 flex items-center justify-center"
                        style={{ transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px) scale(1.05)` }}>
                        <img src={ASSETS.conservatory} alt="" className="w-full h-full object-cover opacity-15" />
                    </div>
                    {/* Arch frame — mid layer */}
                    <div className="absolute inset-0 flex items-center justify-center"
                        style={{ transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -12}px)` }}>
                        <img src={ASSETS.archFrame} alt="" className="h-[85vh] max-w-[90vw] object-contain opacity-35" />
                    </div>
                    {/* Divider — foreground layer */}
                    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-64 opacity-25 eg-float-2"
                        style={{ transform: `translateX(-50%) translate(${mousePos.x * -18}px, ${mousePos.y * -10}px)` }}>
                        <img src={ASSETS.divider} alt="" className="w-full object-contain" />
                    </div>
                </div>

                {/* Cover text */}
                <div className="relative z-10 text-center px-8">
                    <p className={`${playfair.className} text-[11px] tracking-[0.5em] uppercase eg-text-muted mb-6`}>The Wedding of</p>
                    <h1 className={`${greatVibes.className} text-6xl md:text-8xl eg-text mb-4`}>
                        {invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}
                    </h1>
                    <p className={`${playfair.className} text-[11px] tracking-[0.3em] eg-text-light mb-12`}>
                        {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>

                    {guestName && (
                        <div className="mb-10">
                            <p className="text-[9px] tracking-[0.25em] uppercase eg-text-muted mb-2">Kepada Yth:</p>
                            <p className={`${playfair.className} text-2xl md:text-3xl eg-text font-medium`}>{guestName}</p>
                        </div>
                    )}

                    <button onClick={handleOpen} className="eg-btn inline-flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                        Buka Undangan
                    </button>
                </div>
            </section>

            {/* ═══════════════════ MAIN ═══════════════════ */}
            <main className={`transition-all duration-[1200ms] ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

                {/* ── Fixed Parallax Background ── */}
                <div className="eg-parallax-bg overflow-hidden">
                    {/* Conservatory background — very subtle */}
                    <div className="absolute inset-0 opacity-[0.06]" style={{ transform: `translateY(${scrollY * 0.15}px) scale(1.1)` }}>
                        <img src={ASSETS.conservatory} alt="" className="w-full h-full object-cover" />
                    </div>
                    {/* Floating decorations */}
                    <div className="eg-parallax-layer eg-float-1 w-40 opacity-15" style={{ top: '8%', right: '5%', transform: `translate(${mousePos.x * -30}px, ${scrollY * 0.08}px) rotate(${scrollY * 0.02}deg)` }}>
                        <img src={ASSETS.divider} alt="" className="w-full object-contain" />
                    </div>
                    <div className="eg-parallax-layer eg-float-3 w-28 opacity-10" style={{ top: '45%', left: '3%', transform: `translate(${mousePos.x * 25}px, ${scrollY * -0.04}px) rotate(${-scrollY * 0.03}deg)` }}>
                        <img src={ASSETS.divider} alt="" className="w-full object-contain rotate-12" />
                    </div>
                    <div className="eg-parallax-layer eg-float-2 w-24 opacity-[0.08]" style={{ top: '75%', right: '8%', transform: `translate(${mousePos.x * 40}px, ${scrollY * -0.06}px)` }}>
                        <img src={ASSETS.archFrame} alt="" className="w-full object-contain" />
                    </div>
                </div>

                {/* ── LEFT PANEL — Desktop only ── */}
                <div className="eg-left hidden lg:flex flex-col items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #f4f1ec, #ebe7df)' }}>
                    <div className="absolute inset-0 opacity-[0.04]">
                        <img src={ASSETS.conservatory} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 w-full max-w-md px-12">
                        {/* Photo in arch shape with ornate frame */}
                        <div className="relative mb-12 eg-reveal active">
                            <div className="eg-arch-content aspect-[3/4] shadow-2xl">
                                <img src={coverPhoto || ASSETS.conservatory} alt="" className="w-full h-full object-cover" />
                            </div>
                            {/* Arch frame overlay */}
                            <div className="absolute -inset-6 -top-4 pointer-events-none opacity-70"
                                style={{ transform: `translate(${mousePos.x * -5}px, ${mousePos.y * -5}px)` }}>
                                <img src={ASSETS.archFrame} alt="" className="w-full h-full object-contain" />
                            </div>
                        </div>

                        <div className="text-center">
                            <p className={`${greatVibes.className} text-lg eg-gold mb-2`}>The Wedding of</p>
                            <h2 className={`${playfair.className} text-3xl xl:text-4xl eg-text font-bold tracking-wider uppercase`}>
                                {invitation?.groom_name}
                            </h2>
                            <p className={`${greatVibes.className} text-4xl eg-gold my-1`}>&</p>
                            <h2 className={`${playfair.className} text-3xl xl:text-4xl eg-text font-bold tracking-wider uppercase`}>
                                {invitation?.bride_name}
                            </h2>
                            <div className="flex items-center justify-center gap-4 mt-6">
                                <div className="h-px w-10 bg-[#C9A96E]/30" />
                                <p className="text-[10px] tracking-[0.3em] eg-text-muted uppercase">
                                    {eventDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                                <div className="h-px w-10 bg-[#C9A96E]/30" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL — Scrollable ── */}
                <div className="eg-right relative z-10">

                    {/* §1 — Intro Hero */}
                    <section className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                        {/* Mobile-only background */}
                        <div className="absolute inset-0 lg:hidden">
                            {coverPhoto && <img src={coverPhoto} alt="" className="w-full h-full object-cover opacity-15" />}
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #f4f1ec88, #f4f1ecee)' }} />
                        </div>

                        <div className="relative z-10 eg-reveal active">
                            {/* Arch frame decoration */}
                            <div className="relative mx-auto mb-12 w-64 h-72 md:w-80 md:h-96">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <img src={ASSETS.archFrame} alt="" className="w-full h-full object-contain opacity-40 eg-float-2"
                                        style={{ transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)` }} />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className={`${playfair.className} text-[10px] tracking-[0.4em] uppercase eg-text-muted mb-4`}>The Wedding of</p>
                                        <h2 className={`${playfair.className} text-4xl md:text-5xl eg-text font-bold uppercase tracking-wide mb-2`}>
                                            {invitation?.groom_name?.split(' ')[0]}
                                        </h2>
                                        <p className={`${greatVibes.className} text-5xl eg-gold`}>&</p>
                                        <h2 className={`${playfair.className} text-4xl md:text-5xl eg-text font-bold uppercase tracking-wide mt-2`}>
                                            {invitation?.bride_name?.split(' ')[0]}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-6 mb-6">
                                <div className="h-px w-12 bg-[#C9A96E]/40" />
                                <p className={`${playfair.className} text-[11px] tracking-[0.35em] eg-text-light uppercase`}>
                                    {eventDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, ' . ')}
                                </p>
                                <div className="h-px w-12 bg-[#C9A96E]/40" />
                            </div>

                            {/* Scroll indicator */}
                            <div className="mt-12 animate-bounce">
                                <svg className="w-5 h-5 mx-auto eg-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                            </div>
                        </div>
                    </section>

                    {/* §2 — Verse / Ayat */}
                    <section className="py-24 px-8 eg-sage-bg">
                        <div className="max-w-md mx-auto text-center eg-reveal">
                            <img src={ASSETS.divider} alt="" className="w-40 mx-auto mb-10 opacity-60" />
                            <p className={`${playfair.className} text-lg md:text-xl leading-[2] eg-text-light italic`}>
                                "{invitation?.quotes || 'Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu.'}"
                            </p>
                            <p className="mt-6 text-[10px] tracking-[0.3em] uppercase eg-text-muted">{invitation?.quotes_name || '— QS. Ar-Rum : 21 —'}</p>
                            <img src={ASSETS.divider} alt="" className="w-40 mx-auto mt-10 opacity-60 rotate-180" />
                        </div>
                    </section>

                    {/* §3 — Couple */}
                    <section className="py-24 px-8 eg-cream-bg">
                        <div className="text-center mb-16 eg-reveal">
                            <p className={`${greatVibes.className} text-2xl eg-gold mb-2`}>We Are Getting</p>
                            <h3 className={`${playfair.className} text-3xl tracking-[0.15em] uppercase eg-text font-bold`}>Married!</h3>
                        </div>
                        <p className="text-center text-sm eg-text-light mb-16 max-w-md mx-auto eg-reveal" data-delay="1">
                            Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Ya Allah semoga ridho-Mu tercurah mengiringi pernikahan kami:
                        </p>

                        {/* Groom */}
                        <div className="flex flex-col items-center text-center mb-16 eg-reveal" data-delay="1">
                            <div className="relative mb-8">
                                <div className="w-48 h-60 md:w-56 md:h-72 eg-arch-content shadow-xl">
                                    <img src={groomPhoto || ASSETS.conservatory} alt="Groom" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -inset-5 pointer-events-none opacity-50">
                                    <img src={ASSETS.archFrame} alt="" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <p className={`${greatVibes.className} text-3xl eg-gold mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p>
                            <h4 className={`${playfair.className} text-xl font-bold tracking-wider uppercase eg-text mb-2`}>{invitation?.groom_name}</h4>
                            {invitation?.groom_father && <p className="text-xs eg-text-muted">Putra dari Bpk {invitation.groom_father} & Ibu {invitation.groom_mother}</p>}
                        </div>

                        <div className="flex justify-center items-center h-16 eg-reveal" data-delay="2">
                            <span className={`${greatVibes.className} text-5xl eg-gold`}>&</span>
                        </div>

                        {/* Bride */}
                        <div className="flex flex-col items-center text-center mt-16 eg-reveal" data-delay="2">
                            <div className="relative mb-8">
                                <div className="w-48 h-60 md:w-56 md:h-72 eg-arch-content shadow-xl">
                                    <img src={bridePhoto || ASSETS.conservatory} alt="Bride" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -inset-5 pointer-events-none opacity-50">
                                    <img src={ASSETS.archFrame} alt="" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <p className={`${greatVibes.className} text-3xl eg-gold mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p>
                            <h4 className={`${playfair.className} text-xl font-bold tracking-wider uppercase eg-text mb-2`}>{invitation?.bride_name}</h4>
                            {invitation?.bride_father && <p className="text-xs eg-text-muted">Putri dari Bpk {invitation.bride_father} & Ibu {invitation.bride_mother}</p>}
                        </div>
                    </section>

                    {/* §4 — Save The Date & Countdown */}
                    <section className="py-24 px-8 eg-sage-bg text-center">
                        <div className="eg-reveal">
                            <p className={`${greatVibes.className} text-2xl eg-gold mb-2`}>Save The</p>
                            <h3 className={`${playfair.className} text-3xl tracking-[0.15em] uppercase eg-text font-bold mb-14`}>Date</h3>
                        </div>

                        <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mb-16 eg-reveal" data-delay="1">
                            {[
                                { v: countdown.days, l: 'Hari' },
                                { v: countdown.hours, l: 'Jam' },
                                { v: countdown.minutes, l: 'Menit' },
                                { v: countdown.seconds, l: 'Detik' },
                            ].map((item, i) => (
                                <div key={i} className="eg-card py-5 px-2 rounded-2xl text-center">
                                    <p className={`${playfair.className} text-3xl font-bold eg-text`}>{String(item.v).padStart(2, '0')}</p>
                                    <p className="text-[8px] tracking-[0.2em] uppercase eg-text-muted mt-1">{item.l}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-sm eg-text-light max-w-md mx-auto mb-14 eg-reveal" data-delay="2">
                            Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:
                        </p>

                        {/* Event Cards — Arch-shaped */}
                        <div className="space-y-14">
                            {invitation?.events && [...invitation.events].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((ev, i) => (
                                <div key={i} className="eg-reveal" data-delay={`${(i % 3) + 1}`}>
                                    <div className="eg-card p-10 max-w-sm mx-auto relative overflow-hidden">
                                        {/* Top arch decoration */}
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 opacity-25 pointer-events-none">
                                            <img src={ASSETS.divider} alt="" className="w-full object-contain" />
                                        </div>

                                        <h4 className={`${greatVibes.className} text-3xl eg-gold mb-6`}>{ev.name}</h4>

                                        <div className="space-y-3 text-sm eg-text-light">
                                            <p className={`${playfair.className} text-lg uppercase tracking-widest font-bold eg-text`}>
                                                {ev.date ? new Date(ev.date).toLocaleDateString('id-ID', { weekday: 'long' }) : ''}
                                            </p>
                                            <p className={`${playfair.className} text-2xl font-bold eg-text`}>
                                                {ev.date ? new Date(ev.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                                            </p>
                                            <p className="text-xs tracking-widest">{ev.time_start?.substring(0, 5) || ''} WIB - {ev.time_end?.substring(0, 5) || 'Selesai'} WIB</p>

                                            <div className="pt-4">
                                                <div className="w-8 h-8 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-4 h-4 eg-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0Z" /></svg>
                                                </div>
                                                <p className={`${playfair.className} text-sm font-bold eg-text mb-1`}>{ev.location}</p>
                                                <p className="text-xs eg-text-muted">{ev.address || ''}</p>
                                            </div>
                                        </div>

                                        {(ev.latitude && ev.longitude) && (
                                            <a href={`https://maps.google.com/?q=${ev.latitude},${ev.longitude}`} target="_blank" rel="noreferrer"
                                                className="eg-btn-outline inline-block mt-8">
                                                <span className="inline-flex items-center gap-2">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0Z" /></svg>
                                                    Google Map
                                                </span>
                                            </a>
                                        )}

                                        {/* Bottom arch decoration */}
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 opacity-20 pointer-events-none rotate-180">
                                            <img src={ASSETS.divider} alt="" className="w-full object-contain" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* §5 — Gallery */}
                    <section className="py-24 eg-cream-bg">
                        <Gallery
                            layout="masonry"
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={playfair.className}
                            titleSize="text-3xl font-bold uppercase tracking-widest"
                            accentText="eg-text"
                            subtitleText="eg-gold"
                            borderColor="border-[#C9A96E]/20"
                        />
                    </section>

                    {/* §6 — Love Story */}
                    {invitation?.love_stories && invitation.love_stories.length > 0 && (
                        <section className="py-24 px-8 eg-sage-bg">
                            <div className="text-center mb-16 eg-reveal">
                                <p className={`${greatVibes.className} text-2xl eg-gold mb-2`}>Our</p>
                                <h3 className={`${playfair.className} text-3xl tracking-[0.15em] uppercase eg-text font-bold`}>Love Story</h3>
                            </div>
                            <div className="max-w-md mx-auto relative">
                                {/* Timeline line */}
                                <div className="absolute left-6 top-0 bottom-0 eg-timeline-line" />
                                <div className="space-y-10">
                                    {[...invitation.love_stories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((story, i) => (
                                        <div key={story.id || i} className="relative pl-16 eg-reveal" data-delay={`${(i % 3) + 1}`}>
                                            <div className="absolute left-3.5 top-2 w-5 h-5 rounded-full bg-[#C9A96E] border-4 border-[#f4f1ec] z-10" />
                                            <div className="eg-card p-8">
                                                <p className="text-[10px] tracking-[0.2em] uppercase eg-gold font-semibold mb-3">
                                                    {story.date ? new Date(story.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : story.title}
                                                </p>
                                                <h4 className={`${playfair.className} text-lg font-bold eg-text mb-3`}>{story.title}</h4>
                                                <p className="text-sm eg-text-light leading-relaxed">{story.description}</p>
                                                {story.photo && (
                                                    <div className="mt-5 rounded-2xl overflow-hidden shadow-lg">
                                                        <img src={getPhoto(story.photo)} alt={story.title} className="w-full h-40 object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* §7 — QR */}
                    <QrCheckin guest={guest} sectionBg="eg-cream-bg" titleFont={playfair.className} textColor="eg-text" borderStyle="border-[#C9A96E]/20" />

                    {/* §8 — Gift */}
                    <section className="py-24 px-8 eg-sage-bg text-center">
                        <div className="eg-reveal mb-16">
                            <p className={`${greatVibes.className} text-2xl eg-gold mb-2`}>Love</p>
                            <h3 className={`${playfair.className} text-3xl tracking-[0.15em] uppercase eg-text font-bold mb-4`}>Gift</h3>
                            <p className="text-sm eg-text-light max-w-sm mx-auto">Tanpa mengurangi rasa hormat, bagi Bapak/Ibu/Saudara/i yang ingin memberikan tanda kasih untuk kami, dapat melalui:</p>
                        </div>
                        <div className="grid gap-8 max-w-sm mx-auto">
                            {invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={`${(i % 3) + 1}`} variant="EnchantedGarden" />
                            ))}
                        </div>

                        {(invitation?.groom_address || invitation?.bride_address) && (
                            <div className="eg-card p-8 max-w-sm mx-auto mt-10 eg-reveal">
                                <p className="text-[10px] tracking-[0.2em] uppercase eg-text-muted mb-3">Kirim Kado ke</p>
                                <p className="text-sm eg-text-light">{invitation.bride_address || invitation.groom_address}</p>
                            </div>
                        )}
                    </section>

                    {/* §9 — Wishes */}
                    <section className="py-24 px-8 eg-cream-bg">
                        <div className="text-center mb-12 eg-reveal">
                            <p className={`${greatVibes.className} text-2xl eg-gold mb-2`}>Wedding</p>
                            <h3 className={`${playfair.className} text-3xl tracking-[0.15em] uppercase eg-text font-bold`}>Wishes</h3>
                        </div>
                        <div className="max-w-md mx-auto">
                            <form onSubmit={submitWish} className="space-y-5 eg-card p-8 mb-10 eg-reveal" data-delay="1">
                                <div>
                                    <label className="block text-[10px] tracking-[0.2em] uppercase eg-text-muted mb-2">Nama</label>
                                    <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                                        className="w-full bg-transparent border-b border-[#C9A96E]/30 py-3 text-sm eg-text focus:outline-none focus:border-[#C9A96E] transition-colors" placeholder="Nama Anda..." />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-[0.2em] uppercase eg-text-muted mb-2">Ucapan</label>
                                    <textarea value={messageInput} onChange={e => setMessageInput(e.target.value)}
                                        className="w-full bg-transparent border-b border-[#C9A96E]/30 py-3 text-sm eg-text h-28 resize-none focus:outline-none focus:border-[#C9A96E] transition-colors" placeholder="Tulis ucapan..." />
                                </div>
                                <button type="submit" disabled={submitting} className="eg-btn w-full disabled:opacity-50">
                                    {submitting ? 'Mengirim...' : 'Kirim Ucapan'}
                                </button>
                            </form>
                            {wishes.length > 0 && (
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 eg-reveal" data-delay="2">
                                    {wishes.map((w, i) => (
                                        <div key={i} className="eg-card p-6">
                                            <p className={`${playfair.className} text-sm font-bold eg-text mb-1`}>{w.name}</p>
                                            <p className="text-xs eg-text-muted mb-2">{new Date(w.created_at).toLocaleDateString('id-ID')}</p>
                                            <p className="text-sm eg-text-light leading-relaxed italic">"{w.message}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* §10 — Footer */}
                    <footer className="py-24 px-8 text-center eg-sage-bg border-t border-[#C9A96E]/10">
                        <div className="eg-reveal">
                            <img src={ASSETS.divider} alt="" className="w-48 mx-auto mb-10 opacity-50" />
                            <p className="text-[9px] uppercase tracking-[0.4em] eg-text-muted mb-6">Suatu kebahagiaan & kehormatan bagi kami</p>
                            <p className="text-sm eg-text-light italic mb-10 max-w-xs mx-auto">apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan do'a restu kepada kami</p>

                            <p className={`${greatVibes.className} text-lg eg-gold mb-2`}>Kami yang berbahagia,</p>
                            <h2 className={`${playfair.className} text-2xl font-bold tracking-wider uppercase eg-text mb-2`}>
                                {invitation?.groom_name} & {invitation?.bride_name}
                            </h2>
                            <p className="text-[10px] tracking-[0.3em] eg-gold uppercase mb-10">
                                {eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>

                            <div className="flex items-center justify-center gap-4 eg-text-muted mb-6">
                                <div className="h-px w-10 bg-current opacity-30" />
                                <svg className="w-4 h-4 eg-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                <div className="h-px w-10 bg-current opacity-30" />
                            </div>

                            <img src={ASSETS.divider} alt="" className="w-40 mx-auto mt-8 opacity-40 rotate-180" />
                            <p className="text-[8px] eg-text-muted tracking-[0.3em] uppercase mt-8">Enchanted Garden Theme</p>
                        </div>
                    </footer>

                </div>
            </main>
        </div>
    );
}
