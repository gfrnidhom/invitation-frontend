'use client';

import React, { useState } from 'react';
import VideoEmbed from './VideoEmbed';

const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;

export default function Gallery({ 
  invitation, 
  sectionBg = 'bg-white', 
  accentText = 'text-gray-800', 
  subtitleText = 'text-gray-400', 
  borderColor = 'border-gray-100',
  titleFont = 'font-serif',
  titleSize = 'text-3xl',
  imgClasses = 'shadow-sm border',
  layout = 'grid'
}) {
  const photos = invitation?.photos || [];
  const gallery = invitation?.gallery || [];
  
  // Combine all photos and unique them
  const allRawPhotos = [...gallery, ...photos].map(p => (typeof p === 'object' ? p.photo : p)).filter(Boolean);
  const allPhotos = [...new Set(allRawPhotos)];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const hasVideo = invitation?.background_video_url || invitation?.video_url;
  
  if (allPhotos.length === 0 && !hasVideo) return null;

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  return (
    <>
      <section id="gallery" className={`${sectionBg} px-6 py-20`}>
          <div className="max-w-4xl mx-auto">
              <VideoEmbed invitation={invitation} sectionBg="bg-transparent" textColor={subtitleText} borderColor={borderColor} />
              <div className="text-center mb-14">
                  <p className={`text-xs tracking-[0.4em] uppercase ${subtitleText} mb-3`}>Galeri</p>
                  <h2 className={`${titleFont} ${titleSize} ${accentText}`}>Our Moments</h2>
              </div>

              {allPhotos.length > 0 && (
                <>
                  {layout === 'grid' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {allPhotos.map((photo, index) => (
                            <div key={index} className={`gallery-item group relative aspect-square rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 reveal ${borderColor} ${imgClasses}`}
                                 onClick={() => openLightbox(index)}>
                                <img src={photo.startsWith('http') ? photo : `${storageUrl}/${photo}`} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"/></svg>
                                </div>
                            </div>
                        ))}
                    </div>
                  )}

                  {layout === 'masonry' && (
                    <div className="columns-2 md:columns-3 gap-4 space-y-4">
                        {allPhotos.map((photo, index) => (
                            <div key={index} className={`gallery-item group relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 reveal break-inside-avoid ${borderColor} ${imgClasses}`}
                                 onClick={() => openLightbox(index)}>
                                <img src={photo.startsWith('http') ? photo : `${storageUrl}/${photo}`} alt={`Gallery ${index + 1}`} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"/></svg>
                                </div>
                            </div>
                        ))}
                    </div>
                  )}

                  {layout === 'abstract' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[250px]">
                        {allPhotos.map((photo, index) => {
                            let abstractClass = "col-span-1 row-span-1";
                            if (index % 5 === 0) {
                                abstractClass = "col-span-2 row-span-2";
                            }
                            if (index % 7 === 3) {
                                abstractClass = "col-span-2 row-span-1";
                            }

                            return (
                              <div key={index} className={`gallery-item group relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 reveal ${borderColor} ${imgClasses} ${abstractClass}`}
                                   onClick={() => openLightbox(index)}>
                                  <img src={photo.startsWith('http') ? photo : `${storageUrl}/${photo}`} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"/></svg>
                                  </div>
                              </div>
                            );
                        })}
                    </div>
                  )}
                </>
              )}
          </div>
      </section>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/90 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
          <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
          </button>
          <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
          </button>
          <img src={allPhotos[photoIndex].startsWith('http') ? allPhotos[photoIndex] : `${storageUrl}/${allPhotos[photoIndex]}`} alt="Gallery" className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">{photoIndex + 1} / {allPhotos.length}</p>
        </div>
      )}
    </>
  );
}
