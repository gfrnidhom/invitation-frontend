'use client';

import React from 'react';

/**
 * Universal Music Player Component
 * Relies on a global audioController passed down from PublicInvitationViewer
 */
export default function MusicPlayer({
  audioController,
  btnBg = 'bg-white',
  btnColor = 'text-gray-800',
  btnBorder = 'border-gray-200'
}) {
  if (!audioController) return null;

  const { isPlaying, toggle } = audioController;

  return (
    <div className="fixed bottom-24 md:bottom-10 right-6 z-50">
        <button 
          onClick={toggle} 
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl ${btnBg} ${btnColor} ${btnBorder} border`}
          aria-label={isPlaying ? "Pause Music" : "Play Music"}
        >
          {isPlaying ? (
            <svg 
              className="w-5 h-5 animate-spin-slow" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          ) : (
            <svg 
              className="w-5 h-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>
        
        {/* Animated Sound Waves (Visual only when playing) */}
        {isPlaying && (
          <div className="absolute -top-1 -right-1 flex gap-0.5">
            {[1, 2, 3].map((i) => (
              <span 
                key={i} 
                className="w-1 bg-current opacity-60 rounded-full animate-music-bar"
                style={{ 
                  height: i === 2 ? '12px' : '8px',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        )}

        <style jsx>{`
          @keyframes music-bar {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.5); }
          }
          .animate-music-bar {
            animation: music-bar 1s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spin 4s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
    </div>
  );
}
