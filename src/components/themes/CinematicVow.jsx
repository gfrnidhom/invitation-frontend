'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Cinzel, Great_Vibes, Montserrat } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import VideoEmbed from './partials/VideoEmbed';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400','500','600','700','800','900'] });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: ['400'] });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['200','300','400','500','600','700','800'] });
const SU = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const AU = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export default function CinematicVow({ payload, audioController }) {
    const { invitation, guest, guestName } = payload;
    const [isOpen, setIsOpen] = useState(false);
    const videoRef = useRef(null);
    const rightPanelRef = useRef(null);
    const [ni, setNi] = useState(guestName || '');
    const [mi, setMi] = useState('');
    const [ws, setWs] = useState(invitation?.guestMessages || []);
    const [sub, setSub] = useState(false);
    const ed = invitation?.event_date ? new Date(invitation.event_date) : new Date();
    const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
    const [slideIdx, setSlideIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => {
            const diff = ed - new Date();
            if (diff > 0) setCd({ d: Math.floor(diff / 864e5), h: Math.floor((diff / 36e5) % 24), m: Math.floor((diff / 6e4) % 60), s: Math.floor((diff / 1e3) % 60) });
        }, 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const h = () => { document.querySelectorAll('.cv-rv').forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight - 50) el.classList.add('active'); }); };
        const p = rightPanelRef.current;
        if (p) p.addEventListener('scroll', h);
        window.addEventListener('scroll', h);
        h();
        return () => { if (p) p.removeEventListener('scroll', h); window.removeEventListener('scroll', h); };
    }, [isOpen]);

    const gp = (p) => {
        if (!p) return null; let ph = p;
        if (typeof ph === 'string' && ph.startsWith('[')) { try { const x = JSON.parse(ph); if (Array.isArray(x) && x.length > 0) ph = x[0]; } catch {} }
        if (Array.isArray(ph)) ph = ph[0];
        if (typeof ph === 'object' && ph !== null) { if (ph.photo) ph = ph.photo; else if (ph.url) ph = ph.url; else return null; }
        if (typeof ph !== 'string') return null;
        ph = ph.replace(/\\/g, '/');
        if (!ph.startsWith('http') && !ph.startsWith('/')) ph = `${SU}/${ph}`;
        return ph;
    };

    // Parse video URL — support YouTube, direct MP4, and storage paths
    const getVideoSrc = () => {
        const url = invitation?.background_video_url;
        if (!url) return null;
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let vid = '';
            if (url.includes('watch?v=')) vid = url.split('watch?v=')[1]?.split('&')[0];
            else if (url.includes('youtu.be/')) vid = url.split('youtu.be/')[1]?.split('?')[0];
            else if (url.includes('embed/')) vid = url.split('embed/')[1]?.split('?')[0];
            return vid ? { type: 'youtube', src: `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1` } : null;
        }
        // Direct URL or storage path
        const src = url.startsWith('http') ? url : `${SU}/${url}`;
        return { type: 'mp4', src };
    };
    const videoSrc = getVideoSrc();

    const ho = () => {
        setIsOpen(true);
        audioController?.play();
        if (videoRef.current) videoRef.current.play().catch(() => {});
    };

    const sw = async (e) => {
        e.preventDefault(); if (!ni.trim() || !mi.trim()) return; setSub(true);
        try {
            await fetch(`${AU}/invitations/${invitation.id}/guestbook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ name: ni, message: mi }) });
            setWs([{ name: ni, message: mi, created_at: new Date().toISOString() }, ...ws]); setMi(''); toast.success('Ucapan terkirim!');
        } catch { toast.error('Gagal mengirim ucapan'); } finally { setSub(false); }
    };

    // Parse ALL cover photos for slideshow
    const coverPhotos = (() => {
        const c = invitation?.cover_photo;
        if (!c) return [];
        let items = c;
        if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch { return [gp(items)].filter(Boolean); }
        }
        if (!Array.isArray(items)) items = [items];
        return items.map(p => {
            if (typeof p === 'object' && p !== null) return gp(p.photo || p.url || p);
            return gp(p);
        }).filter(Boolean);
    })();
    const cp = coverPhotos.length > 0 ? coverPhotos[0] : null;

    // Slideshow auto-advance (must be after coverPhotos is defined)
    useEffect(() => {
        if (!isOpen || coverPhotos.length <= 1) return;
        const t = setInterval(() => setSlideIdx(prev => (prev + 1) % coverPhotos.length), 5000);
        return () => clearInterval(t);
    }, [isOpen, coverPhotos.length]);

    const grP = gp(invitation?.groom_photo); const brP = gp(invitation?.bride_photo);
    const phs = invitation?.gallery?.length > 0 ? invitation.gallery.map(g => g.photo) : (invitation?.photos || []);

    return (
        <div className={`min-h-screen bg-[#0a0a0f] text-white ${montserrat.className} overflow-hidden`}>
            <style dangerouslySetInnerHTML={{ __html: `
                html,body{margin:0;padding:0;overflow-x:hidden}
                .cv-rv{opacity:0;transform:translateY(30px);transition:all .8s cubic-bezier(.16,1,.3,1)}.cv-rv.active{opacity:1;transform:translateY(0)}.cv-rv[data-delay="1"]{transition-delay:.15s}.cv-rv[data-delay="2"]{transition-delay:.3s}
                .cv-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px)}
                .cv-card-solid{background:rgba(10,10,15,.85);border:1px solid rgba(255,255,255,.06);backdrop-filter:blur(60px);-webkit-backdrop-filter:blur(60px)}
                .sl-cv{position:sticky;top:0;height:100vh}
                @media(max-width:1023px){.sl-cv{display:none}}
                .co-cv{position:fixed;inset:0;z-index:9999;transition:transform 1s cubic-bezier(.16,1,.3,1)}.co-cv.open{transform:translateY(-100%)}
                .ms-cv{animation:mscv 4s linear infinite}@keyframes mscv{from{transform:rotate(0)}to{transform:rotate(360deg)}}
                .sh::-webkit-scrollbar{display:none}.sh{-ms-overflow-style:none;scrollbar-width:none}
                .vid-bg{position:absolute;inset:0;z-index:0;overflow:hidden}
                .vid-bg video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
                .vid-bg iframe{position:absolute;top:50%;left:50%;width:max(100vw,177.78vh);height:max(100vh,56.25vw);transform:translate(-50%,-50%) scale(1.05);border:0;pointer-events:none}
                .vid-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(10,10,15,.3) 0%,rgba(10,10,15,.5) 40%,rgba(10,10,15,.85) 100%)}
                .arch-cv{border-radius:200px 200px 0 0;overflow:hidden}
                .pulse-border{animation:pulseBorder 3s ease-in-out infinite}@keyframes pulseBorder{0%,100%{border-color:rgba(255,255,255,.08)}50%{border-color:rgba(255,255,255,.2)}}
                .film-grain::after{content:'';position:absolute;inset:0;opacity:.015;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");pointer-events:none;z-index:3}
                .slide-img{position:absolute;inset:0;opacity:0;transition:opacity 1.5s ease-in-out}.slide-img.active{opacity:1}
                .slide-dots{display:flex;gap:6px;justify-content:center;margin-top:16px}.slide-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.15);cursor:pointer;transition:all .3s}.slide-dot.active{background:rgba(255,255,255,.6);transform:scale(1.3)}
                .slide-counter{font-variant-numeric:tabular-nums}
                .rp-bg{position:sticky;top:0;height:100vh;width:100%;overflow:hidden;z-index:0;margin-bottom:-100vh}
                @media(max-width:1023px){.rp-bg{position:fixed;inset:-2px;width:calc(100vw + 4px);height:calc(100vh + 4px);height:calc(100dvh + 4px);margin-bottom:0;z-index:0}}
                .rp-bg video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
                .rp-bg iframe{position:absolute;top:50%;left:50%;width:max(100vw,177.78vh);height:max(100vh,56.25vw);transform:translate(-50%,-50%) scale(1.05);border:0;pointer-events:none}
                .rp-bg img.rp-bg-slide{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.5s ease-in-out}
                .rp-bg img.rp-bg-slide.active{opacity:1}
                .rp-content{position:relative;z-index:10}
            ` }} />



            {/* ═══════ COVER OVERLAY ═══════ */}
            <div className={`co-cv ${isOpen ? 'open' : ''}`}>
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0a0a0f] film-grain">
                    {/* Video BG on cover */}
                    {videoSrc ? (
                        <div className="vid-bg">
                            {videoSrc.type === 'youtube' ? (
                                <iframe src={videoSrc.src} allow="autoplay; encrypted-media" allowFullScreen className="pointer-events-none" style={{ border: 0 }} />
                            ) : (
                                <video muted loop playsInline autoPlay className="opacity-50">
                                    <source src={videoSrc.src} type="video/mp4" />
                                </video>
                            )}
                        </div>
                    ) : (
                        cp && <img src={cp} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    )}
                    <div className="vid-overlay" />

                    <div className="relative z-10 text-center px-6 flex flex-col items-center">
                        {/* Film-style cinematic bars */}
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-16 h-px bg-white/20" />
                            <div className="w-2 h-2 rounded-full bg-white/15" />
                            <div className="w-16 h-px bg-white/20" />
                        </div>

                        <p className={`${cinzel.className} text-[10px] tracking-[.6em] uppercase text-white/40 mb-6`}>The Wedding Of</p>
                        <h1 className={`${greatVibes.className} text-6xl md:text-8xl lg:text-9xl text-white mb-4`}>
                            {invitation?.groom_name?.split(' ')[0]} <span className="text-white/30">&</span> {invitation?.bride_name?.split(' ')[0]}
                        </h1>
                        <p className={`${montserrat.className} text-[9px] text-white/25 tracking-[.4em] uppercase mb-10 font-light`}>
                            {ed.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        {guestName && (
                            <div className="mb-10">
                                <p className="text-[8px] text-white/15 uppercase tracking-[.3em] mb-1 font-medium">Kepada Yth.</p>
                                <p className={`${greatVibes.className} text-3xl text-white/70`}>{guestName}</p>
                            </div>
                        )}

                        <button onClick={ho} className={`${cinzel.className} cv-card pulse-border px-12 py-5 text-[9px] tracking-[.4em] uppercase text-white/70 hover:bg-white/10 transition-all duration-700`}>
                            <span className="flex items-center gap-3">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                Buka Undangan
                            </span>
                        </button>

                        <div className="flex items-center gap-6 mt-10">
                            <div className="w-16 h-px bg-white/20" />
                            <div className="w-2 h-2 rounded-full bg-white/15" />
                            <div className="w-16 h-px bg-white/20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════ MAIN SPLIT LAYOUT ═══════ */}
            <div className={`transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col lg:flex-row min-h-screen">

                    {/* ───── LEFT PANEL: Always Cover Photo Slideshow ───── */}
                    <div className="sl-cv w-full lg:w-[70%] bg-[#0a0a0f] relative flex flex-col justify-between film-grain">
                        {/* Cover Photo Slideshow — always visible */}
                        {coverPhotos.length > 0 ? (
                            <>
                                <div className="absolute inset-0 z-[1]">
                                    {coverPhotos.map((photo, i) => (
                                        <img
                                            key={i}
                                            src={photo}
                                            alt={`Cover ${i + 1}`}
                                            className={`slide-img w-full h-full object-cover ${i === slideIdx ? 'active' : ''}`}
                                        />
                                    ))}
                                </div>
                                <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-[#0a0a0f]/20" />
                            </>
                        ) : (
                            <div className="vid-overlay" />
                        )}

                        {/* Text content on top */}
                        <div className="relative z-10 flex-1 flex flex-col justify-end p-8 md:p-12 lg:p-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-px bg-white/20" />
                                <p className={`${cinzel.className} text-[8px] tracking-[.5em] uppercase text-white/30`}>Our Wedding</p>
                            </div>

                            <h1 className={`${greatVibes.className} text-6xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-4 drop-shadow-lg`}>
                                {invitation?.groom_name?.split(' ')[0]}
                            </h1>
                            <p className={`${greatVibes.className} text-4xl text-white/20 mb-4`}>&</p>
                            <h1 className={`${greatVibes.className} text-6xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-8 drop-shadow-lg`}>
                                {invitation?.bride_name?.split(' ')[0]}
                            </h1>

                            {invitation?.description && (
                                <p className="text-xs text-white/30 leading-relaxed max-w-lg mb-6 italic font-light drop-shadow">"{invitation.description}"</p>
                            )}

                            {guestName && (
                                <div className="mb-6">
                                    <p className="text-[8px] text-white/15 tracking-[.3em] uppercase mb-1 font-medium">Dear</p>
                                    <p className={`${greatVibes.className} text-3xl text-white/60 drop-shadow`}>{guestName}</p>
                                </div>
                            )}

                            {/* Slideshow dots + counter */}
                            {coverPhotos.length > 1 && (
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="slide-dots">
                                        {coverPhotos.map((_, i) => (
                                            <button key={i} className={`slide-dot ${i === slideIdx ? 'active' : ''}`} onClick={() => setSlideIdx(i)} />
                                        ))}
                                    </div>
                                    <span className={`${cinzel.className} text-[8px] text-white/20 slide-counter`}>{slideIdx + 1} / {coverPhotos.length}</span>
                                </div>
                            )}
                        </div>

                        {/* Music button */}
                        {invitation?.music_url && (
                            <MusicPlayer audioController={audioController} btnBg="bg-[#0a0a0f]/80" btnColor="text-white/60" btnBorder="border-white/10 shadow-2xl backdrop-blur-xl" />
                        )}
                    </div>

                    {/* ───── RIGHT PANEL: Video/Slideshow BG + Scrollable Content ───── */}
                    <div ref={rightPanelRef} className="w-full lg:w-[30%] lg:h-screen lg:overflow-y-auto sh relative">
                        {/* Fixed/sticky background: Video or Slideshow */}
                        <div className="rp-bg">
                            {videoSrc ? (
                                <>
                                    {videoSrc.type === 'youtube' ? (
                                        <iframe src={videoSrc.src} allow="autoplay; encrypted-media" allowFullScreen className="pointer-events-none" />
                                    ) : (
                                        <video muted loop playsInline autoPlay>
                                            <source src={videoSrc.src} type="video/mp4" />
                                        </video>
                                    )}
                                </>
                            ) : coverPhotos.length > 0 ? (
                                <>
                                    {coverPhotos.map((photo, i) => (
                                        <img key={i} src={photo} alt={`BG ${i + 1}`} className={`rp-bg-slide ${i === slideIdx ? 'active' : ''}`} />
                                    ))}
                                </>
                            ) : null}
                            <div className="absolute inset-0 bg-[#0a0a0f]/60" style={{zIndex:5}} />
                        </div>
                        {/* Scrollable content layer */}
                        <div className="rp-content">

                        {/* Countdown */}
                        <section className="py-20 px-8 text-center cv-rv">
                            <p className={`${cinzel.className} text-[8px] tracking-[.5em] uppercase text-white/25 mb-4`}>Save The Date</p>
                            <h2 className={`${greatVibes.className} text-4xl text-white mb-2`}>
                                {invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}
                            </h2>
                            <p className="text-[9px] text-white/15 tracking-[.3em] uppercase mb-10 font-light">
                                {ed.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
                                {[{ v: cd.d, l: 'Hari' }, { v: cd.h, l: 'Jam' }, { v: cd.m, l: 'Menit' }, { v: cd.s, l: 'Detik' }].map((it, i) => (
                                    <div key={i} className="cv-card rounded-2xl py-4 px-2">
                                        <p className={`${cinzel.className} text-2xl text-white`}>{it.v}</p>
                                        <p className="text-[8px] uppercase tracking-widest text-white/15 mt-1 font-medium">{it.l}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Quote */}
                        <section className="px-8 pb-20 cv-rv">
                            <div className="cv-card-solid rounded-3xl p-8 text-center">
                                <div className="w-10 h-10 rounded-full border border-white/8 mx-auto mb-6 flex items-center justify-center">
                                    <span className="text-white/20 text-lg">❝</span>
                                </div>
                                <p className={`${montserrat.className} text-sm leading-relaxed text-white/40 italic mb-4 font-light`}>
                                    {invitation?.opening_text || '"Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu."'}
                                </p>
                                <p className={`${cinzel.className} text-[9px] text-white/15 tracking-[.2em]`}>QS. Ar-Rum Ayat 21</p>
                            </div>
                        </section>

                        {/* Bride & Groom — Cinematic horizontal cards */}
                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 cv-rv">
                                <h2 className={`${cinzel.className} text-xl tracking-[.15em] text-white`}>Bride & Groom</h2>
                                <p className="text-[9px] text-white/10 tracking-[.3em] uppercase mt-2">Assalamualaikum Wr. Wb.</p>
                                <p className="text-[9px] text-white/20 mt-3 max-w-md mx-auto leading-relaxed font-light">Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:</p>
                            </div>

                            {/* Bride */}
                            <div className="cv-card-solid rounded-3xl p-6 mb-6 cv-rv" data-delay="1">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    {brP && (
                                        <div className="w-36 h-44 flex-none arch-cv border border-white/8">
                                            <img src={brP} alt="Bride" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="text-center flex-1">
                                        <p className={`${greatVibes.className} text-3xl text-white/60 mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p>
                                        <h3 className={`${cinzel.className} text-lg tracking-[.05em] text-white mb-3`}>{invitation?.bride_full_name || invitation?.bride_name}</h3>
                                        <div className="w-10 h-px bg-white/10 mb-3 mx-auto" />
                                        <p className="text-xs text-white/20 font-light">Putri dari</p>
                                        <p className="text-xs text-white/35 font-medium">{invitation?.bride_father || 'Bapak'} & {invitation?.bride_mother || 'Ibu'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center my-4 cv-rv"><span className={`${greatVibes.className} text-5xl text-white/10`}>&</span></div>

                            {/* Groom */}
                            <div className="cv-card-solid rounded-3xl p-6 cv-rv" data-delay="2">
                                <div className="flex flex-col md:flex-row-reverse items-center gap-6">
                                    {grP && (
                                        <div className="w-36 h-44 flex-none arch-cv border border-white/8">
                                            <img src={grP} alt="Groom" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="text-center flex-1">
                                        <p className={`${greatVibes.className} text-3xl text-white/60 mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p>
                                        <h3 className={`${cinzel.className} text-lg tracking-[.05em] text-white mb-3`}>{invitation?.groom_full_name || invitation?.groom_name}</h3>
                                        <div className="w-10 h-px bg-white/10 mb-3 mx-auto" />
                                        <p className="text-xs text-white/20 font-light">Putra dari</p>
                                        <p className="text-xs text-white/35 font-medium">{invitation?.groom_father || 'Bapak'} & {invitation?.groom_mother || 'Ibu'}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Events */}
                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 cv-rv">
                                <h2 className={`${cinzel.className} text-xl tracking-[.15em] text-white`}>Wedding</h2>
                                <p className={`${greatVibes.className} text-4xl text-white/30 -mt-1`}>Event</p>
                            </div>
                            {invitation?.events && invitation.events.length > 0 ? (
                                [...invitation.events].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((ev, idx) => (
                                    <div key={idx} className="cv-card-solid rounded-3xl p-8 mb-6 text-center cv-rv" data-delay={`${idx + 1}`}>
                                        <h3 className={`${cinzel.className} text-lg tracking-[.1em] text-white mb-4`}>{ev.name}</h3>
                                        <p className="text-sm text-white/30 font-light mb-1">{ev.date ? new Date(ev.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
                                        <p className="text-sm text-white/30 font-light mb-3">Pukul : {ev.time_start?.substring(0, 5) || 'TBA'} {ev.time_end ? `- ${ev.time_end.substring(0, 5)}` : '- Selesai'} WIB</p>
                                        {ev.location && <p className="text-sm text-white/40 pt-3 border-t border-white/5">{ev.location}</p>}
                                        {(ev.latitude && ev.longitude) && (
                                            <a href={`https://maps.google.com/?q=${ev.latitude},${ev.longitude}`} target="_blank" rel="noreferrer" className={`${cinzel.className} inline-flex items-center gap-2 cv-card px-6 py-3 text-[9px] tracking-[.15em] text-white/50 hover:bg-white/10 transition-all duration-500 mt-4 rounded-lg`}>
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                                                Lihat Lokasi
                                            </a>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="cv-card-solid rounded-3xl p-10 text-center">
                                    <h3 className={`${cinzel.className} text-lg tracking-[.1em] text-white mb-2`}>Acara Pernikahan</h3>
                                    <p className="text-sm text-white/20 font-light">{ed.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            )}
                        </section>

                        {/* Love Story */}
                        {invitation?.love_stories && invitation.love_stories.length > 0 && (
                            <section className="px-8 pb-20">
                                <div className="text-center mb-12 cv-rv">
                                    <h2 className={`${cinzel.className} text-xl tracking-[.15em] text-white`}>Our</h2>
                                    <p className={`${greatVibes.className} text-4xl text-white/30 -mt-1`}>Love Story</p>
                                </div>
                                {[...invitation.love_stories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((s, i) => (
                                    <div key={s.id || i} className="cv-card-solid rounded-3xl p-8 text-center mb-6 cv-rv" data-delay={`${i + 1}`}>
                                        <h3 className={`${cinzel.className} text-lg tracking-[.1em] text-white mb-4`}>{s.title}</h3>
                                        <p className="text-sm text-white/35 leading-relaxed font-light">{s.description}</p>
                                        {s.photo && <div className="mt-6 rounded-xl overflow-hidden"><img src={gp(s.photo)} alt={s.title} className="w-full h-44 object-cover" /></div>}
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Gallery */}
                        <Gallery 
                            layout="masonry"
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={cinzel.className}
                            titleSize="text-xl tracking-[.15em]"
                            accentText="text-white"
                            subtitleText="text-white/30"
                            borderColor="border-white/10"
                        />

                        {/* QR Checkin */}
                        <div className="px-8">
                            <QrCheckin guest={guest} sectionBg="bg-transparent" titleFont={cinzel.className} textColor="text-white" borderStyle="border-white/8" />
                        </div>

                        {/* Wishes */}
                        <section className="px-8 pb-20 cv-rv">
                            <div className="text-center mb-12">
                                <h2 className={`${cinzel.className} text-xl tracking-[.15em] text-white`}>Wedding</h2>
                                <p className={`${greatVibes.className} text-4xl text-white/30 -mt-1`}>Wishes</p>
                            </div>
                            <div className="cv-card-solid rounded-3xl p-8">
                                <form onSubmit={sw} className="space-y-4">
                                    <div>
                                        <label className={`${cinzel.className} block text-[8px] tracking-[.15em] text-white/20 mb-2`}>Nama</label>
                                        <input type="text" value={ni} onChange={e => setNi(e.target.value)} className="w-full bg-white/5 border border-white/8 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-white/20 transition-colors placeholder-white/15" placeholder="Nama Anda..." />
                                    </div>
                                    <div>
                                        <label className={`${cinzel.className} block text-[8px] tracking-[.15em] text-white/20 mb-2`}>Ucapan</label>
                                        <textarea value={mi} onChange={e => setMi(e.target.value)} className="w-full bg-white/5 border border-white/8 rounded-xl px-5 py-3.5 text-sm text-white h-28 resize-none focus:outline-none focus:border-white/20 transition-colors placeholder-white/15" placeholder="Tulis ucapan..." />
                                    </div>
                                    <button type="submit" disabled={sub} className={`${cinzel.className} w-full bg-white text-[#0a0a0f] py-4 rounded-xl text-[9px] tracking-[.2em] uppercase hover:bg-white/90 transition-colors disabled:opacity-50 font-medium`}>{sub ? 'Mengirim...' : 'Kirim Ucapan'}</button>
                                </form>
                                {ws.length > 0 && (
                                    <div className="mt-8 space-y-3 max-h-[300px] overflow-y-auto sh">
                                        {ws.map((m, i) => (
                                            <div key={i} className="bg-white/3 rounded-2xl p-4 border border-white/5">
                                                <p className="text-sm text-white/50 font-light">{m.message}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                                        <span className="text-white text-[9px] font-bold">{m.name?.charAt(0)?.toUpperCase()}</span>
                                                    </div>
                                                    <p className="text-xs text-white/25">{m.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Gift */}
                        {invitation?.gift_accounts && invitation.gift_accounts.length > 0 && (
                            <section className="px-8 pb-20 cv-rv">
                                <div className="text-center mb-12">
                                    <h2 className={`${cinzel.className} text-xl tracking-[.15em] text-white`}>Wedding</h2>
                                    <p className={`${greatVibes.className} text-4xl text-white/30 -mt-1`}>Gift</p>
                                </div>
                                <div className="space-y-4">
                                    {invitation.gift_accounts.map((a, i) => (
                                        <div key={a.id || i} className="cv-card rounded-2xl p-6 text-center cv-rv" data-delay={`${i + 1}`}>
                                            <p className={`${cinzel.className} text-sm tracking-[.15em] text-white/40 mb-1`}>{a.bank_name}</p>
                                            <p className="text-[9px] text-white/12 uppercase tracking-widest mb-3 font-light">A.N. {a.account_holder}</p>
                                            <p className={`${cinzel.className} text-xl text-white mb-4`}>{a.account_number}</p>
                                            <button onClick={() => { navigator.clipboard.writeText(a.account_number); toast.success('Nomor rekening disalin!'); }}
                                                className={`${cinzel.className} w-full border border-white/8 py-3 text-[9px] tracking-[.15em] text-white/40 hover:bg-white hover:text-[#0a0a0f] transition-all duration-500 rounded-xl`}>
                                                Copy Number
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Footer */}
                        <footer className="py-20 px-8 text-center border-t border-white/5 cv-rv">
                            <p className={`${cinzel.className} text-[8px] tracking-[.4em] text-white/15 mb-8`}>Thank You</p>
                            <div className="w-24 h-24 rounded-full border border-white/8 mx-auto mb-8 flex items-center justify-center">
                                <span className={`${greatVibes.className} text-4xl text-white/20`}>{invitation?.groom_name?.charAt(0)}{invitation?.bride_name?.charAt(0)}</span>
                            </div>
                            <h3 className={`${cinzel.className} text-lg tracking-[.1em] text-white mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h3>
                            <p className="text-[9px] text-white/8 tracking-[.3em] uppercase font-light">{ed.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                            <div className="flex items-center justify-center gap-3 mt-10 text-white/8">
                                <div className="h-px w-12 bg-current" />
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                <div className="h-px w-12 bg-current" />
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/3">
                                <p className={`${cinzel.className} text-[9px] text-white/15 tracking-[.3em]`}>Beringinesia</p>
                                <p className="text-[7px] text-white/6 tracking-[.2em] uppercase mt-1 font-light">Digital Invitation</p>
                            </div>
                        </footer>
                        </div>{/* end scrollable content layer */}
                    </div>
                </div>
            </div>
        </div>
    );
}
