'use client';

import React, { useState } from 'react';

export default function GiftAccounts({ 
    invitation, 
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
  
              <div className={`grid gap-4 ${sortedGifts.length > 1 ? 'md:grid-cols-2' : ''}`}>
                  {sortedGifts.map((account, index) => (
                      <div key={account.id || account.account_number} className={`reveal ${cardBg} rounded-2xl p-6 shadow-sm border ${btnBorder} text-center`}>
                          <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-4`}>
                              <svg className={`w-5 h-5 ${accentText}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"/></svg>
                          </div>
                          <p className={`font-semibold text-sm ${titleText} mb-1`}>{account.bank_name}</p>
                          <p className={`font-mono text-lg font-bold text-gray-900 my-2 select-all`}>{account.account_number}</p>
                          <p className={`text-xs ${bodyText} mb-3`}>a.n {account.account_holder}</p>
                          <button 
                            onClick={() => copyToClipboard(account.account_number, index)} 
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border ${btnBorder} ${accentText} text-xs font-medium hover:${btnHoverBg} transition-colors`}
                          >
                              {copiedIndex === index ? (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"/></svg>
                                  Copy
                                </>
                              )}
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      </section>
    );
  }
