'use client';

import GiftAtmCard from './partials/GiftAtmCard';
import React, { useEffect, useRef, useState } from 'react';
import { Cinzel, Great_Vibes, Montserrat } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import VideoEmbed from './partials/VideoEmbed';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: ['400'] });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function MinimalistBlack({ payload, audioController }) {
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

    // Form state
    const [nameInput, setNameInput] = useState(guestName || '');
    const [messageInput, setMessageInput] = useState('');
    const [wishes, setWishes] = useState(invitation?.guestMessages || []);
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://app.digitvitation.my.id/api';
    const submitWish = async (e) => {
        e.preventDefault();
        if (!nameInput.trim() || !messageInput.trim()) return;
        setSubmitting(true);
        try {
            await fetch(`${API_URL}/invitations/${invitation.id}/guestbook`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ name: nameInput, message: messageInput })
            });
            setWishes([{ name: nameInput, message: messageInput, created_at: new Date().toISOString() }, ...wishes]);
            setMessageInput('');
            toast.success('Ucapan terkirim!');
        } catch { toast.error('Gagal mengirim ucapan'); }
        finally { setSubmitting(false); }
    };

    // Countdown
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
            document.querySelectorAll('.mb-reveal').forEach(el => {
                const top = el.getBoundingClientRect().top;
                if (top < window.innerHeight - 50) el.classList.add('active');
            });
        };
        const panel = rightPanelRef.current;
        if (panel) panel.addEventListener('scroll', handleScroll);
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => {
            if (panel) panel.removeEventListener('scroll', handleScroll);
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



    const coverPhoto = (() => {
        const cp = invitation?.cover_photo;
        if (!cp) return null;
        return getPhoto(Array.isArray(cp) ? cp[0] : cp);
    })();

    const groomPhoto = getPhoto(invitation?.groom_photo);
    const bridePhoto = getPhoto(invitation?.bride_photo);
    const photos = invitation?.gallery?.length > 0 ? invitation.gallery.map(g => g.photo) : (invitation?.photos || []);

    return (
        <div className={`min-h-screen bg-[#0f0f0f] text-white ${montserrat.className} overflow-hidden minimalist-black-theme`}>
            <style dangerouslySetInnerHTML={{ __html: `
                .minimalist-black-theme .mb-reveal { opacity: 0; transform: translateY(35px); transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1); }
                .minimalist-black-theme .mb-reveal.active { opacity: 1; transform: translateY(0); }
                .minimalist-black-theme .mb-reveal[data-delay="1"] { transition-delay: 0.15s; }
                .minimalist-black-theme .mb-reveal[data-delay="2"] { transition-delay: 0.3s; }
                .minimalist-black-theme .mb-reveal[data-delay="3"] { transition-delay: 0.45s; }
                .moon-glow { 
                    position: absolute; width: 450px; height: 450px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(200,175,130,0.35) 0%, rgba(200,175,130,0.08) 50%, transparent 70%);
                    top: 5%; right: 10%; pointer-events: none; z-index: 1;
                    animation: moonPulse 6s ease-in-out infinite alternate;
                }
                @keyframes moonPulse { 0% { opacity: 0.7; transform: scale(1); } 100% { opacity: 1; transform: scale(1.05); } }
                .arch-frame { border-radius: 200px 200px 0 0; overflow: hidden; }
                .split-left { position: sticky; top: 0; height: 100vh; }
                @media (max-width: 1023px) { .split-left { position: relative; height: auto; min-height: 100vh; } }
                .cover-overlay-mb { position: fixed; inset: 0; z-index: 9999; transition: transform 1s cubic-bezier(0.16,1,0.3,1); }
                .cover-overlay-mb.open { transform: translateY(-100%); }
                .music-spin { animation: musicSpin 4s linear infinite; }
                @keyframes musicSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .card-dark { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />



            {/* ═══════ COVER OVERLAY (Pre-open) ═══════ */}
            <div className={`cover-overlay-mb ${isOpen ? 'open' : ''}`}>
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]">
                    {/* Background cover image */}
                    {coverPhoto && <img src={landingPhoto || coverPhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />
                    
                    {/* Moon glow */}
                    <div className="moon-glow" style={{ top: '10%', right: '20%' }} />

                    <div className="relative z-10 text-center px-6 flex flex-col items-center">
                        <p className={`${cinzel.className} text-[10px] md:text-xs tracking-[0.5em] uppercase text-white/50 mb-6`}>The Wedding Of</p>
                        <h1 className={`${greatVibes.className} text-6xl md:text-8xl lg:text-9xl text-white mb-4`}>
                            {invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}
                        </h1>
                        <p className="text-xs text-white/50 tracking-[0.3em] uppercase mb-10">
                            {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        {guestName && (
                            <div className="mb-8">
                                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Kepada Yth. Bapak/Ibu/Saudara/i</p>
                                <p className={`${greatVibes.className} text-3xl text-white`}>{guestName}</p>
                            </div>
                        )}

                        <button onClick={handleOpen} className={`${cinzel.className} border border-white/30 px-10 py-4 text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-500`}>
                            Buka Undangan
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════ MAIN SPLIT LAYOUT ═══════ */}
            <div className={`transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col lg:flex-row min-h-screen">

                    {/* ───── LEFT PANEL (Sticky hero) ───── */}
                    <div className="split-left w-full lg:w-[70%] bg-[#0f0f0f] relative flex flex-col justify-end p-8 md:p-12 lg:p-16">
                        {/* Background cover + moon */}
                        {coverPhoto && <img src={coverPhoto} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-70" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent" />
                        <div className="moon-glow" />

                        <div className="relative z-10">
                            <p className={`${cinzel.className} text-[10px] tracking-[0.4em] uppercase text-white/50 mb-6`}>Our Wedding Invitation</p>
                            
                            <h1 className={`${greatVibes.className} text-6xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-8`}>
                                {invitation?.groom_name?.split(' ')[0]} <span className="text-white/60">&</span> {invitation?.bride_name?.split(' ')[0]}
                            </h1>

                            {/* Quote */}
                            {invitation?.quotes && (
                                <p className="text-sm text-white/50 leading-relaxed max-w-lg mb-10 italic">
                                    "{invitation.description}"
                                </p>
                            )}

                            {/* Guest info */}
                            {guestName && (
                                <div className="mb-6">
                                    <p className="text-[10px] text-white/30 tracking-widest uppercase mb-1">Kepada Yth. Bapak / Ibu /Saudara/i</p>
                                    <p className={`${greatVibes.className} text-3xl text-white`}>{guestName}</p>
                                </div>
                            )}
                        </div>

                        {/* Music toggle — centered between panels */}
                        {invitation?.music_url && (
                            <MusicPlayer audioController={audioController} btnBg="bg-[#0f0f0f]" btnColor="text-white/60" btnBorder="border-white/20 shadow-2xl" />
                        )}
                    </div>

                    {/* ───── RIGHT PANEL (Scrollable content) ───── */}
                    <div ref={rightPanelRef} className="w-full lg:w-[30%] lg:h-screen lg:overflow-y-auto scrollbar-hide bg-[#0f0f0f]">

                        {/* ── Save the Date + Countdown ── */}
                        <section className="py-20 px-8 text-center mb-reveal">
                            <p className={`${cinzel.className} text-[10px] tracking-[0.4em] uppercase text-white/40 mb-4`}>The Wedding Of</p>
                            <h2 className={`${cinzel.className} text-3xl font-bold tracking-wider text-white mb-2`}>
                                {invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}
                            </h2>
                            <p className="text-xs text-white/40 mb-10">
                                {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>

                            {/* Countdown */}
                            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mb-12">
                                {[
                                    { val: countdown.days, label: 'Hari' },
                                    { val: countdown.hours, label: 'Jam' },
                                    { val: countdown.minutes, label: 'Menit' },
                                    { val: countdown.seconds, label: 'Detik' },
                                ].map((item, i) => (
                                    <div key={i} className="card-dark rounded-xl py-4 px-2">
                                        <p className={`${cinzel.className} text-2xl font-bold text-white`}>{item.val}</p>
                                        <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1">{item.label}</p>
                                    </div>
                                ))}
                            </div>

                            <a href="#" className={`${cinzel.className} inline-block border border-white/20 px-8 py-3 text-[10px] tracking-[0.2em] uppercase text-white/70 hover:bg-white hover:text-black transition-all duration-500`}>
                                Save The Date
                            </a>
                        </section>

                        {/* ── Opening verse / Quote ── */}
                        <section className="px-8 pb-20 mb-reveal">
                            {/* Gallery preview thumbnails */}
                            {photos.length > 0 && (
                                <div className="flex gap-3 mb-10 overflow-x-auto scrollbar-hide">
                                    {photos.slice(0, 3).map((p, i) => (
                                        <div key={i} className="flex-none w-28 h-36 rounded-xl overflow-hidden">
                                            <img src={getPhoto(p)} alt={`Preview ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="bg-white rounded-3xl p-8 text-center text-[#1a1a1a]">
                                <p className="text-sm leading-relaxed text-gray-600 italic mb-4">
                                    {invitation?.quotes || '"Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu."'}
                                </p>
                                <p className="text-[10px] text-gray-400 tracking-widest uppercase">{invitation?.quotes_name || 'QS. Ar-Rum Ayat 21'}</p>
                            </div>
                        </section>

                        {/* ── BRIDE & GROOM ── */}
                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 mb-reveal">
                                <h2 className={`${cinzel.className} text-2xl font-bold tracking-[0.15em] uppercase text-white`}>Bride & Groom</h2>
                                <p className="text-xs text-white/30 mt-2">Assalamualaikum Wr. Wb.</p>
                                <p className="text-xs text-white/40 mt-3 max-w-md mx-auto leading-relaxed">
                                    Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami :
                                </p>
                            </div>

                            {/* Bride card */}
                            <div className="bg-white rounded-3xl p-8 text-center text-[#1a1a1a] mb-6 mb-reveal" data-delay="1">
                                {bridePhoto && (
                                    <div className="w-40 h-52 mx-auto mb-6 arch-frame bg-gray-100">
                                        <img src={bridePhoto} alt="Bride" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <p className={`${greatVibes.className} text-3xl text-[#1a1a1a] mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p>
                                <h3 className={`${cinzel.className} text-xl font-bold tracking-wider mb-3`}>{invitation?.bride_full_name || invitation?.bride_name}</h3>
                                <p className="text-sm text-gray-500">Putri dari</p>
                                <p className="text-sm text-gray-600 font-medium">{invitation?.bride_father || 'Bapak Mempelai'} & {invitation?.bride_mother || 'Ibu Mempelai'}</p>
                            </div>

                            {/* Ampersand */}
                            <div className="text-center my-4 mb-reveal">
                                <span className={`${greatVibes.className} text-6xl text-white/20`}>&</span>
                            </div>

                            {/* Groom card */}
                            <div className="bg-white rounded-3xl p-8 text-center text-[#1a1a1a] mb-reveal" data-delay="2">
                                {groomPhoto && (
                                    <div className="w-40 h-52 mx-auto mb-6 arch-frame bg-gray-100">
                                        <img src={groomPhoto} alt="Groom" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <p className={`${greatVibes.className} text-3xl text-[#1a1a1a] mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p>
                                <h3 className={`${cinzel.className} text-xl font-bold tracking-wider mb-3`}>{invitation?.groom_full_name || invitation?.groom_name}</h3>
                                <p className="text-sm text-gray-500">Putra dari</p>
                                <p className="text-sm text-gray-600 font-medium">{invitation?.groom_father || 'Bapak Mempelai'} & {invitation?.groom_mother || 'Ibu Mempelai'}</p>
                            </div>
                        </section>

                        {/* ── WEDDING EVENT ── */}
                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 mb-reveal">
                                <h2 className={`${cinzel.className} text-2xl font-bold tracking-[0.15em] uppercase text-white`}>Wedding</h2>
                                <p className={`${greatVibes.className} text-4xl text-white/50 -mt-1`}>Event</p>
                            </div>

                            {invitation?.events && invitation.events.length > 0 ? (
                                [...invitation.events].sort((a,b) => (a.sort_order||0) - (b.sort_order||0)).map((event, idx) => (
                                    <div key={idx} className="card-dark rounded-3xl p-8 mb-6 overflow-hidden mb-reveal" data-delay={`${idx+1}`}>
                                        {/* Arch photo */}
                                        {coverPhoto && (
                                            <div className="w-full h-44 arch-frame bg-gray-900 mb-6 relative">
                                                <img src={coverPhoto} alt={event.name} className="w-full h-full object-cover opacity-60" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                                <div className="absolute bottom-4 left-0 right-0 text-center">
                                                    <h3 className={`${cinzel.className} text-xl font-bold tracking-[0.2em] uppercase text-white`}>{event.name}</h3>
                                                    <p className={`${cinzel.className} text-lg font-bold tracking-[0.15em] uppercase text-white/30 mt-1`}>{event.name}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-center space-y-3">
                                            <p className="text-sm text-white/60">
                                                {event.date ? new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                            </p>
                                            <p className="text-sm text-white/60">
                                                Pukul : {event.time_start?.substring(0, 5) || 'TBA'} {event.time_end ? `- ${event.time_end.substring(0, 5)}` : '- Selesai'} WIB
                                            </p>

                                            {event.location && (
                                                <div className="pt-3 border-t border-white/5">
                                                    <div className="flex items-center justify-center gap-2 mb-2">
                                                        <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                                                        <p className="text-xs text-white/40">Lokasi Acara :</p>
                                                    </div>
                                                    <p className="text-sm text-white/60">{event.location}</p>
                                                </div>
                                            )}

                                            {(event.latitude && event.longitude) && (
                                                <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer"
                                                    className={`${cinzel.className} inline-flex items-center gap-2 border border-white/20 px-6 py-3 text-[10px] tracking-[0.2em] uppercase text-white/60 hover:bg-white hover:text-black transition-all duration-500 mt-4`}>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                                                    Lihat Lokasi
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="card-dark rounded-3xl p-10 text-center">
                                    <h3 className={`${cinzel.className} text-xl font-bold tracking-wider mb-2`}>Acara Pernikahan</h3>
                                    <p className="text-sm text-white/40">
                                        {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    {invitation?.location && <p className="text-sm text-white/40 mt-2">{invitation.location}</p>}
                                </div>
                            )}
                        </section>

                        {/* ── LOVE STORY ── */}
                        {invitation?.love_stories && invitation.love_stories.length > 0 && (
                            <section className="px-8 pb-20">
                                <div className="text-center mb-12 mb-reveal">
                                    <h2 className={`${cinzel.className} text-2xl font-bold tracking-[0.15em] uppercase text-white`}>Our</h2>
                                    <p className={`${greatVibes.className} text-4xl text-white/50 -mt-1`}>Love Story</p>
                                </div>

                                {[...invitation.love_stories].sort((a,b) => (a.sort_order||0) - (b.sort_order||0)).map((story, i) => (
                                    <div key={story.id || i} className="bg-white rounded-3xl p-8 text-center text-[#1a1a1a] mb-6 mb-reveal" data-delay={`${i+1}`}>
                                        <h3 className={`${cinzel.className} text-lg font-bold tracking-[0.15em] uppercase mb-4`}>{story.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">{story.description}</p>
                                        {story.photo && (
                                            <div className="mt-6 rounded-xl overflow-hidden">
                                                <img src={getPhoto(story.photo)} alt={story.title} className="w-full h-44 object-cover" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* ── OUR BEST MOMENTS ── */}
                        <Gallery 
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={cinzel.className}
                            titleSize="text-2xl font-bold tracking-[0.15em] uppercase"
                            accentText="text-white"
                            subtitleText="text-white/50"
                            borderColor="border-white/10"
                        />

                        {/* ── QR CHECKIN ── */}
                        <div className="px-8">
                            <QrCheckin guest={guest} sectionBg="bg-transparent" titleFont={cinzel.className} textColor="text-white" borderStyle="border-white/10" />
                        </div>

                        {/* ── RSVP & WISHES ── */}
                        <section className="px-8 pb-20 mb-reveal">
                            <div className="text-center mb-12">
                                <h2 className={`${cinzel.className} text-2xl font-bold tracking-[0.15em] uppercase text-white`}>Wedding</h2>
                                <p className={`${greatVibes.className} text-4xl text-white/50 -mt-1`}>Wishes</p>
                            </div>

                            <div className="bg-white rounded-3xl p-8 text-[#1a1a1a]">
                                <form onSubmit={submitWish} className="space-y-4">
                                    <div>
                                        <label className={`${cinzel.className} block text-[9px] tracking-[0.2em] uppercase text-gray-400 mb-2 font-bold`}>Nama</label>
                                        <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-gray-400 transition-colors" placeholder="Nama Anda..." />
                                    </div>
                                    <div>
                                        <label className={`${cinzel.className} block text-[9px] tracking-[0.2em] uppercase text-gray-400 mb-2 font-bold`}>Ucapan</label>
                                        <textarea value={messageInput} onChange={e => setMessageInput(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-sm h-28 resize-none focus:outline-none focus:border-gray-400 transition-colors" placeholder="Tulis ucapan..." />
                                    </div>
                                    <button type="submit" disabled={submitting} className={`${cinzel.className} w-full bg-[#1a1a1a] text-white py-4 rounded-xl text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-black transition-colors disabled:opacity-50`}>
                                        {submitting ? 'Mengirim...' : 'Kirim Ucapan'}
                                    </button>
                                </form>
                                {wishes.length > 0 && (
                                    <div className="mt-8 space-y-3 max-h-[300px] overflow-y-auto">
                                        {wishes.map((m, i) => (
                                            <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                                <p className="text-sm text-gray-600">{m.message}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                                                        <span className="text-white text-[10px] font-bold">{m.name?.charAt(0)?.toUpperCase()}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">{m.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ── GIFT / AMPLOP DIGITAL ── */}
                        {invitation?.gift_accounts && invitation.gift_accounts.length > 0 && (
                            <section className="px-8 pb-20 mb-reveal">
                                <div className="text-center mb-12">
                                    <h2 className={`${cinzel.className} text-2xl font-bold tracking-[0.15em] uppercase text-white`}>Wedding</h2>
                                    <p className={`${greatVibes.className} text-4xl text-white/50 -mt-1`}>Gift</p>
                                </div>

                                <div className="space-y-4">
                                    {invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={`${(i % 3) + 1}`} variant="MinimalistBlack" />
                            ))}
                                </div>
                            </section>
                        )}

                        {/* ── FOOTER ── */}
                <footer className="bg-[#1a1a1a] text-white pt-64 pb-24 px-8 text-center relative overflow-hidden">
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
                        <p className={`${montserrat.className} text-[10px] text-white/50 tracking-[0.3em] uppercase font-bold mb-4`}>
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

                    </div>
                </div>
            </div>
        </div>
    );
}
