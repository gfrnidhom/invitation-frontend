'use client';

import React from 'react';

/**
 * TurutMengundang - Reusable component to display "Turut Mengundang" list
 * 
 * Props:
 * - invitation: The invitation object containing turut_mengundang array
 * - sectionBg: Background class for the section (default: 'bg-white')
 * - titleFont: Font class for the title
 * - accentText: Color class for accent text
 * - subtitleText: Color class for subtitle text
 * - borderColor: Border color class
 */
export default function TurutMengundang({ 
  invitation, 
  sectionBg = 'bg-white', 
  titleFont = '',
  accentText = 'text-gray-800',
  subtitleText = 'text-gray-500',
  borderColor = 'border-gray-200',
  cardBg = 'bg-gray-50',
}) {
  // Parse turut_mengundang - handle both array and JSON string
  let items = invitation?.turut_mengundang || [];
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch {
      items = items.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(items)) items = [];
  items = items.filter(item => item && String(item).trim() !== '');

  if (items.length === 0) return null;

  return (
    <section className={`py-16 px-6 text-center ${sectionBg}`}>
      <div className="max-w-2xl mx-auto">
        <p className={`text-xs tracking-[0.3em] uppercase ${subtitleText} mb-3 font-medium`}>
          Turut Mengundang
        </p>
        <div className={`w-12 h-px ${borderColor.replace('border-', 'bg-')} mx-auto mb-8 opacity-50`} />
        
        <div className="space-y-3">
          {items.map((name, i) => (
            <p key={i} className={`${titleFont} text-base ${accentText} font-medium`}>
              {name}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
