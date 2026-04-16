'use client';
import GiftAtmCard from './partials/GiftAtmCard';
import React, { useEffect, useRef, useState } from 'react';
import { Cormorant_Infant, Raleway } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import VideoEmbed from './partials/VideoEmbed';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';
const ci = Cormorant_Infant({ subsets: ['latin'], weight: ['300','400','500','600','700'] });
const rl = Raleway({ subsets: ['latin'], weight: ['200','300','400','500','600','700'] });
const SU = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const AU = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
export default function FrostedElegance({ payload, audioController }) {
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
    const rpRef = useRef(null);
    const [ni, setNi] = useState(guestName || '');
    const [mi, setMi] = useState('');
    const [ws, setWs] = useState(invitation?.guestMessages || []);
    const [sub, setSub] = useState(false);
    const ed = (() => {
        if (!invitation?.event_date) return new Date();
        let baseDate = new Date(invitation.event_date.replace(' ', 'T'));
        if (isNaN(baseDate)) {
            baseDate = new Date(invitation.event_date.split('T')[0].split(' ')[0] + 'T00:00:00');
        }
        const _y = baseDate.getFullYear();
        const _m = String(baseDate.getMonth() + 1).padStart(2, '0');
        const _d = String(baseDate.getDate()).padStart(2, '0');
        const dateStr = `${_y}-${_m}-${_d}`;
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
    const [cd, setCd] = useState({ d:0, h:0, m:0, s:0 });
    useEffect(() => { const t = setInterval(() => { const diff = ed - new Date(); if(diff>0) setCd({ d:Math.floor(diff/(864e5)), h:Math.floor((diff/36e5)%24), m:Math.floor((diff/6e4)%60), s:Math.floor((diff/1e3)%60) }); }, 1000); return () => clearInterval(t); }, []);
    useEffect(() => { const h = () => { document.querySelectorAll('.fe-rv').forEach(el => { if(el.getBoundingClientRect().top < window.innerHeight-50) el.classList.add('active'); }); }; const p=rpRef.current; if(p) p.addEventListener('scroll',h); window.addEventListener('scroll',h); h(); return()=>{ if(p) p.removeEventListener('scroll',h); window.removeEventListener('scroll',h); }; }, [isOpen]);
    const gp = (p) => { if(!p) return null; let ph=p; if(typeof ph==='string'&&ph.startsWith('[')){ try{const x=JSON.parse(ph);if(Array.isArray(x)&&x.length>0)ph=x[0];}catch{} } if(Array.isArray(ph))ph=ph[0]; if(typeof ph==='object'&&ph!==null){if(ph.photo)ph=ph.photo;else if(ph.url)ph=ph.url;else return null;} if(typeof ph!=='string')return null; ph=ph.replace(/\\/g,'/'); if(!ph.startsWith('http')&&!ph.startsWith('/'))ph=`${SU}/${ph}`; return ph; };
    const ho = () => { setIsOpen(true); audioController?.play(); };

    const sw = async(e) => { e.preventDefault(); if(!ni.trim()||!mi.trim())return; setSub(true); try{ await fetch(`${AU}/invitations/${invitation.id}/guestbook`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:ni,message:mi})}); setWs([{name:ni,message:mi,created_at:new Date().toISOString()},...ws]); setMi(''); toast.success('Ucapan terkirim!'); }catch{toast.error('Gagal mengirim ucapan');}finally{setSub(false);} };
    const cp = (()=>{ const c=invitation?.cover_photo; if(!c)return null; return gp(Array.isArray(c)?c[0]:c); })();
    const grP = gp(invitation?.groom_photo); const brP = gp(invitation?.bride_photo);
    const phs = invitation?.gallery?.length>0 ? invitation.gallery.map(g=>g.photo) : (invitation?.photos||[]);
    return (
        <div className={`min-h-screen bg-[#1a1f2e] text-white ${rl.className} overflow-hidden`}>
            <style dangerouslySetInnerHTML={{__html:`
                .fe-rv{opacity:0;transform:translateY(30px);transition:all .8s cubic-bezier(.16,1,.3,1)}.fe-rv.active{opacity:1;transform:translateY(0)}.fe-rv[data-delay="1"]{transition-delay:.15s}.fe-rv[data-delay="2"]{transition-delay:.3s}
                .ig{position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(200,220,255,.15) 0%,rgba(200,220,255,.03) 50%,transparent 70%);pointer-events:none;z-index:1;animation:igA 6s ease-in-out infinite alternate}@keyframes igA{0%{opacity:.5}100%{opacity:1;transform:scale(1.05)}}
                .fc{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(20px)}.fcl{background:rgba(255,255,255,.92);backdrop-filter:blur(20px);border:1px solid rgba(200,220,255,.3);color:#1a1f2e}
                .ib{color:#a8d8ea}.sl-fe{position:sticky;top:0;height:100vh}@media(max-width:1023px){.sl-fe{position:relative;height:auto;min-height:100vh}}
                .co-fe{position:fixed;inset:0;z-index:9999;transition:transform 1s cubic-bezier(.16,1,.3,1)}.co-fe.open{transform:translateY(-100%)}
                .ms-fe{animation:msfe 4s linear infinite}@keyframes msfe{from{transform:rotate(0)}to{transform:rotate(360deg)}}
                .sh::-webkit-scrollbar{display:none}.sh{-ms-overflow-style:none;scrollbar-width:none}
                .df{width:160px;height:160px;transform:rotate(45deg);overflow:hidden;border:2px solid rgba(168,216,234,.3)}.df img{transform:rotate(-45deg) scale(1.42);width:100%;height:100%;object-fit:cover}@media(min-width:768px){.df{width:200px;height:200px}}
                .sp{position:absolute;width:2px;height:2px;background:white;border-radius:50%;animation:spA 3s ease-in-out infinite}@keyframes spA{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)}}
            `}}/>


            <div className={`co-fe ${isOpen?'open':''}`}>
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0f1420]">
                    {cp&&<img src={landingPhoto || cp} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-35"/>}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0f1420]/50 via-[#0f1420]/60 to-[#0f1420]/95"/>
                    <div className="ig" style={{top:'5%',left:'20%'}}/><div className="ig" style={{bottom:'10%',right:'15%'}}/>
                    {[...Array(6)].map((_,i)=><div key={i} className="sp" style={{top:`${15+Math.random()*70}%`,left:`${15+Math.random()*70}%`,animationDelay:`${i*.5}s`}}/>)}
                    <div className="relative z-10 text-center px-6 flex flex-col items-center">
                        <p className={`${ci.className} text-[11px] tracking-[.5em] uppercase ib mb-6 font-light`}>The Wedding Of</p>
                        <h1 className={`${ci.className} text-6xl md:text-8xl lg:text-9xl text-white font-light mb-4`} style={{letterSpacing:'.05em'}}>{invitation?.groom_name?.split(' ')[0]} <span className="ib">&</span> {invitation?.bride_name?.split(' ')[0]}</h1>
                        <p className="text-xs text-white/35 tracking-[.3em] uppercase mb-10">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                        {guestName&&<div className="mb-8"><p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Kepada Yth.</p><p className={`${ci.className} text-3xl ib font-light`}>{guestName}</p></div>}
                        <button onClick={ho} className={`${ci.className} fc px-10 py-4 text-[10px] tracking-[.3em] uppercase text-white/80 hover:bg-white/10 transition-all duration-500 font-medium`}>Buka Undangan</button>
                    </div>
                </div>
            </div>

            <div className={`transition-opacity duration-1000 ${isOpen?'opacity-100':'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col lg:flex-row min-h-screen">
                    <div className="sl-fe w-full lg:w-[70%] bg-[#1a1f2e] relative flex flex-col justify-end p-8 md:p-12 lg:p-16">
                        {cp&&<img src={cp} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-50"/>}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-[#1a1f2e]/50 to-transparent"/>
                        <div className="ig" style={{top:'5%',right:'10%'}}/>
                        {[...Array(4)].map((_,i)=><div key={i} className="sp" style={{top:`${25+Math.random()*50}%`,left:`${25+Math.random()*50}%`,animationDelay:`${i*.7}s`}}/>)}
                        <div className="relative z-10">
                            <p className={`${ci.className} text-[10px] tracking-[.4em] uppercase ib mb-6 font-light`}>Our Wedding</p>
                            <h1 className={`${ci.className} text-6xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-8 font-light`}>{invitation?.groom_name?.split(' ')[0]} <span className="ib opacity-60">&</span> {invitation?.bride_name?.split(' ')[0]}</h1>
                            {invitation?.quotes&&<p className="text-sm text-white/35 leading-relaxed max-w-lg mb-10 italic font-light">"{invitation.description}"</p>}
                            {guestName&&<div className="mb-6"><p className="text-[10px] text-white/20 tracking-widest uppercase mb-1">Dear</p><p className={`${ci.className} text-3xl ib font-light`}>{guestName}</p></div>}
                        </div>
                        {invitation?.music_url&&<MusicPlayer audioController={audioController} btnBg="bg-[#1a1f2e]" btnColor="ib" btnBorder="border-white/15 shadow-2xl" />}
                    </div>

                    <div ref={rpRef} className="w-full lg:w-[30%] lg:h-screen lg:overflow-y-auto sh bg-[#1a1f2e]">
                        <section className="py-20 px-8 text-center fe-rv">
                            <p className={`${ci.className} text-[10px] tracking-[.4em] uppercase ib mb-4 font-light`}>Save The Date</p>
                            <h2 className={`${ci.className} text-3xl font-light tracking-wider text-white mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h2>
                            <p className="text-xs text-white/25 mb-10">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">{[{v:cd.d,l:'Hari'},{v:cd.h,l:'Jam'},{v:cd.m,l:'Menit'},{v:cd.s,l:'Detik'}].map((it,i)=>(<div key={i} className="fc rounded-2xl py-4 px-2"><p className={`${ci.className} text-2xl font-light ib`}>{it.v}</p><p className="text-[9px] uppercase tracking-widest text-white/20 mt-1">{it.l}</p></div>))}</div>
                        </section>

                        <section className="px-8 pb-20 fe-rv">
                            <div className="fcl rounded-3xl p-8 text-center">
                                <p className="text-sm leading-relaxed text-[#1a1f2e]/55 italic mb-4 font-light">{invitation?.quotes||'"Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu."'}</p>
                                <p className="text-[10px] ib tracking-widest uppercase">{invitation?.quotes_name || 'QS. Ar-Rum Ayat 21'}</p>
                            </div>
                        </section>

                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 fe-rv"><h2 className={`${ci.className} text-2xl font-light tracking-[.15em] uppercase text-white`}>Bride & Groom</h2><p className="text-xs text-white/20 mt-2">Assalamualaikum Wr. Wb.</p><p className="text-xs text-white/30 mt-3 max-w-md mx-auto leading-relaxed font-light">Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:</p></div>
                            <div className="text-center mb-4 fe-rv" data-delay="1">{brP&&<div className="df mx-auto mb-6"><img src={brP} alt="Bride"/></div>}<p className={`${ci.className} text-3xl ib font-light mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p><h3 className={`${ci.className} text-xl font-medium tracking-wider text-white mb-3`}>{invitation?.bride_full_name||invitation?.bride_name}</h3><p className="text-sm text-white/35 font-light">Putri {invitation?.bride_child_order ? `${invitation.bride_child_order} ` : ""}dari</p><p className="text-sm text-white/50 font-medium">{invitation?.bride_father||'Bapak'} & {invitation?.bride_mother||'Ibu'}</p></div>
                            <div className="flex flex-col items-center my-6 fe-rv"><div className="w-px h-8 bg-gradient-to-b from-transparent via-[#a8d8ea]/30 to-transparent"/><span className={`${ci.className} text-5xl ib font-light my-2`}>&</span><div className="w-px h-8 bg-gradient-to-b from-transparent via-[#a8d8ea]/30 to-transparent"/></div>
                            <div className="text-center fe-rv" data-delay="2">{grP&&<div className="df mx-auto mb-6"><img src={grP} alt="Groom"/></div>}<p className={`${ci.className} text-3xl ib font-light mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p><h3 className={`${ci.className} text-xl font-medium tracking-wider text-white mb-3`}>{invitation?.groom_full_name||invitation?.groom_name}</h3><p className="text-sm text-white/35 font-light">Putra {invitation?.groom_child_order ? `${invitation.groom_child_order} ` : ""}dari</p><p className="text-sm text-white/50 font-medium">{invitation?.groom_father||'Bapak'} & {invitation?.groom_mother||'Ibu'}</p></div>
                        </section>

                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 fe-rv"><h2 className={`${ci.className} text-2xl font-light tracking-[.15em] uppercase text-white`}>Wedding</h2><p className={`${ci.className} text-4xl ib font-light -mt-1`}>Event</p></div>
                            {invitation?.events&&invitation.events.length>0?[...invitation.events].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((ev,idx)=>(
                                <div key={idx} className="fc rounded-3xl p-8 mb-6 text-center fe-rv" data-delay={`${idx+1}`}>
                                    <h3 className={`${ci.className} text-xl font-medium tracking-[.15em] uppercase ib mb-4`}>{ev.name}</h3>
                                    <p className="text-sm text-white/40 font-light mb-1">{ev.date?new Date(ev.date).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):''}</p>
                                    <p className="text-sm text-white/40 font-light mb-3">Pukul : {ev.time_start?.substring(0,5)||'TBA'} {ev.time_end?`- ${ev.time_end.substring(0,5)}`:'- Selesai'} WIB</p>
                                    {ev.location&&<p className="text-sm text-white/50 pt-3 border-t border-white/5">{ev.location}</p>}
                                    {(ev.latitude&&ev.longitude)&&<a href={`https://maps.google.com/?q=${ev.latitude},${ev.longitude}`} target="_blank" rel="noreferrer" className={`${ci.className} inline-flex items-center gap-2 fc px-6 py-3 text-[10px] tracking-[.2em] uppercase text-white/60 hover:bg-white/10 transition-all duration-500 mt-4 rounded-lg`}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>Lihat Lokasi</a>}
                                </div>
                            )):<div className="fc rounded-3xl p-10 text-center"><h3 className={`${ci.className} text-xl font-light tracking-wider ib mb-2`}>Acara Pernikahan</h3><p className="text-sm text-white/30 font-light">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div>}
                        </section>

                        {invitation?.love_stories&&invitation.love_stories.length>0&&<section className="px-8 pb-20"><div className="text-center mb-12 fe-rv"><h2 className={`${ci.className} text-2xl font-light tracking-[.15em] uppercase text-white`}>Our</h2><p className={`${ci.className} text-4xl ib font-light -mt-1`}>Love Story</p></div>{[...invitation.love_stories].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((s,i)=>(<div key={s.id||i} className="fcl rounded-3xl p-8 text-center mb-6 fe-rv" data-delay={`${i+1}`}><h3 className={`${ci.className} text-lg font-medium tracking-[.15em] uppercase mb-4`}>{s.title}</h3><p className="text-sm text-[#1a1f2e]/55 leading-relaxed font-light">{s.description}</p>{s.photo&&<div className="mt-6 rounded-xl overflow-hidden"><img src={gp(s.photo)} alt={s.title} className="w-full h-44 object-cover"/></div>}</div>))}</section>}

                        <Gallery 
                            layout="abstract"
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={ci.className}
                            titleSize="text-2xl font-light tracking-[.15em] uppercase"
                            accentText="text-white"
                            subtitleText="ib"
                            borderColor="border-white/10"
                        />

                        <div className="px-8"><QrCheckin guest={guest} sectionBg="bg-transparent" titleFont={ci.className} textColor="text-white" borderStyle="border-white/10"/></div>

                        <section className="px-8 pb-20 fe-rv">
                            <div className="text-center mb-12"><h2 className={`${ci.className} text-2xl font-light tracking-[.15em] uppercase text-white`}>Wedding</h2><p className={`${ci.className} text-4xl ib font-light -mt-1`}>Wishes</p></div>
                            <div className="fcl rounded-3xl p-8">
                                <form onSubmit={sw} className="space-y-4">
                                    <div><label className={`${ci.className} block text-[9px] tracking-[.2em] uppercase text-[#1a1f2e]/35 mb-2 font-medium`}>Nama</label><input type="text" value={ni} onChange={e=>setNi(e.target.value)} className="w-full bg-[#1a1f2e]/5 border border-[#1a1f2e]/10 rounded-xl px-5 py-3.5 text-sm text-[#1a1f2e] focus:outline-none focus:border-[#a8d8ea]/50 transition-colors" placeholder="Nama Anda..."/></div>
                                    <div><label className={`${ci.className} block text-[9px] tracking-[.2em] uppercase text-[#1a1f2e]/35 mb-2 font-medium`}>Ucapan</label><textarea value={mi} onChange={e=>setMi(e.target.value)} className="w-full bg-[#1a1f2e]/5 border border-[#1a1f2e]/10 rounded-xl px-5 py-3.5 text-sm text-[#1a1f2e] h-28 resize-none focus:outline-none focus:border-[#a8d8ea]/50 transition-colors" placeholder="Tulis ucapan..."/></div>
                                    <button type="submit" disabled={sub} className={`${ci.className} w-full bg-[#1a1f2e] text-white py-4 rounded-xl text-[10px] tracking-[.2em] uppercase font-medium hover:bg-[#2a2f3e] transition-colors disabled:opacity-50`}>{sub?'Mengirim...':'Kirim Ucapan'}</button>
                                </form>
                                {ws.length>0&&<div className="mt-8 space-y-3 max-h-[300px] overflow-y-auto sh">{ws.map((m,i)=>(<div key={i} className="bg-[#1a1f2e]/5 rounded-2xl p-4 border border-[#1a1f2e]/8"><p className="text-sm text-[#1a1f2e]/65 font-light">{m.message}</p><div className="flex items-center gap-2 mt-2"><div className="w-6 h-6 rounded-full bg-[#a8d8ea]/20 flex items-center justify-center"><span className="ib text-[10px] font-bold">{m.name?.charAt(0)?.toUpperCase()}</span></div><p className="text-xs text-[#1a1f2e]/35">{m.name}</p></div></div>))}</div>}
                            </div>
                        </section>

                        {invitation?.gift_accounts&&invitation.gift_accounts.length>0&&<section className="px-8 pb-20 fe-rv"><div className="text-center mb-12"><h2 className={`${ci.className} text-2xl font-light tracking-[.15em] uppercase text-white`}>Wedding</h2><p className={`${ci.className} text-4xl ib font-light -mt-1`}>Gift</p></div><div className="space-y-4">{invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={`${(i % 3) + 1}`} variant="FrostedElegance" />
                            ))}</div></section>}

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
                        <p className={`${poppins.className} text-[10px] text-white/50 tracking-[0.3em] uppercase font-bold mb-4`}>
                            Thank you for being part of our special day
                        </p>
                        <h2 className={`${cormorant.className} text-5xl mb-4 text-white drop-shadow-sm`}>
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
