'use client';

import React, { useState } from 'react';
import GiftAtmCard from './GiftAtmCard';

export default function GiftAccounts({ 
    invitation,
    variant = "golden",
    sectionBg = 'bg-[#fcfbf8]', 
    accentText = 'text-gold-400', 
    accentBg = 'bg-gold-400', 
    cardBg = 'bg-white', 
    iconBg = 'bg-amber-100/50', 
    titleText = 'text-gray-800', 
    bodyText = 'text-gray-500', 
    btnBorder = 'border-amber-200', 
    btnHoverBg = 'bg-amber-50' 
  }) {
    const gifts = (invitation?.giftAccounts || invitation?.gift_accounts) || [];
    if (gifts.length === 0) return null;
  
    const sortedGifts = [...gifts].sort((a, b) => a.sort_order - b.sort_order);
    const [copiedIndex, setCopiedIndex] = useState(null);
  
    const copyToClipboard = (text, index) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      });
    };
  
    return (
      <section id="gift" className={`px-6 py-20 ${sectionBg}`}>
          <div className="max-w-xl mx-auto text-center">
              <p className={`font-sans text-xs tracking-[0.4em] uppercase ${accentText} mb-6`}>Wedding Gift</p>
              <div className={`w-12 h-px ${accentBg} mx-auto mb-4`}></div>
              <p className={`text-sm ${bodyText} mb-10`}>Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, kami menyediakan amplop digital.</p>
  
              <div className="flex flex-col gap-4 w-full">
                  {sortedGifts.map((account, index) => (
                      <GiftAtmCard key={account.id || account.account_number} acc={account} delayData={`${index + 1}`} variant={variant} />
                  ))}
              </div>
          </div>
      </section>
    );
  }
