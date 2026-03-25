'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { guests } from '@/lib/api';

export default function GuestsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [guestList, setGuestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', group: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    guests.list(id)
      .then((res) => setGuestList(res.data || []))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    setSaving(true);
    try {
      const res = await guests.create(id, form);
      setGuestList([...guestList, res.data || res]);
      setForm({ name: '', phone: '', email: '', address: '', group: '' });
      setShowModal(false);
    } catch { alert('Gagal menambahkan tamu'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (guestId) => {
    if (!confirm('Hapus tamu ini?')) return;
    await guests.delete(id, guestId);
    setGuestList(guestList.filter((g) => g.id !== guestId));
  };

  const handleCheckIn = async (guestId) => {
    try {
      await guests.checkIn(guestId);
      setGuestList(guestList.map((g) => g.id === guestId ? { ...g, checked_in: true } : g));
    } catch { alert('Gagal check-in'); }
  };

  const filtered = guestList.filter((g) =>
    g.name?.toLowerCase().includes(search.toLowerCase())
  );

  const rsvpStats = {
    total: guestList.length,
    confirmed: guestList.filter((g) => g.rsvp_status === 'confirmed' || g.rsvp_status === 'hadir').length,
    declined: guestList.filter((g) => g.rsvp_status === 'declined' || g.rsvp_status === 'tidak_hadir').length,
    pending: guestList.filter((g) => !g.rsvp_status || g.rsvp_status === 'pending').length,
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      {/* Header */}
      <button className="btn btn-ghost btn-sm" onClick={() => router.push('/invitations')} style={{ marginBottom: '8px' }}>
        ← Kembali
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          Daftar Tamu
        </h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Tambah Tamu
        </button>
      </div>

      {/* RSVP Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Tamu', value: rsvpStats.total, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Hadir', value: rsvpStats.confirmed, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Tidak Hadir', value: rsvpStats.declined, color: '#ef4444', bg: '#fef2f2' },
          { label: 'Pending', value: rsvpStats.pending, color: '#f59e0b', bg: '#fffbeb' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '16px', borderRadius: '12px', background: s.bg, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: s.color, opacity: 0.7 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input className="input" placeholder="🔍 Cari tamu..." value={search}
          onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: '360px' }} />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">Belum Ada Tamu</div>
          <div className="empty-text">Tambahkan tamu undangan untuk mulai mengelola daftar.</div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Telepon</th>
                <th>RSVP</th>
                <th>Check-in</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((guest) => (
                <tr key={guest.id}>
                  <td style={{ fontWeight: '500' }}>{guest.name}</td>
                  <td>{guest.phone || '-'}</td>
                  <td>
                    <span className={`badge ${
                      guest.rsvp_status === 'confirmed' || guest.rsvp_status === 'hadir' ? 'badge-success'
                      : guest.rsvp_status === 'declined' || guest.rsvp_status === 'tidak_hadir' ? 'badge-danger'
                      : 'badge-warning'
                    }`}>
                      {guest.rsvp_status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    {guest.checked_in ? (
                      <span className="badge badge-success">✅ Hadir</span>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleCheckIn(guest.id)}>Check-in</button>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {guest.phone && (
                        <a href={`https://wa.me/${guest.phone}`} target="_blank" rel="noreferrer"
                          className="btn btn-ghost btn-sm" title="WhatsApp">💬</a>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(guest.id)}
                        style={{ color: 'var(--color-danger)' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Guest Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '600', margin: '0 0 24px' }}>
              Tambah Tamu Baru
            </h2>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div><label className="label">Nama</label><input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="label">Telepon</label><input className="input" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="628xxx" /></div>
              <div><label className="label">Email</label><input className="input" type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">Alamat</label><input className="input" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><label className="label">Grup</label><input className="input" value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value })} placeholder="Keluarga, Teman, dll" /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !form.name}>
                {saving ? 'Menyimpan...' : '➕ Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
