'use client';
import React, { useState } from 'react';
import { QrCode, MapPin, X, ExternalLink, Download, Calendar, Clock, Navigation } from 'lucide-react';

export function getMapUrl(item) {
  if (!item) return null;
  if (item.map_url && typeof item.map_url === 'string' && item.map_url.trim() !== '') {
    return item.map_url.trim();
  }
  if (item.latitude && item.longitude) {
    return `https://maps.google.com/?q=${item.latitude},${item.longitude}`;
  }
  return null;
}

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function MapLocationButton({
  item,
  className = '',
  buttonText = 'QR Peta',
  style = {},
  children = null,
  showQrButton = true,
  qrButtonClassName = '',
}) {
  const [showQrModal, setShowQrModal] = useState(false);
  const mapUrl = getMapUrl(item);

  if (!mapUrl) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=380x380&margin=8&data=${encodeURIComponent(mapUrl)}`;

  const downloadQrCode = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eticket-qr-lokasi-${item?.name || 'peta'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(qrImageUrl, '_blank');
    }
  };

  const formattedDate = formatEventDate(item?.date);
  const timeText = item?.time_start ? `${item.time_start}${item.time_end ? ` - ${item.time_end}` : ''} WIB` : '';

  return (
    <>
      <div className="inline-flex items-center justify-center mt-3">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowQrModal(true);
          }}
          className={
            className
              ? `${className.replace(/\bfc\b|\bflex-col\b/g, '')} !flex-row inline-flex items-center justify-center gap-2`
              : 'inline-flex !flex-row items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white font-medium text-xs shadow-md hover:bg-black transition-all cursor-pointer'
          }
          style={style}
          title="Lihat E-Ticket QR Code Peta Lokasi"
        >
          <span className="inline-flex flex-row items-center justify-center gap-2">
            <QrCode className="w-4 h-4 flex-shrink-0" />
            <span>QR Peta</span>
          </span>
        </button>
      </div>

      {showQrModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setShowQrModal(false)}
        >
          {/* E-Ticket Card Container */}
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transform transition-all relative flex flex-col text-left"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Section 1: Ticket Header */}
            <div className="bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-950 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-all cursor-pointer z-10"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-amber-400 uppercase mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>E-Ticket Location Pass</span>
              </div>

              <h4 className="text-xl font-extrabold text-white tracking-wide leading-snug pr-8">
                {item?.name || 'Lokasi Acara'}
              </h4>

              {(formattedDate || timeText) && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-300 font-medium">
                  {formattedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-amber-400 flex-shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  {timeText && (
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-amber-400 flex-shrink-0" />
                      <span>{timeText}</span>
                    </div>
                  )}
                </div>
              )}

              {item?.location && (
                <div className="mt-2 flex items-start gap-2 text-xs text-slate-300">
                  <MapPin size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    {item.location} {item.address ? `• ${item.address}` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Section 2: Perforated Ticket Divider */}
            <div className="bg-white relative flex items-center justify-between px-2 py-1">
              {/* Left Notch */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/80 z-10 shadow-inner"></div>
              {/* Dashed Perforation Line */}
              <div className="w-full border-t-2 border-dashed border-gray-200 mx-4"></div>
              {/* Right Notch */}
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/80 z-10 shadow-inner"></div>
            </div>

            {/* Section 3: Ticket Body (QR Code & Action Buttons) */}
            <div className="bg-white text-gray-900 p-6 pt-3 flex flex-col items-center">
              <p className="text-[11px] uppercase tracking-widest font-semibold text-gray-400 mb-4 text-center">
                Scan QR untuk Navigasi Google Maps
              </p>

              {/* Framed QR Box with Corner Accents */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-lg relative group transition-transform hover:scale-[1.02] duration-300 mb-5">
                {/* Scanner frame corners */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-slate-900 rounded-tl"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-slate-900 rounded-tr"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-slate-900 rounded-bl"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-slate-900 rounded-br"></div>

                <img
                  src={qrImageUrl}
                  alt="QR Code Peta Lokasi"
                  className="w-52 h-52 object-contain rounded-xl mx-auto block"
                />
              </div>

              {/* Ticket Barcode / Serial Simulation */}
              <div className="w-full flex items-center justify-between text-[11px] font-mono text-gray-500 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200/80 mb-5">
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                  <QrCode size={13} className="text-slate-600" />
                  PASS-{item?.id ? `ID${item.id}` : 'QR-MAP'}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">
                  Verified Location
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 w-full">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-medium text-xs shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  <Navigation size={14} className="text-amber-400" />
                  <span>Buka Maps</span>
                </a>
                <button
                  type="button"
                  onClick={downloadQrCode}
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs border border-gray-200 transition-all cursor-pointer"
                  title="Download QR Code E-Ticket"
                >
                  <Download size={14} />
                  <span>Simpan QR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
