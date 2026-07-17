'use client';

import React from 'react';

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function VideoEmbed({ invitation, sectionBg = 'bg-transparent', textColor = 'text-current', borderColor = 'border-white/10' }) {
    const videoUrl = invitation?.live_streaming_link || invitation?.background_video_url || invitation?.video_url;

    if (!videoUrl || (typeof videoUrl === 'string' && videoUrl.trim() === '')) return null;

    const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    const isMp4 = videoUrl.match(/\.(mp4|webm|ogg|mov)$/i) || (!videoUrl.startsWith('http') && !isYoutube);

    let embedUrl = null;
    if (isYoutube) {
        if (videoUrl.includes('watch?v=')) {
            embedUrl = `https://www.youtube.com/embed/${videoUrl.split('watch?v=')[1].split('&')[0]}`;
        } else if (videoUrl.includes('youtu.be/')) {
            embedUrl = `https://www.youtube.com/embed/${videoUrl.split('youtu.be/')[1].split('?')[0]}`;
        } else if (videoUrl.includes('/live/')) {
            embedUrl = `https://www.youtube.com/embed/${videoUrl.split('/live/')[1].split('?')[0]}`;
        } else if (videoUrl.includes('/embed/')) {
            embedUrl = `https://www.youtube.com/embed/${videoUrl.split('/embed/')[1].split('?')[0]}`;
        } else {
            embedUrl = videoUrl;
        }
    }

    return (
        <div className={`w-full ${sectionBg} mb-12`}>
            {isYoutube || isMp4 ? (
                <>
                    <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl relative pt-[56.25%] bg-black/5 flex items-center justify-center group cv-card">
                        {isYoutube ? (
                            <iframe 
                                className="absolute inset-0 w-full h-full"
                                src={embedUrl} 
                                title="Video Streaming" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen>
                            </iframe>
                        ) : (
                            <video 
                                controls 
                                className="absolute inset-0 w-full h-full object-cover" 
                                src={videoUrl.startsWith('http') ? videoUrl : `${STORAGE_URL}/${videoUrl}`} 
                            />
                        )}
                        <div className={`absolute inset-0 border-2 ${borderColor} rounded-3xl pointer-events-none transition-colors duration-500`}></div>
                    </div>
                    {invitation?.live_streaming_link && (
                        <div className="text-center mt-4">
                            <a
                                href={invitation.live_streaming_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-current/20 hover:bg-black/10 transition-colors text-xs font-medium"
                            >
                                <span>Buka Tautan Live Streaming</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                            </a>
                        </div>
                    )}
                </>
            ) : (
                <div className="max-w-xl mx-auto rounded-3xl p-8 bg-black/5 border border-current/10 text-center flex flex-col items-center justify-center gap-4 cv-card shadow-xl">
                    <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-1">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>
                    <h4 className="font-bold text-base tracking-wide">Live Streaming / Virtual Room</h4>
                    <p className="text-xs opacity-75 max-w-sm leading-relaxed">
                        Saksikan prosesi pernikahan kami secara virtual melalui tautan live streaming berikut.
                    </p>
                    <a
                        href={videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        <span>Gabung / Tonton Live Streaming</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </a>
                </div>
            )}
            <div className="text-center mt-6 reveal">
                <p className={`text-[10px] uppercase tracking-widest font-bold opacity-60 ${textColor}`}>Live Streaming / Virtual Event</p>
                <div className={`h-px w-24 mx-auto mt-4 bg-current opacity-20 ${textColor}`}></div>
            </div>
        </div>
    );
}
