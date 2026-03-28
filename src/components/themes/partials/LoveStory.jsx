'use client';

import React from 'react';

const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;

export default function LoveStory({ 
    invitation, 
    sectionBg = 'bg-white', 
    accentText = 'text-gold-400', 
    accentBg = 'bg-gold-400', 
    lineBg = 'bg-gold-200',
    dotBg = 'bg-gold-400',
    dotRing = 'ring-white',
    cardBg = 'bg-[#fcfbf8]', 
    titleText = 'text-gray-800', 
    bodyText = 'text-gray-500' 
  }) {
    const stories = invitation?.loveStories || [];
    if (stories.length === 0) return null;
  
    const sortedStories = [...stories].sort((a, b) => a.sort_order - b.sort_order);
  
    const formatDate = (dateStr) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      } catch (e) { return dateStr; }
    };
  
    return (
      <section className={`px-6 py-20 ${sectionBg}`}>
          <div className="max-w-2xl mx-auto">
              <p className={`font-sans text-xs tracking-[0.4em] uppercase ${accentText} mb-6 text-center`}>Our Love Story</p>
              <div className={`w-12 h-px ${accentBg} mx-auto mb-12`}></div>
  
              <div className="relative">
                  {/* Timeline line */}
                  <div className={`absolute left-4 md:left-1/2 top-0 bottom-0 w-px ${lineBg} md:-translate-x-px`}></div>
  
                  {sortedStories.map((story, index) => {
                      const isEven = index % 2 === 0;
                      return (
                          <div key={story.id || story.title} className={`reveal relative pl-12 md:pl-0 mb-12 last:mb-0 ${isEven ? 'md:pr-[52%]' : 'md:pl-[52%]'}`}>
                              {/* Timeline dot */}
                              <div className={`absolute left-2.5 md:left-1/2 top-1 w-3 h-3 rounded-full ${dotBg} ring-4 ${dotRing} md:-translate-x-1.5`}></div>
  
                              {story.photo && (
                                  <div className="aspect-video rounded-xl overflow-hidden mb-3 shadow-md">
                                      <img src={story.photo.startsWith('http') ? story.photo : `${storageUrl}/${story.photo}`} alt={story.title} className="w-full h-full object-cover" />
                                  </div>
                              )}
  
                              <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
                                  {story.date && (
                                      <p className={`text-[11px] font-medium ${accentText} tracking-wider uppercase mb-1`}>{formatDate(story.date)}</p>
                                  )}
                                  <h4 className={`font-serif text-lg ${titleText} mb-2`}>{story.title}</h4>
                                  {story.description && (
                                      <p className={`text-sm ${bodyText} leading-relaxed`}>{story.description}</p>
                                  )}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </section>
    );
  }
