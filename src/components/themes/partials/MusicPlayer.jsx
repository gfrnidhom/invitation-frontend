'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function MusicPlayer({
  musicUrl,
  btnBg = 'bg-white',
  btnColor = 'text-gray-800',
  btnBorder = 'border-gray-200'
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Attempt auto-play when permitted
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    } else if (audioRef.current && !isPlaying) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!musicUrl) return null;

  return (
    <>
      <audio ref={audioRef} src={musicUrl} loop />
      <button 
        onClick={togglePlay} 
        className={`fixed bottom-24 md:bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 ${btnBg} ${btnColor} ${btnBorder}`}
      >
        <svg 
          className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          viewBox="0 0 24 24"
        >
          {isPlaying ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>
          )}
        </svg>
      </button>
    </>
  );
}
