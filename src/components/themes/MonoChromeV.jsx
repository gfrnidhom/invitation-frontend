'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Cinzel, Bodoni_Moda, Montserrat } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import VideoEmbed from './partials/VideoEmbed';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400','500','600','700','800','900'] });
const bodoni = Bodoni_Moda({ subsets: ['latin'], weight: ['400','500','600','700','800','900'], style: ['normal','italic'] });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['200','300','400','500','600','700','800'] });
const SU = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const AU = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export default function MonoChromeV({ payload, audioController }) {
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
    useEffect(() => { const h = () => { document.querySelectorAll('.m5-rv').forEach(el => { if(el.getBoundingClientRect().top < window.innerHeight-50) el.classList.add('active'); }); }; const p=rpRef.current; if(p) p.addEventListener('scroll',h); window.addEventListener('scroll',h); h(); return()=>{ if(p) p.removeEventListener('scroll',h); window.removeEventListener('scroll',h); }; }, [isOpen]);

    const gp = (p) => { if(!p) return null; let ph=p; if(typeof ph==='string'&&ph.startsWith('[')){ try{const x=JSON.parse(ph);if(Array.isArray(x)&&x.length>0)ph=x[0];}catch{} } if(Array.isArray(ph))ph=ph[0]; if(typeof ph==='object'&&ph!==null){if(ph.photo)ph=ph.photo;else if(ph.url)ph=ph.url;else return null;} if(typeof ph!=='string')return null; ph=ph.replace(/\\/g,'/'); if(!ph.startsWith('http')&&!ph.startsWith('/'))ph=`${SU}/${ph}`; return ph; };
    const ho = () => { setIsOpen(true); audioController?.play(); };

    const sw = async(e) => { e.preventDefault(); if(!ni.trim()||!mi.trim())return; setSub(true); try{ await fetch(`${AU}/invitations/${invitation.id}/guestbook`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:ni,message:mi})}); setWs([{name:ni,message:mi,created_at:new Date().toISOString()},...ws]); setMi(''); toast.success('Ucapan terkirim!'); }catch{toast.error('Gagal mengirim ucapan');}finally{setSub(false);} };
    const cp = (()=>{ const c=invitation?.cover_photo; if(!c)return null; return gp(Array.isArray(c)?c[0]:c); })();
    const grP = gp(invitation?.groom_photo); const brP = gp(invitation?.bride_photo);
    const phs = invitation?.gallery?.length>0 ? invitation.gallery.map(g=>g.photo) : (invitation?.photos||[]);

    // Charcoal Noir: #1c1c1e bg, #3a3a3c mid, luxurious charcoal with subtle warmth
    return (
        <div className={`min-h-screen bg-[#1c1c1e] text-[#d1d1d6] ${montserrat.className} overflow-hidden`}>
            <style dangerouslySetInnerHTML={{__html:`
                .m5-rv{opacity:0;transform:translateY(30px);transition:all .8s cubic-bezier(.16,1,.3,1)}.m5-rv.active{opacity:1;transform:translateY(0)}.m5-rv[data-delay="1"]{transition-delay:.15s}.m5-rv[data-delay="2"]{transition-delay:.3s}
                .m5c{background:rgba(209,209,214,.05);border:1px solid rgba(209,209,214,.08)}.m5cw{background:#f2f2f7;color:#1c1c1e}
                .ch{color:#8e8e93}
                .sl5{position:sticky;top:0;height:100vh}@media(max-width:1023px){.sl5{position:relative;height:auto;min-height:100vh}}
                .co5{position:fixed;inset:0;z-index:9999;transition:transform 1s cubic-bezier(.16,1,.3,1)}.co5.open{transform:translateY(-100%)}
                .ms5{animation:ms5a 4s linear infinite}@keyframes ms5a{from{transform:rotate(0)}to{transform:rotate(360deg)}}
                .sh::-webkit-scrollbar{display:none}.sh{-ms-overflow-style:none;scrollbar-width:none}
                .oval-frame{border-radius:50%;overflow:hidden;aspect-ratio:3/4}
                .stripe{background:repeating-linear-gradient(0deg,transparent,transparent 49%,rgba(209,209,214,.04) 49%,rgba(209,209,214,.04) 51%,transparent 51%,transparent 100%)}
            `}}/>


            <div className={`co5 ${isOpen?'open':''}`}>
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0c0c0e]">
                    {cp&&<img src={cp} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"/>}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0e]/50 via-[#0c0c0e]/70 to-[#0c0c0e]/95"/>
                    <div className="relative z-10 text-center px-6 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full border border-[#d1d1d6]/10 flex items-center justify-center mb-8"><span className={`${cinzel.className} text-lg text-[#d1d1d6]/30`}>{invitation?.groom_name?.charAt(0)}{invitation?.bride_name?.charAt(0)}</span></div>
                        <p className={`${montserrat.className} text-[9px] tracking-[.6em] uppercase ch mb-6 font-medium`}>The Wedding Of</p>
                        <h1 className={`${bodoni.className} italic text-6xl md:text-8xl lg:text-9xl text-[#f2f2f7] mb-2`}>{invitation?.groom_name?.split(' ')[0]}</h1>
                        <p className={`${cinzel.className} text-xs ch my-3`}>✦ & ✦</p>
                        <h1 className={`${bodoni.className} italic text-6xl md:text-8xl lg:text-9xl text-[#f2f2f7] mb-6`}>{invitation?.bride_name?.split(' ')[0]}</h1>
                        <p className={`${montserrat.className} text-[9px] ch tracking-[.4em] uppercase mb-10 font-light`}>{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                        {guestName&&<div className="mb-8"><p className={`${montserrat.className} text-[8px] text-[#d1d1d6]/15 uppercase tracking-[.3em] mb-1 font-medium`}>Kepada Yth.</p><p className={`${bodoni.className} italic text-2xl ch`}>{guestName}</p></div>}
                        <button onClick={ho} className={`${cinzel.className} border border-[#d1d1d6]/15 px-12 py-4 text-[9px] tracking-[.4em] uppercase text-[#d1d1d6]/60 hover:bg-[#f2f2f7] hover:text-[#1c1c1e] hover:border-[#f2f2f7] transition-all duration-500`}>Buka Undangan</button>
                    </div>
                </div>
            </div>

            <div className={`transition-opacity duration-1000 ${isOpen?'opacity-100':'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col lg:flex-row min-h-screen">
                    <div className="sl5 w-full lg:w-[70%] bg-[#1c1c1e] relative flex flex-col justify-end p-8 md:p-12 lg:p-16">
                        {cp&&<img src={cp} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-35 grayscale"/>}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-[#1c1c1e]/55 to-transparent"/>
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-full border border-[#d1d1d6]/8 flex items-center justify-center mb-6"><span className={`${cinzel.className} text-xs text-[#d1d1d6]/20`}>{invitation?.groom_name?.charAt(0)}{invitation?.bride_name?.charAt(0)}</span></div>
                            <p className={`${montserrat.className} text-[8px] tracking-[.5em] uppercase ch mb-6 font-medium`}>Our Wedding</p>
                            <h1 className={`${bodoni.className} italic text-6xl md:text-7xl lg:text-8xl text-[#f2f2f7] leading-[1] mb-2`}>{invitation?.groom_name?.split(' ')[0]}</h1>
                            <p className={`${cinzel.className} text-xs ch my-2`}>✦</p>
                            <h1 className={`${bodoni.className} italic text-6xl md:text-7xl lg:text-8xl text-[#f2f2f7] leading-[1] mb-8`}>{invitation?.bride_name?.split(' ')[0]}</h1>
                            {invitation?.description&&<p className={`${montserrat.className} text-xs text-[#d1d1d6]/25 leading-relaxed max-w-lg mb-10 font-light`}>"{invitation.description}"</p>}
                            {guestName&&<div className="mb-6"><p className={`${montserrat.className} text-[8px] text-[#d1d1d6]/10 tracking-[.3em] uppercase mb-1 font-medium`}>Dear</p><p className={`${bodoni.className} italic text-2xl ch`}>{guestName}</p></div>}
                        </div>
                        {invitation?.music_url&&<MusicPlayer audioController={audioController} btnBg="bg-[#1c1c1e]" btnColor="ch" btnBorder="border-[#d1d1d6]/10 shadow-2xl" />}
                    </div>

                    <div ref={rpRef} className="w-full lg:w-[30%] lg:h-screen lg:overflow-y-auto sh bg-[#1c1c1e] stripe">
                        <section className="py-20 px-8 text-center m5-rv">
                            <p className={`${montserrat.className} text-[8px] tracking-[.5em] uppercase ch mb-4 font-medium`}>Save The Date</p>
                            <h2 className={`${bodoni.className} italic text-3xl text-[#f2f2f7] mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h2>
                            <p className={`${montserrat.className} text-[9px] text-[#d1d1d6]/15 tracking-[.3em] uppercase mb-10 font-light`}>{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">{[{v:cd.d,l:'Hari'},{v:cd.h,l:'Jam'},{v:cd.m,l:'Menit'},{v:cd.s,l:'Detik'}].map((it,i)=>(<div key={i} className="m5c rounded-2xl py-4 px-2"><p className={`${bodoni.className} italic text-2xl text-[#f2f2f7]`}>{it.v}</p><p className={`${montserrat.className} text-[8px] uppercase tracking-widest ch mt-1 font-medium`}>{it.l}</p></div>))}</div>
                        </section>

                        <section className="px-8 pb-20 m5-rv">
                            <div className="m5cw rounded-3xl p-8 text-center">
                                <p className={`${bodoni.className} italic text-sm leading-relaxed text-[#1c1c1e]/50 mb-4`}>{invitation?.opening_text||'"Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu."'}</p>
                                <p className={`${cinzel.className} text-[9px] text-[#1c1c1e]/25 tracking-[.2em]`}>QS. Ar-Rum Ayat 21</p>
                            </div>
                        </section>

                        {/* Bride & Groom — Oval portrait frames */}
                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 m5-rv"><h2 className={`${cinzel.className} text-xl tracking-[.15em] text-[#f2f2f7]`}>Bride & Groom</h2><p className={`${montserrat.className} text-[8px] text-[#d1d1d6]/12 tracking-[.3em] uppercase mt-2 font-medium`}>Assalamualaikum Wr. Wb.</p><p className={`${montserrat.className} text-[9px] text-[#d1d1d6]/20 mt-3 max-w-md mx-auto leading-relaxed font-light`}>Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:</p></div>

                            <div className="text-center mb-6 m5-rv" data-delay="1">
                                {brP&&<div className="oval-frame w-40 mx-auto mb-6 border-2 border-[#d1d1d6]/10"><img src={brP} alt="Bride" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"/></div>}
                                <p className={`${bodoni.className} italic text-3xl text-[#d1d1d6]/60 mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p>
                                <h3 className={`${cinzel.className} text-lg tracking-[.1em] text-[#f2f2f7] mb-3`}>{invitation?.bride_full_name||invitation?.bride_name}</h3>
                                <p className={`${montserrat.className} text-[10px] text-[#d1d1d6]/20 font-light`}>Putri dari {invitation?.bride_father||'Bapak'} & {invitation?.bride_mother||'Ibu'}</p>
                            </div>
                            <div className="text-center my-5 m5-rv"><p className={`${cinzel.className} text-sm ch`}>✦ & ✦</p></div>
                            <div className="text-center m5-rv" data-delay="2">
                                {grP&&<div className="oval-frame w-40 mx-auto mb-6 border-2 border-[#d1d1d6]/10"><img src={grP} alt="Groom" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"/></div>}
                                <p className={`${bodoni.className} italic text-3xl text-[#d1d1d6]/60 mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p>
                                <h3 className={`${cinzel.className} text-lg tracking-[.1em] text-[#f2f2f7] mb-3`}>{invitation?.groom_full_name||invitation?.groom_name}</h3>
                                <p className={`${montserrat.className} text-[10px] text-[#d1d1d6]/20 font-light`}>Putra dari {invitation?.groom_father||'Bapak'} & {invitation?.groom_mother||'Ibu'}</p>
                            </div>
                        </section>

                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 m5-rv"><h2 className={`${cinzel.className} text-xl tracking-[.15em] text-[#f2f2f7]`}>Wedding Event</h2></div>
                            {invitation?.events&&invitation.events.length>0?[...invitation.events].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((ev,idx)=>(
                                <div key={idx} className="m5cw rounded-3xl p-8 mb-6 text-center m5-rv" data-delay={`${idx+1}`}>
                                    <h3 className={`${cinzel.className} text-lg tracking-[.1em] text-[#1c1c1e] mb-4`}>{ev.name}</h3>
                                    <p className={`${montserrat.className} text-sm text-[#1c1c1e]/40 font-light mb-1`}>{ev.date?new Date(ev.date).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):''}</p>
                                    <p className={`${montserrat.className} text-sm text-[#1c1c1e]/40 font-light mb-3`}>Pukul : {ev.time_start?.substring(0,5)||'TBA'} {ev.time_end?`- ${ev.time_end.substring(0,5)}`:'- Selesai'} WIB</p>
                                    {ev.location&&<p className={`${montserrat.className} text-sm text-[#1c1c1e]/55 pt-3 border-t border-[#1c1c1e]/5`}>{ev.location}</p>}
                                    {(ev.latitude&&ev.longitude)&&<a href={`https://maps.google.com/?q=${ev.latitude},${ev.longitude}`} target="_blank" rel="noreferrer" className={`${cinzel.className} inline-flex items-center gap-2 bg-[#1c1c1e] text-[#f2f2f7] px-6 py-3 text-[9px] tracking-[.15em] hover:bg-[#2c2c2e] transition-all duration-500 mt-4 rounded-lg`}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>Lihat Lokasi</a>}
                                </div>
                            )):<div className="m5cw rounded-3xl p-10 text-center"><h3 className={`${cinzel.className} text-lg tracking-[.1em] text-[#1c1c1e] mb-2`}>Acara Pernikahan</h3></div>}
                        </section>

                        {invitation?.love_stories&&invitation.love_stories.length>0&&<section className="px-8 pb-20"><div className="text-center mb-12 m5-rv"><h2 className={`${cinzel.className} text-xl tracking-[.15em] text-[#f2f2f7]`}>Our Love Story</h2></div>{[...invitation.love_stories].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((s,i)=>(<div key={s.id||i} className="m5cw rounded-3xl p-8 text-center mb-6 m5-rv" data-delay={`${i+1}`}><h3 className={`${cinzel.className} text-lg tracking-[.1em] text-[#1c1c1e] mb-4`}>{s.title}</h3><p className={`${montserrat.className} text-sm text-[#1c1c1e]/50 leading-relaxed font-light`}>{s.description}</p>{s.photo&&<div className="mt-6 rounded-xl overflow-hidden"><img src={gp(s.photo)} alt={s.title} className="w-full h-44 object-cover grayscale"/></div>}</div>))}</section>}

                        <Gallery 
                            layout="abstract"
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={cinzel.className}
                            titleSize="text-xl tracking-[.15em]"
                            accentText="text-[#f2f2f7]"
                            subtitleText="text-[#d1d1d6]"
                            borderColor="border-[#d1d1d6]/10"
                        />

                        <div className="px-8"><QrCheckin guest={guest} sectionBg="bg-transparent" titleFont={cinzel.className} textColor="text-[#d1d1d6]" borderStyle="border-[#d1d1d6]/8"/></div>

                        <section className="px-8 pb-20 m5-rv">
                            <div className="text-center mb-12"><h2 className={`${cinzel.className} text-xl tracking-[.15em] text-[#f2f2f7]`}>Wedding Wishes</h2></div>
                            <div className="m5cw rounded-3xl p-8">
                                <form onSubmit={sw} className="space-y-4">
                                    <div><label className={`${cinzel.className} block text-[8px] tracking-[.15em] text-[#1c1c1e]/25 mb-2`}>Nama</label><input type="text" value={ni} onChange={e=>setNi(e.target.value)} className={`${montserrat.className} w-full bg-white border border-[#1c1c1e]/8 rounded-xl px-5 py-3.5 text-sm text-[#1c1c1e] focus:outline-none focus:border-[#1c1c1e]/20 transition-colors`} placeholder="Nama Anda..."/></div>
                                    <div><label className={`${cinzel.className} block text-[8px] tracking-[.15em] text-[#1c1c1e]/25 mb-2`}>Ucapan</label><textarea value={mi} onChange={e=>setMi(e.target.value)} className={`${montserrat.className} w-full bg-white border border-[#1c1c1e]/8 rounded-xl px-5 py-3.5 text-sm text-[#1c1c1e] h-28 resize-none focus:outline-none focus:border-[#1c1c1e]/20 transition-colors`} placeholder="Tulis ucapan..."/></div>
                                    <button type="submit" disabled={sub} className={`${cinzel.className} w-full bg-[#1c1c1e] text-[#f2f2f7] py-4 rounded-xl text-[9px] tracking-[.2em] hover:bg-[#2c2c2e] transition-colors disabled:opacity-50`}>{sub?'Mengirim...':'Kirim Ucapan'}</button>
                                </form>
                                {ws.length>0&&<div className="mt-8 space-y-3 max-h-[300px] overflow-y-auto sh">{ws.map((m,i)=>(<div key={i} className="bg-white rounded-2xl p-4 border border-[#1c1c1e]/5"><p className={`${montserrat.className} text-sm text-[#1c1c1e]/55 font-light`}>{m.message}</p><div className="flex items-center gap-2 mt-2"><div className="w-6 h-6 rounded-full bg-[#1c1c1e] flex items-center justify-center"><span className="text-[#f2f2f7] text-[9px] font-bold">{m.name?.charAt(0)?.toUpperCase()}</span></div><p className={`${montserrat.className} text-xs text-[#1c1c1e]/25`}>{m.name}</p></div></div>))}</div>}
                            </div>
                        </section>

                        {invitation?.gift_accounts&&invitation.gift_accounts.length>0&&<section className="px-8 pb-20 m5-rv"><div className="text-center mb-12"><h2 className={`${cinzel.className} text-xl tracking-[.15em] text-[#f2f2f7]`}>Wedding Gift</h2></div><div className="space-y-4">{invitation.gift_accounts.map((a,i)=>(<div key={a.id||i} className="m5c rounded-2xl p-6 text-center m5-rv" data-delay={`${i+1}`}><p className={`${cinzel.className} text-sm tracking-[.15em] ch mb-1`}>{a.bank_name}</p><p className={`${montserrat.className} text-[9px] text-[#d1d1d6]/12 uppercase tracking-widest mb-3 font-light`}>A.N. {a.account_holder}</p><p className={`${bodoni.className} italic text-xl text-[#f2f2f7] mb-4`}>{a.account_number}</p><button onClick={()=>{navigator.clipboard.writeText(a.account_number);toast.success('Nomor rekening disalin!');}} className={`${cinzel.className} w-full border border-[#d1d1d6]/8 py-3 text-[9px] tracking-[.15em] ch hover:bg-[#f2f2f7] hover:text-[#1c1c1e] transition-all duration-500 rounded-xl`}>Copy Number</button></div>))}</div></section>}

                        <footer className="py-20 px-8 text-center border-t border-[#d1d1d6]/5 m5-rv">
                            <p className={`${cinzel.className} text-[8px] tracking-[.4em] ch mb-8`}>Thank You</p>
                            <div className="w-24 h-24 rounded-full border border-[#d1d1d6]/8 mx-auto mb-8 flex items-center justify-center"><span className={`${bodoni.className} italic text-3xl text-[#d1d1d6]/25`}>{invitation?.groom_name?.charAt(0)}{invitation?.bride_name?.charAt(0)}</span></div>
                            <h3 className={`${cinzel.className} text-lg tracking-[.1em] text-[#f2f2f7] mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h3>
                            <p className={`${montserrat.className} text-[9px] text-[#d1d1d6]/8 tracking-[.3em] uppercase font-light`}>{ed.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
                            <div className="flex items-center justify-center gap-3 mt-10 ch opacity-20"><div className="h-px w-12 bg-current"/><span className={`${cinzel.className} text-[8px]`}>✦</span><div className="h-px w-12 bg-current"/></div>
                            <div className="mt-12 pt-8 border-t border-[#d1d1d6]/3"><p className={`${cinzel.className} text-[9px] ch tracking-[.3em]`}>Beringinesia</p><p className={`${montserrat.className} text-[7px] text-[#d1d1d6]/6 tracking-[.2em] uppercase mt-1 font-light`}>Digital Invitation</p></div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
