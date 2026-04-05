'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Trash2, UserCheck, Users, MessageCircle, Clock, CheckCircle, XCircle, FileText, Save, Upload, Download, QrCode, X, Printer, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { confirmAction } from '@/lib/toast-confirm';
import { guests, invitations } from '@/lib/api';
import { getInvitationUrl, APP_CONFIG } from '@/lib/constants';

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalGuests, setTotalGuests] = useState(0);
  const [perPage, setPerPage] = useState(15);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchGuests = async (page = 1) => {
    try {
      const res = await guests.list(id, page);
      setGuestList(res.data || []);
      if (res.meta) {
        setCurrentPage(res.meta.current_page || page);
        setLastPage(res.meta.last_page || 1);
        setTotalGuests(res.meta.total || 0);
        setPerPage(res.meta.per_page || 15);
      } else if (res.last_page) {
        setCurrentPage(res.current_page || page);
        setLastPage(res.last_page || 1);
        setTotalGuests(res.total || 0);
        setPerPage(res.per_page || 15);
      }
    } catch {
      setGuestList([]);
    }
  };

  useEffect(() => { 
    Promise.all([
      fetchGuests(1),
      invitations.get(id).then((res) => setInvitation(res.data || res)).catch(() => {})
    ]).finally(() => setLoading(false)); 
  }, [id]);

  const handlePageChange = (page) => {
    if (page < 1 || page > lastPage) return;
    setCurrentPage(page);
    fetchGuests(page);
  };

  const handleSave = async () => { 
    setSaving(true); 
    try { 
      if (editingId) {
        const res = await guests.update(id, editingId, form); 
        setGuestList(prev => prev.map(g => g.id === editingId ? (res.data || res) : g)); 
        toast.success('Informasi tamu diperbarui');
      } else {
        const res = await guests.create(id, form); 
        // Refresh current page to get accurate data
        await fetchGuests(currentPage);
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
  
  const handleDelete = (guestId) => { confirmAction('Hapus tamu ini?', async () => { try { await guests.delete(id, guestId); await fetchGuests(currentPage); toast.success('Tamu dihapus'); } catch { toast.error('Gagal menghapus tamu'); } }); };
  const handleCheckIn = async (guestId) => { try { await guests.checkIn(guestId); setGuestList(prev => prev.map((g) => g.id === guestId ? { ...g, is_checked_in: true, rsvp_status: 'attending' } : g)); toast.success('Tamu berhasil check-in'); } catch { toast.error('Gagal check-in'); } };

  const getInviteText = (guest) => {
    if (!invitation) return '';
    const nameSlug = guest.name.trim().replace(/\s+/g, '-');
    const invLink = `${getInvitationUrl(invitation.slug)}?to=${encodeURIComponent(nameSlug)}`;
    
    const template = invitation.whatsapp_template || `Halo [nama_tamu],\n\nKami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.\n\nSimpan tanggalnya dan jadilah bagian dari hari istimewa kami.\n\nLihat detail undangan di sini:\n[link_undangan]\n\nAtas kehadiran & doanya, kami ucapkan terima kasih.`;
    
    let ticketUrl = '';
    if (guest.qr_code && guest.token) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.digitvitation.my.id';
      ticketUrl = `${baseUrl}/ticket/${invitation.slug}?to=${encodeURIComponent(nameSlug)}&token=${encodeURIComponent(guest.token)}`;
    } else if (guest.qr_code) {
      const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';
      ticketUrl = guest.qr_code.startsWith('http') ? guest.qr_code : `${storageUrl}/${guest.qr_code}`;
    }

    let text = template
      .replace(/\[nama_tamu\]/g, guest.name)
      .replace(/\[link_undangan\]/g, invLink);
      
    if (text.includes('[eticket]')) {
      text = text.replace(/\[eticket\]/g, ticketUrl);
    } else {
      // Auto-append if [eticket] isn't used in the template but the guest has one
      if (guest.qr_code && guest.token) {
        text += `\\n\\nSimpan E-Ticket Anda di tautan berikut untuk kemudahan Check-in di lokasi:\\n${ticketUrl}`;
      } else if (guest.qr_code) {
        text += `\\n\\nSimpan QR Code berikut untuk kemudahan Check-in di lokasi:\\n${ticketUrl}`;
      }
    }
    return text;
  };

  const handleCopyInvite = async (guest) => {
    const text = getInviteText(guest);
    if (!text) { toast.error('Data undangan belum lengkap'); return; }
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Teks undangan berhasil disalin!');
    } catch {
      toast.error('Gagal menyalin teks');
    }
  };

  const getWaLink = (guest) => {
    if (!guest.phone || !invitation) return '#';
    const text = getInviteText(guest);
    const phone = guest.phone.replace(/^0/, '62');
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  };

  const filtered = guestList.filter((g) => g.name?.toLowerCase().includes(search.toLowerCase()));
  const rsvpStats = {
    total: totalGuests || guestList.length,
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) { setImportPreview([]); setImportFile(null); return; }
    processImportFile(file);
  };

  const processImportFile = (file) => {
    setImportFile(file);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setImportPreview(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processImportFile(file);
  };

  const handleImportSubmit = async () => {
    if (!importPreview.length) return toast.error('Belum ada data untuk diimport');
    setImporting(true);
    setImportResult(null);
    try {
      const headers = ['name', 'phone', 'email'];
      let csvContent = headers.join(',') + '\n';
      
      importPreview.forEach(row => {
        const name = row['name'] || row['Nama'] || row['NAMA'] || '';
        const phone = row['phone'] || row['Phone'] || row['No Telepon'] || row['telepon'] || row['no_telp'] || '';
        const email = row['email'] || row['Email'] || row['EMAIL'] || '';
        csvContent += `"${String(name).replace(/"/g, '""')}","${String(phone).replace(/"/g, '""')}","${String(email).replace(/"/g, '""')}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const fd = new FormData();
      fd.append('file', blob, 'import.csv');
      
      const res = await guests.import(id, fd);
      
      setImportResult(res.data || res);
      toast.success(res.message || 'Berhasil mengimport tamu');
      
      // Refresh guest list
      await fetchGuests(1);
      setCurrentPage(1);
    } catch (err) {
      toast.error('Gagal mengimport tamu. Pastikan format benar.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { name: 'Budi Santoso', phone: '081234567890', email: 'budi@email.com' },
      { name: 'Siti Rahma', phone: '089876543210', email: 'siti@email.com' },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Tamu");
    XLSX.writeFile(wb, "Template_Tamu_Undangan.xlsx");
  };

  const downloadQrCode = async (guest) => {
    const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';
    const qrUrl = guest.qr_code.startsWith('http') ? guest.qr_code : `${storageUrl}/${guest.qr_code}`;
    
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${guest.name.replace(/\s+/g, '-').toLowerCase()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('QR Code berhasil didownload');
    } catch {
      toast.error('Gagal mendownload QR Code');
    }
  };

  const getQrUrl = (guest) => {
    if (!guest.qr_code) return null;
    const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';
    return guest.qr_code.startsWith('http') ? guest.qr_code : `${storageUrl}/${guest.qr_code}`;
  };

  // Generate pagination page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(lastPage, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <style>{`
        /* Master Responsive Layout */
        .guests-page-container {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .guest-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
          width: 100%;
        }

        .stat-card-modern {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .header-actions-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-container {
          width: 360px;
          position: relative;
          margin-bottom: 20px;
        }

        .table-scroll-container {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .table-modern {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px; /* Ensures table doesn't squash, forcing scroll */
        }

        /* ─── Tablet & Mobile Adjustments ─── */
        @media (max-width: 1024px) {
          .guest-stats-grid { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 16px; 
          }
        }

        @media (max-width: 768px) {
          .header-actions-group {
            width: 100%;
            flex-direction: column;
            gap: 8px;
            margin-top: 16px;
          }
          .header-actions-group button {
            width: 100%;
            justify-content: center;
          }
          .search-container {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .guest-stats-grid { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 10px; 
          }
          .stat-card-modern {
            padding: 16px;
            border-radius: 16px;
          }
          .stat-card-modern .stat-icon-wrapper {
            width: 36px !important;
            height: 36px !important;
            margin-bottom: 12px !important;
            border-radius: 10px !important;
          }
          .stat-card-modern .stat-icon-wrapper svg {
            width: 18px;
            height: 18px;
          }
          .stat-card-modern .stat-value {
            font-size: 22px !important;
          }
          .stat-card-modern .stat-label {
            font-size: 12px !important;
            margin-top: 2px !important;
          }
        }
      `}</style>

      <div className="guests-page-container">
        
        {/* Top Header Row */}
        <button className="btn btn-ghost btn-sm" onClick={() => router.push('/app/invitations')} style={{ marginBottom: '12px' }}><ArrowLeft size={16} /> Kembali</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Daftar Tamu</h1>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>Kelola undangan dan lacak kehadiran tamu Anda.</p>
          </div>
          <div className="header-actions-group">
            <button className="btn btn-secondary" onClick={() => { setShowImportModal(true); setImportPreview([]); setImportFile(null); setImportResult(null); }}>
              <Upload size={16} /> Import Excel
            </button>
            <button className="btn btn-primary" onClick={() => { setForm({ name: '', phone: '', email: '', address: '', group: '' }); setEditingId(null); setShowModal(true); }}>
              <Plus size={16} /> Tambah Tamu
            </button>
          </div>
        </div>

        {/* Responsive Real Grid for Stats */}
        <div className="guest-stats-grid">
          {[
            { icon: Users, label: 'Total Tamu', value: rsvpStats.total, color: '#6366f1', bg: '#eef2ff' },
            { icon: CheckCircle, label: 'Hadir', value: rsvpStats.confirmed, color: '#10b981', bg: '#ecfdf5' },
            { icon: XCircle, label: 'Tidak Hadir', value: rsvpStats.declined, color: '#ef4444', bg: '#fef2f2' },
            { icon: Clock, label: 'Pending', value: rsvpStats.pending, color: '#f59e0b', bg: '#fffbeb' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="stat-card-modern" style={{ background: `linear-gradient(135deg, #ffffff 0%, ${card.bg}60 100%)` }}>
                <div className="stat-icon-wrapper" style={{ background: card.bg, color: card.color, width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="stat-value" style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', fontFamily: 'var(--font-heading)', lineHeight: '1' }}>
                  {card.value.toLocaleString()}
                </div>
                <div className="stat-label" style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginTop: '6px' }}>
                  {card.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Search Input Container */}
        <div className="search-container">
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="input" placeholder="Cari nama tamu..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '44px', width: '100%', height: '46px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
        </div>

        {/* Scrollable Data Table Wrapper */}
        {filtered.length === 0 ? (
          <div className="card empty-state" style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
            <Users size={56} strokeWidth={1} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <div className="empty-title" style={{ fontSize: '18px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Belum Ada Tamu</div>
            <div className="empty-text" style={{ fontSize: '14px', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>Tambahkan tamu undangan secara manual atau import dari file Excel untuk menghemat waktu.</div>
          </div>
        ) : (
          <>
            <div className="table-scroll-container">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>Tamu & Info</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>Kontak</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap', width: '120px' }}>Status RSVP</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap', width: '130px' }}>Check-in</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap', width: '180px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((guest) => (
                    <tr key={guest.id} style={{ transition: 'background-color 0.2s', ':hover': { background: '#f8fafc' }, borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>{guest.name}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontWeight: '500' }}>{guest.group || 'Umum'}</span>
                          {guest.qr_code && (
                            <button onClick={() => setSelectedQr(guest)} style={{ background: '#f3e8ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}>
                              <QrCode size={12} /> QR Code
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {guest.phone ? <span style={{ fontWeight: '500' }}>{guest.phone}</span> : '-'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {getRsvpBadge(guest.rsvp_status)}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {guest.is_checked_in 
                          ? <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}><CheckCircle size={14} /> Hadir</span> 
                          : <button className="btn btn-ghost btn-sm" onClick={() => handleCheckIn(guest.id)} style={{ whiteSpace: 'nowrap', color: '#64748b', background: '#f1f5f9' }}><UserCheck size={14} /> Check-in</button>
                        }
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                          <button onClick={() => handleCopyInvite(guest)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Copy Undangan">
                            <Copy size={16} />
                          </button>
                          {guest.phone && (
                            <a href={getWaLink(guest)} target="_blank" rel="noreferrer" style={{ background: '#d1fae5', color: '#047857', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Kirim WhatsApp">
                              <MessageCircle size={16} />
                            </a>
                          )}
                          <button onClick={() => handleEditClick(guest)} style={{ background: '#dbeafe', color: '#1d4ed8', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Edit">
                            <FileText size={16} />
                          </button>
                          <button onClick={() => handleDelete(guest.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Hapus">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {lastPage > 1 && (
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', opacity: currentPage <= 1 ? 0.5 : 1 }}>
                    <ChevronLeft size={16} />
                  </button>
                  {getPageNumbers().map(page => (
                    <button key={page} onClick={() => handlePageChange(page)} style={{ minWidth: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: currentPage === page ? '#6366f1' : '#fff', border: `1px solid ${currentPage === page ? '#6366f1' : '#cbd5e1'}`, borderRadius: '8px', color: currentPage === page ? '#fff' : '#475569', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= lastPage} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', cursor: currentPage >= lastPage ? 'not-allowed' : 'pointer', opacity: currentPage >= lastPage ? 0.5 : 1 }}>
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                  Halaman {currentPage} dari {lastPage} • Total {totalGuests} tamu
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Add/Edit Guest Modal */}
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

      {/* QR Code View Modal */}
      {selectedQr && (
        <div className="modal-overlay" onClick={() => setSelectedQr(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '32px', textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '700', margin: '0 0 4px', color: '#1e293b' }}>QR Code Tamu</h2>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{selectedQr.name}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedQr(null)} style={{ padding: '4px' }}><X size={18} /></button>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #f8fafc, #eef2ff)', 
              padding: '24px', 
              borderRadius: '20px', 
              display: 'inline-block', 
              border: '1px solid #e2e8f0', 
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)'
            }}>
              <img 
                src={getQrUrl(selectedQr)} 
                alt={`QR Code - ${selectedQr.name}`}
                style={{ width: '220px', height: '220px', objectFit: 'contain' }} 
              />
            </div>
            
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
              Scan QR Code ini untuk check-in tamu di lokasi acara
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => downloadQrCode(selectedQr)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download size={16} /> Download
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  const qrUrl = getQrUrl(selectedQr);
                  printWindow.document.write(`
                    <html>
                      <head><title>QR Code - ${selectedQr.name}</title></head>
                      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui">
                        <h2 style="margin:0 0 8px">${selectedQr.name}</h2>
                        <p style="margin:0 0 24px;color:#64748b">Scan untuk Check-in</p>
                        <img src="${qrUrl}" style="width:300px;height:300px" />
                        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">Token: ${selectedQr.token}</p>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => printWindow.print(), 500);
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Printer size={16} /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreview([]); setImportResult(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '640px', width: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '600', margin: '0 0 4px' }}>Import Data Tamu</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Upload file Excel (.xlsx) atau CSV untuk import tamu secara massal</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreview([]); setImportResult(null); }} style={{ padding: '4px' }}><X size={18} /></button>
            </div>

            {/* Download Template */}
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', 
              padding: '12px 16px', background: '#f0fdf4', borderRadius: '12px', 
              border: '1px solid #bbf7d0', marginBottom: '16px' 
            }}>
              <Download size={18} color="#16a34a" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>Belum punya template?</div>
                <div style={{ fontSize: '12px', color: '#16a34a' }}>Download template Excel dengan kolom yang benar</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={downloadTemplate} style={{ color: '#16a34a', fontWeight: '600', fontSize: '13px' }}>Download Template</button>
            </div>
            
            {/* Dropzone */}
            <div 
              style={{ 
                border: `2px dashed ${dragOver ? '#6366f1' : '#cbd5e1'}`, 
                borderRadius: '16px', 
                padding: '32px', 
                textAlign: 'center', 
                marginBottom: '20px', 
                background: dragOver ? '#eef2ff' : '#f8fafc', 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {importFile ? (
                <>
                  <div style={{ 
                    width: '56px', height: '56px', borderRadius: '16px', 
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' 
                  }}>
                    <FileText size={24} color="white" />
                  </div>
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{importFile.name}</div>
                  <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '500' }}>✓ {importPreview.length} baris data terbaca</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Klik untuk ganti file</div>
                </>
              ) : (
                <>
                  <Upload size={36} color={dragOver ? '#6366f1' : '#94a3b8'} style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                    {dragOver ? 'Lepaskan file di sini...' : 'Drag & drop atau klik untuk memilih file'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>Mendukung format .xlsx, .xls, .csv</div>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style={{ display: 'none' }} />
            </div>

            {/* Preview Table */}
            {importPreview.length > 0 && !importResult && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '12px' }}>
                  Preview Data ({importPreview.length} baris):
                </div>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflowX: 'auto', maxHeight: '220px' }}>
                  <table style={{ minWidth: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                        <th style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama</th>
                        <th style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Telepon</th>
                        <th style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.slice(0, 10).map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                          <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '12px' }}>{i + 1}</td>
                          <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: '500', color: '#1e293b' }}>{row.name || row.Nama || row.NAMA || '-'}</td>
                          <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{row.phone || row.Phone || row['No Telepon'] || row.telepon || '-'}</td>
                          <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{row.email || row.Email || row.EMAIL || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importPreview.length > 10 && <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: '8px' }}>...dan {importPreview.length - 10} baris lainnya</div>}
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  padding: '16px 20px', borderRadius: '12px', 
                  background: importResult.imported > 0 ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${importResult.imported > 0 ? '#bbf7d0' : '#fecaca'}`,
                }}>
                  <div style={{ fontWeight: '600', fontSize: '15px', color: importResult.imported > 0 ? '#15803d' : '#dc2626', marginBottom: '8px' }}>
                    {importResult.imported > 0 ? '✅ Import Berhasil!' : '❌ Import Gagal'}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                    <div><span style={{ fontWeight: '600', color: '#15803d' }}>{importResult.imported}</span> <span style={{ color: '#64748b' }}>berhasil diimport</span></div>
                    {importResult.skipped > 0 && (
                      <div><span style={{ fontWeight: '600', color: '#dc2626' }}>{importResult.skipped}</span> <span style={{ color: '#64748b' }}>dilewati</span></div>
                    )}
                  </div>
                  {importResult.errors?.length > 0 && (
                    <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fff5f5', borderRadius: '8px', fontSize: '12px', color: '#b91c1c', maxHeight: '100px', overflowY: 'auto' }}>
                      {importResult.errors.map((err, i) => <div key={i}>• {err}</div>)}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                    QR Code otomatis dibuat untuk setiap tamu yang berhasil diimport ✨
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreview([]); setImportResult(null); }}>
                {importResult ? 'Tutup' : 'Batal'}
              </button>
              {!importResult && (
                <button className="btn btn-primary" onClick={handleImportSubmit} disabled={importing || importPreview.length === 0}>
                  {importing ? (
                    <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Mengimport...</>
                  ) : (
                    <><Upload size={16} /> Konfirmasi Import ({importPreview.length} tamu)</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
