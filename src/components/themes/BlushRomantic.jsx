'use client';
import GiftAtmCard from './partials/GiftAtmCard';
import React, { useEffect, useRef, useState } from 'react';
import { Marcellus, Dancing_Script, Poppins } from 'next/font/google';
import toast from 'react-hot-toast';
import QrCheckin from './partials/QrCheckin';
import VideoEmbed from './partials/VideoEmbed';
import Gallery from './partials/Gallery';
import MusicPlayer from './partials/MusicPlayer';
const marcellus = Marcellus({ subsets: ['latin'], weight: ['400'] });
const dancing = Dancing_Script({ subsets: ['latin'], weight: ['400','500','600','700'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['200','300','400','500','600','700'] });
const SU = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const AU = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
export default function BlushRomantic({ payload, audioController }) {
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
    useEffect(() => { const h = () => { document.querySelectorAll('.br-rv').forEach(el => { if(el.getBoundingClientRect().top < window.innerHeight-50) el.classList.add('active'); }); }; const p=rpRef.current; if(p) p.addEventListener('scroll',h); window.addEventListener('scroll',h); h(); return()=>{ if(p) p.removeEventListener('scroll',h); window.removeEventListener('scroll',h); }; }, [isOpen]);
    const gp = (p) => { if(!p) return null; let ph=p; if(typeof ph==='string'&&ph.startsWith('[')){ try{const x=JSON.parse(ph);if(Array.isArray(x)&&x.length>0)ph=x[0];}catch{} } if(Array.isArray(ph))ph=ph[0]; if(typeof ph==='object'&&ph!==null){if(ph.photo)ph=ph.photo;else if(ph.url)ph=ph.url;else return null;} if(typeof ph!=='string')return null; ph=ph.replace(/\\/g,'/'); if(!ph.startsWith('http')&&!ph.startsWith('/'))ph=`${SU}/${ph}`; return ph; };
    const ho = () => { setIsOpen(true); audioController?.play(); };

    const sw = async(e) => { e.preventDefault(); if(!ni.trim()||!mi.trim())return; setSub(true); try{ await fetch(`${AU}/invitations/${invitation.id}/guestbook`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:ni,message:mi})}); setWs([{name:ni,message:mi,created_at:new Date().toISOString()},...ws]); setMi(''); toast.success('Ucapan terkirim!'); }catch{toast.error('Gagal mengirim ucapan');}finally{setSub(false);} };
    const cp = (()=>{ const c=invitation?.cover_photo; if(!c)return null; return gp(Array.isArray(c)?c[0]:c); })();
    const grP = gp(invitation?.groom_photo); const brP = gp(invitation?.bride_photo);
    const phs = invitation?.gallery?.length>0 ? invitation.gallery.map(g=>g.photo) : (invitation?.photos||[]);
    return (
        <div className={`min-h-screen bg-[#8b3a4a] text-[#fefcfa] ${poppins.className} overflow-hidden`}>
            <style dangerouslySetInnerHTML={{__html:`
                .br-rv{opacity:0;transform:translateY(30px);transition:all .8s cubic-bezier(.16,1,.3,1)}.br-rv.active{opacity:1;transform:translateY(0)}.br-rv[data-delay="1"]{transition-delay:.15s}.br-rv[data-delay="2"]{transition-delay:.3s}
                .rg{position:absolute;width:450px;height:450px;border-radius:50%;background:radial-gradient(circle,rgba(183,110,121,.25) 0%,rgba(183,110,121,.06) 50%,transparent 70%);pointer-events:none;z-index:1;animation:rgA 6s ease-in-out infinite alternate}@keyframes rgA{0%{opacity:.5}100%{opacity:1;transform:scale(1.05)}}
                .bc{background:rgba(254,252,250,.06);border:1px solid rgba(254,252,250,.1);backdrop-filter:blur(12px)}.bcl{background:#fdf2f4;color:#8b3a4a;border:1px solid rgba(183,110,121,.15)}
                .rg-txt{color:#b76e79}.dr{color:#8b3a4a}
                .sl-br{position:sticky;top:0;height:100vh}@media(max-width:1023px){.sl-br{position:relative;height:auto;min-height:100vh}}
                .co-br{position:fixed;inset:0;z-index:9999;transition:transform 1s cubic-bezier(.16,1,.3,1)}.co-br.open{transform:translateY(-100%)}
                .ms-br{animation:msbr 4s linear infinite}@keyframes msbr{from{transform:rotate(0)}to{transform:rotate(360deg)}}
                .sh::-webkit-scrollbar{display:none}.sh{-ms-overflow-style:none;scrollbar-width:none}
                .arch-br{border-radius:200px 200px 0 0;overflow:hidden}
            `}}/>


            <div className={`co-br ${isOpen?'open':''}`}>
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#6b2a3a]">
                    {cp&&<img src={landingPhoto || cp} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-35"/>}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#6b2a3a]/40 via-[#6b2a3a]/65 to-[#6b2a3a]/95"/>
                    <div className="rg" style={{top:'10%',right:'15%'}}/>
                    <div className="relative z-10 text-center px-6 flex flex-col items-center">
                        <svg className="w-8 h-8 rg-txt mb-6 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        <p className={`${marcellus.className} text-[11px] tracking-[.5em] uppercase rg-txt mb-6`}>The Wedding Of</p>
                        <h1 className={`${dancing.className} text-6xl md:text-8xl lg:text-9xl text-[#fefcfa] mb-4`}>{invitation?.groom_name?.split(' ')[0]} <span className="rg-txt">&</span> {invitation?.bride_name?.split(' ')[0]}</h1>
                        <p className="text-xs text-[#fefcfa]/35 tracking-[.3em] uppercase mb-10">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                        {guestName&&<div className="mb-8"><p className="text-[10px] text-[#fefcfa]/25 uppercase tracking-widest mb-1">Kepada Yth.</p><p className={`${dancing.className} text-3xl rg-txt`}>{guestName}</p></div>}
                        <button onClick={ho} className={`${marcellus.className} border border-[#b76e79]/50 px-10 py-4 text-[10px] tracking-[.3em] uppercase rg-txt hover:bg-[#b76e79] hover:text-white transition-all duration-500`}>Buka Undangan</button>
                    </div>
                </div>
            </div>

            <div className={`transition-opacity duration-1000 ${isOpen?'opacity-100':'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col lg:flex-row min-h-screen">
                    <div className="sl-br w-full lg:w-[70%] bg-[#8b3a4a] relative flex flex-col justify-end p-8 md:p-12 lg:p-16">
                        {cp&&<img src={cp} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-50"/>}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#8b3a4a] via-[#8b3a4a]/50 to-transparent"/>
                        <div className="rg" style={{top:'8%',right:'8%'}}/>
                        <div className="relative z-10">
                            <p className={`${marcellus.className} text-[10px] tracking-[.4em] uppercase rg-txt mb-6`}>Our Wedding</p>
                            <h1 className={`${dancing.className} text-6xl md:text-7xl lg:text-8xl text-[#fefcfa] leading-[1.1] mb-8`}>{invitation?.groom_name?.split(' ')[0]} <span className="rg-txt opacity-60">&</span> {invitation?.bride_name?.split(' ')[0]}</h1>
                            {invitation?.quotes&&<p className="text-sm text-[#fefcfa]/35 leading-relaxed max-w-lg mb-10 italic font-light">"{invitation.description}"</p>}
                            {guestName&&<div className="mb-6"><p className="text-[10px] text-[#fefcfa]/20 tracking-widest uppercase mb-1">Dear</p><p className={`${dancing.className} text-3xl rg-txt`}>{guestName}</p></div>}
                        </div>
                        {invitation?.music_url&&<MusicPlayer audioController={audioController} btnBg="bg-[#8b3a4a]" btnColor="text-white" btnBorder="border-[#b76e79]/30" />}
                    </div>

                    <div ref={rpRef} className="w-full lg:w-[30%] lg:h-screen lg:overflow-y-auto sh bg-[#8b3a4a]">
                        <section className="py-20 px-8 text-center br-rv">
                            <p className={`${marcellus.className} text-[10px] tracking-[.4em] uppercase rg-txt mb-4`}>Save The Date</p>
                            <h2 className={`${marcellus.className} text-3xl tracking-wider text-[#fefcfa] mb-2`}>{invitation?.groom_name?.split(' ')[0]} & {invitation?.bride_name?.split(' ')[0]}</h2>
                            <p className="text-xs text-[#fefcfa]/25 mb-10">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">{[{v:cd.d,l:'Hari'},{v:cd.h,l:'Jam'},{v:cd.m,l:'Menit'},{v:cd.s,l:'Detik'}].map((it,i)=>(<div key={i} className="bc rounded-2xl py-4 px-2"><p className={`${marcellus.className} text-2xl rg-txt`}>{it.v}</p><p className="text-[9px] uppercase tracking-widest text-[#fefcfa]/20 mt-1">{it.l}</p></div>))}</div>
                        </section>

                        <section className="px-8 pb-20 br-rv">
                            <div className="bcl rounded-3xl p-8 text-center">
                                <svg className="w-8 h-8 rg-txt mx-auto mb-4 opacity-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                <p className="text-sm leading-relaxed text-[#8b3a4a]/55 italic mb-4 font-light">{invitation?.quotes||'"Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati dan dijadikannya kasih sayang di antara kamu."'}</p>
                                <p className="text-[10px] rg-txt tracking-widest uppercase">{invitation?.quotes_name || 'QS. Ar-Rum Ayat 21'}</p>
                            </div>
                        </section>

                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 br-rv"><h2 className={`${marcellus.className} text-2xl tracking-[.15em] uppercase text-[#fefcfa]`}>Bride & Groom</h2><p className="text-xs text-[#fefcfa]/20 mt-2">Assalamualaikum Wr. Wb.</p><p className="text-xs text-[#fefcfa]/30 mt-3 max-w-md mx-auto leading-relaxed font-light">Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:</p></div>

                            {/* Bride — left photo, right info */}
                            <div className="bcl rounded-3xl p-6 mb-6 br-rv" data-delay="1">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    {brP&&<div className="w-36 h-44 flex-none arch-br border-2 border-[#b76e79]/20"><img src={brP} alt="Bride" className="w-full h-full object-cover"/></div>}
                                    <div className="text-center flex-1">
                                        <p className={`${dancing.className} text-3xl rg-txt mb-1`}>{invitation?.bride_name?.split(' ')[0]}</p>
                                        <h3 className={`${marcellus.className} text-xl tracking-wider text-[#8b3a4a] mb-3`}>{invitation?.bride_full_name||invitation?.bride_name}</h3>
                                        <div className="w-10 h-px bg-[#b76e79]/25 mb-3 mx-auto"/>
                                        <p className="text-sm text-[#8b3a4a]/45 font-light">Putri {invitation?.bride_child_order ? `${invitation.bride_child_order} ` : ""}dari</p>
                                        <p className="text-sm text-[#8b3a4a]/65 font-medium">{invitation?.bride_father||'Bapak'} & {invitation?.bride_mother||'Ibu'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center my-4 br-rv"><span className={`${dancing.className} text-6xl rg-txt`}>&</span></div>
                            {/* Groom — right photo, left info */}
                            <div className="bcl rounded-3xl p-6 br-rv" data-delay="2">
                                <div className="flex flex-col md:flex-row-reverse items-center gap-6">
                                    {grP&&<div className="w-36 h-44 flex-none arch-br border-2 border-[#b76e79]/20"><img src={grP} alt="Groom" className="w-full h-full object-cover"/></div>}
                                    <div className="text-center flex-1">
                                        <p className={`${dancing.className} text-3xl rg-txt mb-1`}>{invitation?.groom_name?.split(' ')[0]}</p>
                                        <h3 className={`${marcellus.className} text-xl tracking-wider text-[#8b3a4a] mb-3`}>{invitation?.groom_full_name||invitation?.groom_name}</h3>
                                        <div className="w-10 h-px bg-[#b76e79]/25 mb-3 mx-auto"/>
                                        <p className="text-sm text-[#8b3a4a]/45 font-light">Putra {invitation?.groom_child_order ? `${invitation.groom_child_order} ` : ""}dari</p>
                                        <p className="text-sm text-[#8b3a4a]/65 font-medium">{invitation?.groom_father||'Bapak'} & {invitation?.groom_mother||'Ibu'}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="px-8 pb-20">
                            <div className="text-center mb-12 br-rv"><h2 className={`${marcellus.className} text-2xl tracking-[.15em] uppercase text-[#fefcfa]`}>Wedding</h2><p className={`${dancing.className} text-4xl rg-txt -mt-1`}>Event</p></div>
                            {invitation?.events&&invitation.events.length>0?[...invitation.events].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((ev,idx)=>(
                                <div key={idx} className="bcl rounded-3xl p-8 mb-6 text-center br-rv" data-delay={`${idx+1}`}>
                                    <h3 className={`${marcellus.className} text-xl tracking-[.15em] uppercase text-[#8b3a4a] mb-4`}>{ev.name}</h3>
                                    <p className="text-sm text-[#8b3a4a]/45 font-light mb-1">{ev.date?new Date(ev.date).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):''}</p>
                                    <p className="text-sm text-[#8b3a4a]/45 font-light mb-3">Pukul : {ev.time_start?.substring(0,5)||'TBA'} {ev.time_end?`- ${ev.time_end.substring(0,5)}`:'- Selesai'} WIB</p>
                                    {ev.location&&<p className="text-sm text-[#8b3a4a]/60 font-medium pt-3 border-t border-[#8b3a4a]/8">{ev.location}</p>}
                                    {(ev.latitude&&ev.longitude)&&<a href={`https://maps.google.com/?q=${ev.latitude},${ev.longitude}`} target="_blank" rel="noreferrer" className={`${marcellus.className} inline-flex items-center gap-2 border border-[#b76e79]/30 px-6 py-3 text-[10px] tracking-[.2em] uppercase rg-txt hover:bg-[#b76e79] hover:text-white transition-all duration-500 mt-4 rounded-lg`}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>Lihat Lokasi</a>}
                                </div>
                            )):<div className="bcl rounded-3xl p-10 text-center"><h3 className={`${marcellus.className} text-xl tracking-wider text-[#8b3a4a] mb-2`}>Acara Pernikahan</h3><p className="text-sm text-[#8b3a4a]/35 font-light">{ed.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div>}
                        </section>

                        {invitation?.love_stories&&invitation.love_stories.length>0&&<section className="px-8 pb-20"><div className="text-center mb-12 br-rv"><h2 className={`${marcellus.className} text-2xl tracking-[.15em] uppercase text-[#fefcfa]`}>Our</h2><p className={`${dancing.className} text-4xl rg-txt -mt-1`}>Love Story</p></div>{[...invitation.love_stories].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((s,i)=>(<div key={s.id||i} className="bcl rounded-3xl p-8 text-center mb-6 br-rv" data-delay={`${i+1}`}><h3 className={`${marcellus.className} text-lg tracking-[.15em] uppercase text-[#8b3a4a] mb-4`}>{s.title}</h3><p className="text-sm text-[#8b3a4a]/55 leading-relaxed font-light">{s.description}</p>{s.photo&&<div className="mt-6 rounded-xl overflow-hidden"><img src={gp(s.photo)} alt={s.title} className="w-full h-44 object-cover"/></div>}</div>))}</section>}

                        <Gallery 
                            layout="abstract"
                            invitation={invitation}
                            sectionBg="bg-transparent"
                            titleFont={marcellus.className}
                            titleSize="text-2xl tracking-[.15em] uppercase"
                            accentText="text-[#fefcfa]"
                            subtitleText="rg-txt"
                            borderColor="border-[#b76e79]/30"
                        />

                        <div className="px-8"><QrCheckin guest={guest} sectionBg="bg-transparent" titleFont={marcellus.className} textColor="text-[#fefcfa]" borderStyle="border-[#b76e79]/20"/></div>

                        <section className="px-8 pb-20 br-rv">
                            <div className="text-center mb-12"><h2 className={`${marcellus.className} text-2xl tracking-[.15em] uppercase text-[#fefcfa]`}>Wedding</h2><p className={`${dancing.className} text-4xl rg-txt -mt-1`}>Wishes</p></div>
                            <div className="bcl rounded-3xl p-8">
                                <form onSubmit={sw} className="space-y-4">
                                    <div><label className={`${marcellus.className} block text-[9px] tracking-[.2em] uppercase text-[#8b3a4a]/35 mb-2`}>Nama</label><input type="text" value={ni} onChange={e=>setNi(e.target.value)} className="w-full bg-[#8b3a4a]/5 border border-[#8b3a4a]/12 rounded-xl px-5 py-3.5 text-sm text-[#8b3a4a] focus:outline-none focus:border-[#b76e79]/50 transition-colors" placeholder="Nama Anda..."/></div>
                                    <div><label className={`${marcellus.className} block text-[9px] tracking-[.2em] uppercase text-[#8b3a4a]/35 mb-2`}>Ucapan</label><textarea value={mi} onChange={e=>setMi(e.target.value)} className="w-full bg-[#8b3a4a]/5 border border-[#8b3a4a]/12 rounded-xl px-5 py-3.5 text-sm text-[#8b3a4a] h-28 resize-none focus:outline-none focus:border-[#b76e79]/50 transition-colors" placeholder="Tulis ucapan..."/></div>
                                    <button type="submit" disabled={sub} className={`${marcellus.className} w-full bg-[#b76e79] text-white py-4 rounded-xl text-[10px] tracking-[.2em] uppercase hover:bg-[#a05e69] transition-colors disabled:opacity-50`}>{sub?'Mengirim...':'Kirim Ucapan'}</button>
                                </form>
                                {ws.length>0&&<div className="mt-8 space-y-3 max-h-[300px] overflow-y-auto sh">{ws.map((m,i)=>(<div key={i} className="bg-[#8b3a4a]/5 rounded-2xl p-4 border border-[#8b3a4a]/8"><p className="text-sm text-[#8b3a4a]/60 font-light">{m.message}</p><div className="flex items-center gap-2 mt-2"><div className="w-6 h-6 rounded-full bg-[#b76e79]/15 flex items-center justify-center"><span className="rg-txt text-[10px] font-bold">{m.name?.charAt(0)?.toUpperCase()}</span></div><p className="text-xs text-[#8b3a4a]/35">{m.name}</p></div></div>))}</div>}
                            </div>
                        </section>

                        {invitation?.gift_accounts&&invitation.gift_accounts.length>0&&<section className="px-8 pb-20 br-rv"><div className="text-center mb-12"><h2 className={`${marcellus.className} text-2xl tracking-[.15em] uppercase text-[#fefcfa]`}>Wedding</h2><p className={`${dancing.className} text-4xl rg-txt -mt-1`}>Gift</p></div><div className="space-y-4">{invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={`${(i % 3) + 1}`} variant="BlushRomantic" />
                            ))}</div></section>}

                        {/* ── FOOTER ── */}
                <footer className="bg-[#1a1a1a] text-[#fefcfa] pt-64 pb-24 px-8 text-center relative overflow-hidden">
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
                        <h2 className={`${cormorant.className} text-5xl mb-4 text-[#fefcfa] drop-shadow-sm`}>
                            {invitation?.groom_name?.split(' ')[0]} <span className="text-white/50 font-light mx-2">&</span> {invitation?.bride_name?.split(' ')[0]}
                        </h2>
                        
                        {/* Branding */}
                        <div className="border-t border-[#fefcfa]/10 pt-8 mt-12">
                            <p className="text-[9px] text-[#fefcfa]/40 tracking-[0.2em] uppercase mb-2">Digital Invitation by</p>
                            <a href="https://digitvitation.my.id" target="_blank" rel="noreferrer" className="inline-block text-white/80 hover:text-white transition-colors">
                                <span className={`${cormorant.className} text-lg font-bold tracking-wider uppercase`}>Digivitation</span>
                            </a>
                            <p className="text-[8px] text-[#fefcfa]/30 mt-2 tracking-wider">© {new Date().getFullYear()} Digivitation. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
