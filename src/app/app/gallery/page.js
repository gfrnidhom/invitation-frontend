'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { confirmAction } from '@/lib/toast-confirm';
import { invitations, gallery } from '@/lib/api';

export default function MediaGalleryPage() {
  const router = useRouter();
  const [invitation, setInvitation] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Since user has only 1 invitation, we fetch the first one
    invitations.list().then((res) => {
      const list = res.data || [];
      if (list.length > 0) {
        setInvitation(list[0]);
        return gallery.list(list[0].id);
      } else {
        setLoading(false);
      }
    })
    .then((res) => {
      if (res) setPhotos(res.data || []);
    })
    .catch(() => toast.error('Gagal memuat data galeri'))
    .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    const files = e.target.files; 
    if (!files.length || !invitation) return; 
    
    setUploading(true); 
    try { 
      for (const file of files) { 
        const fd = new FormData(); 
        fd.append('photo', file); 
        const res = await gallery.upload(invitation.id, fd); 
        setPhotos((prev) => [...prev, res.data || res]); 
      } 
      toast.success('Upload berhasil'); 
    } catch(err) { 
      toast.error(err?.message || 'Gagal upload foto'); 
    } finally { 
      setUploading(false); 
      // clear input
      e.target.value = '';
    } 
  };

  const handleDelete = (photoId) => { 
    confirmAction('Hapus foto ini?', async () => { 
      try { 
        await gallery.delete(invitation.id, photoId); 
        setPhotos(prev => prev.filter((p) => (p.id || p.path || p.photo) !== photoId)); 
        toast.success('Foto dihapus'); 
      } catch { 
        toast.error('Gagal menghapus foto'); 
      } 
    }); 
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  if (!invitation) {
    return (
      <div className="empty-state card" style={{ animation: 'slide-up 0.4s ease-out' }}>
        <div className="empty-icon text-slate-400"><ImageIcon size={48} strokeWidth={1.5} /></div>
        <div className="empty-title">Belum Ada Undangan</div>
        <div className="empty-text">Buat undangan terlebih dahulu untuk mengelola media galeri.</div>
        <button onClick={() => router.push('/app/invitations/create')} className="btn btn-primary" style={{ marginTop: '20px' }}>Buat Undangan</button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Media Gallery</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Kelola foto-foto momen spesial Anda</p>
        </div>
        <label className={`btn ${uploading ? 'btn-secondary' : 'btn-primary'}`} style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
          <Upload size={16} /> {uploading ? 'Mengunggah...' : 'Upload Foto'}
          <input type="file" multiple accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        {photos.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <ImageIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Belum ada foto di galeri</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {photos.map((photo) => (
              <div className="group" key={photo.id} style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${photo.path || photo.photo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="hover:scale-105" />
                <button 
                  onClick={() => handleDelete(photo.id)} 
                  style={{ position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                  className="hover:bg-red-500 hover:text-white transition-colors title='Hapus Foto'"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
