'use client';

import React, { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export default function Guestbook({ invitation, guestName, guestToken, hideHeader = false }) {
  const [messages, setMessages] = useState(invitation?.guestMessages || []);
  const [name, setName] = useState(guestName || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [rsvpStatus, setRsvpStatus] = useState(null); // 'attending' or 'declined'
  const [attendees, setAttendees] = useState(1);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // RSVP Form submission requires a valid Guest Token to tie it to the specific guest record
  const submitRsvp = async (status) => {
    // Removed per user request
  };

  const submitGuestbook = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    
    setLoading(true);
    try {
      // Create guestbook directly against the public endpoint
      await fetch(`${API_URL}/invitations/${invitation.id}/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, message })
      });
      
      const newMsg = {
        name,
        message,
        created_at: new Date().toISOString()
      };
      
      setMessages([newMsg, ...messages]);
      setMessage('');
    } catch (e) {
      alert('Gagal mengirim ucapan!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Guestbook wishes */}
      <section id="wishes" className="px-6 py-24 reveal">
          <div className="max-w-xl mx-auto">
              {!hideHeader && (
                <>
                  <p className="font-body text-xs tracking-[0.5em] uppercase text-gray-400 mb-4 text-center">Ucapan & Doa</p>
                  <p className="font-heading text-3xl font-bold mb-10 text-center">Wishes</p>
                </>
              )}
  
              <form onSubmit={submitGuestbook} className="mb-10 space-y-3">
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama" required className="w-full border-2 border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-body focus:border-gray-900 outline-none transition-colors" />
                  <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Tulis ucapan..." rows="3" required className="w-full border-2 border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-body focus:border-gray-900 outline-none transition-colors resize-none"></textarea>
                  <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-heading text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50">
                      {loading ? 'Mengirim...' : 'Kirim Ucapan'}
                  </button>
              </form>
  
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {messages.map((msg, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <p className="font-body text-sm text-gray-700">{msg.message}</p>
                        <div className="flex items-center gap-2 mt-3">
                            <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                                <span className="text-white text-[10px] font-bold">{msg.name ? msg.name.charAt(0).toUpperCase() : '?'}</span>
                            </div>
                            <p className="text-xs text-gray-400 font-body">{msg.name}</p>
                        </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">Belum ada ucapan.</p>
                  )}
              </div>
          </div>
      </section>
    </>
  );
}
