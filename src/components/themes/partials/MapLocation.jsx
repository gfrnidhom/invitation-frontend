'use client';
import React, { useState } from 'react';
import { QrCode, MapPin, X, ExternalLink, Download } from 'lucide-react';

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

export function MapLocationButton({
  item,
  className = '',
  buttonText = 'Lihat Lokasi',
  style = {},
  children = null,
  showQrButton = true,
  qrButtonClassName = '',
}) {
  const [showQrModal, setShowQrModal] = useState(false);
  const mapUrl = getMapUrl(item);

  if (!mapUrl) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&margin=10&data=${encodeURIComponent(mapUrl)}`;

  const downloadQrCode = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-peta-lokasi.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <>
      <div className="inline-flex items-center gap-2 flex-wrap justify-center mt-3">
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className={
            className ||
            'inline-flex items-center gap-1.5 px-5 py-2 rounded-full border text-xs font-medium transition-colors'
          }
          style={style}
        >
          {children || (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              {buttonText}
            </>
          )}
        </a>

        {showQrButton && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQrModal(true);
            }}
            className={
              qrButtonClassName ||
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-current/20 hover:bg-black/10 transition-colors text-xs font-medium opacity-85 hover:opacity-100 cursor-pointer'
            }
            style={{ color: style.color || 'inherit' }}
            title="Scan QR Code Peta Lokasi"
          >
            <QrCode size={14} />
            <span>QR Peta</span>
          </button>
        )}
      </div>

      {showQrModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white text-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 shadow-sm">
              <QrCode size={24} />
            </div>
            <h4 className="font-bold text-lg text-gray-900 mb-1">QR Code Lokasi Peta</h4>
            <p className="text-xs text-gray-500 mb-4 max-w-[250px] leading-relaxed">
              Scan QR Code ini dengan kamera ponsel atau aplikasi scanner untuk langsung membuka navigasi menuju lokasi acara.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner mb-4 flex justify-center w-full">
              <img
                src={qrImageUrl}
                alt="QR Code Peta Lokasi"
                className="w-52 h-52 object-contain rounded-lg"
              />
            </div>
            <div className="flex gap-2 w-full">
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md transition-colors"
              >
                <ExternalLink size={14} />
                Buka Maps
              </a>
              <button
                type="button"
                onClick={downloadQrCode}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs border border-gray-300 transition-colors cursor-pointer"
              >
                <Download size={14} />
                Download QR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
