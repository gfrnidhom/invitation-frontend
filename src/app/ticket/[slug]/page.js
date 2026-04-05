'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { publicInvitation } from '@/lib/api';
import { Download, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TicketPage({ params }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const guestNameParam = searchParams.get('to') || '';
  const tokenParam = searchParams.get('token') || '';
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parse proper guest name
  const guestNameText = guestNameParam ? guestNameParam.replace(/-/g, ' ') : 'Tamu Undangan';

  useEffect(() => {
    publicInvitation.get(slug, guestNameParam)
      .then(res => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, guestNameParam]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data || !data.invitation) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50">
        <h1 className="text-xl font-medium text-slate-800">Tiket tidak valid atau tidak ditemukan.</h1>
      </div>
    );
  }

  const invitation = data.invitation;

  // Process Cover Photo for Background
  let coverPhotoUrl = null;
  if (Array.isArray(invitation.cover_photo) && invitation.cover_photo.length > 0) {
    coverPhotoUrl = invitation.cover_photo[0];
  } else if (typeof invitation.cover_photo === 'string' && invitation.cover_photo.trim() !== '') {
    try {
      const parsed = JSON.parse(invitation.cover_photo);
      if (Array.isArray(parsed) && parsed.length > 0) coverPhotoUrl = parsed[0];
    } catch(e) {
      coverPhotoUrl = invitation.cover_photo;
    }
  }

  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';
  if (coverPhotoUrl && !coverPhotoUrl.startsWith('http')) {
    coverPhotoUrl = coverPhotoUrl.startsWith('/') ? `${storageUrl}${coverPhotoUrl}` : `${storageUrl}/${coverPhotoUrl}`;
  }

  // Process QR Code URL dynamically from token
  let finalQrUrl = null;
  if (tokenParam) {
    // Laravels backend standard format for QR codes
    finalQrUrl = `${storageUrl}/qrcodes/${tokenParam}.svg`;
  }

  const downloadQrCode = async () => {
    if (!finalQrUrl) return;
    try {
      const response = await fetch(finalQrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `E-Ticket-${guestNameText.replace(/\s+/g, '-').toLowerCase()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('E-Ticket berhasil disimpan');
    } catch {
      toast.error('Gagal menyimpan E-Ticket');
    }
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden flex flex-col items-center justify-center bg-gray-900 px-4 py-8">
      {/* Background with Blur */}
      {coverPhotoUrl && (
        <div className="absolute inset-0 z-0">
          <img src={coverPhotoUrl} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
        </div>
      )}

      {/* Main Content Ticket */}
      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        {/* Title Group */}
        <div className="text-center mb-8" style={{ animation: 'slide-up 0.6s ease-out both' }}>
          <p className="text-white/70 text-xs tracking-[0.3em] uppercase mb-2">E-Ticket Check In</p>
          <h1 className="text-3xl font-bold text-white font-serif mb-1 drop-shadow-md">
            {invitation.groom_name} & {invitation.bride_name}
          </h1>
        </div>

        {/* The Ticket Card */}
        <div 
          className="w-full bg-white/95 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative"
          style={{ animation: 'slide-up 0.8s ease-out 0.2s both' }}
        >
          {/* Card Top Decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">✨</span>
          </div>

          <div className="mt-4 mb-2">
            <p className="text-gray-500 text-xs tracking-wider uppercase mb-1">Tiket Akses Untuk</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{guestNameText}</h2>
          </div>

          {/* QR Code Container */}
          {finalQrUrl ? (
            <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm mb-6 w-full aspect-square max-w-[240px] max-h-[240px] flex items-center justify-center">
              <img src={finalQrUrl} alt="QR Code" className="w-full h-full object-contain" />
            </div>
          ) : (
             <div className="w-full aspect-square max-w-[240px] max-h-[240px] bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
               QR Code tidak tersedia
             </div>
          )}

          <div className="w-full border-t border-dashed border-gray-300 my-4 relative">
             {/* Cutout notches */}
             <div className="absolute -left-10 -top-4 w-8 h-8 rounded-full bg-gray-900/50 backdrop-blur-md"></div>
             <div className="absolute -right-10 -top-4 w-8 h-8 rounded-full bg-gray-900/50 backdrop-blur-md"></div>
          </div>

          <p className="text-sm text-gray-500 font-medium">Tunjukkan QR Code ini di meja penerima tamu saat tiba di lokasi acara.</p>
        </div>

        {/* Floating Actions */}
        <div className="flex gap-4 mt-8" style={{ animation: 'slide-up 1s ease-out 0.4s both' }}>
          <button 
            onClick={downloadQrCode} 
            className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full font-medium transition-colors text-sm"
          >
            <Download size={16} /> Simpan Gambar
          </button>
        </div>
      </div>
    </div>
  );
}
