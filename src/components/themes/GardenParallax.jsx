'use client';

import GiftAtmCard from './partials/GiftAtmCard';
import React, { useEffect, useRef, useState } from 'react';
import { Pinyon_Script, Cormorant_Garamond, Jost } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';

const pinyon = Pinyon_Script({ subsets: ['latin'], weight: ['400'] });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });
const jost = Jost({ subsets: ['latin'], weight: ['200', '300', '400', '500', '600', '700'] });

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Internal Asset Paths (Moved to public/)
const ASSETS = {
    hero: '/themes/garden-parallax/hero.png',
    topArch: '/themes/garden-parallax/top_arch.png',
    petal: '/themes/garden-parallax/petal.png'
};

export default function GardenParallax({ payload, audioController }) {
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
    const scrollContainerRef = useRef(null);
    const [scrollY, setScrollY] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
        const handleScroll = () => {
            setScrollY(window.scrollY);
            document.querySelectorAll('.gp-reveal').forEach(el => {
                const top = el.getBoundingClientRect().top;
                if (top < window.innerHeight - 50) el.classList.add('active');
            });
        };
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) - 0.5,
                y: (e.clientY / window.innerHeight) - 0.5
            });
        };
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
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

    const coverPhoto = getPhoto(invitation?.cover_photo);
    const groomPhoto = getPhoto(invitation?.groom_photo);
    const bridePhoto = getPhoto(invitation?.bride_photo);
    const photos = invitation?.gallery?.length > 0 ? invitation.gallery.map(g => g.photo) : (invitation?.photos || []);

    return (
        <div className={`min-h-screen bg-[#fcfbf7] text-[#2c3e50] ${jost.className} ${isOpen ? 'overflow-visible' : 'overflow-hidden'} garden-parallax-theme`}>
            <style dangerouslySetInnerHTML={{ __html: `
                .garden-parallax-theme .gp-reveal { opacity: 0; transform: translateY(30px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
                .garden-parallax-theme .gp-reveal.active { opacity: 1; transform: translateY(0); }
                
                .garden-glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07); }
                
                .bg-garden { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
                .parallax-layer { position: absolute; transition: transform 0.1s ease-out; pointer-events: none; }
                
                .garden-btn { background: #5d6d7e; color: white; padding: 12px 32px; rounded-full; transition: all 0.4s cubic-bezier(0.16,1,0.3,1); text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: 600; }
                .garden-btn:hover { background: #34495e; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

                @media (min-width: 1024px) {
                    .gp-split-left { position: fixed; top: 0; left: 0; width: 70%; height: 100vh; z-index: 10; border-right: 1px solid rgba(0,0,0,0.03); }
                    .gp-split-right { margin-left: 70%; width: 30%; position: relative; }
                }

                .arch-image { border-radius: 50% 50% 0 0; overflow: hidden; }
                .gold-accent { color: #d4af37; }
                
                /* Custom Scrollbar */
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: #fcfbf7; }
                ::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }
            `}} />

            {/* ─── MUSIC TOGGLE ─── */}
            {invitation?.music_url && (
                <MusicPlayer audioController={audioController} btnBg="garden-glass" btnColor="text-[#5d6d7e]" btnBorder="border-none shadow-xl" />
            )}

            {/* ══════════════════════ COVER SECTION ══════════════════════ */}
            <section className={`fixed inset-0 z-[60] flex flex-col items-center justify-center transition-all duration-[1200ms] ease-in-out ${isOpen ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100'}`}>
                <div className="absolute inset-0 bg-[#fcfbf7]">
                    {/* Background Parallax Layer */}
                    <div className="absolute inset-0 grayscale opacity-10" style={{ transform: `scale(1.1) translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}>
                        <img src={ASSETS.hero} alt="" className="w-full h-full object-cover" />
                    </div>
                    {/* Floral Arch */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 opacity-60" style={{ transform: `translateY(${mousePos.y * -15}px)` }}>
                        <img src={ASSETS.topArch} alt="" className="w-full h-full object-contain object-top" />
                    </div>
                </div>

                <div className="relative z-10 text-center px-8">
                    <p className={`${cormorant.className} text-sm tracking-[0.4em] uppercase text-[#7f8c8d] mb-6`}>Wedding Invitation</p>
                    <h1 className={`${pinyon.className} text-6xl md:text-8xl text-[#2c3e50] mb-8`}>
                        {invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}
                    </h1>
                    <div className="w-12 h-px bg-[#cbd5e0] mx-auto mb-10" />
                    
                    {guestName && (
                        <div className="mb-12">
                            <p className="text-[10px] tracking-[0.2em] uppercase text-[#95a5a6] mb-3">Dear Special Guest</p>
                            <p className={`${cormorant.className} text-3xl text-[#34495e]`}>{guestName}</p>
                        </div>
                    )}

                    <button onClick={handleOpen} className="garden-btn">
                        Open Invitation
                    </button>
                </div>
            </section>

            {/* ══════════════════════ MAIN CONTENT ══════════════════════ */}
            <main className={`transition-all duration-[1000ms] ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* ─── PARALLAX DECORATIONS (Floating) ─── */}
                <div className="bg-garden overflow-hidden">
                    {/* Floating Petal 1 */}
                    <div className="parallax-layer w-16 h-16 opacity-30" style={{ top: '15%', left: '10%', transform: `translate(${mousePos.x * -50}px, ${scrollY * 0.1}px) rotate(${scrollY * 0.05}deg)` }}>
                        <img src={ASSETS.petal} alt="" className="w-full h-full object-contain" />
                    </div>
                    {/* Floating Petal 2 */}
                    <div className="parallax-layer w-12 h-12 opacity-20" style={{ top: '60%', right: '15%', transform: `translate(${mousePos.x * 60}px, ${scrollY * -0.05}px) rotate(${scrollY * -0.1}deg)` }}>
                        <img src={ASSETS.petal} alt="" className="w-full h-full object-contain" />
                    </div>
                    {/* Huge Background Arch */}
                    <div className="fixed bottom-0 left-0 w-1/3 h-1/3 opacity-[0.03] grayscale" style={{ transform: `translateX(${scrollY * 0.05}px)` }}>
                        <img src={ASSETS.topArch} alt="" className="w-full h-full object-contain object-bottom rotate-180" />
                    </div>
                </div>

                {/* ─── LEFT PANEL (Fixed Hero) ─── */}
                <div className="gp-split-left hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden bg-white">
                    <div className="absolute inset-0 opacity-[0.03]">
                         <img src={ASSETS.hero} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 w-full max-w-md">
                        <div className="arch-image aspect-[4/5] shadow-2xl mb-12 border-[12px] border-[#fcfbf7]">
                            <img src={coverPhoto || ASSETS.hero} alt="" className="w-full h-full object-cover" />
                        </div>
                        <h2 className={`${pinyon.className} text-6xl text-[#2c3e50] text-center`}>
                            {invitation?.groom_name} & {invitation?.bride_name}
                        </h2>
                        <p className="text-center mt-6 text-[11px] tracking-[0.4em] uppercase text-[#95a5a6]">
                            {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* ─── RIGHT PANEL (Content) ─── */}
                <div className="gp-split-right">
                    
                    {/* Intro Section */}
                    <section className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative">
                        <div className="gp-reveal active">
                            <p className={`${cormorant.className} text-xl italic text-[#7f8c8d] mb-4`}>The Wedding of</p>
                            <h2 className={`${cormorant.className} text-4xl md:text-5xl lg:text-7xl font-light uppercase tracking-[0.1em] mb-8`}>
                                {invitation?.groom_name} <br/> <span className={`${pinyon.className} text-6xl normal-case tracking-normal lowercase block my-2`}>&</span> {invitation?.bride_name}
                            </h2>
                            <div className="w-px h-24 bg-gradient-to-b from-[#cbd5e0] to-transparent mx-auto" />
                        </div>
                    </section>

                    {/* Verse Section */}
                    <section className="py-24 px-8 text-center bg-white/30">
                        <div className="gp-reveal max-w-md mx-auto">
                            <span className="text-3xl text-[#cbd5e0]">“</span>
                            <p className={`${cormorant.className} text-lg leading-relaxed text-[#5d6d7e] italic`}>
                                {invitation?.quotes || 'Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati.'}
                            </p>
                            <p className="mt-4 text-[10px] tracking-[0.3em] uppercase text-[#95a5a6]">{invitation?.quotes_name || '( QS. Ar-Rum Ayat 21 )'}</p>
                        </div>
                    </section>

                    {/* Couple Section */}
                    <section className="py-24 px-8 md:px-16">
                        <div className="grid md:grid-cols-1 gap-20">
                            {/* Groom */}
                            <div className="flex flex-col items-center text-center gp-reveal">
                                <div className="w-56 h-72 arch-image mb-8 shadow-xl">
                                    <img src={groomPhoto || ASSETS.hero} alt="" className="w-full h-full object-cover" />
                                </div>
                                <h3 className={`${pinyon.className} text-5xl mb-2`}>{invitation?.groom_name}</h3>
                                {invitation?.groom_father && <p className="text-xs text-[#7f8c8d] mb-1">Putra dari Bpk {invitation.groom_father} & Ibu {invitation.groom_mother}</p>}
                                <a href={`https://instagram.com/${invitation?.groom_instagram}`} className="text-[#cbd5e0] hover:text-[#5d6d7e] transition-colors mt-4">
                                    <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                </a>
                            </div>

                            <div className="flex justify-center items-center h-20">
                                <span className={`${pinyon.className} text-6xl text-[#cbd5e0]`}>&</span>
                            </div>

                            {/* Bride */}
                            <div className="flex flex-col items-center text-center gp-reveal">
                                <div className="w-56 h-72 arch-image mb-8 shadow-xl">
                                    <img src={bridePhoto || ASSETS.hero} alt="" className="w-full h-full object-cover" />
                                </div>
                                <h3 className={`${pinyon.className} text-5xl mb-2`}>{invitation?.bride_name}</h3>
                                {invitation?.bride_father && <p className="text-xs text-[#7f8c8d] mb-1">Putri dari Bpk {invitation.bride_father} & Ibu {invitation.bride_mother}</p>}
                                <a href={`https://instagram.com/${invitation?.bride_instagram}`} className="text-[#cbd5e0] hover:text-[#5d6d7e] transition-colors mt-4">
                                    <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Countdown & Event */}
                    <section className="py-24 px-8 bg-gradient-to-b from-transparent via-[#fcfbf7] to-transparent">
                        <div className="text-center mb-16 gp-reveal">
                            <h2 className={`${cormorant.className} text-3xl uppercase tracking-widest mb-10`}>Counting Down</h2>
                            <div className="grid grid-cols-4 gap-4 max-w-xs mx-auto">
                                {[
                                    {v: countdown.days, l: 'Days'},
                                    {v: countdown.hours, l: 'Hours'},
                                    {v: countdown.minutes, l: 'Mins'},
                                    {v: countdown.seconds, l: 'Secs'},
                                ].map((item, i) => (
                                    <div key={i} className="text-[#34495e]">
                                        <p className={`${cormorant.className} text-3xl font-light`}>{item.v}</p>
                                        <p className="text-[8px] uppercase tracking-widest mt-1 opacity-50">{item.l}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Events Grid */}
                        <div className="space-y-12">
                            {invitation?.events?.map((ev, i) => (
                                <div key={i} className="garden-glass p-10 rounded-[40px] text-center gp-reveal max-w-sm mx-auto">
                                    <h4 className={`${cormorant.className} text-2xl uppercase tracking-widest mb-6`}>{ev.name}</h4>
                                    <div className="space-y-3 text-xs tracking-widest text-[#7f8c8d] mb-8">
                                        <p>{ev.date ? new Date(ev.date).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</p>
                                        <p>{ev.time_start} - {ev.time_end || 'Selesai'}</p>
                                        <p className="pt-4 text-[#34495e] font-medium">{ev.location}</p>
                                    </div>
                                    <a href={`https://maps.google.com/?q=${ev.latitude},${ev.longitude}`} target="_blank" rel="noreferrer" className="garden-btn inline-block text-[8px] py-3">
                                        Open Location
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Gallery */}
                    <div className="py-24">
                        <Gallery 
                            layout="masonry"
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={cormorant.className}
                            titleSize="text-4xl uppercase tracking-widest"
                            accentText="text-[#2c3e50]"
                            subtitleText="text-[#95a5a6]"
                            borderColor="border-[#cbd5e0]/30"
                        />
                    </div>

                    {/* QR Checkin */}
                    <QrCheckin guest={guest} sectionBg="bg-white/30" titleFont={cormorant.className} textColor="text-[#34495e]" borderStyle="border-[#cbd5e0]/20" />

                    {/* Wedding Gift */}
                    <section className="py-24 px-8 text-center bg-white/50">
                        <div className="gp-reveal mb-16">
                            <h3 className={`${cormorant.className} text-3xl uppercase tracking-widest mb-4`}>Wedding Gift</h3>
                            <p className={`${cormorant.className} italic text-[#7f8c8d]`}>Your presence is enough, but if you wish to give...</p>
                        </div>

                        <div className="grid gap-6 max-w-xs mx-auto">
                            {invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={`${(i % 3) + 1}`} variant="GardenParallax" />
                            ))}
                        </div>
                    </section>

                    {/* Wishes */}
                    <section className="py-24 px-8">
                        <div className="text-center mb-12 gp-reveal">
                            <h3 className={`${cormorant.className} text-3xl uppercase tracking-widest`}>Send Wishes</h3>
                        </div>
                        <div className="max-w-md mx-auto">
                             <form onSubmit={submitWish} className="space-y-6 gp-reveal">
                                <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                                    className="w-full bg-white/80 border-b border-[#cbd5e0] p-4 text-sm focus:outline-none focus:border-[#5d6d7e] transition-colors" placeholder="YOUR NAME" />
                                <textarea value={messageInput} onChange={e => setMessageInput(e.target.value)}
                                    className="w-full bg-white/80 border-b border-[#cbd5e0] p-4 text-sm h-32 resize-none focus:outline-none focus:border-[#5d6d7e] transition-colors" placeholder="YOUR MESSAGE" />
                                <button type="submit" disabled={submitting} className="garden-btn w-full">
                                    {submitting ? 'Sending...' : 'Send Wishes'}
                                </button>
                            </form>
                            <div className="mt-12 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {wishes.map((w, i) => (
                                    <div key={i} className="garden-glass p-6 rounded-2xl shadow-sm">
                                        <p className="font-semibold text-sm mb-2">{w.name}</p>
                                        <p className="text-sm text-[#7f8c8d] leading-relaxed italic">"{w.message}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    {/* ── FOOTER ── */}
                <footer className="bg-[#1a1a1a] text-[#95a5a6] pt-64 pb-24 px-8 text-center relative overflow-hidden">
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
                        <h2 className={`${cormorant.className} text-5xl mb-4 text-[#95a5a6] drop-shadow-sm`}>
                            {invitation?.groom_name?.split(' ')[0]} <span className="text-black/50 font-light mx-2">&</span> {invitation?.bride_name?.split(' ')[0]}
                        </h2>
                        
                        {/* Branding */}
                        <div className="border-t border-[#95a5a6]/10 pt-8 mt-12">
                            <p className="text-[9px] text-[#95a5a6]/40 tracking-[0.2em] uppercase mb-2">Digital Invitation by</p>
                            <a href="https://digitvitation.my.id" target="_blank" rel="noreferrer" className="inline-block text-black/80 hover:text-black transition-colors">
                                <span className={`${cormorant.className} text-lg font-bold tracking-wider uppercase`}>Digivitation</span>
                            </a>
                            <p className="text-[8px] text-[#95a5a6]/30 mt-2 tracking-wider">© {new Date().getFullYear()} Digivitation. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

                </div>
            </main>
        </div>
    );
}
