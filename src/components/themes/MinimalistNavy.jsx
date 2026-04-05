'use client';

import React, { useEffect, useRef, useState } from 'react';
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

export default function MinimalistNavy({ payload, audioController }) {
    const { invitation, guest, guestName } = payload;
    const [isOpen, setIsOpen] = useState(false);
    const [nameInput, setNameInput] = useState(guestName || '');
    const [messageInput, setMessageInput] = useState('');
    const [wishes, setWishes] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const eventDate = invitation?.event_date ? new Date(invitation.event_date) : new Date();
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
            document.querySelectorAll('.mn-reveal').forEach(el => {
                const top = el.getBoundingClientRect().top;
                if (top < window.innerHeight - 50) el.classList.add('active');
            });
        };
        
        // Listen to window scroll because we moved scroll to body/root
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
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

    const coverPhoto = (() => {
        const cp = invitation?.cover_photo;
        if (!cp) return null;
        return getPhoto(Array.isArray(cp) ? cp[0] : cp);
    })();

    const groomPhoto = getPhoto(invitation?.groom_photo);
    const bridePhoto = getPhoto(invitation?.bride_photo);
    const photos = invitation?.gallery?.length > 0 ? invitation.gallery.map(g => g.photo) : (invitation?.photos || []);

    // Circular text for spinning animation
    const circularText = `${invitation?.groom_name || 'Groom'} & ${invitation?.bride_name || 'Bride'} · ${eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · Happy Wedding · `;

    return (
        <div className={`min-h-screen bg-[#0B1D35] text-white ${jost.className} ${isOpen ? 'overflow-visible' : 'overflow-hidden'} minimalist-navy-theme`}>
            <style dangerouslySetInnerHTML={{ __html: `
                .minimalist-navy-theme .mn-reveal { opacity: 0; transform: translateY(35px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
                .minimalist-navy-theme .mn-reveal.active { opacity: 1; transform: translateY(0); }
                .minimalist-navy-theme .mn-reveal[data-delay="1"] { transition-delay: 0.15s; }
                .minimalist-navy-theme .mn-reveal[data-delay="2"] { transition-delay: 0.3s; }
                .minimalist-navy-theme .mn-reveal[data-delay="3"] { transition-delay: 0.45s; }

                /* Arch frame */
                .navy-arch { border-radius: 200px 200px 0 0; overflow: hidden; }
                .navy-arch-alt { border-radius: 0 0 200px 200px; overflow: hidden; }
                .navy-arch-left { border-radius: 200px 0 0 200px; overflow: hidden; }

                /* Navy glass */
                .navy-glass { background: rgba(11, 29, 53, 0.65); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
                .navy-glass-light { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); }
                
                /* Buttons */
                .navy-btn { background: transparent; border: 1px solid rgba(255,255,255,0.35); color: white; transition: all 0.4s cubic-bezier(0.16,1,0.3,1); }
                .navy-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.6); transform: translateY(-2px); }
                .navy-btn-solid { background: #0B1D35; color: white; transition: all 0.4s; }
                .navy-btn-solid:hover { background: #162d4d; }

                /* Spinning circular text */
                .spin-circle { animation: spinCircle 20s linear infinite; }
                @keyframes spinCircle { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                /* Custom Scrollbar */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #0B1D35; }
                ::-webkit-scrollbar-thumb { background: rgba(201, 169, 110, 0.4); border-radius: 10px; }

                /* Split layout */
                @media (min-width: 1024px) {
                    .mn-split-left { position: fixed; top: 0; left: 0; width: 50%; height: 100vh; z-index: 10; }
                    .mn-split-right { margin-left: 50%; width: 50%; }
                }

                /* Divider line animation */
                .mn-line { width: 0; transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1); }
                .mn-line.active { width: 80px; }

                /* Gold accent color */
                .gold-accent { color: #C9A96E; }
                .gold-border { border-color: #C9A96E; }
                .gold-bg { background-color: #C9A96E; }
            `}} />

            {/* ─── MUSIC TOGGLE ─── */}
            {invitation?.music_url && (
                <MusicPlayer audioController={audioController} btnBg="navy-glass" btnColor="text-white" btnBorder="border-white/20 shadow-2xl" />
            )}

            {/* ══════════════════════ COVER SECTION ══════════════════════ */}
            <section className={`fixed inset-0 z-[60] flex flex-col items-center justify-center transition-all duration-[1200ms] ease-in-out ${isOpen ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100'}`}>
                <div className="absolute inset-0">
                    {coverPhoto ? (
                        <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0B1D35] via-[#162d4d] to-[#0B1D35]" />
                    )}
                    <div className="absolute inset-0 bg-[#0B1D35]/65" />
                </div>

                <div className="relative z-10 text-center px-8">
                    <p className={`${greatVibes.className} text-2xl md:text-3xl text-white/80 mb-4`}>The Wedding of</p>
                    <h1 className={`${playfair.className} text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-6 uppercase`}>
                        {invitation?.groom_name} <span className="font-light">&</span> {invitation?.bride_name}
                    </h1>
                    <p className="text-sm md:text-base text-white/70 tracking-widest mb-4">
                        {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>

                    {guestName && (
                        <div className="mb-8">
                            <p className="text-xs text-white/50 tracking-[0.2em] uppercase mb-1">Kepada Bpk/Ibu/Saudara/i</p>
                            <p className={`${playfair.className} text-xl md:text-2xl text-white font-medium`}>{guestName}</p>
                        </div>
                    )}

                    <button onClick={handleOpen} className="navy-btn px-10 py-4 rounded-full text-xs tracking-[0.25em] uppercase font-medium inline-flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                        Buka Undangan
                    </button>
                </div>
            </section>

            {/* ══════════════════════ MAIN CONTENT (SPLIT LAYOUT) ══════════════════════ */}
            <main className={`transition-all duration-[1000ms] ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

                {/* ─── LEFT PANEL (Fixed on Desktop, Hidden on Mobile) ─── */}
                <div className="mn-split-left bg-[#0B1D35] relative hidden lg:flex flex-col justify-center px-8 md:px-12 lg:px-16 py-24 lg:py-0 min-h-screen lg:min-h-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0B1D35] via-[#112642] to-[#0B1D35] opacity-90" />
                    {coverPhoto && <img src={coverPhoto} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />}
                    
                    <div className="relative z-10">
                        <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-medium mb-8 mn-reveal">Our Wedding Invitation</p>
                        <div className="w-16 h-px bg-white/20 mb-10 mn-line mn-reveal" data-delay="1" />

                        <h2 className={`${playfair.className} text-4xl md:text-5xl lg:text-5xl xl:text-7xl font-bold text-white leading-[1.1] mb-10 uppercase mn-reveal`} data-delay="1">
                            {invitation?.groom_name} <span className="text-white/30">&</span> {invitation?.bride_name}
                        </h2>

                        <p className="text-sm text-[#C9A96E] tracking-[0.2em] mb-12 font-medium mn-reveal" data-delay="2">
                            {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>

                        <p className="text-sm text-white/50 italic leading-[1.8] mb-12 max-w-md mn-reveal" data-delay="2">
                            "{invitation?.description || 'What counts in making a happy marriage is not so much how compatible you are, but how you deal with incompatibility.'}"
                        </p>

                        {guestName && (
                            <div className="mn-reveal" data-delay="3">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-white/25 mb-2">Kepada Yth. Bapak / Ibu /Saudara/i</p>
                                <p className={`${playfair.className} text-2xl md:text-3xl text-white font-medium`}>{guestName}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── RIGHT PANEL (Scrollable) ─── */}
                <div ref={rightPanelRef} className="mn-split-right">

                    {/* ── Section 1: Circular Text + Countdown ── */}
                    <section className="bg-[#0B1D35] min-h-screen flex flex-col items-center justify-center px-8 py-24 relative overflow-hidden">
                        {/* Background for mobile */}
                        <div className="absolute inset-0 lg:hidden">
                            {coverPhoto && <img src={coverPhoto} alt="" className="w-full h-full object-cover opacity-20" />}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1D35]/80 via-[#0B1D35]/60 to-[#0B1D35]" />
                        </div>

                        <div className="relative z-10 w-full flex flex-col items-center">
                            <div className="relative w-48 h-48 md:w-56 md:h-56 mb-10 mn-reveal">
                            <svg className="w-full h-full spin-circle" viewBox="0 0 200 200">
                                <defs>
                                    <path id="circPath" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" fill="none" />
                                </defs>
                                <text className="fill-white/30" style={{ fontSize: '11px', letterSpacing: '3px' }}>
                                    <textPath href="#circPath">{circularText}</textPath>
                                </text>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className={`${greatVibes.className} text-xl gold-accent`}>We are</p>
                                    <p className={`${playfair.className} text-sm tracking-[0.15em] uppercase text-white/80`}>Getting Married</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center max-w-md mb-14 mn-reveal" data-delay="1">
                            <p className="text-xs text-white/50 leading-[2] italic">
                                "{invitation?.description || 'Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu.'}"
                            </p>
                            <p className="text-[10px] text-white/30 mt-4 tracking-widest uppercase">( QS. Ar-Rum Ayat 21 )</p>
                        </div>

                        <div className="flex items-center gap-4 mb-10 mn-reveal" data-delay="2">
                            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                            </div>
                            <button className="navy-btn px-6 py-2.5 rounded-full text-[10px] tracking-[0.2em] uppercase">Save The Date</button>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mn-reveal" data-delay="3">
                            {[
                                { val: countdown.days, label: 'Hari' },
                                { val: countdown.hours, label: 'Jam' },
                                { val: countdown.minutes, label: 'Menit' },
                                { val: countdown.seconds, label: 'Detik' },
                            ].map((item, i) => (
                                <div key={i} className="text-center">
                                    <p className={`${playfair.className} text-3xl md:text-4xl font-bold text-white`}>{item.val}</p>
                                    <p className="text-[9px] text-white/30 tracking-[0.15em] uppercase mt-1">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 text-center mn-reveal">
                            <p className={`${playfair.className} text-2xl text-white/80 italic`}>We Found</p>
                            <p className={`${greatVibes.className} text-5xl gold-accent -mt-2`}>Love</p>
                        </div>

                        {photos.length > 0 && (
                            <div className="flex gap-3 mt-10 w-full overflow-x-auto pb-4 px-4 navy-scrollbar mn-reveal">
                                {photos.slice(0, 4).map((p, i) => (
                                    <div key={i} className="flex-none w-28 h-36 md:w-36 md:h-44 rounded-xl overflow-hidden shadow-2xl">
                                        <img src={getPhoto(p)} alt={`Photo ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                    {/* ── Section 2: Greeting + Couple ── */}
                    <section className="bg-[#f8f6f3] text-[#0B1D35] py-24 px-8 md:px-12">
                        <div className="text-center mb-16 mn-reveal">
                            <p className={`${playfair.className} text-sm tracking-widest uppercase text-[#0B1D35]/40 mb-4`}>Assalamualaikum Wr. Wb.</p>
                            <p className="text-sm text-[#0B1D35]/60 leading-[2] max-w-sm mx-auto">
                                Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami :
                            </p>
                        </div>

                        <div className="flex flex-col items-center mb-16 mn-reveal" data-delay="1">
                            <div className="w-56 h-72 md:w-64 md:h-80 navy-arch mb-8 bg-gray-200 shadow-2xl">
                                {bridePhoto ? <img src={bridePhoto} className="w-full h-full object-cover" alt="Bride" /> : <div className="w-full h-full bg-gradient-to-b from-[#c5cfd8] to-[#a8b5c2]" />}
                            </div>
                            <p className={`${greatVibes.className} text-3xl gold-accent mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p>
                            <h3 className={`${playfair.className} text-xl md:text-2xl font-bold uppercase tracking-wider text-[#0B1D35] mb-2`}>{invitation?.bride_name}</h3>
                            {invitation?.bride_father && <p className="text-xs text-[#0B1D35]/50">Putri dari Bpk {invitation.bride_father} & Ibu {invitation.bride_mother}</p>}
                        </div>

                        <div className="flex justify-center my-8">
                            <span className={`${playfair.className} text-6xl text-[#0B1D35]/10 font-light`}>&</span>
                        </div>

                        <div className="flex flex-col items-center mb-10 mn-reveal" data-delay="2">
                            <div className="w-56 h-72 md:w-64 md:h-80 navy-arch mb-8 bg-gray-200 shadow-2xl">
                                {groomPhoto ? <img src={groomPhoto} className="w-full h-full object-cover" alt="Groom" /> : <div className="w-full h-full bg-gradient-to-b from-[#c5cfd8] to-[#a8b5c2]" />}
                            </div>
                            <p className={`${greatVibes.className} text-3xl gold-accent mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p>
                            <h3 className={`${playfair.className} text-xl md:text-2xl font-bold uppercase tracking-wider text-[#0B1D35] mb-2`}>{invitation?.groom_name}</h3>
                            {invitation?.groom_father && <p className="text-xs text-[#0B1D35]/50">Putra dari Bpk {invitation.groom_father} & Ibu {invitation.groom_mother}</p>}
                        </div>
                    </section>

                    {/* ── Section 3: Save The Date / Events ── */}
                    <section className="bg-[#0B1D35] py-24 px-8 md:px-12 text-center">
                        <div className="mn-reveal">
                            <p className={`${playfair.className} text-2xl md:text-3xl text-white mb-0`}>Save The</p>
                            <p className={`${greatVibes.className} text-5xl md:text-6xl gold-accent -mt-2 mb-12`}>Date</p>
                        </div>

                        {invitation?.events && invitation.events.length > 0 ? (
                            [...invitation.events].sort((a, b) => a.sort_order - b.sort_order).map((event, idx) => (
                                <div key={idx} className="mb-16 mn-reveal" data-delay={`${idx + 1}`}>
                                    <div className="mb-6">
                                        <p className={`${playfair.className} text-lg tracking-[0.2em] uppercase text-white/80 mb-6`}>{event.name}</p>
                                    </div>

                                    {coverPhoto && (
                                        <div className={`w-full max-w-xs mx-auto aspect-[3/4] mb-8 ${idx % 2 === 0 ? 'rounded-tl-[120px] rounded-br-[120px]' : 'rounded-tr-[120px] rounded-bl-[120px]'} overflow-hidden border-2 border-white/10 shadow-2xl`}>
                                            <img src={coverPhoto} alt={event.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div className="navy-glass rounded-2xl p-8 max-w-sm mx-auto text-left border border-white/5">
                                        <div className="space-y-4 text-sm text-white/70">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-4 h-4 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                                <span>{event.date ? new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <svg className="w-4 h-4 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0Z" /></svg>
                                                <span>{event.time_start?.substring(0, 5) || 'TBA'} {event.time_end ? `- ${event.time_end.substring(0, 5)}` : ''} WIB</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <svg className="w-4 h-4 text-white/40 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0Z" /></svg>
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                        {(event.latitude && event.longitude) && (
                                            <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer"
                                                className="navy-btn mt-6 w-full py-3 rounded-full text-[10px] tracking-[0.2em] uppercase text-center block">
                                                Lihat Lokasi
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="navy-glass rounded-2xl p-10 text-white/40 text-sm">Belum ada acara yang ditambahkan.</div>
                        )}
                    </section>

                    {/* ── Section 4: Gallery ── */}
                    <Gallery
                        layout="masonry"
                        invitation={invitation}
                        sectionBg="bg-[#f8f6f3]"
                        titleFont={playfair.className}
                        titleSize="text-3xl md:text-4xl font-bold"
                        accentText="text-[#0B1D35]"
                        subtitleText="gold-accent"
                        borderColor="border-[#0B1D35]/10"
                    />

                    {/* ── Section 5: Love Story ── */}
                    {invitation?.love_stories && invitation.love_stories.length > 0 && (
                        <section className="bg-[#0B1D35] py-24 px-8 md:px-12">
                            <div className="text-center mb-16 mn-reveal">
                                <p className={`${playfair.className} text-2xl text-white`}>Our</p>
                                <p className={`${greatVibes.className} text-5xl gold-accent -mt-2`}>Love Story</p>
                            </div>
                            <div className="space-y-8 max-w-lg mx-auto">
                                {[...invitation.love_stories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((story, i) => (
                                    <div key={story.id || i} className="navy-glass rounded-2xl p-8 mn-reveal" data-delay={`${(i % 3) + 1}`}>
                                        <p className="text-[10px] text-white/30 tracking-widest uppercase mb-3">
                                            {story.date ? new Date(story.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : ''}
                                        </p>
                                        <h4 className={`${playfair.className} text-lg font-bold text-white mb-3`}>{story.title}</h4>
                                        <p className="text-sm text-white/50 leading-relaxed">{story.description}</p>
                                        {story.photo && (
                                            <div className="mt-6 rounded-xl overflow-hidden shadow-xl">
                                                <img src={getPhoto(story.photo)} alt={story.title} className="w-full h-40 object-cover" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Section 6: QR Checkin ── */}
                    <QrCheckin guest={guest} sectionBg="bg-[#f8f6f3]" titleFont={playfair.className} textColor="text-[#0B1D35]" borderStyle="border-[#0B1D35]/10" />

                    {/* ── Section 7: Wedding Gift ── */}
                    <section className="bg-[#0B1D35] py-24 px-8 md:px-12 text-center">
                        <div className="mn-reveal">
                            <p className={`${playfair.className} text-2xl text-white`}>Wedding</p>
                            <p className={`${greatVibes.className} text-5xl gold-accent -mt-2 mb-12`}>Gift</p>
                        </div>

                        <div className="space-y-6 max-w-md mx-auto">
                            {invitation?.gift_accounts && invitation.gift_accounts.length > 0 ? (
                                invitation.gift_accounts.map((acc, i) => (
                                    <div key={acc.id || i} className="navy-glass rounded-2xl p-8 text-center mn-reveal border border-white/5" data-delay={`${(i % 3) + 1}`}>
                                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-5">
                                            <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5Z" /></svg>
                                        </div>
                                        <h4 className="text-sm font-medium text-white tracking-widest uppercase mb-1">{acc.bank_name}</h4>
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-4">A.N. {acc.account_holder}</p>
                                        <p className={`${playfair.className} text-xl text-white font-bold mb-5`}>{acc.account_number}</p>
                                        <button onClick={() => { navigator.clipboard.writeText(acc.account_number); toast.success('Nomor rekening disalin!'); }}
                                            className="navy-btn w-full py-3 rounded-full text-[10px] tracking-[0.2em] uppercase">
                                            Salin Nomor
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="navy-glass rounded-2xl p-10 text-white/40 text-sm">Belum ada informasi rekening.</div>
                            )}
                        </div>

                        {(invitation?.groom_address || invitation?.bride_address) && (
                            <div className="navy-glass rounded-2xl p-8 max-w-md mx-auto mt-10 mn-reveal border border-white/5">
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Kirim Kado Fisik</p>
                                <p className="text-sm text-white/60">{invitation.bride_address || invitation.groom_address}</p>
                            </div>
                        )}
                    </section>

                    {/* ── Section 8: Wishes ── */}
                    <section className="bg-[#f8f6f3] py-24 px-8 md:px-12">
                        <div className="text-center mb-12 mn-reveal">
                            <p className={`${playfair.className} text-2xl text-[#0B1D35]`}>Wedding</p>
                            <p className={`${greatVibes.className} text-5xl gold-accent -mt-2`}>Wishes</p>
                        </div>

                        <div className="max-w-md mx-auto">
                            <form onSubmit={submitWish} className="space-y-4 mb-10 mn-reveal" data-delay="1">
                                <div>
                                    <label className={`${playfair.className} block text-[10px] tracking-[0.2em] uppercase text-[#0B1D35]/40 mb-2`}>Nama</label>
                                    <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                                        className="w-full bg-white border border-[#0B1D35]/10 rounded-xl px-5 py-3.5 text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B1D35]/30 transition-colors" placeholder="Nama Anda..." />
                                </div>
                                <div>
                                    <label className={`${playfair.className} block text-[10px] tracking-[0.2em] uppercase text-[#0B1D35]/40 mb-2`}>Ucapan</label>
                                    <textarea value={messageInput} onChange={e => setMessageInput(e.target.value)}
                                        className="w-full bg-white border border-[#0B1D35]/10 rounded-xl px-5 py-3.5 text-sm text-[#0B1D35] focus:outline-none focus:border-[#0B1D35]/30 transition-colors h-28 resize-none" placeholder="Tulis ucapan..." />
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="navy-btn-solid w-full py-3.5 rounded-full text-[10px] tracking-[0.2em] uppercase font-medium disabled:opacity-50 shadow-lg">
                                    {submitting ? 'Mengirim...' : 'Kirim Ucapan'}
                                </button>
                            </form>

                            {/* Wishes list */}
                            {wishes.length > 0 && (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto mn-reveal" data-delay="2">
                                    {wishes.map((w, i) => (
                                        <div key={i} className="bg-white rounded-xl p-5 border border-[#0B1D35]/5 shadow-sm">
                                            <p className={`${playfair.className} text-sm font-bold text-[#0B1D35] mb-1`}>{w.name}</p>
                                            <p className="text-xs text-[#0B1D35]/40 mb-2 font-medium">{new Date(w.created_at).toLocaleDateString('id-ID')}</p>
                                            <p className="text-sm text-[#0B1D35]/70 leading-relaxed">{w.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── FOOTER ── */}
                    <footer className="bg-[#0B1D35] py-24 px-8 text-center">
                        <div className="mn-reveal">
                            <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 mb-8">Thank you for being part of our story</p>

                            <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center mx-auto mb-8 bg-white/5">
                                <p className={`${greatVibes.className} text-3xl text-white/40`}>
                                    {invitation?.groom_name?.charAt(0)}{invitation?.bride_name?.charAt(0)}
                                </p>
                            </div>

                            <p className={`${playfair.className} text-xl font-bold tracking-wider text-white mb-2`}>
                                {invitation?.groom_name} & {invitation?.bride_name}
                            </p>
                            <p className="text-xs text-[#C9A96E] tracking-widest uppercase mb-10">
                                {eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>

                            <div className="flex items-center justify-center gap-4 text-white/10 mb-8">
                                <div className="h-px w-16 bg-current" />
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                <div className="h-px w-16 bg-current" />
                            </div>

                            <p className="text-[9px] text-white/10 tracking-[0.3em] uppercase">Minimalist Navy Theme</p>
                        </div>
                    </footer>

                </div>
            </main>
        </div>
    );
}
