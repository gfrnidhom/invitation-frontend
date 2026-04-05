'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Playfair_Display, Great_Vibes, Lato } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import VideoEmbed from './partials/VideoEmbed';
import Gallery from './partials/Gallery';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: ['400'] });
const lato = Lato({ subsets: ['latin'], weight: ['300', '400', '700', '900'] });

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://app.digitvitation.my.id/storage';

export default function MidnightGold({ payload, audioController }) {
    const { invitation, guest, guestName } = payload;
    const [isOpen, setIsOpen] = useState(false);
    const rightPanelRef = useRef(null);

    const [nameInput, setNameInput] = useState(guestName || '');
    const [messageInput, setMessageInput] = useState('');
    const [wishes, setWishes] = useState(invitation?.guestMessages || []);
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
            document.querySelectorAll('.mg-reveal').forEach(el => {
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
        if (audioController) audioController.play();
    };

    const toggleAudio = () => {
        if (audioController) audioController.toggle();
    };

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
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

    const coverPhoto = (() => {
        const cp = invitation?.cover_photo;
        if (!cp) return null;
        return getPhoto(Array.isArray(cp) ? cp[0] : cp);
    })();

    const groomPhoto = getPhoto(invitation?.groom_photo);
    const bridePhoto = getPhoto(invitation?.bride_photo);
    const photos = invitation?.gallery?.length > 0 ? invitation.gallery.map(g => g.photo) : (invitation?.photos || []);

    return (
        <div className={`min-h-screen bg-[#0c1220] text-white ${lato.className} overflow-hidden midnight-gold-theme`}>
            <style dangerouslySetInnerHTML={{ __html: `
                .midnight-gold-theme .mg-reveal { opacity: 0; transform: translateY(35px); transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1); }
                .midnight-gold-theme .mg-reveal.active { opacity: 1; transform: translateY(0); }
                .midnight-gold-theme .mg-reveal[data-delay="1"] { transition-delay: 0.15s; }
                .midnight-gold-theme .mg-reveal[data-delay="2"] { transition-delay: 0.3s; }
                .midnight-gold-theme .mg-reveal[data-delay="3"] { transition-delay: 0.45s; }
                .gold-glow {
                    position: absolute; width: 500px; height: 500px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.06) 50%, transparent 70%);
                    pointer-events: none; z-index: 1;
                    animation: goldPulse 5s ease-in-out infinite alternate;
                }
                @keyframes goldPulse { 0% { opacity: 0.6; transform: scale(1); } 100% { opacity: 1; transform: scale(1.08); } }
                .gold-border { border: 1px solid rgba(201,168,76,0.25); }
                .gold-border-strong { border: 1px solid rgba(201,168,76,0.45); }
                .gold-text { color: #c9a84c; }
                .gold-text-soft { color: rgba(201,168,76,0.6); }
                .card-midnight { background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.12); backdrop-filter: blur(10px); }
                .split-left-mg { position: sticky; top: 0; height: 100vh; }
                @media (max-width: 1023px) { .split-left-mg { position: relative; height: auto; min-height: 100vh; } }
                .cover-overlay-mg { position: fixed; inset: 0; z-index: 9999; transition: transform 1s cubic-bezier(0.16,1,0.3,1); }
                .cover-overlay-mg.open { transform: translateY(-100%); }
                .music-spin-mg { animation: musicSpinMg 4s linear infinite; }
                @keyframes musicSpinMg { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .arch-frame-mg { border-radius: 200px 200px 0 0; overflow: hidden; }
                .gold-ornament::before, .gold-ornament::after {
                    content: '✦'; color: rgba(201,168,76,0.3); font-size: 12px; margin: 0 12px;
                }
            `}} />



            {/* ═══════ COVER OVERLAY ═══════ */}
            <div className={`cover-overlay-mg ${isOpen ? 'open' : ''}`}>
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0a0e1a]">
                    {coverPhoto && <img src={coverPhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/50 via-[#0a0e1a]/70 to-[#0a0e1a]/95" />
                    <div className="gold-glow" style={{ top: '8%', right: '15%' }} />

                    <div className="relative z-10 text-center px-6 flex flex-col items-center">
                        <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/60 to-transparent mb-8" />
                        <p className={`${playfair.className} text-[10px] md:text-xs tracking-[0.5em] uppercase gold-text-soft mb-6`}>The Wedding Of</p>
                        <h1 className={`${greatVibes.className} text-6xl md:text-8xl lg:text-9xl text-white mb-4`}>
                            {invitation?.groom_name?.split(' ')[0]} <span className="gold-text">&</span> {invitation?.bride_name?.split(' ')[0]}
                        </h1>
                        <p className="text-xs gold-text-soft tracking-[0.3em] uppercase mb-10">
                            {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        {guestName && (
                            <div className="mb-8">
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Kepada Yth. Bapak/Ibu/Saudara/i</p>
                                <p className={`${greatVibes.className} text-3xl gold-text`}>{guestName}</p>
                            </div>
                        )}

                        <button onClick={handleOpen} className={`${playfair.className} gold-border-strong px-10 py-4 text-[10px] tracking-[0.3em] uppercase gold-text hover:bg-[#c9a84c] hover:text-[#0a0e1a] transition-all duration-500`}>
                            Buka Undangan
                        </button>
                        <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/60 to-transparent mt-8" />
                    </div>
                </div>
            </div>

            {/* ═══════ MAIN SPLIT LAYOUT ═══════ */}
            <div className={`transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col lg:flex-row min-h-screen">

                    {/* ───── LEFT PANEL (Sticky hero) ───── */}
                    <div className="split-left-mg w-full lg:w-[55%] bg-[#0c1220] relative flex flex-col justify-end p-8 md:p-12 lg:p-16">
                        {coverPhoto && <img src={coverPhoto} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1220] via-[#0c1220]/50 to-transparent" />
                        <div className="gold-glow" style={{ top: '5%', right: '10%' }} />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-px bg-[#c9a84c]/40" />
                                <p className={`${playfair.className} text-[10px] tracking-[0.4em] uppercase gold-text-soft`}>Our Wedding</p>
                            </div>

                            <h1 className={`${greatVibes.className} text-6xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-4`}>
                                {invitation?.groom_name?.split(' ')[0]}
                            </h1>
                            <div className={`${greatVibes.className} text-5xl md:text-6xl gold-text mb-4`}>&</div>
                            <h1 className={`${greatVibes.className} text-6xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-8`}>
                                {invitation?.bride_name?.split(' ')[0]}
                            </h1>

                            {invitation?.description && (
                                <p className="text-sm text-white/40 leading-relaxed max-w-lg mb-10 italic">
                                    "{invitation.description}"
                                </p>
                            )}

                            {guestName && (
                                <div className="mb-6">
                                    <p className="text-[10px] text-white/25 tracking-widest uppercase mb-1">Dear</p>
                                    <p className={`${greatVibes.className} text-3xl gold-text`}>{guestName}</p>
                                </div>
                            )}
                        </div>

                        {invitation?.music_url && (
                            <button onClick={toggleAudio} className="absolute bottom-8 right-8 lg:bottom-1/2 lg:-right-6 lg:translate-y-1/2 z-50 w-12 h-12 rounded-full bg-[#0c1220] gold-border flex items-center justify-center hover:border-[#c9a84c]/60 transition-all shadow-2xl">
                                {audioController?.isPlaying ? (
                                    <svg className="w-5 h-5 music-spin-mg gold-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5 gold-text" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                )}
                            </button>
                        )}
                    </div>

                    {/* ───── RIGHT PANEL (Scrollable) ───── */}
                    <div ref={rightPanelRef} className="w-full lg:w-[45%] lg:h-screen lg:overflow-y-auto scrollbar-hide bg-[#0c1220]">

                        {/* ── Countdown ── */}
                        <section className="py-20 px-8 md:px-12 text-center mg-reveal">
                            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent mx-auto mb-8" />
                            <p className={`${playfair.className} text-[10px] tracking-[0.4em] uppercase gold-text-soft mb-4`}>Save The Date</p>
                            <h2 className={`${playfair.className} text-3xl md:text-4xl font-bold tracking-wider text-white mb-2`}>
                                {invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}
                            </h2>
                            <p className="text-xs text-white/30 mb-10">
                                {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>

                            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mb-12">
                                {[
                                    { val: countdown.days, label: 'Hari' },
                                    { val: countdown.hours, label: 'Jam' },
                                    { val: countdown.minutes, label: 'Menit' },
                                    { val: countdown.seconds, label: 'Detik' },
                                ].map((item, i) => (
                                    <div key={i} className="card-midnight rounded-xl py-4 px-2">
                                        <p className={`${playfair.className} text-2xl md:text-3xl font-bold gold-text`}>{item.val}</p>
                                        <p className="text-[9px] uppercase tracking-widest text-white/25 mt-1">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ── Opening Quote ── */}
                        <section className="px-8 md:px-12 pb-20 mg-reveal">
                            {photos.length > 0 && (
                                <div className="flex gap-3 mb-10 overflow-x-auto scrollbar-hide">
                                    {photos.slice(0, 3).map((p, i) => (
                                        <div key={i} className="flex-none w-28 h-36 md:w-36 md:h-44 rounded-xl overflow-hidden gold-border">
                                            <img src={getPhoto(p)} alt={`Preview ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="card-midnight rounded-3xl p-8 md:p-10 text-center">
                                <div className="w-10 h-10 rounded-full gold-border mx-auto mb-6 flex items-center justify-center">
                                    <span className="gold-text text-lg">❝</span>
                                </div>
                                <p className="text-sm leading-relaxed text-white/50 italic mb-4">
                                    {invitation?.opening_text || '"Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu."'}
                                </p>
                                <p className="text-[10px] gold-text-soft tracking-widest uppercase">QS. Ar-Rum Ayat 21</p>
                            </div>
                        </section>

                        {/* ── BRIDE & GROOM (Horizontal alternating) ── */}
                        <section className="px-8 md:px-12 pb-20">
                            <div className="text-center mb-12 mg-reveal">
                                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent mx-auto mb-6" />
                                <h2 className={`${playfair.className} text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase text-white`}>Bride & Groom</h2>
                                <p className="text-xs text-white/25 mt-2">Assalamualaikum Wr. Wb.</p>
                                <p className="text-xs text-white/35 mt-3 max-w-md mx-auto leading-relaxed">
                                    Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:
                                </p>
                            </div>

                            {/* Bride — Photo left, info right */}
                            <div className="card-midnight rounded-3xl p-6 md:p-8 mb-6 mg-reveal" data-delay="1">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    {bridePhoto && (
                                        <div className="w-36 h-44 md:w-40 md:h-52 flex-none arch-frame-mg gold-border">
                                            <img src={bridePhoto} alt="Bride" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="text-center md:text-left flex-1">
                                        <p className={`${greatVibes.className} text-3xl gold-text mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p>
                                        <h3 className={`${playfair.className} text-xl md:text-2xl font-bold tracking-wider text-white mb-3`}>
                                            {invitation?.bride_full_name || invitation?.bride_name}
                                        </h3>
                                        <div className="w-10 h-px bg-[#c9a84c]/30 mb-3 mx-auto md:mx-0" />
                                        <p className="text-sm text-white/40">Putri dari</p>
                                        <p className="text-sm text-white/60 font-medium">{invitation?.bride_father || 'Bapak'} & {invitation?.bride_mother || 'Ibu'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ampersand */}
                            <div className="text-center my-4 mg-reveal">
                                <span className={`${greatVibes.className} text-6xl gold-text`}>&</span>
                            </div>

                            {/* Groom — Info left, photo right */}
                            <div className="card-midnight rounded-3xl p-6 md:p-8 mg-reveal" data-delay="2">
                                <div className="flex flex-col md:flex-row-reverse items-center gap-6">
                                    {groomPhoto && (
                                        <div className="w-36 h-44 md:w-40 md:h-52 flex-none arch-frame-mg gold-border">
                                            <img src={groomPhoto} alt="Groom" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="text-center md:text-right flex-1">
                                        <p className={`${greatVibes.className} text-3xl gold-text mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p>
                                        <h3 className={`${playfair.className} text-xl md:text-2xl font-bold tracking-wider text-white mb-3`}>
                                            {invitation?.groom_full_name || invitation?.groom_name}
                                        </h3>
                                        <div className="w-10 h-px bg-[#c9a84c]/30 mb-3 mx-auto md:ml-auto md:mr-0" />
                                        <p className="text-sm text-white/40">Putra dari</p>
                                        <p className="text-sm text-white/60 font-medium">{invitation?.groom_father || 'Bapak'} & {invitation?.groom_mother || 'Ibu'}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── EVENTS ── */}
                        <section className="px-8 md:px-12 pb-20">
                            <div className="text-center mb-12 mg-reveal">
                                <h2 className={`${playfair.className} text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase text-white`}>Wedding</h2>
                                <p className={`${greatVibes.className} text-4xl gold-text -mt-1`}>Event</p>
                            </div>

                            {invitation?.events && invitation.events.length > 0 ? (
                                [...invitation.events].sort((a,b) => (a.sort_order||0) - (b.sort_order||0)).map((event, idx) => (
                                    <div key={idx} className="card-midnight rounded-3xl p-8 mb-6 overflow-hidden mg-reveal" data-delay={`${idx+1}`}>
                                        {coverPhoto && (
                                            <div className="w-full h-44 md:h-52 arch-frame-mg mb-6 relative">
                                                <img src={coverPhoto} alt={event.name} className="w-full h-full object-cover opacity-50" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1220]/90 to-transparent" />
                                                <div className="absolute bottom-4 left-0 right-0 text-center">
                                                    <h3 className={`${playfair.className} text-xl font-bold tracking-[0.2em] uppercase gold-text`}>{event.name}</h3>
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-center space-y-3">
                                            <p className="text-sm text-white/50">
                                                {event.date ? new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                            </p>
                                            <p className="text-sm text-white/50">
                                                Pukul : {event.time_start?.substring(0, 5) || 'TBA'} {event.time_end ? `- ${event.time_end.substring(0, 5)}` : '- Selesai'} WIB
                                            </p>
                                            {event.location && (
                                                <div className="pt-3 border-t border-[#c9a84c]/10">
                                                    <p className="text-xs gold-text-soft mb-1">Lokasi Acara :</p>
                                                    <p className="text-sm text-white/50">{event.location}</p>
                                                </div>
                                            )}
                                            {(event.latitude && event.longitude) && (
                                                <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer"
                                                    className={`${playfair.className} inline-flex items-center gap-2 gold-border-strong px-6 py-3 text-[10px] tracking-[0.2em] uppercase gold-text hover:bg-[#c9a84c] hover:text-[#0c1220] transition-all duration-500 mt-4`}>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                                                    Lihat Lokasi
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="card-midnight rounded-3xl p-10 text-center">
                                    <h3 className={`${playfair.className} text-xl font-bold tracking-wider gold-text mb-2`}>Acara Pernikahan</h3>
                                    <p className="text-sm text-white/35">
                                        {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    {invitation?.location && <p className="text-sm text-white/35 mt-2">{invitation.location}</p>}
                                </div>
                            )}
                        </section>

                        {/* ── LOVE STORY ── */}
                        {invitation?.love_stories && invitation.love_stories.length > 0 && (
                            <section className="px-8 md:px-12 pb-20">
                                <div className="text-center mb-12 mg-reveal">
                                    <h2 className={`${playfair.className} text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase text-white`}>Our</h2>
                                    <p className={`${greatVibes.className} text-4xl gold-text -mt-1`}>Love Story</p>
                                </div>
                                {[...invitation.love_stories].sort((a,b) => (a.sort_order||0) - (b.sort_order||0)).map((story, i) => (
                                    <div key={story.id || i} className="card-midnight rounded-3xl p-8 text-center mb-6 mg-reveal" data-delay={`${i+1}`}>
                                        <h3 className={`${playfair.className} text-lg md:text-xl font-bold tracking-[0.15em] uppercase gold-text mb-4`}>{story.title}</h3>
                                        <p className="text-sm text-white/45 leading-relaxed">{story.description}</p>
                                        {story.photo && (
                                            <div className="mt-6 rounded-xl overflow-hidden gold-border">
                                                <img src={getPhoto(story.photo)} alt={story.title} className="w-full h-44 object-cover" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* ── GALLERY ── */}
                        <Gallery 
                            layout="abstract"
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={playfair.className}
                            titleSize="text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase"
                            accentText="text-white"
                            subtitleText="gold-text"
                            borderColor="border-[#c9a84c]/30"
                        />

                        {/* ── QR CHECKIN ── */}
                        <div className="px-8 md:px-12">
                            <QrCheckin guest={guest} sectionBg="bg-transparent" titleFont={playfair.className} textColor="text-white" borderStyle="border-[#c9a84c]/20" />
                        </div>

                        {/* ── WISHES ── */}
                        <section className="px-8 md:px-12 pb-20 mg-reveal">
                            <div className="text-center mb-12">
                                <h2 className={`${playfair.className} text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase text-white`}>Wedding</h2>
                                <p className={`${greatVibes.className} text-4xl gold-text -mt-1`}>Wishes</p>
                            </div>

                            <div className="card-midnight rounded-3xl p-8 md:p-10">
                                <form onSubmit={submitWish} className="space-y-4">
                                    <div>
                                        <label className={`${playfair.className} block text-[9px] tracking-[0.2em] uppercase gold-text-soft mb-2 font-bold`}>Nama</label>
                                        <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                                            className="w-full bg-white/5 gold-border rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-[#c9a84c]/50 transition-colors placeholder-white/20" placeholder="Nama Anda..." />
                                    </div>
                                    <div>
                                        <label className={`${playfair.className} block text-[9px] tracking-[0.2em] uppercase gold-text-soft mb-2 font-bold`}>Ucapan</label>
                                        <textarea value={messageInput} onChange={e => setMessageInput(e.target.value)}
                                            className="w-full bg-white/5 gold-border rounded-xl px-5 py-3.5 text-sm text-white h-28 resize-none focus:outline-none focus:border-[#c9a84c]/50 transition-colors placeholder-white/20" placeholder="Tulis ucapan..." />
                                    </div>
                                    <button type="submit" disabled={submitting} className={`${playfair.className} w-full bg-[#c9a84c] text-[#0c1220] py-4 rounded-xl text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-[#d4b85c] transition-colors disabled:opacity-50`}>
                                        {submitting ? 'Mengirim...' : 'Kirim Ucapan'}
                                    </button>
                                </form>

                                {wishes.length > 0 && (
                                    <div className="mt-8 space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
                                        {wishes.map((msg, i) => (
                                            <div key={i} className="bg-white/3 rounded-2xl p-4 gold-border">
                                                <p className="text-sm text-white/60">{msg.message}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="w-6 h-6 rounded-full bg-[#c9a84c]/20 flex items-center justify-center">
                                                        <span className="gold-text text-[10px] font-bold">{msg.name?.charAt(0)?.toUpperCase()}</span>
                                                    </div>
                                                    <p className="text-xs gold-text-soft">{msg.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ── GIFT ── */}
                        {invitation?.gift_accounts && invitation.gift_accounts.length > 0 && (
                            <section className="px-8 md:px-12 pb-20 mg-reveal">
                                <div className="text-center mb-12">
                                    <h2 className={`${playfair.className} text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase text-white`}>Wedding</h2>
                                    <p className={`${greatVibes.className} text-4xl gold-text -mt-1`}>Gift</p>
                                </div>
                                <div className="space-y-4">
                                    {invitation.gift_accounts.map((acc, i) => (
                                        <div key={acc.id || i} className="card-midnight rounded-2xl p-6 text-center mg-reveal" data-delay={`${i+1}`}>
                                            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/10 mx-auto mb-4 flex items-center justify-center">
                                                <svg className="w-5 h-5 gold-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>
                                            </div>
                                            <p className={`${playfair.className} text-sm font-bold tracking-widest uppercase gold-text mb-1`}>{acc.bank_name}</p>
                                            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">A.N. {acc.account_holder}</p>
                                            <p className={`${playfair.className} text-xl font-bold text-white mb-4`}>{acc.account_number}</p>
                                            <button onClick={() => { navigator.clipboard.writeText(acc.account_number); toast.success('Nomor rekening disalin!'); }}
                                                className="w-full gold-border py-3 text-[10px] uppercase tracking-widest gold-text-soft hover:bg-[#c9a84c] hover:text-[#0c1220] transition-all duration-500 rounded-xl font-bold">
                                                Copy Number
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── FOOTER with Beringinesia branding ── */}
                        <footer className="py-20 px-8 md:px-12 text-center border-t border-[#c9a84c]/10 mg-reveal">
                            <p className={`${playfair.className} text-[9px] tracking-[0.4em] uppercase gold-text-soft mb-8`}>Thank You</p>

                            <div className="w-24 h-24 rounded-full gold-border mx-auto mb-8 flex items-center justify-center">
                                <span className={`${greatVibes.className} text-4xl gold-text`}>
                                    {invitation?.groom_name?.charAt(0)}{invitation?.bride_name?.charAt(0)}
                                </span>
                            </div>

                            <h3 className={`${playfair.className} text-lg font-bold tracking-[0.15em] uppercase text-white mb-2`}>
                                {invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}
                            </h3>
                            <p className="text-xs text-white/20 tracking-widest uppercase">
                                {eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>

                            <div className="flex items-center justify-center gap-3 mt-10 gold-text-soft">
                                <div className="h-px w-12 bg-current" />
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                <div className="h-px w-12 bg-current" />
                            </div>

                            <div className="mt-12 pt-8 border-t border-[#c9a84c]/5">
                                <p className={`${playfair.className} text-[10px] gold-text tracking-[0.3em] uppercase`}>Beringinesia</p>
                                <p className="text-[8px] text-white/15 tracking-[0.2em] uppercase mt-1">Digital Invitation</p>
                            </div>
                        </footer>

                    </div>
                </div>
            </div>
        </div>
    );
}
