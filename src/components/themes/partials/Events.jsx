'use client';

import React from 'react';

export default function Events({ 
  invitation, 
  sectionBg = 'bg-white', 
  accentText = 'text-gold-400', 
  accentBg = 'bg-gold-400', 
  cardBg = 'bg-[#fcfbf8]', // cream
  iconBg = 'bg-amber-100/50', 
  titleText = 'text-gray-800', 
  bodyText = 'text-gray-500', 
  btnBorder = 'border-amber-200', 
  btnHoverBg = 'bg-amber-50' 
}) {
  const eventsList = invitation?.events || [];
  if (eventsList.length === 0) return null;

  const sortedEvents = [...eventsList].sort((a, b) => a.sort_order - b.sort_order);

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch(e) { return dateStr; }
  };

  return (
    <section id="events" className={`px-6 py-20 ${sectionBg}`}>
        <div className="max-w-3xl mx-auto">
            <p className={`font-sans text-xs tracking-[0.4em] uppercase ${accentText} mb-6 text-center`}>Event Details</p>
            <div className={`w-12 h-px ${accentBg} mx-auto mb-12`}></div>

            <div className={`grid md:grid-cols-${Math.min(sortedEvents.length, 2)} gap-8`}>
                {sortedEvents.map((event) => {
                    const isAkad = event.name.toLowerCase().includes('akad');
                    return (
                        <div key={event.id || event.name} className={`${cardBg} rounded-2xl p-8 text-center reveal`}>
                            <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-5`}>
                                {isAkad ? (
                                    <svg className={`w-6 h-6 ${accentText}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/></svg>
                                ) : (
                                    <svg className={`w-6 h-6 ${accentText}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"/></svg>
                                )}
                            </div>

                            <h3 className={`font-serif text-2xl ${titleText} mb-4`}>{event.name}</h3>

                            <div className={`space-y-2 text-sm ${bodyText}`}>
                                <p className="font-medium">{formatDate(event.date)}</p>
                                {(event.time_start || event.time) ? (
                                    <p>{(event.time_start || event.time).substring(0, 5)}{event.time_end ? ` - ${event.time_end.substring(0, 5)}` : '- Selesai'} WIB</p>
                                ) : (
                                    <p>TBA</p>
                                )}
                                <p className="pt-1">{event.location}</p>
                            </div>

                            {(event.latitude && event.longitude) && (
                                <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 mt-5 px-5 py-2 rounded-full border ${btnBorder} ${accentText} text-xs font-medium hover:${btnHoverBg} transition-colors`}>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                                    Google Maps
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </section>
  );
}
