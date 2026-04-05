'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Upload, X, FileText, Heart, Calendar, Image, BookHeart, Gift, Music } from 'lucide-react';
import toast from 'react-hot-toast';
import { confirmAction } from '@/lib/toast-confirm';
import { invitations, events as eventsApi, loveStories, giftAccounts, gallery, music as musicApi } from '@/lib/api';

const tabs = [
  { id: 'detail', label: 'Detail', icon: FileText },
  { id: 'couple', label: 'Mempelai', icon: Heart },
  { id: 'events', label: 'Acara', icon: Calendar },
  { id: 'gallery', label: 'Galeri', icon: Image },
  { id: 'story', label: 'Love Story', icon: BookHeart },
  { id: 'gift', label: 'Hadiah', icon: Gift },
  { id: 'settings', label: 'Pengaturan', icon: FileText },
];

export default function EditInvitationPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('detail');
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    invitations.get(id).then((res) => setInvitation(res.data || res)).catch(() => router.push('/app/invitations')).finally(() => setLoading(false));
  }, [id, router]);

  const saveInvitation = async (data) => {
    setSaving(true); setMessage('');
    try {
      const res = await invitations.update(id, data);
      setInvitation(res.data || res);
      setMessage('Tersimpan!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { 
      const errorMsg = err?.message || err?.error || 'Gagal menyimpan';
      setMessage(errorMsg); 
    }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/app/invitations')} style={{ marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Kembali
          </button>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Edit Undangan</h1>
        </div>
        {message && <span className={`badge ${message === 'Tersimpan!' ? 'badge-success' : 'badge-danger'}`}>{message}</span>}
      </div>

      <div className="tab-list" style={{ marginBottom: '24px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} className={`tab-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icon size={15} /> {tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="card" style={{ padding: '28px' }}>
        {activeTab === 'detail' && <DetailTab invitation={invitation} onSave={saveInvitation} saving={saving} />}
        {activeTab === 'couple' && <CoupleTab invitation={invitation} onSave={saveInvitation} saving={saving} />}
        {activeTab === 'events' && <EventsTab invitationId={id} />}
        {activeTab === 'gallery' && <GalleryTab invitationId={id} />}
        {activeTab === 'story' && <StoryTab invitationId={id} />}
        {activeTab === 'gift' && <GiftTab invitationId={id} />}
        {activeTab === 'settings' && <SettingsTab invitation={invitation} onSave={saveInvitation} saving={saving} />}
      </div>
    </div>
  );
}

function DetailTab({ invitation, onSave, saving }) {
  const [form, setForm] = useState({ 
    title: invitation?.title || '', 
    event_date: invitation?.event_date || '', 
    event_time: invitation?.event_time || '', 
    location: invitation?.location || '', 
    latitude: invitation?.latitude || '', 
    longitude: invitation?.longitude || '', 
    description: invitation?.description || '', 
    opening_text: invitation?.opening_text || '', 
    closing_text: invitation?.closing_text || '',
    background_video_url: invitation?.background_video_url || '',
    cover_photo: null,
    cover_photos: []
  });

  const [existingCovers, setExistingCovers] = useState(
    invitation?.cover_photo ? (Array.isArray(invitation.cover_photo) ? invitation.cover_photo : [invitation.cover_photo]).filter(Boolean) : []
  );

  const handleSave = () => {
    const fd = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'cover_photos') {
        form[key].forEach(f => fd.append('cover_photo[]', f));
      } else if (form[key] !== null && form[key] !== '' && key !== 'cover_photo') {
        fd.append(key, form[key]);
      }
    });
    existingCovers.forEach(c => fd.append('cover_photo_existing[]', c));
    if (existingCovers.length === 0) fd.append('cover_photo_existing[]', '');
    onSave(fd);
  };

  return (
    <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
      <div><label className="label">Judul Undangan (mis: Dimas & Nisa)</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div><label className="label">Tanggal Acara Utama</label><input className="input" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
        <div><label className="label">Waktu (mis: 08:00 - Selesai)</label><input className="input" placeholder="08:00 - Selesai" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} /></div>
      </div>
      <div><label className="label">Lokasi Utama (mis: Gedung Pancasila)</label><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div><label className="label">Latitude Peta</label><input className="input" placeholder="-6.200000" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></div>
        <div><label className="label">Longitude Peta</label><input className="input" placeholder="106.816666" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></div>
      </div>
      <div><label className="label">Deskripsi / Detail Tambahan Acara</label><textarea className="input" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} /></div>
      <div><label className="label">Background Video URL (Opsional, MP4/Youtube)</label><input className="input" placeholder="https://..." value={form.background_video_url} onChange={(e) => setForm({ ...form, background_video_url: e.target.value })} /></div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label className="label" style={{ margin: 0 }}>Foto Cover</label>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', padding: '6px 12px' }}>
            <Upload size={14} /> Tambah Foto
            <input type="file" multiple accept="image/*" onChange={(e) => setForm({ ...form, cover_photos: [...form.cover_photos, ...Array.from(e.target.files)] })} style={{ display: 'none' }} />
          </label>
        </div>
        
        {existingCovers.length === 0 && form.cover_photos.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', fontSize: '14px' }}>Belum ada foto yang dipilih</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
            {existingCovers.map((photo, i) => (
              <div key={`exist-${i}`} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1' }}>
                <img src={photo.startsWith('http') ? photo : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${photo}`} alt="Existing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setExistingCovers(existingCovers.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
              </div>
            ))}
            {form.cover_photos.map((file, i) => (
              <div key={`new-${i}`} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1' }}>
                <img src={URL.createObjectURL(file)} alt="New" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(59, 130, 246, 0.8)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '2px', fontWeight: 'bold' }}>BARU</div>
                <button onClick={() => setForm({ ...form, cover_photos: form.cover_photos.filter((_, idx) => idx !== i) })} style={{ position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
      <div><label className="label">Teks Pembuka (Diatas Doa/Mempelai)</label><textarea className="input" rows="3" value={form.opening_text} onChange={(e) => setForm({ ...form, opening_text: e.target.value })} style={{ resize: 'vertical' }} /></div>
      <div><label className="label">Teks Penutup (Terima Kasih)</label><textarea className="input" rows="3" value={form.closing_text} onChange={(e) => setForm({ ...form, closing_text: e.target.value })} style={{ resize: 'vertical' }} /></div>
      <button className="btn btn-primary" onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Detail'}</button>
    </div>
  );
}

function SettingsTab({ invitation, onSave, saving }) {
  const [form, setForm] = useState({ 
    whatsapp_template: invitation?.whatsapp_template || '', 
    music_url: invitation?.music_url || '',
    music_file: null,
    selected_music_title: ''
  });
  
  const [playing, setPlaying] = useState(false);
  const [previewingId, setPreviewingId] = useState(null);
  const audioPreviewRef = useRef(null);
  const libraryAudioRef = useRef(null);

  // Music library state
  const [musicLibrary, setMusicLibrary] = useState({ presets: [], user_music: [] });
  const [loadingMusic, setLoadingMusic] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryTab, setLibraryTab] = useState('presets');
  const [librarySearch, setLibrarySearch] = useState('');
  const [uploading, setUploading] = useState(false);

  // Load music library
  const loadMusicLibrary = async () => {
    setLoadingMusic(true);
    try {
      const res = await musicApi.list();
      setMusicLibrary(res.data || { presets: [], user_music: [] });
    } catch (err) {
      console.error('Failed to load music library:', err);
    } finally {
      setLoadingMusic(false);
    }
  };

  useEffect(() => {
    loadMusicLibrary();
  }, []);

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const cleanPath = url.replace(/^\/storage\//, '').replace(/^\//, '');
    return `${process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage'}/${cleanPath}`;
  };

  // Sync audio reproduction with playing state
  useEffect(() => {
    if (!audioPreviewRef.current) return;
    if (playing) {
      const src = audioPreviewRef.current.src;
      if (!src || src === window.location.href) {
        setPlaying(false);
        return;
      }
      try {
        const playPromise = audioPreviewRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn("Audio preview failed asynchronously: " + err.message);
            setPlaying(false);
          });
        }
      } catch (err) {
        console.warn("Audio preview failed synchronously: " + err.message);
        setPlaying(false);
      }
    } else {
      audioPreviewRef.current.pause();
    }
  }, [playing]);

  // Stop audio when source changes
  useEffect(() => {
    setPlaying(false);
    if (audioPreviewRef.current) {
        audioPreviewRef.current.load();
    }
  }, [form.music_url, form.music_file]);

  const handleSave = () => {
    const fd = new FormData();
    fd.append('whatsapp_template', form.whatsapp_template);
    if (form.music_file) {
      fd.append('music_url', form.music_file);
    } else {
      fd.append('music_url', form.music_url || '');
    }
    onSave(fd);
  };

  const removeMusic = () => {
    setForm({ ...form, music_url: '', music_file: null, selected_music_title: '' });
    setPlaying(false);
  };

  const selectFromLibrary = (item) => {
    stopLibraryPreview();
    setForm({ ...form, music_url: item.file_url, music_file: null, selected_music_title: item.title });
    setShowLibrary(false);
  };

  const handleUploadToLibrary = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', file.name.replace(/\.[^/.]+$/, ''));
      const res = await musicApi.upload(fd);
      await loadMusicLibrary();
      // Auto-select the uploaded music
      if (res.data) {
        setForm({ ...form, music_url: res.data.file_url, music_file: null, selected_music_title: res.data.title });
      }
      setShowLibrary(false);
    } catch (err) {
      console.error('Upload failed:', err);
      alert(err?.message || 'Gagal upload musik');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUserMusic = async (id) => {
    if (!confirm('Hapus musik ini?')) return;
    try {
      await musicApi.delete(id);
      await loadMusicLibrary();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Library audio preview
  const toggleLibraryPreview = (item) => {
    if (previewingId === item.id) {
      stopLibraryPreview();
    } else {
      setPreviewingId(item.id);
      if (libraryAudioRef.current) {
        libraryAudioRef.current.src = getFullUrl(item.file_url);
        try {
          const playPromise = libraryAudioRef.current.play();
          if (playPromise !== undefined) {
             playPromise.catch(() => { setPreviewingId(null); });
          }
        } catch (err) {
          console.warn("Library audio play sync throw: " + err.message);
          setPreviewingId(null);
        }
      }
    }
  };

  const stopLibraryPreview = () => {
    setPreviewingId(null);
    if (libraryAudioRef.current) {
      libraryAudioRef.current.pause();
      libraryAudioRef.current.currentTime = 0;
    }
  };

  const getMusicLabel = () => {
    if (form.music_file) return form.music_file.name;
    if (form.selected_music_title) return form.selected_music_title;
    if (form.music_url) {
      if (form.music_url.includes('sndcdn.com')) return 'Link SoundCloud (Legacy)';
      const name = form.music_url.split('/').pop() || 'Existing Audio';
      try {
        return decodeURIComponent(name);
      } catch(e) {
        return name;
      }
    }
    return 'Belum ada musik terpilih';
  };

  const currentAudioSrc = form.music_file 
    ? URL.createObjectURL(form.music_file) 
    : getFullUrl(form.music_url);

  const filteredPresets = musicLibrary.presets?.filter(m => 
    !librarySearch || 
    (m.title?.toLowerCase() || '').includes(librarySearch.toLowerCase()) || 
    (m.category?.toLowerCase() || '').includes(librarySearch.toLowerCase())
  ) || [];
  
  const filteredUserMusic = musicLibrary.user_music?.filter(m => 
    !librarySearch || 
    (m.title?.toLowerCase() || '').includes(librarySearch.toLowerCase())
  ) || [];

  return (
    <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
      <div>
        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Music size={16} /> Background Music
        </label>

        {/* Current Music Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'linear-gradient(135deg, #f8fafc, #eef2ff)', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: form.music_url || form.music_file ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#e0e7ff', color: form.music_url || form.music_file ? 'white' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', flexShrink: 0 }}>
                    <Music size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getMusicLabel()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {form.music_url || form.music_file ? 'Musik aktif' : 'Pilih dari library atau upload sendiri'}
                    </div>
                </div>
                {(form.music_url || form.music_file) && (
                   <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                       <button type="button" onClick={() => setPlaying(!playing)} className={`btn btn-sm ${playing ? 'btn-danger' : 'btn-secondary'}`} style={{ minWidth: '56px', fontSize: '12px' }}>
                           {playing ? '⏹ Stop' : '▶ Play'}
                       </button>
                       <button type="button" onClick={removeMusic} className="btn btn-sm btn-ghost" style={{ color: '#ef4444', padding: '6px' }}>
                           <Trash2 size={14} />
                       </button>
                   </div>
                )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button type="button" onClick={() => { setShowLibrary(true); setLibrarySearch(''); }} className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '13px' }}>
                <Music size={15} /> Pilih dari Library
              </button>
              <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Upload size={15} /> Upload File
                <input type="file" accept="audio/*" onChange={(e) => { const file = e.target.files[0]; if (file) setForm({ ...form, music_file: file, selected_music_title: '' }); }} style={{ display: 'none' }} />
              </label>
            </div>
        </div>

        {/* Hidden audio for current music preview */}
        <audio ref={audioPreviewRef} src={currentAudioSrc || undefined} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      </div>

      {/* Music Library Modal */}
      {showLibrary && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={(e) => { if (e.target === e.currentTarget) { stopLibraryPreview(); setShowLibrary(false); } }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', margin: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>🎵 Music Library</h3>
                <button onClick={() => { stopLibraryPreview(); setShowLibrary(false); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={16} /></button>
              </div>
              {/* Search */}
              <input type="text" placeholder="Cari musik..." value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#f8fafc' }} />
              {/* Tabs */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '12px', background: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
                <button onClick={() => setLibraryTab('presets')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: libraryTab === 'presets' ? 'white' : 'transparent', color: libraryTab === 'presets' ? '#4f46e5' : '#64748b', boxShadow: libraryTab === 'presets' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                  ⭐ Preset ({filteredPresets.length})
                </button>
                <button onClick={() => setLibraryTab('user')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: libraryTab === 'user' ? 'white' : 'transparent', color: libraryTab === 'user' ? '#4f46e5' : '#64748b', boxShadow: libraryTab === 'user' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                  🎤 Musik Saya ({filteredUserMusic.length})
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 24px' }}>
              {loadingMusic ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px' }}>Memuat music library...</p>
                </div>
              ) : (
                <>
                  {libraryTab === 'presets' && (
                    filteredPresets.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        <p style={{ fontSize: '14px' }}>Belum ada musik preset</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {filteredPresets.map((item) => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', background: form.music_url === item.file_url ? '#eef2ff' : '#fafafa', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => selectFromLibrary(item)}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: form.music_url === item.file_url ? '#6366f1' : '#e0e7ff', color: form.music_url === item.file_url ? 'white' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                              <Music size={18} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                              {item.category && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{item.category}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <button type="button" onClick={(e) => { e.stopPropagation(); toggleLibraryPreview(item); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: previewingId === item.id ? '#fee2e2' : 'white', color: previewingId === item.id ? '#ef4444' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}>
                                {previewingId === item.id ? '⏹' : '▶'}
                              </button>
                              {form.music_url === item.file_url && (
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✓</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                  {libraryTab === 'user' && (
                    <>
                      {/* Upload new button */}
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '12px', border: '2px dashed #cbd5e1', background: '#f8fafc', cursor: uploading ? 'wait' : 'pointer', color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '12px', transition: 'all 0.2s' }}>
                        {uploading ? (
                          <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Mengupload...</>
                        ) : (
                          <><Upload size={16} /> Upload Musik Baru (MP3, maks 10MB)</>
                        )}
                        <input type="file" accept="audio/*" onChange={handleUploadToLibrary} style={{ display: 'none' }} disabled={uploading} />
                      </label>
                      {filteredUserMusic.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                          <p style={{ fontSize: '14px' }}>Belum ada musik yang diupload</p>
                          <p style={{ fontSize: '12px', marginTop: '4px' }}>Upload musik pertama Anda di atas</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {filteredUserMusic.map((item) => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', background: form.music_url === item.file_url ? '#eef2ff' : '#fafafa', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => selectFromLibrary(item)}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: form.music_url === item.file_url ? '#f59e0b' : '#fef3c7', color: form.music_url === item.file_url ? 'white' : '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                                <Music size={18} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <button type="button" onClick={(e) => { e.stopPropagation(); toggleLibraryPreview(item); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: previewingId === item.id ? '#fee2e2' : 'white', color: previewingId === item.id ? '#ef4444' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}>
                                  {previewingId === item.id ? '⏹' : '▶'}
                                </button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteUserMusic(item.id); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                  <Trash2 size={13} />
                                </button>
                                {form.music_url === item.file_url && (
                                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✓</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Hidden audio for library preview */}
            <audio ref={libraryAudioRef} onEnded={() => setPreviewingId(null)} />
          </div>
        </div>
      )}

      <div>
        <label className="label">Template Pesan WhatsApp</label>
        <textarea className="input" rows="6" value={form.whatsapp_template} onChange={(e) => setForm({ ...form, whatsapp_template: e.target.value })} placeholder="Halo [nama_tamu], ini undangan pernikahan kami..." style={{ resize: 'vertical' }} />
        <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
          Variabel yang tersedia: <br/>
          <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>[nama_tamu]</code>
          <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>[link_undangan]</code>
          <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>[eticket]</code>
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</button>
    </div>
  );
}

function CoupleTab({ invitation, onSave, saving }) {
  const [form, setForm] = useState({ 
    bride_name: invitation?.bride_name || '', bride_full_name: invitation?.bride_full_name || '', bride_father: invitation?.bride_father || '', bride_mother: invitation?.bride_mother || '', bride_address: invitation?.bride_address || '', bride_photo: null, bride_photos: [],
    groom_name: invitation?.groom_name || '', groom_full_name: invitation?.groom_full_name || '', groom_father: invitation?.groom_father || '', groom_mother: invitation?.groom_mother || '', groom_address: invitation?.groom_address || '', groom_photo: null, groom_photos: [] 
  });

  const [existingBrideCovers, setExistingBrideCovers] = useState(
    invitation?.bride_photo ? (Array.isArray(invitation.bride_photo) ? invitation.bride_photo : [invitation.bride_photo]).filter(Boolean) : []
  );
  const [existingGroomCovers, setExistingGroomCovers] = useState(
    invitation?.groom_photo ? (Array.isArray(invitation.groom_photo) ? invitation.groom_photo : [invitation.groom_photo]).filter(Boolean) : []
  );

  const handleSave = () => {
    const fd = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'bride_photos') {
        form[key].forEach(f => fd.append('bride_photo[]', f));
      } else if (key === 'groom_photos') {
        form[key].forEach(f => fd.append('groom_photo[]', f));
      } else if (form[key] !== null && form[key] !== '' && key !== 'bride_photo' && key !== 'groom_photo') {
        fd.append(key, form[key]);
      }
    });

    existingBrideCovers.forEach(c => fd.append('bride_photo_existing[]', c));
    if (existingBrideCovers.length === 0) fd.append('bride_photo_existing[]', '');
    existingGroomCovers.forEach(c => fd.append('groom_photo_existing[]', c));
    if (existingGroomCovers.length === 0) fd.append('groom_photo_existing[]', '');

    onSave(fd);
  };

  const fields = [
    { section: 'Mempelai Wanita', prefix: 'bride', items: [{ key: 'bride_name', label: 'Nama Panggilan' }, { key: 'bride_full_name', label: 'Nama Lengkap' }, { key: 'bride_father', label: 'Nama Ayah' }, { key: 'bride_mother', label: 'Nama Ibu' }, { key: 'bride_address', label: 'Alamat' }] },
    { section: 'Mempelai Pria', prefix: 'groom', items: [{ key: 'groom_name', label: 'Nama Panggilan' }, { key: 'groom_full_name', label: 'Nama Lengkap' }, { key: 'groom_father', label: 'Nama Ayah' }, { key: 'groom_mother', label: 'Nama Ibu' }, { key: 'groom_address', label: 'Alamat' }] },
  ];
  return (
    <div style={{ display: 'grid', gap: '28px', maxWidth: '600px' }}>
      {fields.map((section) => {
        const existingArray = section.prefix === 'bride' ? existingBrideCovers : existingGroomCovers;
        const setExistingArray = section.prefix === 'bride' ? setExistingBrideCovers : setExistingGroomCovers;
        return (
          <div key={section.section}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: '0 0 16px', color: '#334155' }}>{section.section}</h3>
            <div style={{ display: 'grid', gap: '14px' }}>
              {section.items.map((item) => (<div key={item.key}><label className="label">{item.label}</label><input className="input" value={form[item.key]} onChange={(e) => setForm({ ...form, [item.key]: e.target.value })} /></div>))}
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="label" style={{ margin: 0 }}>Foto {section.section}</label>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', padding: '6px 12px' }}>
                    <Upload size={14} /> Tambah Foto
                    <input type="file" multiple accept="image/*" onChange={(e) => setForm({ ...form, [`${section.prefix}_photos`]: [...form[`${section.prefix}_photos`], ...Array.from(e.target.files)] })} style={{ display: 'none' }} />
                  </label>
                </div>

                {existingArray.length === 0 && form[`${section.prefix}_photos`].length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', fontSize: '14px' }}>Belum ada foto yang dipilih</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                    {existingArray.map((photo, i) => (
                      <div key={`exist-${i}`} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1' }}>
                        <img src={photo.startsWith('http') ? photo : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${photo}`} alt="Existing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => setExistingArray(existingArray.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
                      </div>
                    ))}
                    {form[`${section.prefix}_photos`].map((file, i) => (
                      <div key={`new-${i}`} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1' }}>
                        <img src={URL.createObjectURL(file)} alt="New" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(59, 130, 246, 0.8)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '2px', fontWeight: 'bold' }}>BARU</div>
                        <button onClick={() => setForm({ ...form, [`${section.prefix}_photos`]: form[`${section.prefix}_photos`].filter((_, idx) => idx !== i) })} style={{ position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <button className="btn btn-primary" onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Mempelai'}</button>
    </div>
  );
}

function EventsTab({ invitationId }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', date: '', time_start: '', time_end: '', location: '', latitude: '', longitude: '', sort_order: '' }); 
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { eventsApi.list(invitationId).then((res) => setItems(res.data || [])).finally(() => setLoading(false)); }, [invitationId]);
  
  const handleSave = async () => { 
    try { 
      // Format time safely and omit empty strings for nullable numbers
      const payload = { ...form };
      if (payload.time_start) payload.time_start = payload.time_start.substring(0, 5);
      if (payload.time_end) payload.time_end = payload.time_end.substring(0, 5);
      if (payload.sort_order === '' || payload.sort_order === null) payload.sort_order = 0;
      if (payload.latitude === '') payload.latitude = null;
      if (payload.longitude === '') payload.longitude = null;

      if (editingId) {
        const res = await eventsApi.update(invitationId, editingId, payload);
        setItems(prev => prev.map(item => item.id === editingId ? (res.data || res) : item));
        toast.success('Acara diperbarui');
      } else {
        const res = await eventsApi.create(invitationId, payload); 
        setItems(prev => [...prev, res.data || res]); 
        toast.success('Acara ditambahkan');
      }
      setForm({ name: '', date: '', time_start: '', time_end: '', location: '', latitude: '', longitude: '', sort_order: '' }); 
      setShowForm(false); 
      setEditingId(null);
    } catch (err) { 
      toast.error(err?.message || err?.error || 'Gagal menyimpan acara'); 
    } 
  };

  const handleEdit = (event) => {
    setForm({ name: event.name || '', date: event.date || '', time_start: event.time_start || '', time_end: event.time_end || '', location: event.location || '', latitude: event.latitude || '', longitude: event.longitude || '', sort_order: event.sort_order || '' });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = (eventId) => { confirmAction('Hapus acara ini?', async () => { try { await eventsApi.delete(invitationId, eventId); setItems(prev => prev.filter((e) => e.id !== eventId)); toast.success('Acara dihapus'); } catch { toast.error('Gagal menghapus acara'); } }); };
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: 0 }}>Daftar Acara</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ name: '', date: '', time_start: '', time_end: '', location: '', latitude: '', longitude: '', sort_order: '' }); setEditingId(null); setShowForm(!showForm); }}>{showForm ? 'Batal' : <><Plus size={14} /> Tambah</>}</button>
      </div>
      {showForm && (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
          {[{ key: 'name', label: 'Nama Acara', placeholder: 'Akad Nikah' }, { key: 'date', label: 'Tanggal', type: 'date' }, { key: 'time_start', label: 'Waktu Mulai', type: 'time' }, { key: 'time_end', label: 'Waktu Selesai (Opsional)', type: 'time' }, { key: 'location', label: 'Tempat/Lokasi', placeholder: 'Masjid Al-Ikhlas' }, { key: 'latitude', label: 'Latitude Peta', placeholder: '-6.200000' }, { key: 'longitude', label: 'Longitude Peta', placeholder: '106.816666' }, { key: 'sort_order', label: 'Urutan (Makin kecil makin awal)', type: 'number' }].map((f) => (
            <div key={f.key}><label className="label">{f.label}</label><input className="input" type={f.type || 'text'} placeholder={f.placeholder || ''} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} /></div>
          ))}
          <button className="btn btn-primary btn-sm" onClick={handleSave}><Save size={14} /> {editingId ? 'Update Acara' : 'Simpan Acara'}</button>
        </div>
      )}
      {items.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Belum ada acara ditambahkan</p> : (
        <div style={{ display: 'grid', gap: '12px' }}>{items.map((event) => (
          <div key={event.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontWeight: '600', color: '#1e293b' }}>{event.name}</div><div style={{ fontSize: '13px', color: '#64748b' }}>{event.date} • {event.time_start} {event.time_end ? `- ${event.time_end}` : ''} • {event.location}</div></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(event)} style={{ color: '#3b82f6' }}>Edit</button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(event.id)} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}

function GalleryTab({ invitationId }) {
  const [photos, setPhotos] = useState([]); const [loading, setLoading] = useState(true); const [uploading, setUploading] = useState(false);
  useEffect(() => { gallery.list(invitationId).then((res) => setPhotos(res.data || [])).finally(() => setLoading(false)); }, [invitationId]);
  const handleUpload = async (e) => { const files = e.target.files; if (!files.length) return; setUploading(true); try { for (const file of files) { const fd = new FormData(); fd.append('photo', file); const res = await gallery.upload(invitationId, fd); setPhotos((prev) => [...prev, res.data || res]); } toast.success('Upload berhasil'); } catch(err) { toast.error(err?.message || 'Gagal upload foto'); } finally { setUploading(false); } };
  const handleDelete = (photoId) => { confirmAction('Hapus foto ini?', async () => { try { await gallery.delete(invitationId, photoId); setPhotos(prev => prev.filter((p) => (p.id || p.path || p.photo) !== photoId)); toast.success('Foto dihapus'); } catch { toast.error('Gagal menghapus foto'); } }); };
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: 0 }}>Galeri Foto</h3>
        <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}><Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}<input type="file" multiple accept="image/*" onChange={handleUpload} style={{ display: 'none' }} /></label>
      </div>
      {photos.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Belum ada foto di galeri</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {photos.map((photo) => (
            <div key={photo.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1' }}>
              <img src={(photo.path || photo.photo).startsWith('http') ? (photo.path || photo.photo) : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${photo.path || photo.photo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => handleDelete(photo.id)} style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StoryTab({ invitationId }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', date: '', description: '', sort_order: '', photo: null, photoFile: null }); 
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loveStories.list(invitationId).then((res) => setItems(res.data || [])).finally(() => setLoading(false)); }, [invitationId]);
  
  const handleSave = async () => { 
    try { 
      const fd = new FormData();
      Object.keys(form).forEach(k => {
        if (k === 'photoFile' && form[k]) {
          fd.append('photo', form[k]);
        } else if (k !== 'photo' && k !== 'photoFile' && form[k] !== null && form[k] !== undefined) {
          if (k === 'date' && form[k] === '') return;
          if (k === 'sort_order' && form[k] === '') {
            fd.append(k, 0);
          } else {
            fd.append(k, form[k]);
          }
        }
      });

      if (editingId) {
        const res = await loveStories.update(invitationId, editingId, fd);
        setItems(prev => prev.map(item => item.id === editingId ? (res.data || res) : item));
        toast.success('Cerita diperbarui');
      } else {
        const res = await loveStories.create(invitationId, fd); 
        setItems(prev => [...prev, res.data || res]); 
        toast.success('Cerita ditambahkan');
      }
      setForm({ title: '', date: '', description: '', sort_order: '', photo: null, photoFile: null }); 
      setShowForm(false); 
      setEditingId(null);
    } catch { toast.error('Gagal menyimpan cerita'); } 
  };

  const handleEdit = (story) => {
    setForm({ title: story.title || '', date: story.date || '', description: story.description || '', sort_order: story.sort_order || '', photo: story.photo, photoFile: null });
    setEditingId(story.id);
    setShowForm(true);
  };

  const handleDelete = (storyId) => { confirmAction('Hapus cerita ini?', async () => { try { await loveStories.delete(invitationId, storyId); setItems(prev => prev.filter((s) => s.id !== storyId)); toast.success('Cerita dihapus'); } catch { toast.error('Gagal menghapus cerita'); } }); };
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: 0 }}>Love Story</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ title: '', date: '', description: '', sort_order: '', photo: null, photoFile: null }); setEditingId(null); setShowForm(!showForm); }}>{showForm ? 'Batal' : <><Plus size={14} /> Tambah</>}</button>
      </div>
      {showForm && (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
          <div><label className="label">Judul</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Pertama Bertemu" /></div>
          <div><label className="label">Tanggal</label><input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><label className="label">Urutan</label><input className="input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} placeholder="1" /></div>
          <div><label className="label">Deskripsi</label><textarea className="input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <div>
            <label className="label">Foto Cerita</label>
            <input type="file" className="input" accept="image/*" onChange={(e) => setForm({ ...form, photoFile: e.target.files[0] })} />
            {form.photo && !form.photoFile && <div className="mt-2 text-xs text-blue-500">Gambar saat ini: {form.photo}</div>}
          </div>
          <button className="btn btn-primary btn-sm mt-2" onClick={handleSave}><Save size={14} /> {editingId ? 'Update' : 'Simpan'}</button>
        </div>
      )}
      {items.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Belum ada love story</p> : (
        <div style={{ display: 'grid', gap: '12px' }}>{items.map((story) => (
          <div key={story.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {story.photo && (
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={(story.photo).startsWith('http') ? story.photo : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${story.photo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div><div style={{ fontWeight: '600', color: '#1e293b' }}>{story.title}</div><div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{story.date} {story.sort_order ? `(Urutan: ${story.sort_order})` : ''}</div><div style={{ fontSize: '14px', color: '#475569', marginTop: '6px' }}>{story.description}</div></div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(story)} style={{ color: '#3b82f6' }}>Edit</button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(story.id)} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}

function GiftTab({ invitationId }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ bank_name: '', account_holder: '', account_number: '', sort_order: '' }); 
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { giftAccounts.list(invitationId).then((res) => setItems(res.data || [])).finally(() => setLoading(false)); }, [invitationId]);
  
  const handleSave = async () => { 
    try { 
      const payload = { ...form };
      if (payload.sort_order === '' || payload.sort_order === null) payload.sort_order = 0;

      if (editingId) {
        const res = await giftAccounts.update(invitationId, editingId, payload);
        setItems(prev => prev.map(item => item.id === editingId ? (res.data || res) : item));
        toast.success('Rekening diperbarui');
      } else {
        const res = await giftAccounts.create(invitationId, payload); 
        setItems(prev => [...prev, res.data || res]); 
        toast.success('Rekening ditambahkan');
      }
      setForm({ bank_name: '', account_holder: '', account_number: '', sort_order: '' }); 
      setShowForm(false); 
      setEditingId(null);
    } catch (err) { 
      toast.error(err?.message || err?.error || 'Gagal menyimpan rekening'); 
    } 
  };

  const handleEdit = (acc) => {
    setForm({ bank_name: acc.bank_name || '', account_holder: acc.account_holder || '', account_number: acc.account_number || '', sort_order: acc.sort_order || '' });
    setEditingId(acc.id);
    setShowForm(true);
  };

  const handleDelete = (accountId) => { confirmAction('Hapus rekening ini?', async () => { try { await giftAccounts.delete(invitationId, accountId); setItems(prev => prev.filter((a) => a.id !== accountId)); toast.success('Rekening dihapus'); } catch { toast.error('Gagal menghapus rekening'); } }); };
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: 0 }}>Rekening Hadiah</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ bank_name: '', account_holder: '', account_number: '', sort_order: '' }); setEditingId(null); setShowForm(!showForm); }}>{showForm ? 'Batal' : <><Plus size={14} /> Tambah</>}</button>
      </div>
      {showForm && (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
          <div><label className="label">Nama Bank / Wallet</label><input className="input" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="BCA / DANA" /></div>
          <div><label className="label">Nama Pemilik</label><input className="input" value={form.account_holder} onChange={(e) => setForm({ ...form, account_holder: e.target.value })} /></div>
          <div><label className="label">Nomor Rekening</label><input className="input" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} /></div>
          <div><label className="label">Urutan</label><input className="input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} placeholder="1" /></div>
          <button className="btn btn-primary btn-sm" onClick={handleSave}><Save size={14} /> {editingId ? 'Update' : 'Simpan'}</button>
        </div>
      )}
      {items.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Belum ada rekening hadiah</p> : (
        <div style={{ display: 'grid', gap: '12px' }}>{items.map((acc) => (
          <div key={acc.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontWeight: '600', color: '#1e293b' }}>{acc.bank_name}</div><div style={{ fontSize: '13px', color: '#64748b' }}>{acc.account_holder} - {acc.account_number}</div></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(acc)} style={{ color: '#3b82f6' }}>Edit</button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(acc.id)} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
