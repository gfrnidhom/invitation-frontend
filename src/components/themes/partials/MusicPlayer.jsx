'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function MusicPlayer({
  musicUrl,
  shouldPlay = false,
  btnBg = 'bg-white',
  btnColor = 'text-gray-800',
  btnBorder = 'border-gray-200'
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioUnlocked = useRef(false);

  // iOS/Mobile Browser Audio Unlock Trick
  // Safari blocks any audio.play() that isn't DIRECTLY in an onClick handler.
  // By executing a muted play/pause on the very FIRST click on the entire screen 
  // (which is usually the "Buka Undangan" button), we "unlock" the audio element forever.
  useEffect(() => {
    const unlockAudioContext = () => {
      if (audioUnlocked.current || !audioRef.current) return;
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          audioRef.current.pause();
          audioUnlocked.current = true;
        }).catch(() => {
          // Ignore
        });
      }
      // Remove listeners once unlocked
      document.removeEventListener('touchstart', unlockAudioContext, true);
      document.removeEventListener('click', unlockAudioContext, true);
    };

    document.addEventListener('touchstart', unlockAudioContext, true);
    document.addEventListener('click', unlockAudioContext, true);

    return () => {
      document.removeEventListener('touchstart', unlockAudioContext, true);
      document.removeEventListener('click', unlockAudioContext, true);
    };
  }, []);

  // Handle shouldPlay prop from parent (triggered when user opens invitation)
  useEffect(() => {
    if (shouldPlay && audioRef.current && !isPlaying) {
      const attemptPlay = () => {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {
              console.error('Autoplay blocked by browser. Awaiting interaction.');
              setIsPlaying(false);
            });
        }
      };
      
      // Add a slight delay to allow the 'unlock' trick above to finish processing
      setTimeout(attemptPlay, 100);
    }
  }, [shouldPlay]);



  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error('Play blocked:', err);
            setIsPlaying(false);
          });
      }
    }
  };

  if (!musicUrl) return null;

  return (
    <>
      <audio ref={audioRef} src={musicUrl} loop preload="auto" />
      <button 
        onClick={togglePlay} 
        className={`fixed bottom-24 md:bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 ${btnBg} ${btnColor} ${btnBorder}`}
        style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}
      >
        <svg 
          className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} 
          style={isPlaying ? { animationDuration: '3s' } : {}}
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          viewBox="0 0 24 24"
        >
          {isPlaying ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>
          ) : (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0-2.25 2.25M19.5 12h-4.5"/>
            </>
          )}
        </svg>
      </button>
    </>
  );
}
