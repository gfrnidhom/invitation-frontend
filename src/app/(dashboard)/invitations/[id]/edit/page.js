'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { invitations, events as eventsApi, loveStories, giftAccounts, gallery } from '@/lib/api';

const tabs = [
  { id: 'detail', label: '📋 Detail', icon: '📋' },
  { id: 'couple', label: '💑 Mempelai', icon: '💑' },
  { id: 'events', label: '📅 Acara', icon: '📅' },
  { id: 'gallery', label: '🖼️ Galeri', icon: '🖼️' },
  { id: 'story', label: '💕 Love Story', icon: '💕' },
  { id: 'gift', label: '🎁 Hadiah', icon: '🎁' },
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
    invitations.get(id)
      .then((res) => setInvitation(res.data || res))
      .catch(() => router.push('/invitations'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const saveInvitation = async (data) => {
    setSaving(true);
    setMessage('');
    try {
      const res = await invitations.update(id, data);
      setInvitation(res.data || res);
      setMessage('✅ Tersimpan!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('❌ Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/invitations')} style={{ marginBottom: '8px' }}>
            ← Kembali
          </button>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            Edit Undangan
          </h1>
        </div>
        {message && (
          <span style={{ fontSize: '14px', fontWeight: '500', color: message.includes('✅') ? '#10b981' : '#ef4444' }}>
            {message}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-list" style={{ marginBottom: '24px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card" style={{ padding: '28px' }}>
        {activeTab === 'detail' && <DetailTab invitation={invitation} onSave={saveInvitation} saving={saving} />}
        {activeTab === 'couple' && <CoupleTab invitation={invitation} onSave={saveInvitation} saving={saving} />}
        {activeTab === 'events' && <EventsTab invitationId={id} />}
        {activeTab === 'gallery' && <GalleryTab invitationId={id} />}
        {activeTab === 'story' && <StoryTab invitationId={id} />}
        {activeTab === 'gift' && <GiftTab invitationId={id} />}
      </div>
    </div>
  );
}

// ─── Detail Tab ───
function DetailTab({ invitation, onSave, saving }) {
  const [form, setForm] = useState({
    title: invitation?.title || '',
    wedding_date: invitation?.wedding_date || '',
    opening_text: invitation?.opening_text || '',
    closing_text: invitation?.closing_text || '',
  });

  return (
    <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
      <div>
        <label className="label">Judul Undangan</label>
        <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <label className="label">Tanggal Pernikahan</label>
        <input className="input" type="date" value={form.wedding_date} onChange={(e) => setForm({ ...form, wedding_date: e.target.value })} />
      </div>
      <div>
        <label className="label">Teks Pembuka</label>
        <textarea className="input" rows="3" value={form.opening_text} onChange={(e) => setForm({ ...form, opening_text: e.target.value })}
          style={{ resize: 'vertical' }} />
      </div>
      <div>
        <label className="label">Teks Penutup</label>
        <textarea className="input" rows="3" value={form.closing_text} onChange={(e) => setForm({ ...form, closing_text: e.target.value })}
          style={{ resize: 'vertical' }} />
      </div>
      <button className="btn btn-primary" onClick={() => onSave(form)} disabled={saving}>
        {saving ? 'Menyimpan...' : '💾 Simpan Detail'}
      </button>
    </div>
  );
}

// ─── Couple Tab ───
function CoupleTab({ invitation, onSave, saving }) {
  const [form, setForm] = useState({
    bride_name: invitation?.bride_name || '',
    bride_father: invitation?.bride_father || '',
    bride_mother: invitation?.bride_mother || '',
    groom_name: invitation?.groom_name || '',
    groom_father: invitation?.groom_father || '',
    groom_mother: invitation?.groom_mother || '',
  });

  const fields = [
    { section: 'Mempelai Wanita', items: [
      { key: 'bride_name', label: 'Nama Lengkap' },
      { key: 'bride_father', label: 'Nama Ayah' },
      { key: 'bride_mother', label: 'Nama Ibu' },
    ]},
    { section: 'Mempelai Pria', items: [
      { key: 'groom_name', label: 'Nama Lengkap' },
      { key: 'groom_father', label: 'Nama Ayah' },
      { key: 'groom_mother', label: 'Nama Ibu' },
    ]},
  ];

  return (
    <div style={{ display: 'grid', gap: '28px', maxWidth: '600px' }}>
      {fields.map((section) => (
        <div key={section.section}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: '0 0 16px', color: '#334155' }}>
            {section.section}
          </h3>
          <div style={{ display: 'grid', gap: '14px' }}>
            {section.items.map((item) => (
              <div key={item.key}>
                <label className="label">{item.label}</label>
                <input className="input" value={form[item.key]} onChange={(e) => setForm({ ...form, [item.key]: e.target.value })} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="btn btn-primary" onClick={() => onSave(form)} disabled={saving}>
        {saving ? 'Menyimpan...' : '💾 Simpan Mempelai'}
      </button>
    </div>
  );
}

// ─── Events Tab ───
function EventsTab({ invitationId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', date: '', time: '', location: '', address: '', maps_url: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    eventsApi.list(invitationId)
      .then((res) => setItems(res.data || []))
      .finally(() => setLoading(false));
  }, [invitationId]);

  const handleAdd = async () => {
    try {
      const res = await eventsApi.create(invitationId, form);
      setItems([...items, res.data || res]);
      setForm({ name: '', date: '', time: '', location: '', address: '', maps_url: '' });
      setShowForm(false);
    } catch { alert('Gagal menambahkan acara'); }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Hapus acara ini?')) return;
    await eventsApi.delete(invitationId, eventId);
    setItems(items.filter((e) => e.id !== eventId));
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: 0 }}>Daftar Acara</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Batal' : '➕ Tambah'}
        </button>
      </div>
      {showForm && (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
          {[
            { key: 'name', label: 'Nama Acara', placeholder: 'Akad Nikah' },
            { key: 'date', label: 'Tanggal', type: 'date' },
            { key: 'time', label: 'Waktu', placeholder: '08:00 - 10:00' },
            { key: 'location', label: 'Tempat', placeholder: 'Masjid Al-Ikhlas' },
            { key: 'address', label: 'Alamat', placeholder: 'Jl. Contoh No. 123' },
            { key: 'maps_url', label: 'Google Maps URL', placeholder: 'https://maps.google.com/...' },
          ].map((f) => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input className="input" type={f.type || 'text'} placeholder={f.placeholder || ''} value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>💾 Simpan Acara</button>
        </div>
      )}
      {items.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Belum ada acara ditambahkan</p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {items.map((event) => (
            <div key={event.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>{event.name}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{event.date} • {event.time} • {event.location}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(event.id)} style={{ color: 'var(--color-danger)' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Gallery Tab ───
function GalleryTab({ invitationId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    gallery.list(invitationId)
      .then((res) => setPhotos(res.data || []))
      .finally(() => setLoading(false));
  }, [invitationId]);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('photo', file);
        const res = await gallery.upload(invitationId, fd);
        setPhotos((prev) => [...prev, res.data || res]);
      }
    } catch { alert('Gagal upload foto'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (photoId) => {
    if (!confirm('Hapus foto ini?')) return;
    await gallery.delete(invitationId, photoId);
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: 0 }}>Galeri Foto</h3>
        <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
          {uploading ? 'Uploading...' : '📷 Upload'}
          <input type="file" multiple accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>
      {photos.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Belum ada foto di galeri</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {photos.map((photo) => (
            <div key={photo.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1' }}>
              <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${photo.path || photo.photo}`}
                alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => handleDelete(photo.id)} style={{
                position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px',
                borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                cursor: 'pointer', fontSize: '14px',
              }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Story Tab ───
function StoryTab({ invitationId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', date: '', description: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loveStories.list(invitationId)
      .then((res) => setItems(res.data || []))
      .finally(() => setLoading(false));
  }, [invitationId]);

  const handleAdd = async () => {
    try {
      const res = await loveStories.create(invitationId, form);
      setItems([...items, res.data || res]);
      setForm({ title: '', date: '', description: '' });
      setShowForm(false);
    } catch { alert('Gagal menambahkan cerita'); }
  };

  const handleDelete = async (storyId) => {
    if (!confirm('Hapus cerita ini?')) return;
    await loveStories.delete(invitationId, storyId);
    setItems(items.filter((s) => s.id !== storyId));
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: 0 }}>Love Story</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Batal' : '➕ Tambah'}
        </button>
      </div>
      {showForm && (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
          <div><label className="label">Judul</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Pertama Bertemu" /></div>
          <div><label className="label">Tanggal</label><input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><label className="label">Deskripsi</label><textarea className="input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>💾 Simpan</button>
        </div>
      )}
      {items.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Belum ada love story</p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {items.map((story) => (
            <div key={story.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>{story.title}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{story.date}</div>
                <div style={{ fontSize: '14px', color: '#475569', marginTop: '6px' }}>{story.description}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(story.id)} style={{ color: 'var(--color-danger)' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Gift Tab ───
function GiftTab({ invitationId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ bank_name: '', account_name: '', account_number: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    giftAccounts.list(invitationId)
      .then((res) => setItems(res.data || []))
      .finally(() => setLoading(false));
  }, [invitationId]);

  const handleAdd = async () => {
    try {
      const res = await giftAccounts.create(invitationId, form);
      setItems([...items, res.data || res]);
      setForm({ bank_name: '', account_name: '', account_number: '' });
      setShowForm(false);
    } catch { alert('Gagal menambahkan rekening'); }
  };

  const handleDelete = async (accountId) => {
    if (!confirm('Hapus rekening ini?')) return;
    await giftAccounts.delete(invitationId, accountId);
    setItems(items.filter((a) => a.id !== accountId));
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', margin: 0 }}>Rekening Hadiah</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Batal' : '➕ Tambah'}
        </button>
      </div>
      {showForm && (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
          <div><label className="label">Nama Bank</label><input className="input" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="BCA" /></div>
          <div><label className="label">Nama Pemilik</label><input className="input" value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} /></div>
          <div><label className="label">Nomor Rekening</label><input className="input" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} /></div>
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>💾 Simpan</button>
        </div>
      )}
      {items.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Belum ada rekening hadiah</p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {items.map((acc) => (
            <div key={acc.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>{acc.bank_name}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{acc.account_name} - {acc.account_number}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(acc.id)} style={{ color: 'var(--color-danger)' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
