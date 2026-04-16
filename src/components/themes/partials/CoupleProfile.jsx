'use client';

import React from 'react';

const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;

export default function CoupleProfile({ invitation, sectionBg = 'bg-gray-50', accentText = 'text-gray-800', cardBg = 'bg-white', subtitleText = 'text-gray-400', borderColor = 'border-gray-100' }) {
  if (!invitation?.groom_name && !invitation?.bride_name) return null;

  const getFirstPhoto = (photo) => {
      if (!photo) return null;
      if (Array.isArray(photo)) return photo.length > 0 ? photo[0] : null;
      return photo;
  };

  const groomCover = getFirstPhoto(invitation?.groom_photo);
  const brideCover = getFirstPhoto(invitation?.bride_photo);

  return (
    <section className={`${sectionBg} px-6 py-20`}>
        <div className="max-w-4xl mx-auto">
            {/* Section title */}
            <div className="text-center mb-14">
                <p className={`text-xs tracking-[0.4em] uppercase ${subtitleText} mb-3`}>Mempelai</p>
                <h2 className={`font-serif text-3xl ${accentText}`}>Bride & Groom</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
                {/* Groom */}
                <div className={`${cardBg} rounded-3xl p-8 text-center shadow-sm border ${borderColor} reveal`}>
                    {groomCover ? (
                        <div className={`w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 ${borderColor} shadow-md`}>
                            <img src={groomCover.startsWith('http') ? groomCover : `${storageUrl}/${groomCover}`} alt={invitation.groom_name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className={`w-40 h-40 mx-auto mb-6 rounded-full ${sectionBg} flex items-center justify-center border-4 ${borderColor}`}>
                            <svg className={`w-16 h-16 ${subtitleText}`} fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
                        </div>
                    )}

                    <h3 className={`font-serif text-2xl ${accentText} mb-1`}>{invitation.groom_name}</h3>
                    {invitation.groom_full_name && (
                        <p className={`text-sm ${subtitleText} mb-4`}>{invitation.groom_full_name}</p>
                    )}

                    {(invitation.groom_father || invitation.groom_mother) && (
                        <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                            <p className={`text-xs uppercase tracking-widest ${subtitleText} mb-2`}>Putra {invitation?.groom_child_order ? `${invitation.groom_child_order} ` : ''}dari</p>
                            {invitation.groom_father && <p className={`text-sm ${accentText} font-medium`}>Bapak {invitation.groom_father}</p>}
                            {invitation.groom_mother && <p className={`text-sm ${accentText} font-medium`}>& Ibu {invitation.groom_mother}</p>}
                        </div>
                    )}

                    {invitation.groom_address && (
                        <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                            <div className="flex items-start justify-center gap-2">
                                <svg className={`w-4 h-4 ${subtitleText} mt-0.5 shrink-0`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                                <p className={`text-sm ${subtitleText}`}>{invitation.groom_address}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bride */}
                <div className={`${cardBg} rounded-3xl p-8 text-center shadow-sm border ${borderColor} reveal`}>
                    {brideCover ? (
                        <div className={`w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 ${borderColor} shadow-md`}>
                            <img src={brideCover.startsWith('http') ? brideCover : `${storageUrl}/${brideCover}`} alt={invitation.bride_name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className={`w-40 h-40 mx-auto mb-6 rounded-full ${sectionBg} flex items-center justify-center border-4 ${borderColor}`}>
                            <svg className={`w-16 h-16 ${subtitleText}`} fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
                        </div>
                    )}

                    <h3 className={`font-serif text-2xl ${accentText} mb-1`}>{invitation.bride_name}</h3>
                    {invitation.bride_full_name && (
                        <p className={`text-sm ${subtitleText} mb-4`}>{invitation.bride_full_name}</p>
                    )}

                    {(invitation.bride_father || invitation.bride_mother) && (
                        <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                            <p className={`text-xs uppercase tracking-widest ${subtitleText} mb-2`}>Putri {invitation?.bride_child_order ? `${invitation.bride_child_order} ` : ''}dari</p>
                            {invitation.bride_father && <p className={`text-sm ${accentText} font-medium`}>Bapak {invitation.bride_father}</p>}
                            {invitation.bride_mother && <p className={`text-sm ${accentText} font-medium`}>& Ibu {invitation.bride_mother}</p>}
                        </div>
                    )}

                    {invitation.bride_address && (
                        <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                            <div className="flex items-start justify-center gap-2">
                                <svg className={`w-4 h-4 ${subtitleText} mt-0.5 shrink-0`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                                <p className={`text-sm ${subtitleText}`}>{invitation.bride_address}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </section>
  );
}
