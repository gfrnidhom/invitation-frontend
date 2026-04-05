'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Oswald, Playfair_Display, Source_Sans_3 } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import VideoEmbed from './partials/VideoEmbed';
import Gallery from './partials/Gallery';
const oswald = Oswald({ subsets: ['latin'], weight: ['200','300','400','500','600','700'] });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400','500','600','700','800','900'], style: ['normal','italic'] });
const sourceSans = Source_Sans_3({ subsets: ['latin'], weight: ['200','300','400','500','600','700','800'] });
const SU = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const AU = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export default function MonoChromeII({ payload }) {
    const { invitation, guest, guestName } = payload;
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const rpRef = useRef(null);
    const [ni, setNi] = useState(guestName || '');
    const [mi, setMi] = useState('');
    const [ws, setWs] = useState(invitation?.guestMessages || []);
    const [sub, setSub] = useState(false);
    const ed = invitation?.event_date ? new Date(invitation.event_date) : new Date();
    const [cd, setCd] = useState({ d:0, h:0, m:0, s:0 });

    useEffect(() => { const t = setInterval(() => { const diff = ed - new Date(); if(diff>0) setCd({ d:Math.floor(diff/(864e5)), h:Math.floor((diff/36e5)%24), m:Math.floor((diff/6e4)%60), s:Math.floor((diff/1e3)%60) }); }, 1000); return () => clearInterval(t); }, []);
    useEffect(() => { const h = () => { document.querySelectorAll('.m2-rv').forEach(el => { if(el.getBoundingClientRect().top < window.innerHeight-50) el.classList.add('active'); }); }; const p=rpRef.current; if(p) p.addEventListener('scroll',h); window.addEventListener('scroll',h); h(); return()=>{ if(p) p.removeEventListener('scroll',h); window.removeEventListener('scroll',h); }; }, [isOpen]);

    const gp = (p) => { if(!p) return null; let ph=p; if(typeof ph==='string'&&ph.startsWith('[')){ try{const x=JSON.parse(ph);if(Array.isArray(x)&&x.length>0)ph=x[0];}catch{} } if(Array.isArray(ph))ph=ph[0]; if(typeof ph==='object'&&ph!==null){if(ph.photo)ph=ph.photo;else if(ph.url)ph=ph.url;else return null;} if(typeof ph!=='string')return null; ph=ph.replace(/\\/g,'/'); if(!ph.startsWith('http')&&!ph.startsWith('/'))ph=`${SU}/${ph}`; return ph; };
    const ho = () => { setIsOpen(true); if(audioRef.current) audioRef.current.play().then(()=>setIsPlaying(true)).catch(()=>{}); };
    const ta = () => { if(!audioRef.current)return; if(isPlaying){audioRef.current.pause();setIsPlaying(false);}else{audioRef.current.play();setIsPlaying(true);} };
    const sw = async(e) => { e.preventDefault(); if(!ni.trim()||!mi.trim())return; setSub(true); try{ await fetch(`${AU}/invitations/${invitation.id}/guestbook`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:ni,message:mi})}); setWs([{name:ni,message:mi,created_at:new Date().toISOString()},...ws]); setMi(''); toast.success('Ucapan terkirim!'); }catch{toast.error('Gagal mengirim ucapan');}finally{setSub(false);} };

    const cp = (()=>{ const c=invitation?.cover_photo; if(!c)return null; return gp(Array.isArray(c)?c[0]:c); })();
    const grP = gp(invitation?.groom_photo); const brP = gp(invitation?.bride_photo);
    const phs = invitation?.gallery?.length>0 ? invitation.gallery.map(g=>g.photo) : (invitation?.photos||[]);

    // Warm sepia monochrome: #2c2420 bg, #d4c5b3 accent, warm grays
    return (
        <div className={`min-h-screen bg-[#2c2420] text-[#e8ddd0] ${sourceSans.className} overflow-hidden`}>
            <style dangerouslySetInnerHTML={{__html:`
                .m2-rv{opacity:0;transform:translateY(30px);transition:all .8s cubic-bezier(.16,1,.3,1)}.m2-rv.active{opacity:1;transform:translateY(0)}.m2-rv[data-delay="1"]{transition-delay:.15s}.m2-rv[data-delay="2"]{transition-delay:.3s}
                .m2c{background:rgba(212,197,179,.06);border:1px solid rgba(212,197,179,.12)}.m2cw{background:#f5f0ea;color:#2c2420;border:1px solid rgba(44,36,32,.08)}
                .sep{color:#d4c5b3}
                .sl2{position:sticky;top:0;height:100vh}@media(max-width:1023px){.sl2{position:relative;height:auto;min-height:100vh}}
                .co2{position:fixed;inset:0;z-index:9999;transition:transform 1s cubic-bezier(.16,1,.3,1)}.co2.open{transform:translateY(-100%)}
                .ms2{animation:ms2a 4s linear infinite}@keyframes ms2a{from{transform:rotate(0)}to{transform:rotate(360deg)}}
                .sh::-webkit-scrollbar{display:none}.sh{-ms-overflow-style:none;scrollbar-width:none}
                .hex-frame{clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);overflow:hidden}
            `}}/>
            {invitation?.music_url&&<audio ref={audioRef} src={invitation.music_url.startsWith('http')?invitation.music_url:`${SU}/${invitation.music_url}`} loop/>}

            {/* COVER */}
            <div className={`co2 ${isOpen?'open':''}`}>
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#1f1915]">
                    {cp&&<img src={cp} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-25 sepia"/>}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1f1915]/40 via-[#1f1915]/65 to-[#1f1915]/95"/>
                    <div className="relative z-10 text-center px-6 flex flex-col items-center">
                        <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#d4c5b3]/40 to-transparent mb-8"/>
                        <p className={`${oswald.className} text-xs tracking-[.6em] uppercase text-[#d4c5b3]/50 mb-6`}>The Wedding Of</p>
                        <h1 className={`${playfair.className} italic text-5xl md:text-7xl lg:text-8xl text-[#e8ddd0] mb-2 font-medium`}>{invitation?.groom_name?.split(' ')[0]}</h1>
                        <p className={`${playfair.className} italic text-4xl text-[#d4c5b3]/40 my-1`}>&</p>
                        <h1 className={`${playfair.className} italic text-5xl md:text-7xl lg:text-8xl text-[#e8ddd0] mb-6 font-medium`}>{invitation?.bride_name?.split(' ')[0]}</h1>
                        <p className="text-[10px] text-[#d4c5b3]/30 tracking-[.4em] uppercase mb-10">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                        {guestName&&<div className="mb-8"><p className="text-[9px] text-[#e8ddd0]/20 uppercase tracking-[.3em] mb-1">Kepada Yth.</p><p className={`${playfair.className} italic text-2xl sep`}>{guestName}</p></div>}
                        <button onClick={ho} className={`${oswald.className} border border-[#d4c5b3]/30 px-10 py-4 text-[10px] tracking-[.4em] uppercase text-[#d4c5b3]/70 hover:bg-[#d4c5b3] hover:text-[#2c2420] transition-all duration-500`}>Buka Undangan</button>
                        <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#d4c5b3]/40 to-transparent mt-8"/>
                    </div>
                </div>
            </div>

            {/* MAIN */}
            <div className={`transition-opacity duration-1000 ${isOpen?'opacity-100':'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col lg:flex-row min-h-screen">
                    {/* LEFT */}
                    <div className="sl2 w-full lg:w-[55%] bg-[#2c2420] relative flex flex-col justify-end p-8 md:p-12 lg:p-16">
                        {cp&&<img src={cp} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-40 sepia"/>}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2c2420] via-[#2c2420]/50 to-transparent"/>
                        <div className="relative z-10">
                            <p className={`${oswald.className} text-[10px] tracking-[.5em] uppercase text-[#d4c5b3]/40 mb-6`}>Our Wedding</p>
                            <h1 className={`${playfair.className} italic text-6xl md:text-7xl lg:text-8xl text-[#e8ddd0] leading-[1.1] mb-3 font-medium`}>{invitation?.groom_name?.split(' ')[0]}</h1>
                            <p className={`${playfair.className} italic text-3xl text-[#d4c5b3]/30 mb-3`}>&</p>
                            <h1 className={`${playfair.className} italic text-6xl md:text-7xl lg:text-8xl text-[#e8ddd0] leading-[1.1] mb-8 font-medium`}>{invitation?.bride_name?.split(' ')[0]}</h1>
                            {invitation?.description&&<p className="text-sm text-[#e8ddd0]/30 leading-relaxed max-w-lg mb-10 italic font-light">"{invitation.description}"</p>}
                            {guestName&&<div className="mb-6"><p className="text-[9px] text-[#e8ddd0]/15 tracking-[.3em] uppercase mb-1">Dear</p><p className={`${playfair.className} italic text-2xl sep`}>{guestName}</p></div>}
                        </div>
                        {invitation?.music_url&&<button onClick={ta} className="absolute bottom-8 right-8 lg:bottom-1/2 lg:-right-6 lg:translate-y-1/2 z-50 w-12 h-12 rounded-full bg-[#2c2420] border border-[#d4c5b3]/15 flex items-center justify-center hover:border-[#d4c5b3]/40 transition-all shadow-2xl">{isPlaying?<svg className="w-5 h-5 ms2 sep" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/></svg>:<svg className="w-5 h-5 sep" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}</button>}
                    </div>

                    {/* RIGHT */}
                    <div ref={rpRef} className="w-full lg:w-[45%] lg:h-screen lg:overflow-y-auto sh bg-[#2c2420]">
                        {/* Countdown */}
                        <section className="py-20 px-8 md:px-12 text-center m2-rv">
                            <p className={`${oswald.className} text-[10px] tracking-[.5em] uppercase text-[#d4c5b3]/35 mb-4`}>Save The Date</p>
                            <h2 className={`${playfair.className} italic text-3xl md:text-4xl font-medium text-[#e8ddd0] mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h2>
                            <p className="text-[10px] text-[#e8ddd0]/20 tracking-[.3em] uppercase mb-10">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">{[{v:cd.d,l:'Hari'},{v:cd.h,l:'Jam'},{v:cd.m,l:'Menit'},{v:cd.s,l:'Detik'}].map((it,i)=>(<div key={i} className="m2c rounded-2xl py-4 px-2"><p className={`${playfair.className} italic text-2xl md:text-3xl sep`}>{it.v}</p><p className="text-[9px] uppercase tracking-widest text-[#e8ddd0]/15 mt-1">{it.l}</p></div>))}</div>
                        </section>

                        {/* Quote */}
                        <section className="px-8 md:px-12 pb-20 m2-rv">
                            <div className="m2cw rounded-3xl p-8 md:p-10 text-center">
                                <p className={`${playfair.className} italic text-sm leading-relaxed text-[#2c2420]/55 mb-4`}>{invitation?.opening_text||'"Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu."'}</p>
                                <p className={`${oswald.className} text-[10px] text-[#d4c5b3] tracking-[.3em] uppercase`}>QS. Ar-Rum Ayat 21</p>
                            </div>
                        </section>

                        {/* Bride & Groom — Hexagonal frame with vertical stack */}
                        <section className="px-8 md:px-12 pb-20">
                            <div className="text-center mb-12 m2-rv"><h2 className={`${oswald.className} text-2xl md:text-3xl tracking-[.2em] uppercase text-[#e8ddd0]`}>Bride & Groom</h2><p className="text-[10px] text-[#e8ddd0]/15 tracking-[.3em] uppercase mt-2">Assalamualaikum Wr. Wb.</p><p className="text-[10px] text-[#e8ddd0]/25 mt-3 max-w-md mx-auto leading-relaxed font-light">Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:</p></div>
                            {/* Bride */}
                            <div className="text-center mb-6 m2-rv" data-delay="1">
                                {brP&&<div className="hex-frame w-44 h-52 md:w-52 md:h-60 mx-auto mb-6 bg-[#d4c5b3]/10"><img src={brP} alt="Bride" className="w-full h-full object-cover sepia hover:sepia-0 transition-all duration-700"/></div>}
                                <p className={`${playfair.className} italic text-3xl sep mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p>
                                <h3 className={`${oswald.className} text-xl md:text-2xl tracking-[.1em] uppercase text-[#e8ddd0] mb-3`}>{invitation?.bride_full_name||invitation?.bride_name}</h3>
                                <p className="text-sm text-[#e8ddd0]/30 font-light">Putri dari</p>
                                <p className="text-sm text-[#e8ddd0]/50">{invitation?.bride_father||'Bapak'} & {invitation?.bride_mother||'Ibu'}</p>
                            </div>
                            <div className="text-center my-5 m2-rv"><div className="w-px h-10 bg-[#d4c5b3]/15 mx-auto"/><span className={`${playfair.className} italic text-4xl text-[#d4c5b3]/20 my-2 block`}>&</span><div className="w-px h-10 bg-[#d4c5b3]/15 mx-auto"/></div>
                            {/* Groom */}
                            <div className="text-center m2-rv" data-delay="2">
                                {grP&&<div className="hex-frame w-44 h-52 md:w-52 md:h-60 mx-auto mb-6 bg-[#d4c5b3]/10"><img src={grP} alt="Groom" className="w-full h-full object-cover sepia hover:sepia-0 transition-all duration-700"/></div>}
                                <p className={`${playfair.className} italic text-3xl sep mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p>
                                <h3 className={`${oswald.className} text-xl md:text-2xl tracking-[.1em] uppercase text-[#e8ddd0] mb-3`}>{invitation?.groom_full_name||invitation?.groom_name}</h3>
                                <p className="text-sm text-[#e8ddd0]/30 font-light">Putra dari</p>
                                <p className="text-sm text-[#e8ddd0]/50">{invitation?.groom_father||'Bapak'} & {invitation?.groom_mother||'Ibu'}</p>
                            </div>
                        </section>

                        {/* Events */}
                        <section className="px-8 md:px-12 pb-20">
                            <div className="text-center mb-12 m2-rv"><h2 className={`${oswald.className} text-2xl md:text-3xl tracking-[.2em] uppercase text-[#e8ddd0]`}>Wedding</h2><p className={`${playfair.className} italic text-4xl sep -mt-1`}>Event</p></div>
                            {invitation?.events&&invitation.events.length>0?[...invitation.events].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((ev,idx)=>(
                                <div key={idx} className="m2cw rounded-3xl p-8 mb-6 text-center m2-rv" data-delay={`${idx+1}`}>
                                    <h3 className={`${oswald.className} text-xl tracking-[.15em] uppercase text-[#2c2420] mb-4`}>{ev.name}</h3>
                                    <p className="text-sm text-[#2c2420]/45 font-light mb-1">{ev.date?new Date(ev.date).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):''}</p>
                                    <p className="text-sm text-[#2c2420]/45 font-light mb-3">Pukul : {ev.time_start?.substring(0,5)||'TBA'} {ev.time_end?`- ${ev.time_end.substring(0,5)}`:'- Selesai'} WIB</p>
                                    {ev.location&&<p className="text-sm text-[#2c2420]/60 pt-3 border-t border-[#2c2420]/8">{ev.location}</p>}
                                    {(ev.latitude&&ev.longitude)&&<a href={`https://maps.google.com/?q=${ev.latitude},${ev.longitude}`} target="_blank" rel="noreferrer" className={`${oswald.className} inline-flex items-center gap-2 border border-[#2c2420]/15 px-6 py-3 text-[10px] tracking-[.2em] uppercase text-[#2c2420]/50 hover:bg-[#2c2420] hover:text-[#f5f0ea] transition-all duration-500 mt-4`}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>Lihat Lokasi</a>}
                                </div>
                            )):<div className="m2cw rounded-3xl p-10 text-center"><h3 className={`${oswald.className} text-xl tracking-[.15em] uppercase text-[#2c2420] mb-2`}>Acara Pernikahan</h3></div>}
                        </section>

                        {/* Love Story */}
                        {invitation?.love_stories&&invitation.love_stories.length>0&&<section className="px-8 md:px-12 pb-20"><div className="text-center mb-12 m2-rv"><h2 className={`${oswald.className} text-2xl md:text-3xl tracking-[.2em] uppercase text-[#e8ddd0]`}>Our</h2><p className={`${playfair.className} italic text-4xl sep -mt-1`}>Love Story</p></div>{[...invitation.love_stories].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((s,i)=>(<div key={s.id||i} className="m2cw rounded-3xl p-8 text-center mb-6 m2-rv" data-delay={`${i+1}`}><h3 className={`${oswald.className} text-lg tracking-[.1em] uppercase text-[#2c2420] mb-4`}>{s.title}</h3><p className="text-sm text-[#2c2420]/55 leading-relaxed font-light">{s.description}</p>{s.photo&&<div className="mt-6 rounded-xl overflow-hidden"><img src={gp(s.photo)} alt={s.title} className="w-full h-44 object-cover sepia"/></div>}</div>))}</section>}

                        {/* Gallery */}
                        <Gallery 
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={oswald.className}
                            titleSize="text-2xl md:text-3xl tracking-[.2em] uppercase"
                            accentText="text-[#e8ddd0]"
                            subtitleText="sep"
                            borderColor="border-[#d4c5b3]/15"
                        />

                        {/* QR Checkin */}
                        <div className="px-8 md:px-12"><QrCheckin guest={guest} sectionBg="bg-transparent" titleFont={oswald.className} textColor="text-[#e8ddd0]" borderStyle="border-[#d4c5b3]/15"/></div>

                        {/* Wishes */}
                        <section className="px-8 md:px-12 pb-20 m2-rv">
                            <div className="text-center mb-12"><h2 className={`${oswald.className} text-2xl md:text-3xl tracking-[.2em] uppercase text-[#e8ddd0]`}>Wedding</h2><p className={`${playfair.className} italic text-4xl sep -mt-1`}>Wishes</p></div>
                            <div className="m2cw rounded-3xl p-8 md:p-10">
                                <form onSubmit={sw} className="space-y-4">
                                    <div><label className={`${oswald.className} block text-[9px] tracking-[.2em] uppercase text-[#2c2420]/30 mb-2`}>Nama</label><input type="text" value={ni} onChange={e=>setNi(e.target.value)} className="w-full bg-[#2c2420]/5 border border-[#2c2420]/10 rounded-xl px-5 py-3.5 text-sm text-[#2c2420] focus:outline-none focus:border-[#d4c5b3]/50 transition-colors" placeholder="Nama Anda..."/></div>
                                    <div><label className={`${oswald.className} block text-[9px] tracking-[.2em] uppercase text-[#2c2420]/30 mb-2`}>Ucapan</label><textarea value={mi} onChange={e=>setMi(e.target.value)} className="w-full bg-[#2c2420]/5 border border-[#2c2420]/10 rounded-xl px-5 py-3.5 text-sm text-[#2c2420] h-28 resize-none focus:outline-none focus:border-[#d4c5b3]/50 transition-colors" placeholder="Tulis ucapan..."/></div>
                                    <button type="submit" disabled={sub} className={`${oswald.className} w-full bg-[#2c2420] text-[#f5f0ea] py-4 rounded-xl text-[10px] tracking-[.3em] uppercase hover:bg-[#1f1915] transition-colors disabled:opacity-50`}>{sub?'Mengirim...':'Kirim Ucapan'}</button>
                                </form>
                                {ws.length>0&&<div className="mt-8 space-y-3 max-h-[300px] overflow-y-auto sh">{ws.map((m,i)=>(<div key={i} className="bg-[#2c2420]/5 rounded-2xl p-4 border border-[#2c2420]/6"><p className="text-sm text-[#2c2420]/60 font-light">{m.message}</p><div className="flex items-center gap-2 mt-2"><div className="w-6 h-6 rounded-full bg-[#2c2420] flex items-center justify-center"><span className="text-[#f5f0ea] text-[10px] font-bold">{m.name?.charAt(0)?.toUpperCase()}</span></div><p className="text-xs text-[#2c2420]/30">{m.name}</p></div></div>))}</div>}
                            </div>
                        </section>

                        {/* Gift */}
                        {invitation?.gift_accounts&&invitation.gift_accounts.length>0&&<section className="px-8 md:px-12 pb-20 m2-rv"><div className="text-center mb-12"><h2 className={`${oswald.className} text-2xl md:text-3xl tracking-[.2em] uppercase text-[#e8ddd0]`}>Wedding</h2><p className={`${playfair.className} italic text-4xl sep -mt-1`}>Gift</p></div><div className="space-y-4">{invitation.gift_accounts.map((a,i)=>(<div key={a.id||i} className="m2c rounded-2xl p-6 text-center m2-rv" data-delay={`${i+1}`}><p className={`${oswald.className} text-sm tracking-[.3em] uppercase sep mb-1`}>{a.bank_name}</p><p className="text-[10px] text-[#e8ddd0]/15 uppercase tracking-widest mb-3">A.N. {a.account_holder}</p><p className={`${playfair.className} italic text-xl text-[#e8ddd0] mb-4`}>{a.account_number}</p><button onClick={()=>{navigator.clipboard.writeText(a.account_number);toast.success('Nomor rekening disalin!');}} className={`${oswald.className} w-full border border-[#d4c5b3]/15 py-3 text-[10px] tracking-[.3em] uppercase text-[#d4c5b3]/50 hover:bg-[#d4c5b3] hover:text-[#2c2420] transition-all duration-500 rounded-xl`}>Copy Number</button></div>))}</div></section>}

                        {/* Footer */}
                        <footer className="py-20 px-8 md:px-12 text-center border-t border-[#d4c5b3]/5 m2-rv">
                            <p className={`${oswald.className} text-[9px] tracking-[.5em] uppercase text-[#d4c5b3]/30 mb-8`}>Thank You</p>
                            <div className="w-24 h-24 rounded-full border border-[#d4c5b3]/12 mx-auto mb-8 flex items-center justify-center"><span className={`${playfair.className} italic text-3xl sep`}>{invitation?.groom_name?.charAt(0)}{invitation?.bride_name?.charAt(0)}</span></div>
                            <h3 className={`${oswald.className} text-lg tracking-[.15em] uppercase text-[#e8ddd0] mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h3>
                            <p className="text-[10px] text-[#e8ddd0]/10 tracking-[.3em] uppercase">{ed.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
                            <div className="flex items-center justify-center gap-4 mt-10 text-[#d4c5b3]/10"><div className="h-px w-16 bg-current"/><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg><div className="h-px w-16 bg-current"/></div>
                            <div className="mt-12 pt-8 border-t border-[#d4c5b3]/3"><p className={`${oswald.className} text-[10px] sep tracking-[.4em] uppercase`}>Beringinesia</p><p className="text-[8px] text-[#e8ddd0]/8 tracking-[.2em] uppercase mt-1">Digital Invitation</p></div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
