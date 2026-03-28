'use client';

import React, { useEffect, useState } from 'react';

export default function BottomNav({ 
    navBg = 'bg-white/90', 
    navActive = 'bg-gray-900 text-white', 
    navInactive = 'text-gray-400', 
    navBorder = 'border-gray-200/50' 
}) {
  const [activeSection, setActiveSection] = useState('home');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reveal nav after a slight delay
    setTimeout(() => setIsVisible(true), 2000);

    const sections = ['home', 'events', 'gallery', 'gift', 'wishes'];
    
    const handleScroll = () => {
        let current = '';
        const scrollY = window.scrollY;

        sections.forEach((section) => {
            const el = document.getElementById(section);
            if (el) {
                const rect = el.getBoundingClientRect();
                // If section is reasonably visible in viewport
                if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
                    current = section;
                }
            }
        });

        if (current && current !== activeSection) {
            setActiveSection(current);
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const navTo = (e, section) => {
      e.preventDefault();
      setActiveSection(section);
      const el = document.getElementById(section);
      if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  const getItemClass = (id) => {
      return `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300 ${activeSection === id ? navActive : navInactive}`;
  };

  return (
    <>
      <nav className={`fixed bottom-0 left-0 right-0 z-[999] transition-all duration-700 ease-out`} style={{ transform: isVisible ? 'translateY(0)' : 'translateY(100%)', opacity: isVisible ? 1 : 0 }}>
          <div className="max-w-lg mx-auto px-4 pb-4">
              <div className={`${navBg} backdrop-blur-xl rounded-2xl shadow-lg border ${navBorder} px-2 py-2 flex items-center justify-around gap-1`}>
                  
                  <a href="#home" onClick={(e) => navTo(e, 'home')} className={getItemClass('home')}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
                      <span className="text-[10px] font-medium">Home</span>
                  </a>

                  <a href="#events" onClick={(e) => navTo(e, 'events')} className={getItemClass('events')}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
                      <span className="text-[10px] font-medium">Acara</span>
                  </a>

                  <a href="#gallery" onClick={(e) => navTo(e, 'gallery')} className={getItemClass('gallery')}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 0 0Z"/></svg>
                      <span className="text-[10px] font-medium">Galeri</span>
                  </a>

                  <a href="#gift" onClick={(e) => navTo(e, 'gift')} className={getItemClass('gift')}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg>
                      <span className="text-[10px] font-medium">Hadiah</span>
                  </a>

                  <a href="#wishes" onClick={(e) => navTo(e, 'wishes')} className={getItemClass('wishes')}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"/></svg>
                      <span className="text-[10px] font-medium">Ucapan</span>
                  </a>

              </div>
          </div>
      </nav>
      {/* Padding to account for fixed bottom nav */}
      <div style={{ height: '80px' }}></div>
    </>
  );
}
