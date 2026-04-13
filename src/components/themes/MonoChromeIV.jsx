'use client';
import GiftAtmCard from './partials/GiftAtmCard';
import React, { useEffect, useRef, useState } from 'react';
import { Space_Grotesk, Italiana, Work_Sans } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import VideoEmbed from './partials/VideoEmbed';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300','400','500','600','700'] });
const italiana = Italiana({ subsets: ['latin'], weight: ['400'] });
const workSans = Work_Sans({ subsets: ['latin'], weight: ['200','300','400','500','600','700','800'] });
const SU = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const AU = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export default function MonoChromeIV({ payload, audioController }) {
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
    useEffect(() => { const h = () => { document.querySelectorAll('.m4-rv').forEach(el => { if(el.getBoundingClientRect().top < window.innerHeight-50) el.classList.add('active'); }); }; const p=rpRef.current; if(p) p.addEventListener('scroll',h); window.addEventListener('scroll',h); h(); return()=>{ if(p) p.removeEventListener('scroll',h); window.removeEventListener('scroll',h); }; }, [isOpen]);

    const gp = (p) => { if(!p) return null; let ph=p; if(typeof ph==='string'&&ph.startsWith('[')){ try{const x=JSON.parse(ph);if(Array.isArray(x)&&x.length>0)ph=x[0];}catch{} } if(Array.isArray(ph))ph=ph[0]; if(typeof ph==='object'&&ph!==null){if(ph.photo)ph=ph.photo;else if(ph.url)ph=ph.url;else return null;} if(typeof ph!=='string')return null; ph=ph.replace(/\\/g,'/'); if(!ph.startsWith('http')&&!ph.startsWith('/'))ph=`${SU}/${ph}`; return ph; };
    const ho = () => { setIsOpen(true); audioController?.play(); };

    const sw = async(e) => { e.preventDefault(); if(!ni.trim()||!mi.trim())return; setSub(true); try{ await fetch(`${AU}/invitations/${invitation.id}/guestbook`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:ni,message:mi})}); setWs([{name:ni,message:mi,created_at:new Date().toISOString()},...ws]); setMi(''); toast.success('Ucapan terkirim!'); }catch{toast.error('Gagal mengirim ucapan');}finally{setSub(false);} };
    const cp = (()=>{ const c=invitation?.cover_photo; if(!c)return null; return gp(Array.isArray(c)?c[0]:c); })();
    const grP = gp(invitation?.groom_photo); const brP = gp(invitation?.bride_photo);
    const phs = invitation?.gallery?.length>0 ? invitation.gallery.map(g=>g.photo) : (invitation?.photos||[]);

    // Steel Gray / Industrial Monochrome: #18181b bg, #71717a accent, strong geometric lines
    return (
        <div className={`min-h-screen bg-[#18181b] text-[#e4e4e7] ${workSans.className} overflow-hidden`}>
            <style dangerouslySetInnerHTML={{__html:`
                .m4-rv{opacity:0;transform:translateY(30px);transition:all .8s cubic-bezier(.16,1,.3,1)}.m4-rv.active{opacity:1;transform:translateY(0)}.m4-rv[data-delay="1"]{transition-delay:.15s}.m4-rv[data-delay="2"]{transition-delay:.3s}
                .m4c{background:rgba(228,228,231,.04);border:1px solid rgba(228,228,231,.08)}.m4cw{background:#fafafa;color:#18181b;border:1px solid #e4e4e7}
                .stl{color:#a1a1aa}
                .sl4{position:sticky;top:0;height:100vh}@media(max-width:1023px){.sl4{position:relative;height:auto;min-height:100vh}}
                .co4{position:fixed;inset:0;z-index:9999;transition:transform 1s cubic-bezier(.16,1,.3,1)}.co4.open{transform:translateY(-100%)}
                .ms4{animation:ms4a 4s linear infinite}@keyframes ms4a{from{transform:rotate(0)}to{transform:rotate(360deg)}}
                .sh::-webkit-scrollbar{display:none}.sh{-ms-overflow-style:none;scrollbar-width:none}
                .square-frame{aspect-ratio:1;overflow:hidden}
                .line-accent{position:relative}.line-accent::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#a1a1aa}
            `}}/>


            {/* COVER */}
            <div className={`co4 ${isOpen?'open':''}`}>
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#09090b]">
                    {cp&&<img src={landingPhoto || cp} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale contrast-125"/>}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/50 via-[#09090b]/70 to-[#09090b]/95"/>
                    <div className="relative z-10 text-center px-6 flex flex-col items-center">
                        <div className="flex items-center gap-4 mb-8"><div className="w-16 h-px bg-[#a1a1aa]/30"/><div className="w-2 h-2 border border-[#a1a1aa]/30 rotate-45"/><div className="w-16 h-px bg-[#a1a1aa]/30"/></div>
                        <p className={`${spaceGrotesk.className} text-[10px] tracking-[.6em] uppercase stl mb-6 font-medium`}>The Wedding Of</p>
                        <h1 className={`${italiana.className} text-6xl md:text-8xl lg:text-[9rem] text-[#e4e4e7] mb-2 leading-[.9]`}>{invitation?.groom_name?.split(' ')[0]}</h1>
                        <div className="flex items-center gap-4 my-3"><div className="w-12 h-px bg-[#a1a1aa]/20"/><span className={`${italiana.className} text-3xl stl`}>&</span><div className="w-12 h-px bg-[#a1a1aa]/20"/></div>
                        <h1 className={`${italiana.className} text-6xl md:text-8xl lg:text-[9rem] text-[#e4e4e7] mb-6 leading-[.9]`}>{invitation?.bride_name?.split(' ')[0]}</h1>
                        <p className={`${spaceGrotesk.className} text-[10px] stl tracking-[.4em] uppercase mb-10 font-light`}>{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                        {guestName&&<div className="mb-8"><p className={`${spaceGrotesk.className} text-[9px] text-[#e4e4e7]/15 uppercase tracking-[.3em] mb-1 font-medium`}>Kepada Yth.</p><p className={`${italiana.className} text-2xl stl`}>{guestName}</p></div>}
                        <button onClick={ho} className={`${spaceGrotesk.className} border border-[#a1a1aa]/25 px-10 py-4 text-[10px] tracking-[.4em] uppercase stl font-medium hover:bg-[#e4e4e7] hover:text-[#18181b] hover:border-[#e4e4e7] transition-all duration-500`}>Buka Undangan</button>
                    </div>
                </div>
            </div>

            {/* MAIN */}
            <div className={`transition-opacity duration-1000 ${isOpen?'opacity-100':'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col lg:flex-row min-h-screen">
                    {/* LEFT */}
                    <div className="sl4 w-full lg:w-[70%] bg-[#18181b] relative flex flex-col justify-end p-8 md:p-12 lg:p-16">
                        {cp&&<img src={cp} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale contrast-125"/>}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-[#18181b]/60 to-transparent"/>
                        <div className="relative z-10">
                            <p className={`${spaceGrotesk.className} text-[9px] tracking-[.5em] uppercase stl mb-6 font-medium`}>Our Wedding</p>
                            <h1 className={`${italiana.className} text-6xl md:text-7xl lg:text-8xl text-[#e4e4e7] leading-[.85] mb-3`}>{invitation?.groom_name?.split(' ')[0]}</h1>
                            <div className="flex items-center gap-3 mb-3"><div className="w-8 h-px bg-[#a1a1aa]/20"/><span className={`${italiana.className} text-2xl text-[#a1a1aa]/30`}>&</span></div>
                            <h1 className={`${italiana.className} text-6xl md:text-7xl lg:text-8xl text-[#e4e4e7] leading-[.85] mb-8`}>{invitation?.bride_name?.split(' ')[0]}</h1>
                            {invitation?.quotes&&<p className="text-xs text-[#e4e4e7]/25 leading-relaxed max-w-lg mb-10 font-light">"{invitation.description}"</p>}
                            {guestName&&<div className="mb-6 line-accent pl-5"><p className={`${spaceGrotesk.className} text-[8px] text-[#e4e4e7]/12 tracking-[.3em] uppercase mb-1 font-medium`}>Dear</p><p className={`${italiana.className} text-2xl stl`}>{guestName}</p></div>}
                        </div>
                        {invitation?.music_url&&<MusicPlayer audioController={audioController} btnBg="bg-[#18181b]" btnColor="stl" btnBorder="border-[#a1a1aa]/12 shadow-2xl" />}
                    </div>

                    {/* RIGHT */}
                    <div ref={rpRef} className="w-full lg:w-[30%] lg:h-screen lg:overflow-y-auto sh bg-[#18181b]">
                        <section className="py-20 px-8 text-center m4-rv">
                            <p className={`${spaceGrotesk.className} text-[9px] tracking-[.5em] uppercase stl mb-4 font-medium`}>Save The Date</p>
                            <h2 className={`${italiana.className} text-3xl text-[#e4e4e7] mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h2>
                            <p className={`${spaceGrotesk.className} text-[9px] text-[#e4e4e7]/15 tracking-[.3em] uppercase mb-10 font-light`}>{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">{[{v:cd.d,l:'DAYS'},{v:cd.h,l:'HRS'},{v:cd.m,l:'MIN'},{v:cd.s,l:'SEC'}].map((it,i)=>(<div key={i} className="m4c py-4 px-2"><p className={`${italiana.className} text-3xl text-[#e4e4e7]`}>{it.v}</p><p className={`${spaceGrotesk.className} text-[7px] uppercase tracking-[.3em] stl mt-1 font-medium`}>{it.l}</p></div>))}</div>
                        </section>

                        <section className="px-8 pb-20 m4-rv">
                            <div className="m4cw p-8 text-center">
                                <p className={`${italiana.className} text-sm leading-relaxed text-[#18181b]/50 mb-4`}>{invitation?.quotes||'"Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu."'}</p>
                                <p className={`${spaceGrotesk.className} text-[9px] text-[#18181b]/25 tracking-[.3em] uppercase font-medium`}>{invitation?.quotes_name || 'QS. Ar-Rum Ayat 21'}</p>
                            </div>
                        </section>

                        {/* Bride & Groom — Square photos with geometric accent */}
                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 m4-rv"><h2 className={`${italiana.className} text-3xl text-[#e4e4e7]`}>Bride & Groom</h2><p className={`${spaceGrotesk.className} text-[9px] text-[#e4e4e7]/12 tracking-[.3em] uppercase mt-2 font-medium`}>Assalamualaikum Wr. Wb.</p><p className={`${spaceGrotesk.className} text-[9px] text-[#e4e4e7]/20 mt-3 max-w-md mx-auto leading-relaxed font-light`}>Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:</p></div>

                            <div className="m4c p-6 mb-6 m4-rv" data-delay="1">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    {brP&&<div className="square-frame w-36 flex-none border border-[#e4e4e7]/8"><img src={brP} alt="Bride" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"/></div>}
                                    <div className="text-center flex-1 line-accent pl-5">
                                        <p className={`${italiana.className} text-3xl stl mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p>
                                        <h3 className={`${spaceGrotesk.className} text-lg tracking-[.05em] text-[#e4e4e7] mb-3 font-medium`}>{invitation?.bride_full_name||invitation?.bride_name}</h3>
                                        <p className="text-xs text-[#e4e4e7]/25 font-light">Putri dari {invitation?.bride_father||'Bapak'} & {invitation?.bride_mother||'Ibu'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-3 my-5 m4-rv"><div className="w-px h-8 bg-[#a1a1aa]/10"/><div className="w-3 h-3 border border-[#a1a1aa]/15 rotate-45"/><div className="w-px h-8 bg-[#a1a1aa]/10"/></div>
                            <div className="m4c p-6 m4-rv" data-delay="2">
                                <div className="flex flex-col md:flex-row-reverse items-center gap-6">
                                    {grP&&<div className="square-frame w-36 flex-none border border-[#e4e4e7]/8"><img src={grP} alt="Groom" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"/></div>}
                                    <div className="text-center flex-1">
                                        <p className={`${italiana.className} text-3xl stl mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p>
                                        <h3 className={`${spaceGrotesk.className} text-lg tracking-[.05em] text-[#e4e4e7] mb-3 font-medium`}>{invitation?.groom_full_name||invitation?.groom_name}</h3>
                                        <p className="text-xs text-[#e4e4e7]/25 font-light">Putra dari {invitation?.groom_father||'Bapak'} & {invitation?.groom_mother||'Ibu'}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 m4-rv"><h2 className={`${italiana.className} text-3xl text-[#e4e4e7]`}>Wedding Event</h2></div>
                            {invitation?.events&&invitation.events.length>0?[...invitation.events].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((ev,idx)=>(
                                <div key={idx} className="m4cw p-8 mb-6 text-center m4-rv" data-delay={`${idx+1}`}>
                                    <h3 className={`${italiana.className} text-xl text-[#18181b] mb-4`}>{ev.name}</h3>
                                    <p className={`${spaceGrotesk.className} text-sm text-[#18181b]/40 font-light mb-1`}>{ev.date?new Date(ev.date).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):''}</p>
                                    <p className={`${spaceGrotesk.className} text-sm text-[#18181b]/40 font-light mb-3`}>Pukul : {ev.time_start?.substring(0,5)||'TBA'} {ev.time_end?`- ${ev.time_end.substring(0,5)}`:'- Selesai'} WIB</p>
                                    {ev.location&&<p className={`${spaceGrotesk.className} text-sm text-[#18181b]/55 pt-3 border-t border-[#18181b]/5`}>{ev.location}</p>}
                                    {(ev.latitude&&ev.longitude)&&<a href={`https://maps.google.com/?q=${ev.latitude},${ev.longitude}`} target="_blank" rel="noreferrer" className={`${spaceGrotesk.className} inline-flex items-center gap-2 bg-[#18181b] text-[#e4e4e7] px-6 py-3 text-[9px] tracking-[.2em] uppercase font-medium hover:bg-[#27272a] transition-all duration-500 mt-4`}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>Lihat Lokasi</a>}
                                </div>
                            )):<div className="m4cw p-10 text-center"><h3 className={`${italiana.className} text-xl text-[#18181b] mb-2`}>Acara Pernikahan</h3></div>}
                        </section>

                        {invitation?.love_stories&&invitation.love_stories.length>0&&<section className="px-8 pb-20"><div className="text-center mb-12 m4-rv"><h2 className={`${italiana.className} text-3xl text-[#e4e4e7]`}>Our Love Story</h2></div>{[...invitation.love_stories].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((s,i)=>(<div key={s.id||i} className="m4cw p-8 text-center mb-6 m4-rv" data-delay={`${i+1}`}><h3 className={`${italiana.className} text-lg text-[#18181b] mb-4`}>{s.title}</h3><p className="text-sm text-[#18181b]/50 leading-relaxed font-light">{s.description}</p>{s.photo&&<div className="mt-6 overflow-hidden"><img src={gp(s.photo)} alt={s.title} className="w-full h-44 object-cover grayscale"/></div>}</div>))}</section>}

                        <Gallery 
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={italiana.className}
                            titleSize="text-3xl"
                            accentText="text-[#e4e4e7]"
                            subtitleText="text-[#a1a1aa]"
                            borderColor="border-[#a1a1aa]/20"
                        />

                        <div className="px-8"><QrCheckin guest={guest} sectionBg="bg-transparent" titleFont={italiana.className} textColor="text-[#e4e4e7]" borderStyle="border-[#a1a1aa]/10"/></div>

                        <section className="px-8 pb-20 m4-rv">
                            <div className="text-center mb-12"><h2 className={`${italiana.className} text-3xl text-[#e4e4e7]`}>Wedding Wishes</h2></div>
                            <div className="m4cw p-8">
                                <form onSubmit={sw} className="space-y-4">
                                    <div><label className={`${spaceGrotesk.className} block text-[8px] tracking-[.2em] uppercase text-[#18181b]/25 mb-2 font-medium`}>Nama</label><input type="text" value={ni} onChange={e=>setNi(e.target.value)} className={`${workSans.className} w-full bg-white border border-[#18181b]/8 px-5 py-3.5 text-sm text-[#18181b] focus:outline-none focus:border-[#18181b]/25 transition-colors`} placeholder="Nama Anda..."/></div>
                                    <div><label className={`${spaceGrotesk.className} block text-[8px] tracking-[.2em] uppercase text-[#18181b]/25 mb-2 font-medium`}>Ucapan</label><textarea value={mi} onChange={e=>setMi(e.target.value)} className={`${workSans.className} w-full bg-white border border-[#18181b]/8 px-5 py-3.5 text-sm text-[#18181b] h-28 resize-none focus:outline-none focus:border-[#18181b]/25 transition-colors`} placeholder="Tulis ucapan..."/></div>
                                    <button type="submit" disabled={sub} className={`${spaceGrotesk.className} w-full bg-[#18181b] text-[#e4e4e7] py-4 text-[9px] tracking-[.3em] uppercase font-medium hover:bg-[#27272a] transition-colors disabled:opacity-50`}>{sub?'Mengirim...':'Kirim Ucapan'}</button>
                                </form>
                                {ws.length>0&&<div className="mt-8 space-y-3 max-h-[300px] overflow-y-auto sh">{ws.map((m,i)=>(<div key={i} className="bg-[#fafafa] p-4 border border-[#18181b]/5"><p className="text-sm text-[#18181b]/55 font-light">{m.message}</p><div className="flex items-center gap-2 mt-2"><div className="w-6 h-6 bg-[#18181b] flex items-center justify-center"><span className="text-white text-[9px] font-bold">{m.name?.charAt(0)?.toUpperCase()}</span></div><p className="text-xs text-[#18181b]/25">{m.name}</p></div></div>))}</div>}
                            </div>
                        </section>

                        {invitation?.gift_accounts&&invitation.gift_accounts.length>0&&<section className="px-8 pb-20 m4-rv"><div className="text-center mb-12"><h2 className={`${italiana.className} text-3xl text-[#e4e4e7]`}>Wedding Gift</h2></div><div className="space-y-4">{invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={`${(i % 3) + 1}`} variant="MonoChromeIV" />
                            ))}</div></section>}

                        <footer className="py-20 px-8 text-center border-t border-[#e4e4e7]/5 m4-rv">
                            <p className={`${spaceGrotesk.className} text-[8px] tracking-[.5em] uppercase stl mb-8 font-medium`}>Thank You</p>
                            <div className="w-20 h-20 border border-[#a1a1aa]/10 mx-auto mb-8 flex items-center justify-center"><span className={`${italiana.className} text-3xl stl`}>{invitation?.groom_name?.charAt(0)}{invitation?.bride_name?.charAt(0)}</span></div>
                            <h3 className={`${italiana.className} text-lg text-[#e4e4e7] mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h3>
                            <p className={`${spaceGrotesk.className} text-[9px] text-[#e4e4e7]/8 tracking-[.3em] uppercase font-light`}>{ed.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
                            <div className="flex items-center justify-center gap-3 mt-10 text-[#a1a1aa]/8"><div className="h-px w-12 bg-current"/><div className="w-2 h-2 border border-current rotate-45"/><div className="h-px w-12 bg-current"/></div>
                            <div className="mt-12 pt-8 border-t border-[#e4e4e7]/3"><p className={`${spaceGrotesk.className} text-[9px] stl tracking-[.4em] uppercase font-medium`}>Digivitation</p><p className={`${spaceGrotesk.className} text-[7px] text-[#e4e4e7]/6 tracking-[.2em] uppercase mt-1 font-light`}>Digital Invitation</p></div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
