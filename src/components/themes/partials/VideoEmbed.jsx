'use client';

import React from 'react';

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

export default function VideoEmbed({ invitation, sectionBg = 'bg-transparent', textColor = 'text-current', borderColor = 'border-white/10' }) {
    const videoUrl = invitation?.background_video_url || invitation?.video_url;

    if (!videoUrl) return null;

    const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    const embedUrl = isYoutube 
        ? (videoUrl.includes('watch?v=') 
            ? videoUrl.replace('watch?v=', 'embed/').split('&')[0] 
            : videoUrl.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0])
        : null;

    return (
        <div className={`w-full ${sectionBg} mb-12`}>
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
                {/* Optional subtle border overlay */}
                <div className={`absolute inset-0 border-2 ${borderColor} rounded-3xl pointer-events-none transition-colors duration-500`}></div>
            </div>
            <div className="text-center mt-6 reveal">
                <p className={`text-[10px] uppercase tracking-widest font-bold opacity-60 ${textColor}`}>Live Streaming / Virtual Event</p>
                <div className={`h-px w-24 mx-auto mt-4 bg-current opacity-20 ${textColor}`}></div>
            </div>
        </div>
    );
}
