'use client';

import React, { useState, useEffect } from 'react';

const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;

export default function CoverOverlay({ invitation, guestName, onOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(true);

  // Lock body scroll initially
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
      // Disable scrolling up to the top automatically to prevent weird jumping
      window.scrollTo(0, 0);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isRendered) return null;

  const handleOpen = () => {
    setIsOpen(true);
    document.body.style.overflow = '';
    if (onOpen) onOpen();
    
    // Unmount after animation finishes
    setTimeout(() => {
      setIsRendered(false);
    }, 1000);
  };

  const firstCover = invitation?.cover_photo ? (Array.isArray(invitation.cover_photo) ? invitation.cover_photo[0] : invitation.cover_photo) : null;
  const bgStyle = firstCover 
    ? { backgroundImage: `url(${firstCover.startsWith('http') ? firstCover : `${storageUrl}/${firstCover}`})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: '#111827' };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        ...bgStyle,
        transform: isOpen ? 'translateY(-100%)' : 'translateY(0)'
      }}
    >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 text-center text-white px-6 w-full max-w-lg mx-auto flex flex-col h-full justify-center">
            <div className="mb-auto mt-20">
                <p className="font-body text-xs tracking-[0.5em] uppercase text-white/70 mb-8">The Wedding Of</p>
                <div className="font-heading text-5xl md:text-6xl font-bold tracking-tight mb-4">
                    {invitation?.groom_name} 
                    <span className="block my-2 text-3xl font-light text-white/50">&</span> 
                    {invitation?.bride_name}
                </div>
            </div>

            <div className="mt-auto mb-20">
                {guestName ? (
                    <>
                        <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">Teruntuk Bapak/Ibu/Saudara/i</p>
                        <p className="font-sans font-semibold text-2xl text-white mb-10">{guestName}</p>
                    </>
                ) : (
                    <p className="font-sans font-medium text-lg text-white/80 mb-10">Kepada Yth. Tamu Undangan</p>
                )}

                <button 
                  onClick={handleOpen} 
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-heading font-semibold text-sm hover:bg-gray-100 hover:scale-105 transition-all w-full max-w-[280px] justify-center mx-auto"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
                    Buka Undangan
                </button>
            </div>
        </div>
    </div>
  );
}
