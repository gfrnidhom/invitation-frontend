'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Bebas_Neue, Allura, Inter } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import VideoEmbed from './partials/VideoEmbed';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';
const bebas = Bebas_Neue({ subsets: ['latin'], weight: ['400'] });
const allura = Allura({ subsets: ['latin'], weight: ['400'] });
const inter = Inter({ subsets: ['latin'], weight: ['200','300','400','500','600','700','800'] });
const SU = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const AU = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
export default function MonoChrome({ payload, audioController }) {
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
    useEffect(() => { const h = () => { document.querySelectorAll('.mc-rv').forEach(el => { if(el.getBoundingClientRect().top < window.innerHeight-50) el.classList.add('active'); }); }; const p=rpRef.current; if(p) p.addEventListener('scroll',h); window.addEventListener('scroll',h); h(); return()=>{ if(p) p.removeEventListener('scroll',h); window.removeEventListener('scroll',h); }; }, [isOpen]);
    const gp = (p) => { if(!p) return null; let ph=p; if(typeof ph==='string'&&ph.startsWith('[')){ try{const x=JSON.parse(ph);if(Array.isArray(x)&&x.length>0)ph=x[0];}catch{} } if(Array.isArray(ph))ph=ph[0]; if(typeof ph==='object'&&ph!==null){if(ph.photo)ph=ph.photo;else if(ph.url)ph=ph.url;else return null;} if(typeof ph!=='string')return null; ph=ph.replace(/\\/g,'/'); if(!ph.startsWith('http')&&!ph.startsWith('/'))ph=`${SU}/${ph}`; return ph; };
    const ho = () => { setIsOpen(true); audioController?.play(); };

    const sw = async(e) => { e.preventDefault(); if(!ni.trim()||!mi.trim())return; setSub(true); try{ await fetch(`${AU}/invitations/${invitation.id}/guestbook`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:ni,message:mi})}); setWs([{name:ni,message:mi,created_at:new Date().toISOString()},...ws]); setMi(''); toast.success('Ucapan terkirim!'); }catch{toast.error('Gagal mengirim ucapan');}finally{setSub(false);} };
    const cp = (()=>{ const c=invitation?.cover_photo; if(!c)return null; return gp(Array.isArray(c)?c[0]:c); })();
    const grP = gp(invitation?.groom_photo); const brP = gp(invitation?.bride_photo);
    const phs = invitation?.gallery?.length>0 ? invitation.gallery.map(g=>g.photo) : (invitation?.photos||[]);
    return (
        <div className={`min-h-screen bg-black text-white ${inter.className} overflow-hidden`}>
            <style dangerouslySetInnerHTML={{__html:`
                .mc-rv{opacity:0;transform:translateY(30px);transition:all .8s cubic-bezier(.16,1,.3,1)}.mc-rv.active{opacity:1;transform:translateY(0)}.mc-rv[data-delay="1"]{transition-delay:.15s}.mc-rv[data-delay="2"]{transition-delay:.3s}
                .mc-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}.mc-card-w{background:#fff;color:#000;border:1px solid rgba(0,0,0,.05)}
                .sl-mc{position:sticky;top:0;height:100vh}@media(max-width:1023px){.sl-mc{position:relative;height:auto;min-height:100vh}}
                .co-mc{position:fixed;inset:0;z-index:9999;transition:transform 1s cubic-bezier(.16,1,.3,1)}.co-mc.open{transform:translateY(-100%)}
                .ms-mc{animation:msmc 4s linear infinite}@keyframes msmc{from{transform:rotate(0)}to{transform:rotate(360deg)}}
                .sh::-webkit-scrollbar{display:none}.sh{-ms-overflow-style:none;scrollbar-width:none}
                .photo-overlay{position:relative;overflow:hidden}.photo-overlay::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 50%)}
            `}}/>


            <div className={`co-mc ${isOpen?'open':''}`}>
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                    {cp&&<img src={cp} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"/>}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/95"/>
                    <div className="relative z-10 text-center px-6 flex flex-col items-center">
                        <p className={`${bebas.className} text-sm md:text-base tracking-[.6em] uppercase text-white/40 mb-6`}>The Wedding Of</p>
                        <h1 className={`${bebas.className} text-7xl md:text-9xl lg:text-[10rem] text-white mb-2 leading-[0.9]`}>{invitation?.groom_name?.split(' ')[0]}</h1>
                        <p className={`${allura.className} text-5xl text-white/30 my-2`}>&</p>
                        <h1 className={`${bebas.className} text-7xl md:text-9xl lg:text-[10rem] text-white mb-6 leading-[0.9]`}>{invitation?.bride_name?.split(' ')[0]}</h1>
                        <p className="text-[10px] text-white/30 tracking-[.4em] uppercase mb-10">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                        {guestName&&<div className="mb-8"><p className="text-[9px] text-white/20 uppercase tracking-[.3em] mb-1">Kepada Yth.</p><p className={`${allura.className} text-3xl text-white/70`}>{guestName}</p></div>}
                        <button onClick={ho} className={`${bebas.className} border border-white/20 px-12 py-4 text-sm tracking-[.4em] uppercase text-white/70 hover:bg-white hover:text-black transition-all duration-500`}>Buka Undangan</button>
                    </div>
                </div>
            </div>

            <div className={`transition-opacity duration-1000 ${isOpen?'opacity-100':'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col lg:flex-row min-h-screen">
                    <div className="sl-mc w-full lg:w-[70%] bg-black relative flex flex-col justify-end p-8 md:p-12 lg:p-16">
                        {cp&&<img src={cp} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"/>}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"/>
                        <div className="relative z-10">
                            <p className={`${bebas.className} text-xs tracking-[.5em] uppercase text-white/30 mb-6`}>Our Wedding</p>
                            <h1 className={`${bebas.className} text-7xl md:text-8xl lg:text-9xl text-white leading-[0.85] mb-4`}>{invitation?.groom_name?.split(' ')[0]}</h1>
                            <p className={`${allura.className} text-4xl text-white/20 mb-4`}>&</p>
                            <h1 className={`${bebas.className} text-7xl md:text-8xl lg:text-9xl text-white leading-[0.85] mb-8`}>{invitation?.bride_name?.split(' ')[0]}</h1>
                            {invitation?.description&&<p className="text-xs text-white/30 leading-relaxed max-w-lg mb-10 font-light">"{invitation.description}"</p>}
                            {guestName&&<div className="mb-6"><p className="text-[9px] text-white/15 tracking-[.3em] uppercase mb-1">Dear</p><p className={`${allura.className} text-3xl text-white/60`}>{guestName}</p></div>}
                        </div>
                        {invitation?.music_url&&<MusicPlayer audioController={audioController} btnBg="bg-black" btnColor="text-white/60" btnBorder="border-white/15 shadow-2xl" />}
                    </div>

                    <div ref={rpRef} className="w-full lg:w-[30%] lg:h-screen lg:overflow-y-auto sh bg-black">
                        <section className="py-20 px-8 text-center mc-rv">
                            <p className={`${bebas.className} text-xs tracking-[.5em] uppercase text-white/25 mb-4`}>Save The Date</p>
                            <h2 className={`${bebas.className} text-4xl tracking-wider text-white mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h2>
                            <p className="text-[10px] text-white/20 tracking-[.3em] uppercase mb-10">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">{[{v:cd.d,l:'DAYS'},{v:cd.h,l:'HRS'},{v:cd.m,l:'MIN'},{v:cd.s,l:'SEC'}].map((it,i)=>(<div key={i} className="mc-card rounded-xl py-4 px-2"><p className={`${bebas.className} text-3xl text-white`}>{it.v}</p><p className="text-[8px] uppercase tracking-[.3em] text-white/20 mt-1">{it.l}</p></div>))}</div>
                        </section>

                        <section className="px-8 pb-20 mc-rv">
                            <div className="mc-card-w rounded-3xl p-8 text-center">
                                <p className="text-sm leading-relaxed text-black/50 italic mb-4 font-light">{invitation?.opening_text||'"Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu."'}</p>
                                <p className="text-[10px] text-black/30 tracking-[.3em] uppercase">QS. Ar-Rum Ayat 21</p>
                            </div>
                        </section>

                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 mc-rv"><h2 className={`${bebas.className} text-3xl tracking-[.2em] uppercase text-white`}>Bride & Groom</h2><p className="text-[10px] text-white/15 tracking-[.3em] uppercase mt-2">Assalamualaikum Wr. Wb.</p><p className="text-[10px] text-white/25 mt-3 max-w-md mx-auto leading-relaxed font-light">Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:</p></div>

                            {/* Bride — Full width photo with name overlay */}
                            <div className="mb-8 mc-rv" data-delay="1">
                                {brP&&<div className="photo-overlay rounded-2xl mb-4 aspect-[4/5]"><img src={brP} alt="Bride" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"/><div className="absolute bottom-6 left-6 right-6 z-10"><p className={`${allura.className} text-3xl text-white/80 mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p><h3 className={`${bebas.className} text-2xl tracking-[.15em] uppercase text-white`}>{invitation?.bride_full_name||invitation?.bride_name}</h3></div></div>}
                                {!brP&&<div className="text-center"><p className={`${allura.className} text-3xl text-white/60 mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p><h3 className={`${bebas.className} text-2xl tracking-[.15em] uppercase text-white`}>{invitation?.bride_full_name||invitation?.bride_name}</h3></div>}
                                <div className="text-center mt-3"><p className="text-[10px] text-white/25 font-light">Putri dari {invitation?.bride_father||'Bapak'} & {invitation?.bride_mother||'Ibu'}</p></div>
                            </div>

                            <div className="text-center my-6 mc-rv"><div className="w-px h-12 bg-white/10 mx-auto"/><span className={`${bebas.className} text-4xl text-white/15 my-3 block`}>&</span><div className="w-px h-12 bg-white/10 mx-auto"/></div>

                            {/* Groom */}
                            <div className="mc-rv" data-delay="2">
                                {grP&&<div className="photo-overlay rounded-2xl mb-4 aspect-[4/5]"><img src={grP} alt="Groom" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"/><div className="absolute bottom-6 left-6 right-6 z-10"><p className={`${allura.className} text-3xl text-white/80 mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p><h3 className={`${bebas.className} text-2xl tracking-[.15em] uppercase text-white`}>{invitation?.groom_full_name||invitation?.groom_name}</h3></div></div>}
                                {!grP&&<div className="text-center"><p className={`${allura.className} text-3xl text-white/60 mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p><h3 className={`${bebas.className} text-2xl tracking-[.15em] uppercase text-white`}>{invitation?.groom_full_name||invitation?.groom_name}</h3></div>}
                                <div className="text-center mt-3"><p className="text-[10px] text-white/25 font-light">Putra dari {invitation?.groom_father||'Bapak'} & {invitation?.groom_mother||'Ibu'}</p></div>
                            </div>
                        </section>

                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 mc-rv"><h2 className={`${bebas.className} text-3xl tracking-[.2em] uppercase text-white`}>Wedding Event</h2></div>
                            {invitation?.events&&invitation.events.length>0?[...invitation.events].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((ev,idx)=>(
                                <div key={idx} className="mc-card rounded-2xl p-8 mb-6 text-center mc-rv" data-delay={`${idx+1}`}>
                                    <h3 className={`${bebas.className} text-2xl tracking-[.2em] uppercase text-white mb-4`}>{ev.name}</h3>
                                    <p className="text-xs text-white/30 font-light mb-1">{ev.date?new Date(ev.date).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):''}</p>
                                    <p className="text-xs text-white/30 font-light mb-3">Pukul : {ev.time_start?.substring(0,5)||'TBA'} {ev.time_end?`- ${ev.time_end.substring(0,5)}`:'- Selesai'} WIB</p>
                                    {ev.location&&<p className="text-xs text-white/40 pt-3 border-t border-white/5">{ev.location}</p>}
                                    {(ev.latitude&&ev.longitude)&&<a href={`https://maps.google.com/?q=${ev.latitude},${ev.longitude}`} target="_blank" rel="noreferrer" className={`${bebas.className} inline-flex items-center gap-2 border border-white/15 px-6 py-3 text-xs tracking-[.2em] uppercase text-white/50 hover:bg-white hover:text-black transition-all duration-500 mt-4`}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>Lihat Lokasi</a>}
                                </div>
                            )):<div className="mc-card rounded-2xl p-10 text-center"><h3 className={`${bebas.className} text-2xl tracking-[.2em] uppercase text-white mb-2`}>Acara Pernikahan</h3><p className="text-xs text-white/25 font-light">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div>}
                        </section>

                        {invitation?.love_stories&&invitation.love_stories.length>0&&<section className="px-8 pb-20"><div className="text-center mb-12 mc-rv"><h2 className={`${bebas.className} text-3xl tracking-[.2em] uppercase text-white`}>Our Love Story</h2></div>{[...invitation.love_stories].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((s,i)=>(<div key={s.id||i} className="mc-card-w rounded-2xl p-8 text-center mb-6 mc-rv" data-delay={`${i+1}`}><h3 className={`${bebas.className} text-xl tracking-[.15em] uppercase mb-4`}>{s.title}</h3><p className="text-sm text-black/50 leading-relaxed font-light">{s.description}</p>{s.photo&&<div className="mt-6 rounded-xl overflow-hidden"><img src={gp(s.photo)} alt={s.title} className="w-full h-44 object-cover grayscale"/></div>}</div>))}</section>}

                        <Gallery 
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={bebas.className}
                            titleSize="text-3xl tracking-[.2em] uppercase"
                            accentText="text-white"
                            subtitleText="text-white/50"
                            borderColor="border-white/10"
                        />

                        <div className="px-8"><QrCheckin guest={guest} sectionBg="bg-transparent" titleFont={bebas.className} textColor="text-white" borderStyle="border-white/10"/></div>

                        <section className="px-8 pb-20 mc-rv">
                            <div className="text-center mb-12"><h2 className={`${bebas.className} text-3xl tracking-[.2em] uppercase text-white`}>Wedding Wishes</h2></div>
                            <div className="mc-card-w rounded-2xl p-8">
                                <form onSubmit={sw} className="space-y-4">
                                    <div><label className={`${bebas.className} block text-xs tracking-[.2em] uppercase text-black/30 mb-2`}>Nama</label><input type="text" value={ni} onChange={e=>setNi(e.target.value)} className="w-full bg-black/3 border border-black/8 rounded-lg px-5 py-3.5 text-sm text-black focus:outline-none focus:border-black/30 transition-colors" placeholder="Nama Anda..."/></div>
                                    <div><label className={`${bebas.className} block text-xs tracking-[.2em] uppercase text-black/30 mb-2`}>Ucapan</label><textarea value={mi} onChange={e=>setMi(e.target.value)} className="w-full bg-black/3 border border-black/8 rounded-lg px-5 py-3.5 text-sm text-black h-28 resize-none focus:outline-none focus:border-black/30 transition-colors" placeholder="Tulis ucapan..."/></div>
                                    <button type="submit" disabled={sub} className={`${bebas.className} w-full bg-black text-white py-4 rounded-lg text-sm tracking-[.3em] uppercase hover:bg-gray-800 transition-colors disabled:opacity-50`}>{sub?'Mengirim...':'Kirim Ucapan'}</button>
                                </form>
                                {ws.length>0&&<div className="mt-8 space-y-3 max-h-[300px] overflow-y-auto sh">{ws.map((m,i)=>(<div key={i} className="bg-black/3 rounded-xl p-4 border border-black/5"><p className="text-sm text-black/55 font-light">{m.message}</p><div className="flex items-center gap-2 mt-2"><div className="w-6 h-6 rounded-full bg-black flex items-center justify-center"><span className="text-white text-[10px] font-bold">{m.name?.charAt(0)?.toUpperCase()}</span></div><p className="text-xs text-black/30">{m.name}</p></div></div>))}</div>}
                            </div>
                        </section>

                        {invitation?.gift_accounts&&invitation.gift_accounts.length>0&&<section className="px-8 pb-20 mc-rv"><div className="text-center mb-12"><h2 className={`${bebas.className} text-3xl tracking-[.2em] uppercase text-white`}>Wedding Gift</h2></div><div className="space-y-4">{invitation.gift_accounts.map((a,i)=>(<div key={a.id||i} className="mc-card rounded-2xl p-6 text-center mc-rv" data-delay={`${i+1}`}><p className={`${bebas.className} text-sm tracking-[.3em] uppercase text-white/60 mb-1`}>{a.bank_name}</p><p className="text-[10px] text-white/15 uppercase tracking-widest mb-3">A.N. {a.account_holder}</p><p className={`${bebas.className} text-2xl text-white mb-4`}>{a.account_number}</p><button onClick={()=>{navigator.clipboard.writeText(a.account_number);toast.success('Nomor rekening disalin!');}} className={`${bebas.className} w-full border border-white/10 py-3 text-xs tracking-[.3em] uppercase text-white/40 hover:bg-white hover:text-black transition-all duration-500 rounded-lg`}>Copy Number</button></div>))}</div></section>}

                        <footer className="py-20 px-8 text-center border-t border-white/5 mc-rv">
                            <p className={`${bebas.className} text-xs tracking-[.5em] uppercase text-white/15 mb-8`}>Thank You</p>
                            <div className="w-20 h-20 border border-white/8 mx-auto mb-8 flex items-center justify-center"><span className={`${bebas.className} text-3xl text-white/30`}>{invitation?.groom_name?.charAt(0)}{invitation?.bride_name?.charAt(0)}</span></div>
                            <h3 className={`${bebas.className} text-xl tracking-[.2em] uppercase text-white mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h3>
                            <p className="text-[10px] text-white/10 tracking-[.3em] uppercase">{ed.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
                            <div className="flex items-center justify-center gap-4 mt-10 text-white/8"><div className="h-px w-16 bg-current"/><div className="w-1.5 h-1.5 bg-current"/><div className="h-px w-16 bg-current"/></div>
                            <div className="mt-12 pt-8 border-t border-white/3"><p className={`${bebas.className} text-sm text-white/20 tracking-[.4em] uppercase`}>Digivitation</p><p className="text-[8px] text-white/8 tracking-[.3em] uppercase mt-1">Digital Invitation</p></div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
