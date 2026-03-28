'use client';

import { useState, useEffect, useId, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine, CheckCircle2, XCircle, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { checkin, guests } from '@/lib/api';
import Link from 'next/link';

export default function CheckInScannerPage() {
  const { id } = useParams();
  const router = useRouter();
  const readerId = 'qr-reader-container';
  
  const [scanResult, setScanResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [camError, setCamError] = useState('');
  const [checkedInGuests, setCheckedInGuests] = useState([]);
  const processingRef = useRef(false);
  const qrRef = useRef(null);

  useEffect(() => {
    guests.list(id).then(res => {
      const list = res.data || [];
      const checkedIn = list.filter(g => g.is_checked_in).sort((a,b) => new Date(b.checked_in_at || 0) - new Date(a.checked_in_at || 0));
      setCheckedInGuests(checkedIn);
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    processingRef.current = processing;
  }, [processing]);

  useEffect(() => {
    let mounted = true;
    let html5QrCode = null;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(readerId);
        qrRef.current = html5QrCode;

        const cameras = await Html5Qrcode.getCameras();
        if (!mounted) return; // Prevent proceeding if unmounted during camera fetch

        if (!cameras || cameras.length === 0) {
          throw new Error('Tidak ada kamera yang terdeteksi di perangkat ini.');
        }

        const cameraToUse = cameras.length > 1 ? cameras[cameras.length - 1].id : cameras[0].id;

        await html5QrCode.start(
          cameraToUse,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (processingRef.current) return;
            try { html5QrCode.pause(true); } catch(e){}
            await processCheckIn(decodedText);
            setTimeout(() => {
              try { html5QrCode.resume(); } catch(e){}
            }, 3000); 
          },
          (err) => {}
        );
      } catch (err) {
        if (mounted) {
          console.error(err);
          setCamError(err.message || 'Kamera gagal diakses. Pastikan perangkat Anda memberikan izin kamera.');
        }
      }
    };

    // Debounce initialization by 500ms to skip React Strict Mode's ghost unmounts
    const timeoutId = setTimeout(() => {
      if (mounted && !qrRef.current) {
        startScanner();
      }
    }, 500);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      
      if (qrRef.current) {
        if (qrRef.current.isScanning) {
          qrRef.current.stop().then(() => {
            qrRef.current?.clear();
          }).catch(() => {});
        } else {
          try { qrRef.current.clear(); } catch(e) {}
        }
      }
      
      // Cleanup DOM forcefully
      setTimeout(() => {
        const container = document.getElementById(readerId);
        if (container) container.innerHTML = '';
      }, 300);
    };
  }, []); // Empty dependency array to prevent remounts

  const processCheckIn = async (text) => {
    if (!text) return;
    setProcessing(true);
    
    // If the QR code contains a full URL, extract just the token at the end
    let token = text;
    if (text.includes('/')) {
      token = text.trim().split('/').pop();
    }
    
    try {
      const res = await checkin.scan(token);
      const guestData = res.guest || res.data;
      setScanResult({ success: true, message: res.message || 'Tamu berhasil check-in!', data: guestData });
      toast.success('Check-in Berhasil!');
      
      if (guestData) {
        setCheckedInGuests(prev => {
          if (prev.find(g => g.id === guestData.id)) return prev;
          return [{...guestData, checked_in_at: guestData.checked_in_at || new Date().toISOString() }, ...prev];
        });
      }
      
      // Play a positive ding sound
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch(e){}
    } catch (err) {
      setScanResult({ success: false, message: err.message || 'Gagal check-in atau QR tidak valid.' });
      toast.error('Gagal Check-in');
      
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2984/2984-preview.mp3').play(); } catch(e){}
    } finally {
      setProcessing(false);
      setManualCode('');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    processCheckIn(manualCode);
  };

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out', maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>QR Code Scanner</h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Scan tiket tamu untuk melakukan check-in</p>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden', padding: '0', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
        <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ScanLine size={18} color="#6366f1" />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: '600', color: '#334155', margin: 0 }}>Arahkan Kamera ke QR Code</h2>
        </div>
        
        <div style={{ padding: '20px' }}>
          {/* Scanner Window */}
          {camError ? (
            <div style={{ padding: '24px', textAlign: 'center', background: '#fef2f2', borderRadius: '16px', color: '#dc2626', fontSize: '14px' }}>
              {camError}
            </div>
          ) : (
            <div id={readerId} style={{ width: '100%', minHeight: '250px', border: 'none', borderRadius: '16px', overflow: 'hidden', background: '#000' }}></div>
          )}
        </div>
      </div>

      {scanResult && (
        <div style={{ 
          marginTop: '24px', padding: '24px', borderRadius: '20px', 
          background: scanResult.success ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${scanResult.success ? '#a7f3d0' : '#fecaca'}`,
          animation: 'slide-up 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: scanResult.success ? '#10b981' : '#ef4444', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              {scanResult.success ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '700', color: scanResult.success ? '#065f46' : '#991b1b', marginBottom: '4px' }}>
                {scanResult.success ? 'Berhasil Check-in!' : 'Tolak / Gagal'}
              </div>
              <div style={{ fontSize: '14px', color: scanResult.success ? '#047857' : '#b91c1c' }}>
                {scanResult.message}
              </div>
            </div>
          </div>
          
          {scanResult.success && scanResult.data && (
            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#047857', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Info Tamu</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '700', color: '#065f46' }}>{scanResult.data.name || 'Tamu'}</div>
              {scanResult.data.group && <div style={{ fontSize: '13px', color: '#047857', marginTop: '2px' }}>Grup: {scanResult.data.group}</div>}
              {scanResult.data.number_of_attendees && <div style={{ fontSize: '13px', color: '#047857', marginTop: '2px' }}>Porsi Tamu: {scanResult.data.number_of_attendees} Orang</div>}
            </div>
          )}
        </div>
      )}

      {/* Manual Fallback */}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', color: '#475569', marginTop: '32px', marginBottom: '16px', textAlign: 'center' }}>Atau Masukkan Token Manual</h3>
      <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '12px' }}>
        <input 
          type="text" 
          value={manualCode} 
          onChange={(e) => setManualCode(e.target.value)} 
          placeholder="Contoh: TOKEN123ABC" 
          className="input" 
          style={{ flex: 1 }} 
          disabled={processing}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={processing || !manualCode}>
           <Send size={16} /> Submit
        </button>
      </form>

      {/* Real-time Check-in List */}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '700', color: '#1e293b', marginTop: '40px', marginBottom: '16px' }}>
        Log Kehadiran <span className="badge badge-primary">{checkedInGuests.length}</span>
      </h3>
      
      {checkedInGuests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', background: '#f8fafc', borderRadius: '16px', color: '#64748b', fontSize: '14px' }}>
          Belum ada tamu yang check-in.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {checkedInGuests.map((guest, idx) => (
            <div key={guest.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: '600', color: '#334155' }}>{guest.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span>{guest.group || 'Umum'}</span>
                  <span>•</span>
                  <span>{guest.number_of_attendees || 1} Orang</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', backgroundColor: '#d1fae5', color: '#047857' }}>Hadir</span>
                {guest.checked_in_at && (
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                    {new Date(guest.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        /* Minimal UI resets */
        #${readerId} video { border-radius: 16px; object-fit: cover; width: 100%; height: 100%; }
        #${readerId} canvas { display: none !important; }
      `}</style>
    </div>
  );
}
