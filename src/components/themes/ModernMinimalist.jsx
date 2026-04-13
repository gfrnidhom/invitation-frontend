'use client';

import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import CoverOverlay from './partials/CoverOverlay';
import CoupleProfile from './partials/CoupleProfile';
import Gallery from './partials/Gallery';
import Events from './partials/Events';
import LoveStory from './partials/LoveStory';
import GiftAccounts from './partials/GiftAccounts';
import Guestbook from './partials/Guestbook';
import QrCheckin from './partials/QrCheckin';
import BottomNav from './partials/BottomNav';
import MusicPlayer from './partials/MusicPlayer';
import TurutMengundang from './partials/TurutMengundang';

const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://app.digitvitation.my.id/storage';

export default function ModernMinimalist({ payload, audioController }) {
    const { invitation, guestName, guest } = payload;
    const audioRef = useRef(null);

    // Countdown state
    const [timeLeft, setTimeLeft] = useState({ days: '--', hours: '--', minutes: '--', seconds: '--' });

    useEffect(() => {
        if (!invitation?.event_date) return;
        
        // Parse "YYYY-MM-DD" and "HH:MM"
        const dateStr = invitation.event_date.split('T')[0];
        const timeStr = invitation.event_time ? invitation.event_time.split('-')[0].trim() : '08:00';
        const targetDate = new Date(`${dateStr}T${timeStr}`);

        const timer = setInterval(() => {
            const diff = targetDate - new Date();
            if (diff <= 0) {
                clearInterval(timer);
                setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
                return;
            }
            setTimeLeft({
                days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
                hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
                minutes: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
                seconds: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [invitation?.event_date, invitation?.event_time]);

    // Scroll Reveal Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { 
                if (entry.isIntersecting) { 
                    entry.target.classList.add('visible'); 
                } 
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.reveal');
        elements.forEach(el => observer.observe(el));

        return () => elements.forEach(el => observer.unobserve(el));
    }, []);



    const handleOpenInvitation = () => {
        if (audioController) audioController.play();
    };

    const formatDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        } catch(e) { return dateStr; }
    };

    const getDayName = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { weekday: 'long' });
        } catch(e) { return ''; }
    };

    return (
        <div className="bg-white text-gray-900 font-body antialiased" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                .font-heading { font-family: 'Space Grotesk', sans-serif; }
                .font-body { font-family: 'Outfit', sans-serif; }
                .reveal { opacity: 0; transform: translateY(40px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .reveal.visible { opacity: 1; transform: translateY(0); }
            `}</style>

            <CoverOverlay invitation={invitation} guestName={guestName} onOpen={handleOpenInvitation} />

            {/* Audio Toggle */}
            {invitation?.music_url && (
                <MusicPlayer audioController={audioController} btnBg="bg-gray-900" btnColor="text-white" btnBorder="none shadow-2xl" />
            )}

            {/* Hero */}
            <section id="home" className="min-h-[100dvh] flex flex-col md:flex-row relative">
                {/* Photo Side */}
                {invitation?.cover_photo && (
                    <div className="w-full md:w-1/2 h-[50dvh] md:h-[100dvh] relative overflow-hidden">
                        <img src={(() => { const cp = Array.isArray(invitation.cover_photo) ? invitation.cover_photo[0] : invitation.cover_photo; return cp?.startsWith?.('http') ? cp : `${storageUrl}/${cp}`; })()} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent to-white/20"></div>
                    </div>
                )}

                {/* Text Side */}
                <div className={`w-full ${invitation?.cover_photo ? 'md:w-1/2' : ''} flex flex-col items-center justify-center text-center px-8 py-20 md:py-0`}>
                    {guestName && (
                        <>
                            <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Teruntuk</p>
                            <p className="font-sans font-semibold text-lg text-gray-800 mb-10">{guestName}</p>
                        </>
                    )}

                    <p className="font-body text-xs tracking-[0.5em] uppercase text-gray-400 mb-8">The Wedding Of</p>
                    <h1 className="font-heading text-7xl md:text-9xl font-bold tracking-tight text-gray-900 leading-none">
                        {invitation?.groom_name}
                    </h1>
                    <div className="my-6 flex items-center gap-4">
                        <div className="w-16 h-px bg-gray-900"></div>
                        <span className="font-heading text-lg text-gray-400">&</span>
                        <div className="w-16 h-px bg-gray-900"></div>
                    </div>
                    <h1 className="font-heading text-7xl md:text-9xl font-bold tracking-tight text-gray-900 leading-none">
                        {invitation?.bride_name}
                    </h1>
                    {invitation?.event_date && (
                        <p className="mt-12 font-body text-sm tracking-widest text-gray-400 uppercase">
                            {formatDate(invitation.event_date)}
                        </p>
                    )}
                </div>
            </section>

            <CoupleProfile invitation={invitation} sectionBg="bg-white" cardBg="bg-gray-50" />

            {/* Turut Mengundang */}
            <TurutMengundang 
                invitation={invitation}
                sectionBg="bg-white"
                accentText="text-gray-700"
                subtitleText="text-gray-400"
                borderColor="border-gray-300"
            />

            {/* Description */}
            {invitation?.quotes && (
                <section className="px-6 py-24 max-w-xl mx-auto text-center reveal">
                    <div className="w-8 h-8 mx-auto mb-6 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>
                    </div>
                    <p className="font-body text-lg leading-relaxed text-gray-500">"{invitation.quotes}"</p>
                    {invitation?.quotes_name && <p className="font-body text-xs tracking-widest text-gray-400 uppercase mt-4">{invitation.quotes_name}</p>}
                </section>
            )}

            {/* Active Event Hero Detail */}
            <section className="px-6 py-24 bg-gray-950 text-white reveal">
                <div className="max-w-4xl mx-auto">
                    <p className="font-body text-xs tracking-[0.5em] uppercase text-gray-500 mb-8 text-center">Save The Date</p>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-4">When</p>
                            <p className="font-heading text-2xl font-semibold">{getDayName(invitation?.event_date)}</p>
                            <p className="font-body text-gray-400 mt-2">{formatDate(invitation?.event_date)}</p>
                            {invitation?.event_time && (
                                <p className="font-body text-gray-400">{invitation.event_time} WIB</p>
                            )}
                        </div>
                        <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-4">Where</p>
                            <p className="font-heading text-2xl font-semibold">{invitation?.location || 'Venue'}</p>
                            {(invitation?.latitude && invitation?.longitude) && (
                                <a href={`https://maps.google.com/?q=${invitation.latitude},${invitation.longitude}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white/60 text-sm mt-4 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                                    View on Maps
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Countdown */}
                    <div className="mt-16 flex items-center justify-center gap-8 md:gap-16">
                        <div className="text-center">
                            <p className="font-heading text-5xl md:text-6xl font-bold">{timeLeft.days}</p>
                            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-gray-500 mt-2">Days</p>
                        </div>
                        <div className="text-white/20 font-heading text-4xl">:</div>
                        <div className="text-center">
                            <p className="font-heading text-5xl md:text-6xl font-bold">{timeLeft.hours}</p>
                            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-gray-500 mt-2">Hours</p>
                        </div>
                        <div className="text-white/20 font-heading text-4xl">:</div>
                        <div className="text-center">
                            <p className="font-heading text-5xl md:text-6xl font-bold">{timeLeft.minutes}</p>
                            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-gray-500 mt-2">Min</p>
                        </div>
                        <div className="text-white/20 font-heading text-4xl">:</div>
                        <div className="text-center">
                            <p className="font-heading text-5xl md:text-6xl font-bold">{timeLeft.seconds}</p>
                            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-gray-500 mt-2">Sec</p>
                        </div>
                    </div>
                </div>
            </section>

            <Gallery layout="abstract" invitation={invitation} />
            <Events invitation={invitation} sectionBg="bg-white" accentText="text-gray-900" accentBg="bg-gray-900" cardBg="bg-gray-50" iconBg="bg-gray-200/50" btnBorder="border-gray-200" btnHoverBg="bg-gray-100" />
            <LoveStory invitation={invitation} sectionBg="bg-gray-50" accentText="text-gray-900" accentBg="bg-gray-900" lineBg="bg-gray-300" dotBg="bg-gray-900" cardBg="bg-white" />
            <GiftAccounts variant="ModernMinimalist" invitation={invitation} sectionBg="bg-white" accentText="text-gray-900" accentBg="bg-gray-900" cardBg="bg-gray-50" iconBg="bg-gray-200/50" btnBorder="border-gray-200" btnHoverBg="bg-gray-100" />
            <QrCheckin guest={guest} sectionBg='bg-transparent' />
            <Guestbook invitation={invitation} guestName={guestName} guestToken={guest?.token} />

            {/* Footer */}
            <footer className="py-16 text-center border-t border-gray-100 bg-white relative z-10">
                <p className="font-heading text-3xl font-bold text-gray-900">{invitation?.groom_name} & {invitation?.bride_name}</p>
                <p className="font-body text-xs tracking-widest text-gray-400 uppercase mt-3">We look forward to celebrating with you</p>
            </footer>

            <BottomNav />
        </div>
    );
}
