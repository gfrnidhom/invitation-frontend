'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Upload, X, FileText, Heart, Calendar, Image, BookHeart, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { confirmAction } from '@/lib/toast-confirm';
import { invitations, events as eventsApi, loveStories, giftAccounts, gallery } from '@/lib/api';

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
  const [form, setForm] = useState({ whatsapp_template: invitation?.whatsapp_template || '', music_url: invitation?.music_url || '' });
  const [musicQuery, setMusicQuery] = useState('');
  const [musicResults, setMusicResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [playingTrack, setPlayingTrack] = useState(null);
  const [audioRef, setAudioRef] = useState(null);

  const searchMusic = async () => {
    if (!musicQuery) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/soundcloud?q=${encodeURIComponent(musicQuery)}`);
      const data = await res.json();
      setMusicResults(data.results || []);
    } catch { toast.error('Gagal mencari lagu'); }
    finally { setSearching(false); }
  };

  const togglePlay = (url) => {
    if (playingTrack === url) {
      audioRef?.pause();
      setPlayingTrack(null);
    } else {
      if (audioRef) audioRef.pause();
      const newAudio = new Audio(url);
      newAudio.play();
      newAudio.onended = () => setPlayingTrack(null);
      setAudioRef(newAudio);
      setPlayingTrack(url);
    }
  };

  // Cleanup audio on unmount or tab switch
  useEffect(() => {
    return () => { if (audioRef) audioRef.pause(); }
  }, [audioRef]);

  return (
    <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
      <div>
        <label className="label">Background Music URL</label>
        <input className="input mb-2" placeholder="https://contoh.com/lagu.mp3" value={form.music_url} onChange={(e) => setForm({ ...form, music_url: e.target.value })} />
        <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Masukkan URL MP3 secara manual, atau <strong>Cari Lagu via SoundCloud (Full Track)</strong> secara otomatis di bawah ini:</div>
        
        <div className="flex gap-2 mb-4">
          <input className="input" placeholder="Cari judul lagu / artis..." value={musicQuery} onChange={(e) => setMusicQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchMusic()} />
          <button className="btn btn-secondary whitespace-nowrap" onClick={searchMusic} disabled={searching}>{searching ? 'Mencari...' : 'Cari Lagu'}</button>
        </div>
        
        {musicResults.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 mb-4">
            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Hasil Pencarian SoundCloud</div>
            {musicResults.map((track) => (
              <div key={track.id} className={`flex items-center justify-between bg-white p-2 rounded-lg border ${form.music_url === track.url ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-100'} shadow-sm hover:border-brand-200 transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className="relative group cursor-pointer" onClick={() => togglePlay(track.url)}>
                    <img src={track.artwork || 'https://via.placeholder.com/60x60?text=No+Cover'} alt={track.title} className={`w-10 h-10 rounded-md object-cover transition-opacity ${playingTrack === track.url ? 'opacity-70' : ''}`} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                      {playingTrack === track.url ? (
                        <div className="w-4 h-4 bg-white rounded-sm" />
                      ) : (
                        <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1" />
                      )}
                    </div>
                  </div>
                  <div className="cursor-pointer flex-1 min-w-0" onClick={() => { setForm({ ...form, music_url: track.url }); if (audioRef) audioRef.pause(); setPlayingTrack(null); }}>
                    <div className="font-semibold text-sm text-slate-800 line-clamp-1">{track.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{track.artist}</div>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm text-brand-600" onClick={() => { setForm({ ...form, music_url: track.url }); if (audioRef) audioRef.pause(); setPlayingTrack(null); }}>{form.music_url === track.url ? 'Terpilih' : 'Pilih'}</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="label">Template Pesan WhatsApp</label>
        <textarea className="input" rows="6" value={form.whatsapp_template} onChange={(e) => setForm({ ...form, whatsapp_template: e.target.value })} placeholder="Halo [nama_tamu], ini undangan pernikahan kami..." style={{ resize: 'vertical' }} />
        <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
          Variabel yang tersedia: <br/>
          <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>[nama_tamu]</code>
          <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>[link_undangan]</code>
        </div>
      </div>
      <button className="btn btn-primary" onClick={() => onSave(form)} disabled={saving}><Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</button>
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
  const [form, setForm] = useState({ name: '', date: '', time: '', location: '', address: '', maps_url: '' }); 
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { eventsApi.list(invitationId).then((res) => setItems(res.data || [])).finally(() => setLoading(false)); }, [invitationId]);
  
  const handleSave = async () => { 
    try { 
      if (editingId) {
        const res = await eventsApi.update(invitationId, editingId, form);
        setItems(prev => prev.map(item => item.id === editingId ? (res.data || res) : item));
        toast.success('Acara diperbarui');
      } else {
        const res = await eventsApi.create(invitationId, form); 
        setItems(prev => [...prev, res.data || res]); 
        toast.success('Acara ditambahkan');
      }
      setForm({ name: '', date: '', time: '', location: '', address: '', maps_url: '' }); 
      setShowForm(false); 
      setEditingId(null);
    } catch { toast.error('Gagal menyimpan acara'); } 
  };

  const handleEdit = (event) => {
    setForm({ name: event.name || '', date: event.date || '', time: event.time || '', location: event.location || '', address: event.address || '', maps_url: event.maps_url || '' });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = (eventId) => { confirmAction('Hapus acara ini?', async () => { try { await eventsApi.delete(invitationId, eventId); setItems(prev => prev.filter((e) => e.id !== eventId)); toast.success('Acara dihapus'); } catch { toast.error('Gagal menghapus acara'); } }); };
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: 0 }}>Daftar Acara</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ name: '', date: '', time: '', location: '', address: '', maps_url: '' }); setEditingId(null); setShowForm(!showForm); }}>{showForm ? 'Batal' : <><Plus size={14} /> Tambah</>}</button>
      </div>
      {showForm && (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
          {[{ key: 'name', label: 'Nama Acara', placeholder: 'Akad Nikah' }, { key: 'date', label: 'Tanggal', type: 'date' }, { key: 'time', label: 'Waktu', placeholder: '08:00 - 10:00' }, { key: 'location', label: 'Tempat', placeholder: 'Masjid Al-Ikhlas' }, { key: 'address', label: 'Alamat', placeholder: 'Jl. Contoh No. 123' }, { key: 'maps_url', label: 'Google Maps URL', placeholder: 'https://maps.google.com/...' }].map((f) => (
            <div key={f.key}><label className="label">{f.label}</label><input className="input" type={f.type || 'text'} placeholder={f.placeholder || ''} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} /></div>
          ))}
          <button className="btn btn-primary btn-sm" onClick={handleSave}><Save size={14} /> {editingId ? 'Update Acara' : 'Simpan Acara'}</button>
        </div>
      )}
      {items.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Belum ada acara ditambahkan</p> : (
        <div style={{ display: 'grid', gap: '12px' }}>{items.map((event) => (
          <div key={event.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontWeight: '600', color: '#1e293b' }}>{event.name}</div><div style={{ fontSize: '13px', color: '#64748b' }}>{event.date} • {event.time} • {event.location}</div></div>
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
  const [form, setForm] = useState({ title: '', date: '', description: '' }); 
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loveStories.list(invitationId).then((res) => setItems(res.data || [])).finally(() => setLoading(false)); }, [invitationId]);
  
  const handleSave = async () => { 
    try { 
      if (editingId) {
        const res = await loveStories.update(invitationId, editingId, form);
        setItems(prev => prev.map(item => item.id === editingId ? (res.data || res) : item));
        toast.success('Cerita diperbarui');
      } else {
        const res = await loveStories.create(invitationId, form); 
        setItems(prev => [...prev, res.data || res]); 
        toast.success('Cerita ditambahkan');
      }
      setForm({ title: '', date: '', description: '' }); 
      setShowForm(false); 
      setEditingId(null);
    } catch { toast.error('Gagal menyimpan cerita'); } 
  };

  const handleEdit = (story) => {
    setForm({ title: story.title || '', date: story.date || '', description: story.description || '' });
    setEditingId(story.id);
    setShowForm(true);
  };

  const handleDelete = (storyId) => { confirmAction('Hapus cerita ini?', async () => { try { await loveStories.delete(invitationId, storyId); setItems(prev => prev.filter((s) => s.id !== storyId)); toast.success('Cerita dihapus'); } catch { toast.error('Gagal menghapus cerita'); } }); };
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: 0 }}>Love Story</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ title: '', date: '', description: '' }); setEditingId(null); setShowForm(!showForm); }}>{showForm ? 'Batal' : <><Plus size={14} /> Tambah</>}</button>
      </div>
      {showForm && (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
          <div><label className="label">Judul</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Pertama Bertemu" /></div>
          <div><label className="label">Tanggal</label><input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><label className="label">Deskripsi</label><textarea className="input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <button className="btn btn-primary btn-sm" onClick={handleSave}><Save size={14} /> {editingId ? 'Update' : 'Simpan'}</button>
        </div>
      )}
      {items.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Belum ada love story</p> : (
        <div style={{ display: 'grid', gap: '12px' }}>{items.map((story) => (
          <div key={story.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div><div style={{ fontWeight: '600', color: '#1e293b' }}>{story.title}</div><div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{story.date}</div><div style={{ fontSize: '14px', color: '#475569', marginTop: '6px' }}>{story.description}</div></div>
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
  const [form, setForm] = useState({ bank_name: '', account_holder: '', account_number: '' }); 
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { giftAccounts.list(invitationId).then((res) => setItems(res.data || [])).finally(() => setLoading(false)); }, [invitationId]);
  
  const handleSave = async () => { 
    try { 
      if (editingId) {
        const res = await giftAccounts.update(invitationId, editingId, form);
        setItems(prev => prev.map(item => item.id === editingId ? (res.data || res) : item));
        toast.success('Rekening diperbarui');
      } else {
        const res = await giftAccounts.create(invitationId, form); 
        setItems(prev => [...prev, res.data || res]); 
        toast.success('Rekening ditambahkan');
      }
      setForm({ bank_name: '', account_holder: '', account_number: '' }); 
      setShowForm(false); 
      setEditingId(null);
    } catch { toast.error('Gagal menyimpan rekening'); } 
  };

  const handleEdit = (acc) => {
    setForm({ bank_name: acc.bank_name || '', account_holder: acc.account_holder || '', account_number: acc.account_number || '' });
    setEditingId(acc.id);
    setShowForm(true);
  };

  const handleDelete = (accountId) => { confirmAction('Hapus rekening ini?', async () => { try { await giftAccounts.delete(invitationId, accountId); setItems(prev => prev.filter((a) => a.id !== accountId)); toast.success('Rekening dihapus'); } catch { toast.error('Gagal menghapus rekening'); } }); };
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: 0 }}>Rekening Hadiah</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ bank_name: '', account_holder: '', account_number: '' }); setEditingId(null); setShowForm(!showForm); }}>{showForm ? 'Batal' : <><Plus size={14} /> Tambah</>}</button>
      </div>
      {showForm && (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
          <div><label className="label">Nama Bank</label><input className="input" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="BCA" /></div>
          <div><label className="label">Nama Pemilik</label><input className="input" value={form.account_holder} onChange={(e) => setForm({ ...form, account_holder: e.target.value })} /></div>
          <div><label className="label">Nomor Rekening</label><input className="input" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} /></div>
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
