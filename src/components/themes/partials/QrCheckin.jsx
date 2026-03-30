'use client';

import React from 'react';

export default function QrCheckin({ 
  guest, 
  sectionBg = 'bg-white', 
  titleFont = 'font-bold', 
  textColor = 'text-gray-900', 
  borderStyle = 'border-gray-200',
  cardBg = 'bg-white',
  cardTextColor = null 
}) {
  if (!guest || !guest.qr_code) return null;

  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
  const qrUrl = guest.qr_code.startsWith('http') ? guest.qr_code : `${storageUrl}/${guest.qr_code}`;

  // Determine if the card is dark-themed based on cardBg
  const isDarkCard = cardBg.includes('black') || cardBg.includes('gray-9') || cardBg.includes('slate-9') || cardBg.includes('neutral-9') || cardBg.includes('zinc-9') || cardBg.includes('rgba') || cardBg.includes('white/5') || cardBg.includes('white/0');
  
  // For text inside the card: use cardTextColor if provided, otherwise auto-detect
  const innerTitle = cardTextColor || (isDarkCard ? 'text-white' : 'text-gray-900');
  const innerDesc = isDarkCard ? 'text-gray-400' : 'text-gray-500';
  const innerName = cardTextColor || (isDarkCard ? 'text-white' : 'text-gray-900');
  const innerIconBg = isDarkCard ? 'bg-white/10' : 'bg-gray-100';
  const innerIconColor = isDarkCard ? 'text-white/60' : 'text-gray-700';
  const innerQrBg = isDarkCard ? 'bg-white p-4 rounded-2xl' : 'bg-gray-50 p-4 rounded-2xl border border-gray-100';

  return (
    <section className={`py-20 px-6 ${sectionBg} text-center reveal`}>
      <div className={`max-w-sm mx-auto p-8 rounded-3xl border ${borderStyle} shadow-sm ${cardBg}`}>
        <div className={`w-12 h-12 rounded-full ${innerIconBg} flex items-center justify-center mx-auto mb-6`}>
          <svg className={`w-6 h-6 ${innerIconColor}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"/></svg>
        </div>
        
        <h3 className={`${titleFont} text-2xl mb-2 ${innerTitle}`}>Buku Tamu &amp; Check-in</h3>
        <p className={`text-sm ${innerDesc} leading-relaxed mb-8`}>
          Tunjukkan QR Code ini pada penerima tamu untuk memudahkan proses check-in saat Anda tiba di lokasi acara.
        </p>
        
        <div className={`${innerQrBg} flex justify-center mb-4`}>
          <img src={qrUrl} alt="QR Code Check in" className="w-48 h-48 object-contain" />
        </div>
        
        <p className={`text-xs uppercase tracking-widest font-semibold ${innerName}`}>{guest.name}</p>
      </div>
    </section>
  );
}
