'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Trash2, UserCheck, Users, MessageCircle, Clock, CheckCircle, XCircle, FileText, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { confirmAction } from '@/lib/toast-confirm';
import { guests, invitations } from '@/lib/api';

export default function GuestsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [guestList, setGuestList] = useState([]); const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [search, setSearch] = useState(''); const [showModal, setShowModal] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', group: '' }); 
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { 
    Promise.all([
      guests.list(id).then((res) => setGuestList(res.data || [])).catch(() => {}),
      invitations.get(id).then((res) => setInvitation(res.data || res)).catch(() => {})
    ]).finally(() => setLoading(false)); 
  }, [id]);

  const handleSave = async () => { 
    setSaving(true); 
    try { 
      if (editingId) {
        const res = await guests.update(id, editingId, form); 
        setGuestList(prev => prev.map(g => g.id === editingId ? (res.data || res) : g)); 
        toast.success('Informasi tamu diperbarui');
      } else {
        const res = await guests.create(id, form); 
        setGuestList(prev => [...prev, res.data || res]); 
        toast.success('Tamu berhasil ditambahkan'); 
      }
      setForm({ name: '', phone: '', email: '', address: '', group: '' }); 
      setEditingId(null);
      setShowModal(false); 
    } catch { 
      toast.error(editingId ? 'Gagal memperbarui tamu' : 'Gagal menambahkan tamu'); 
    } finally { 
      setSaving(false); 
    } 
  };

  const handleEditClick = (guest) => {
    setForm({ name: guest.name || '', phone: guest.phone || '', email: guest.email || '', address: guest.address || '', group: guest.group || '' });
    setEditingId(guest.id);
    setShowModal(true);
  };
  
  const handleDelete = (guestId) => { confirmAction('Hapus tamu ini?', async () => { try { await guests.delete(id, guestId); setGuestList(prev => prev.filter((g) => g.id !== guestId)); toast.success('Tamu dihapus'); } catch { toast.error('Gagal menghapus tamu'); } }); };
  const handleCheckIn = async (guestId) => { try { await guests.checkIn(guestId); setGuestList(prev => prev.map((g) => g.id === guestId ? { ...g, is_checked_in: true, rsvp_status: 'attending' } : g)); toast.success('Tamu berhasil check-in'); } catch { toast.error('Gagal check-in'); } };

  const getWaLink = (guest) => {
    if (!guest.phone || !invitation) return '#';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const nameSlug = guest.name.trim().replace(/\s+/g, '-');
    const invLink = `${baseUrl}/invitation/${invitation.slug}?to=${encodeURIComponent(nameSlug)}`;
    
    // Gunakan whatsapp_template dari database atau fallback ke teks default
    const template = invitation.whatsapp_template || `Halo [nama_tamu],\n\nKami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.\n\nSimpan tanggalnya dan jadilah bagian dari hari istimewa kami.\n\nLihat detail undangan di sini:\n[link_undangan]\n\nAtas kehadiran & doanya, kami ucapkan terima kasih.`;
    
    const text = template
      .replace(/\[nama_tamu\]/g, guest.name)
      .replace(/\[link_undangan\]/g, invLink);
      
    // Format ke link yang dikenali device
    const phone = guest.phone.replace(/^0/, '62');
    let finalMsg = text;
    if (guest.qr_code) {
      const qrUrl = guest.qr_code.startsWith('http') ? guest.qr_code : `${baseUrl}/storage/${guest.qr_code}`;
      finalMsg += `\n\nSimpan QR Code berikut untuk kemudahan Check-in di lokasi:\n${qrUrl}`;
    }
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(finalMsg)}`;
  };

  const filtered = guestList.filter((g) => g.name?.toLowerCase().includes(search.toLowerCase()));
  const rsvpStats = {
    total: guestList.length,
    confirmed: guestList.filter((g) => ['confirmed', 'hadir', 'attending'].includes(g.rsvp_status?.toLowerCase())).length,
    declined: guestList.filter((g) => ['declined', 'tidak_hadir'].includes(g.rsvp_status?.toLowerCase())).length,
    pending: guestList.filter((g) => !g.rsvp_status || g.rsvp_status?.toLowerCase() === 'pending').length,
  };

  const getRsvpBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (['confirmed', 'hadir', 'attending'].includes(s)) {
      return <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', backgroundColor: '#d1fae5', color: '#047857', border: '1px solid #34d399' }}>Hadir</span>;
    }
    if (['declined', 'tidak_hadir'].includes(s)) {
      return <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}>Tidak Hadir</span>;
    }
    return <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' }}>Pending</span>;
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => router.push('/app/invitations')} style={{ marginBottom: '8px' }}><ArrowLeft size={16} /> Kembali</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Daftar Tamu</h1>
        <button className="btn btn-primary" onClick={() => { setForm({ name: '', phone: '', email: '', address: '', group: '' }); setEditingId(null); setShowModal(true); }}><Plus size={16} /> Tambah Tamu</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { icon: Users, label: 'Total Tamu', value: rsvpStats.total, color: '#6366f1', bg: '#eef2ff' },
          { icon: CheckCircle, label: 'Hadir', value: rsvpStats.confirmed, color: '#10b981', bg: '#ecfdf5' },
          { icon: XCircle, label: 'Tidak Hadir', value: rsvpStats.declined, color: '#ef4444', bg: '#fef2f2' },
          { icon: Clock, label: 'Pending', value: rsvpStats.pending, color: '#f59e0b', bg: '#fffbeb' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ padding: '16px', borderRadius: '12px', background: s.bg, textAlign: 'center' }}>
              <Icon size={20} color={s.color} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: s.color, opacity: 0.7 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '360px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input className="input" placeholder="Cari tamu..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '40px' }} />
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <Users size={48} strokeWidth={1.5} color="#94a3b8" />
          <div className="empty-title" style={{ marginTop: '16px' }}>Belum Ada Tamu</div>
          <div className="empty-text">Tambahkan tamu undangan untuk mulai mengelola daftar.</div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Nama</th><th>Telepon</th><th>RSVP</th><th>Check-in</th><th>Aksi</th></tr></thead>
            <tbody>
              {filtered.map((guest) => (
                <tr key={guest.id}>
                  <td style={{ fontWeight: '500' }}>{guest.name} <div style={{ fontSize: '12px', color: '#64748b' }}>{guest.group || 'Umum'}</div></td>
                  <td>{guest.phone || '-'}</td>
                  <td>{getRsvpBadge(guest.rsvp_status)}</td>
                  <td>{guest.is_checked_in ? <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', backgroundColor: '#e0e7ff', color: '#4338ca', border: '1px solid #a5b4fc' }}>Checked-in</span> : <button className="btn btn-ghost btn-sm" onClick={() => handleCheckIn(guest.id)}><UserCheck size={14} /> Check-in</button>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {guest.qr_code && <button className="btn btn-ghost btn-sm" onClick={() => setSelectedQr(guest)} style={{ color: '#8b5cf6' }} title="Lihat QR Code"><UserCheck size={15} /></button>}
                      {guest.phone && <a href={getWaLink(guest)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ color: '#10b981' }} title="Kirim WhatsApp"><MessageCircle size={15} /></a>}
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(guest)} style={{ color: '#3b82f6' }} title="Edit"><FileText size={15} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(guest.id)} style={{ color: 'var(--color-danger)' }} title="Hapus"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '600', margin: '0 0 24px' }}>{editingId ? 'Edit Tamu' : 'Tambah Tamu Baru'}</h2>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div><label className="label">Nama Lengkap</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="label">Telepon (WhatsApp)</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08xxx / 628xxx" /></div>
              <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">Alamat</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><label className="label">Grup</label><input className="input" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} placeholder="Keluarga, Teman, VIP" /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name}>{saving ? 'Menyimpan...' : <><Save size={16} /> Simpan</>}</button>
            </div>
          </div>
        </div>
      )}

      {selectedQr && (
        <div className="modal-overlay" onClick={() => setSelectedQr(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '32px', textAlign: 'center', maxWidth: '340px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '700', margin: '0 0 8px', color: '#1e293b' }}>QR Code Tamu</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>{selectedQr.name}</p>
            
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'inline-block', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <img src={selectedQr.qr_code.startsWith('http') ? selectedQr.qr_code : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${selectedQr.qr_code}`} alt="QR Code" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
            </div>
            
            <button className="btn btn-primary" onClick={() => setSelectedQr(null)} style={{ width: '100%' }}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
