'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Loader2, ArrowLeft, KeySquare } from 'lucide-react';
import api from '@/lib/api'; // Assuming you have an axios instance or similar in lib

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // State: 1 = Input Email, 2 = Input OTP & New Password
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.post('/api/forgot-password/send-otp', { email });
      setSuccessMsg(res.data?.message || 'Kode OTP telah dikirim ke email Anda.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengirim OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReset = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      return setError('Konfirmasi password tidak cocok.');
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/forgot-password/verify-reset', { 
        email, 
        otp, 
        password,
        password_confirmation: passwordConfirmation 
      });
      
      setSuccessMsg(res.data?.message || 'Kata sandi berhasil diubah.');
      
      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'OTP tidak valid atau kadaluarsa.');
      
      // If validation returns specific errors array
      if (err.response?.data?.errors) {
         const firstError = Object.values(err.response.data.errors)[0][0];
         setError(firstError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        animation: 'scale-in 0.3s ease-out',
      }}>
        
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontSize: '14px', marginBottom: '24px', fontWeight: '500' }}>
            <ArrowLeft size={16} /> Kembali ke Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <KeySquare size={28} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            Lupa Password
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px', lineHeight: '1.5' }}>
            {step === 1 ? 'Masukkan email akun Anda untuk menerima kode verifikasi OTP.' : 'Masukkan 6-digit OTP dari email Anda berserta kata sandi baru.'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', background: '#fef2f2',
            color: '#dc2626', fontSize: '14px', marginBottom: '20px',
            border: '1px solid #fecaca',
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', background: '#ecfdf5',
            color: '#059669', fontSize: '14px', marginBottom: '20px',
            border: '1px solid #a7f3d0',
          }}>
            {successMsg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div style={{ marginBottom: '24px' }}>
              <label className="label">Alamat Email</label>
              <input className="input" type="email" placeholder="nama@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', fontSize: '15px' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 0.7s linear infinite' }} />
                  Mengirim OTP...
                </span>
              ) : 'Kirim Kode OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyReset}>
            <div style={{ marginBottom: '20px' }}>
              <label className="label">Kode OTP (6-Digit)</label>
              <input className="input" type="text" maxLength={6} placeholder="123456"
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} required style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="label">Password Baru</label>
              <input className="input" type="password" placeholder="••••••••" minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)} required />
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Minimal 8 karakter</p>
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label className="label">Konfirmasi Password Baru</label>
              <input className="input" type="password" placeholder="••••••••" minLength={8}
                value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
            </div>
            
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading || successMsg === 'Kata sandi berhasil diubah.'} style={{ width: '100%', fontSize: '15px' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 0.7s linear infinite' }} />
                  Memproses...
                </span>
              ) : 'Reset Password'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
               <button type="button" onClick={() => { setStep(1); setOtp(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  Kirim Ulang Email OTP
               </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
