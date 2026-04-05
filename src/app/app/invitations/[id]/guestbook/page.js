'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MessageSquare, Trash2, ArrowLeft, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestbook, invitations } from '@/lib/api';
import { confirmAction } from '@/lib/toast-confirm';

export default function GuestbookPage() {
  const params = useParams();
  const invitationId = params.id;

  const [invitation, setInvitation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);

  const fetchMessages = async (page = 1) => {
    try {
      const res = await guestbook.list(invitationId, page);
      setMessages(res.data || []);
      if (res.meta) {
        setCurrentPage(res.meta.current_page || page);
        setLastPage(res.meta.last_page || 1);
        setTotalMessages(res.meta.total || 0);
      } else if (res.last_page) {
        setCurrentPage(res.current_page || page);
        setLastPage(res.last_page || 1);
        setTotalMessages(res.total || 0);
      }
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (!invitationId) return;

    Promise.all([
      invitations.get(invitationId).then(res => setInvitation(res.data)).catch(() => {}),
      fetchMessages(1)
    ]).finally(() => setLoading(false));

  }, [invitationId]);

  const handlePageChange = (page) => {
    if (page < 1 || page > lastPage) return;
    setCurrentPage(page);
    fetchMessages(page);
  };

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

  const handleDelete = (entryId) => {
    confirmAction('Hapus ucapan ini?', async () => {
      try {
        await guestbook.delete(invitationId, entryId);
        setMessages(messages.filter(msg => msg.id !== entryId));
        toast.success('Ucapan berhasil dihapus');
      } catch (err) {
        toast.error('Gagal menghapus ucapan');
      }
    });
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <Link href="/app/invitations" className="btn btn-ghost" style={{ padding: '8px', color: '#64748b' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            Ucapan & Doa
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            {invitation?.title || 'Undangan'} • {totalMessages} ucapan
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="card empty-state">
          <MessageSquare size={48} strokeWidth={1.5} color="#94a3b8" />
          <div className="empty-title" style={{ marginTop: '16px' }}>Belum Ada Ucapan</div>
          <div className="empty-text">Tamu undangan Anda belum meninggalkan ucapan.</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{msg.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                      <Clock size={12} />
                      {new Date(msg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: msg.status === 'hadir' ? '#dcfce7' : (msg.status === 'tidak_hadir' ? '#fee2e2' : '#f1f5f9'), color: msg.status === 'hadir' ? '#166534' : (msg.status === 'tidak_hadir' ? '#991b1b' : '#475569') }}>
                    {msg.status === 'hadir' ? 'Hadir' : (msg.status === 'tidak_hadir' ? 'Tidak Hadir' : 'Mungkin Hadir')}
                  </div>
                </div>
                
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', flex: 1, fontSize: '14px', color: '#334155', lineHeight: '1.6', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
                  &quot;{msg.message}&quot;
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleDelete(msg.id)}
                    className="btn btn-ghost btn-sm" 
                    style={{ color: 'var(--color-danger)' }} 
                    title="Hapus Ucapan"
                  >
                    <Trash2 size={15} />
                    <span style={{ marginLeft: '6px' }}>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div>
              <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
                  <ChevronLeft size={16} />
                </button>
                {getPageNumbers().map(page => (
                  <button key={page} className={currentPage === page ? 'active' : ''} onClick={() => handlePageChange(page)}>
                    {page}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= lastPage}>
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="pagination-info">
                Halaman {currentPage} dari {lastPage} • Total {totalMessages} ucapan
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
