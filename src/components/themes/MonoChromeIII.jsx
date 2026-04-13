'use client';
import GiftAtmCard from './partials/GiftAtmCard';
import React, { useEffect, useRef, useState } from 'react';
import { DM_Serif_Display, Lora, DM_Sans } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import VideoEmbed from './partials/VideoEmbed';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: ['400'], style: ['normal','italic'] });
const lora = Lora({ subsets: ['latin'], weight: ['400','500','600','700'], style: ['normal','italic'] });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['200','300','400','500','600','700'] });
const SU = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const AU = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export default function MonoChromeIII({ payload, audioController }) {
    const { invitation, guest, guestName } = payload;
    const [isOpen, setIsOpen] = useState(false);
    const rpRef = useRef(null);
    const [ni, setNi] = useState(guestName || '');
    const [mi, setMi] = useState('');
    const [ws, setWs] = useState(invitation?.guestMessages || []);
    const [sub, setSub] = useState(false);
    const ed = invitation?.event_date ? new Date(invitation.event_date) : new Date();
    const [cd, setCd] = useState({ d:0, h:0, m:0, s:0 });

    useEffect(() => { const t = setInterval(() => { const diff = ed - new Date(); if(diff>0) setCd({ d:Math.floor(diff/(864e5)), h:Math.floor((diff/36e5)%24), m:Math.floor((diff/6e4)%60), s:Math.floor((diff/1e3)%60) }); }, 1000); return () => clearInterval(t); }, []);
    useEffect(() => { const h = () => { document.querySelectorAll('.m3-rv').forEach(el => { if(el.getBoundingClientRect().top < window.innerHeight-50) el.classList.add('active'); }); }; const p=rpRef.current; if(p) p.addEventListener('scroll',h); window.addEventListener('scroll',h); h(); return()=>{ if(p) p.removeEventListener('scroll',h); window.removeEventListener('scroll',h); }; }, [isOpen]);

    const gp = (p) => { if(!p) return null; let ph=p; if(typeof ph==='string'&&ph.startsWith('[')){ try{const x=JSON.parse(ph);if(Array.isArray(x)&&x.length>0)ph=x[0];}catch{} } if(Array.isArray(ph))ph=ph[0]; if(typeof ph==='object'&&ph!==null){if(ph.photo)ph=ph.photo;else if(ph.url)ph=ph.url;else return null;} if(typeof ph!=='string')return null; ph=ph.replace(/\\/g,'/'); if(!ph.startsWith('http')&&!ph.startsWith('/'))ph=`${SU}/${ph}`; return ph; };
    const ho = () => { setIsOpen(true); audioController?.play(); };

    const sw = async(e) => { e.preventDefault(); if(!ni.trim()||!mi.trim())return; setSub(true); try{ await fetch(`${AU}/invitations/${invitation.id}/guestbook`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:ni,message:mi})}); setWs([{name:ni,message:mi,created_at:new Date().toISOString()},...ws]); setMi(''); toast.success('Ucapan terkirim!'); }catch{toast.error('Gagal mengirim ucapan');}finally{setSub(false);} };

    const cp = (()=>{ const c=invitation?.cover_photo; if(!c)return null; return gp(Array.isArray(c)?c[0]:c); })();
    const grP = gp(invitation?.groom_photo); const brP = gp(invitation?.bride_photo);
    const phs = invitation?.gallery?.length>0 ? invitation.gallery.map(g=>g.photo) : (invitation?.photos||[]);

    // INVERTED: White background, black text, elegant serif
    return (
        <div className={`min-h-screen bg-white text-[#1a1a1a] ${dmSans.className} overflow-hidden`}>
            <style dangerouslySetInnerHTML={{__html:`
                .m3-rv{opacity:0;transform:translateY(30px);transition:all .8s cubic-bezier(.16,1,.3,1)}.m3-rv.active{opacity:1;transform:translateY(0)}.m3-rv[data-delay="1"]{transition-delay:.15s}.m3-rv[data-delay="2"]{transition-delay:.3s}
                .m3c{background:#1a1a1a;color:#f5f5f5;border:1px solid #333}.m3cl{background:#fafafa;border:1px solid #e5e5e5}
                .sl3{position:sticky;top:0;height:100vh}@media(max-width:1023px){.sl3{position:relative;height:auto;min-height:100vh}}
                .co3{position:fixed;inset:0;z-index:9999;transition:transform 1s cubic-bezier(.16,1,.3,1)}.co3.open{transform:translateY(-100%)}
                .ms3{animation:ms3a 4s linear infinite}@keyframes ms3a{from{transform:rotate(0)}to{transform:rotate(360deg)}}
                .sh::-webkit-scrollbar{display:none}.sh{-ms-overflow-style:none;scrollbar-width:none}
                .arch3{border-radius:200px 200px 0 0;overflow:hidden}
            `}}/>


            {/* COVER - Dark overlay on white */}
            <div className={`co3 ${isOpen?'open':''}`}>
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-white">
                    {cp&&<img src={cp} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-15 grayscale"/>}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white"/>
                    <div className="relative z-10 text-center px-6 flex flex-col items-center">
                        <div className="w-20 h-px bg-[#1a1a1a]/15 mb-8"/>
                        <p className={`${dmSans.className} text-[10px] tracking-[.6em] uppercase text-[#1a1a1a]/35 mb-6 font-medium`}>The Wedding Of</p>
                        <h1 className={`${dmSerif.className} text-6xl md:text-8xl lg:text-9xl text-[#1a1a1a] mb-4`}>{invitation?.groom_name?.split(' ')[0]}</h1>
                        <p className={`${lora.className} italic text-4xl text-[#1a1a1a]/20 my-2`}>&</p>
                        <h1 className={`${dmSerif.className} text-6xl md:text-8xl lg:text-9xl text-[#1a1a1a] mb-6`}>{invitation?.bride_name?.split(' ')[0]}</h1>
                        <p className="text-[10px] text-[#1a1a1a]/25 tracking-[.4em] uppercase mb-10">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                        {guestName&&<div className="mb-8"><p className="text-[9px] text-[#1a1a1a]/20 uppercase tracking-[.3em] mb-1">Kepada Yth.</p><p className={`${lora.className} italic text-2xl text-[#1a1a1a]/60`}>{guestName}</p></div>}
                        <button onClick={ho} className={`${dmSans.className} bg-[#1a1a1a] text-white px-10 py-4 text-[10px] tracking-[.4em] uppercase font-medium hover:bg-[#333] transition-all duration-500`}>Buka Undangan</button>
                        <div className="w-20 h-px bg-[#1a1a1a]/15 mt-8"/>
                    </div>
                </div>
            </div>

            {/* MAIN - Left dark, right white */}
            <div className={`transition-opacity duration-1000 ${isOpen?'opacity-100':'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col lg:flex-row min-h-screen">
                    {/* LEFT - Dark panel */}
                    <div className="sl3 w-full lg:w-[70%] bg-[#1a1a1a] relative flex flex-col justify-end p-8 md:p-12 lg:p-16">
                        {cp&&<img src={cp} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-35 grayscale"/>}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent"/>
                        <div className="relative z-10 text-white">
                            <p className={`${dmSans.className} text-[10px] tracking-[.5em] uppercase text-white/30 mb-6 font-medium`}>Our Wedding</p>
                            <h1 className={`${dmSerif.className} text-6xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-3`}>{invitation?.groom_name?.split(' ')[0]}</h1>
                            <p className={`${lora.className} italic text-3xl text-white/20 mb-3`}>&</p>
                            <h1 className={`${dmSerif.className} text-6xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-8`}>{invitation?.bride_name?.split(' ')[0]}</h1>
                            {invitation?.quotes&&<p className="text-sm text-white/30 leading-relaxed max-w-lg mb-10 font-light">"{invitation.description}"</p>}
                            {guestName&&<div className="mb-6"><p className="text-[9px] text-white/15 tracking-[.3em] uppercase mb-1">Dear</p><p className={`${lora.className} italic text-2xl text-white/60`}>{guestName}</p></div>}
                        </div>
                        {invitation?.music_url&&<MusicPlayer audioController={audioController} btnBg="bg-white" btnColor="text-[#1a1a1a]" btnBorder="border-[#1a1a1a]/10 shadow-2xl" />}
                    </div>

                    {/* RIGHT - White panel */}
                    <div ref={rpRef} className="w-full lg:w-[30%] lg:h-screen lg:overflow-y-auto sh bg-white">
                        {/* Countdown */}
                        <section className="py-20 px-8 text-center m3-rv">
                            <p className={`${dmSans.className} text-[10px] tracking-[.5em] uppercase text-[#1a1a1a]/25 mb-4 font-medium`}>Save The Date</p>
                            <h2 className={`${dmSerif.className} text-3xl text-[#1a1a1a] mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h2>
                            <p className="text-[10px] text-[#1a1a1a]/20 tracking-[.3em] uppercase mb-10">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">{[{v:cd.d,l:'Hari'},{v:cd.h,l:'Jam'},{v:cd.m,l:'Menit'},{v:cd.s,l:'Detik'}].map((it,i)=>(<div key={i} className="m3c rounded-2xl py-4 px-2"><p className={`${dmSerif.className} text-2xl text-white`}>{it.v}</p><p className="text-[9px] uppercase tracking-widest text-white/35 mt-1">{it.l}</p></div>))}</div>
                        </section>

                        {/* Quote */}
                        <section className="px-8 pb-20 m3-rv">
                            <div className="m3cl rounded-3xl p-8 text-center">
                                <p className={`${lora.className} italic text-sm leading-relaxed text-[#1a1a1a]/50 mb-4`}>{invitation?.quotes||'"Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu."'}</p>
                                <p className={`${dmSans.className} text-[10px] text-[#1a1a1a]/25 tracking-[.3em] uppercase font-medium`}>{invitation?.quotes_name || 'QS. Ar-Rum Ayat 21'}</p>
                            </div>
                        </section>

                        {/* Bride & Groom — Side-by-side on dark cards */}
                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 m3-rv"><h2 className={`${dmSerif.className} text-3xl text-[#1a1a1a]`}>Bride & Groom</h2><p className="text-[10px] text-[#1a1a1a]/15 tracking-[.3em] uppercase mt-2">Assalamualaikum Wr. Wb.</p><p className="text-[10px] text-[#1a1a1a]/30 mt-3 max-w-md mx-auto leading-relaxed font-light">Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:</p></div>

                            {/* Bride - Horizontal dark card */}
                            <div className="m3c rounded-3xl p-6 mb-6 m3-rv" data-delay="1">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    {brP&&<div className="w-36 h-44 flex-none arch3 border border-white/10"><img src={brP} alt="Bride" className="w-full h-full object-cover grayscale"/></div>}
                                    <div className="text-center flex-1">
                                        <p className={`${lora.className} italic text-3xl text-white/80 mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p>
                                        <h3 className={`${dmSerif.className} text-xl text-white mb-3`}>{invitation?.bride_full_name||invitation?.bride_name}</h3>
                                        <div className="w-10 h-px bg-white/15 mb-3 mx-auto"/>
                                        <p className="text-sm text-white/30 font-light">Putri dari</p>
                                        <p className="text-sm text-white/50">{invitation?.bride_father||'Bapak'} & {invitation?.bride_mother||'Ibu'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center my-4 m3-rv"><span className={`${lora.className} italic text-5xl text-[#1a1a1a]/10`}>&</span></div>
                            {/* Groom - Horizontal dark card reversed */}
                            <div className="m3c rounded-3xl p-6 m3-rv" data-delay="2">
                                <div className="flex flex-col md:flex-row-reverse items-center gap-6">
                                    {grP&&<div className="w-36 h-44 flex-none arch3 border border-white/10"><img src={grP} alt="Groom" className="w-full h-full object-cover grayscale"/></div>}
                                    <div className="text-center flex-1">
                                        <p className={`${lora.className} italic text-3xl text-white/80 mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p>
                                        <h3 className={`${dmSerif.className} text-xl text-white mb-3`}>{invitation?.groom_full_name||invitation?.groom_name}</h3>
                                        <div className="w-10 h-px bg-white/15 mb-3 mx-auto"/>
                                        <p className="text-sm text-white/30 font-light">Putra dari</p>
                                        <p className="text-sm text-white/50">{invitation?.groom_father||'Bapak'} & {invitation?.groom_mother||'Ibu'}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Events */}
                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 m3-rv"><h2 className={`${dmSerif.className} text-3xl text-[#1a1a1a]`}>Wedding Event</h2></div>
                            {invitation?.events&&invitation.events.length>0?[...invitation.events].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((ev,idx)=>(
                                <div key={idx} className="m3cl rounded-3xl p-8 mb-6 text-center m3-rv" data-delay={`${idx+1}`}>
                                    <h3 className={`${dmSerif.className} text-xl text-[#1a1a1a] mb-4`}>{ev.name}</h3>
                                    <p className="text-sm text-[#1a1a1a]/40 font-light mb-1">{ev.date?new Date(ev.date).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):''}</p>
                                    <p className="text-sm text-[#1a1a1a]/40 font-light mb-3">Pukul : {ev.time_start?.substring(0,5)||'TBA'} {ev.time_end?`- ${ev.time_end.substring(0,5)}`:'- Selesai'} WIB</p>
                                    {ev.location&&<p className="text-sm text-[#1a1a1a]/55 pt-3 border-t border-[#1a1a1a]/5">{ev.location}</p>}
                                    {(ev.latitude&&ev.longitude)&&<a href={`https://maps.google.com/?q=${ev.latitude},${ev.longitude}`} target="_blank" rel="noreferrer" className={`${dmSans.className} inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-[10px] tracking-[.2em] uppercase font-medium hover:bg-[#333] transition-all duration-500 mt-4`}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>Lihat Lokasi</a>}
                                </div>
                            )):<div className="m3cl rounded-3xl p-10 text-center"><h3 className={`${dmSerif.className} text-xl text-[#1a1a1a] mb-2`}>Acara Pernikahan</h3></div>}
                        </section>

                        {invitation?.love_stories&&invitation.love_stories.length>0&&<section className="px-8 pb-20"><div className="text-center mb-12 m3-rv"><h2 className={`${dmSerif.className} text-3xl text-[#1a1a1a]`}>Our Love Story</h2></div>{[...invitation.love_stories].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((s,i)=>(<div key={s.id||i} className="m3cl rounded-3xl p-8 text-center mb-6 m3-rv" data-delay={`${i+1}`}><h3 className={`${dmSerif.className} text-lg text-[#1a1a1a] mb-4`}>{s.title}</h3><p className="text-sm text-[#1a1a1a]/50 leading-relaxed font-light">{s.description}</p>{s.photo&&<div className="mt-6 rounded-xl overflow-hidden"><img src={gp(s.photo)} alt={s.title} className="w-full h-44 object-cover grayscale"/></div>}</div>))}</section>}

                        <Gallery 
                            layout="abstract"
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={dmSerif.className}
                            titleSize="text-3xl"
                            accentText="text-[#1a1a1a]"
                            subtitleText="text-[#1a1a1a]/50"
                            borderColor="border-[#1a1a1a]/10"
                        />

                        <div className="px-8"><QrCheckin guest={guest} sectionBg="bg-transparent" titleFont={dmSerif.className} textColor="text-[#1a1a1a]" borderStyle="border-[#1a1a1a]/8"/></div>

                        {/* Wishes */}
                        <section className="px-8 pb-20 m3-rv">
                            <div className="text-center mb-12"><h2 className={`${dmSerif.className} text-3xl text-[#1a1a1a]`}>Wedding Wishes</h2></div>
                            <div className="m3cl rounded-3xl p-8">
                                <form onSubmit={sw} className="space-y-4">
                                    <div><label className={`${dmSans.className} block text-[9px] tracking-[.2em] uppercase text-[#1a1a1a]/25 mb-2 font-medium`}>Nama</label><input type="text" value={ni} onChange={e=>setNi(e.target.value)} className="w-full bg-white border border-[#1a1a1a]/8 rounded-xl px-5 py-3.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a]/25 transition-colors" placeholder="Nama Anda..."/></div>
                                    <div><label className={`${dmSans.className} block text-[9px] tracking-[.2em] uppercase text-[#1a1a1a]/25 mb-2 font-medium`}>Ucapan</label><textarea value={mi} onChange={e=>setMi(e.target.value)} className="w-full bg-white border border-[#1a1a1a]/8 rounded-xl px-5 py-3.5 text-sm text-[#1a1a1a] h-28 resize-none focus:outline-none focus:border-[#1a1a1a]/25 transition-colors" placeholder="Tulis ucapan..."/></div>
                                    <button type="submit" disabled={sub} className={`${dmSans.className} w-full bg-[#1a1a1a] text-white py-4 rounded-xl text-[10px] tracking-[.3em] uppercase font-medium hover:bg-[#333] transition-colors disabled:opacity-50`}>{sub?'Mengirim...':'Kirim Ucapan'}</button>
                                </form>
                                {ws.length>0&&<div className="mt-8 space-y-3 max-h-[300px] overflow-y-auto sh">{ws.map((m,i)=>(<div key={i} className="bg-white rounded-2xl p-4 border border-[#1a1a1a]/5"><p className="text-sm text-[#1a1a1a]/55 font-light">{m.message}</p><div className="flex items-center gap-2 mt-2"><div className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center"><span className="text-white text-[10px] font-bold">{m.name?.charAt(0)?.toUpperCase()}</span></div><p className="text-xs text-[#1a1a1a]/30">{m.name}</p></div></div>))}</div>}
                            </div>
                        </section>

                        {invitation?.gift_accounts&&invitation.gift_accounts.length>0&&<section className="px-8 pb-20 m3-rv"><div className="text-center mb-12"><h2 className={`${dmSerif.className} text-3xl text-[#1a1a1a]`}>Wedding Gift</h2></div><div className="space-y-4">{invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={`${(i % 3) + 1}`} variant="MonoChromeIII" />
                            ))}</div></section>}

                        <footer className="py-20 px-8 text-center border-t border-[#1a1a1a]/5 m3-rv">
                            <p className={`${dmSans.className} text-[9px] tracking-[.5em] uppercase text-[#1a1a1a]/15 mb-8 font-medium`}>Thank You</p>
                            <div className="w-24 h-24 rounded-full border border-[#1a1a1a]/8 mx-auto mb-8 flex items-center justify-center"><span className={`${dmSerif.className} text-3xl text-[#1a1a1a]/25`}>{invitation?.groom_name?.charAt(0)}{invitation?.bride_name?.charAt(0)}</span></div>
                            <h3 className={`${dmSerif.className} text-lg text-[#1a1a1a] mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h3>
                            <p className="text-[10px] text-[#1a1a1a]/10 tracking-[.3em] uppercase">{ed.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
                            <div className="flex items-center justify-center gap-4 mt-10 text-[#1a1a1a]/8"><div className="h-px w-16 bg-current"/><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg><div className="h-px w-16 bg-current"/></div>
                            <div className="mt-12 pt-8 border-t border-[#1a1a1a]/3"><p className={`${dmSans.className} text-[10px] text-[#1a1a1a]/30 tracking-[.4em] uppercase font-medium`}>Digivitation</p><p className="text-[8px] text-[#1a1a1a]/10 tracking-[.2em] uppercase mt-1">Digital Invitation</p></div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
