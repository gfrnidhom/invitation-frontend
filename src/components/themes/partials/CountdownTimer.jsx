'use client';

import React, { useState, useEffect } from 'react';

export default function CountdownTimer({
  eventDate,
  eventTime = '08:00',
  numberFont = 'text-4xl md:text-6xl font-light',
  labelFont = 'text-[10px] tracking-[0.3em] uppercase mt-3 font-semibold',
  textColor = 'text-white',
  accentColor = 'text-gray-400',
  layout = 'default',
  dividerContent = null,
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  useEffect(() => {
    if (!eventDate) return;
    
    // Parse time robustly
    let timeParts = '08:00';
    if (eventTime) {
      // normalize dots to colons, e.g. "09.00" -> "09:00"
      const normalizedTime = eventTime.replace(/\./g, ':');
      // extract just the HH:MM part
      const match = normalizedTime.match(/(\d{1,2}:\d{2})/);
      if (match) {
        timeParts = match[0];
        // Ensure 2-digit pad (e.g. "9:00" -> "09:00")
        if (timeParts.length === 4) timeParts = '0' + timeParts;
      }
    }
    
    // Make sure it has seconds for robust iOS Safari parsing
    timeParts += ':00';
    
    // Parse the UTC date safely into local time first to avoid timezone subtraction bugs
    let baseDate = new Date(eventDate.replace(' ', 'T'));
    if (isNaN(baseDate)) {
        baseDate = new Date(eventDate.split('T')[0].split(' ')[0] + 'T00:00:00');
    }
    
    const y = baseDate.getFullYear();
    const m = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    const targetDateStr = `${y}-${m}-${day}`;
    
    const parsedDate = new Date(`${targetDateStr}T${timeParts}`);
    const finalDate = isNaN(parsedDate) ? baseDate : parsedDate;
    
    const updateCountdown = () => {
      const diff = finalDate - new Date();
      if (diff <= 0) return;
      
      setTimeLeft({
        days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
        hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        minutes: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        seconds: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  const Item = ({ value, label, isLast }) => (
    <>
      <div className="text-center w-16 sm:w-20 md:w-24 shrink-0">
        <p className={`${numberFont} ${textColor}`}>{value}</p>
        <p className={`${labelFont} ${accentColor}`}>{label}</p>
      </div>
      {layout === 'divider' && !isLast && dividerContent}
    </>
  );

  return (
    <div className="flex flex-row flex-nowrap items-center justify-center gap-3 sm:gap-6 md:gap-8 w-full overflow-hidden">
      <Item value={timeLeft.days} label="Days" />
      <Item value={timeLeft.hours} label="Hours" />
      <Item value={timeLeft.minutes} label="Mins" />
      <Item value={timeLeft.seconds} label="Secs" isLast={true} />
    </div>
  );
}
