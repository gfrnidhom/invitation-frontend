'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw { status: res.status, ...error };
  }

  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ──
export const auth = {
  register: (data) => request('/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/logout', { method: 'POST' }),
  user: () => request('/user'),
};

// ── Dashboard ──
export const dashboard = {
  stats: () => request('/dashboard/stats'),
};

// ── Profile ──
export const profile = {
  get: () => request('/profile'),
  update: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Invitations ──
export const invitations = {
  list: (page = 1) => request(`/invitations?page=${page}`),
  get: (id) => request(`/invitations/${id}`),
  create: (data) => request('/invitations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/invitations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/invitations/${id}`, { method: 'DELETE' }),
  publish: (id) => request(`/invitations/${id}/publish`, { method: 'POST' }),
  unpublish: (id) => request(`/invitations/${id}/unpublish`, { method: 'POST' }),
  uploadCover: (id, formData) => request(`/invitations/${id}/cover`, { method: 'POST', body: formData }),
};

// ── Guests ──
export const guests = {
  list: (invitationId, page = 1) => request(`/invitations/${invitationId}/guests?page=${page}`),
  get: (invitationId, guestId) => request(`/invitations/${invitationId}/guests/${guestId}`),
  create: (invitationId, data) => request(`/invitations/${invitationId}/guests`, { method: 'POST', body: JSON.stringify(data) }),
  update: (invitationId, guestId, data) => request(`/invitations/${invitationId}/guests/${guestId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (invitationId, guestId) => request(`/invitations/${invitationId}/guests/${guestId}`, { method: 'DELETE' }),
  import: (invitationId, formData) => request(`/invitations/${invitationId}/guests/import`, { method: 'POST', body: formData }),
  export: (invitationId) => request(`/invitations/${invitationId}/guests/export`),
  whatsappLink: (guestId) => request(`/guests/${guestId}/whatsapp-link`),
  bulkWhatsapp: (invitationId) => request(`/invitations/${invitationId}/whatsapp-links`),
  checkIn: (guestId) => request(`/guests/${guestId}/check-in`, { method: 'POST' }),
};

// ── Events (Acara) ──
export const events = {
  list: (invitationId) => request(`/invitations/${invitationId}/events`),
  create: (invitationId, data) => request(`/invitations/${invitationId}/events`, { method: 'POST', body: JSON.stringify(data) }),
  update: (invitationId, eventId, data) => request(`/invitations/${invitationId}/events/${eventId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (invitationId, eventId) => request(`/invitations/${invitationId}/events/${eventId}`, { method: 'DELETE' }),
};

// ── Love Stories ──
export const loveStories = {
  list: (invitationId) => request(`/invitations/${invitationId}/love-stories`),
  create: (invitationId, data) => request(`/invitations/${invitationId}/love-stories`, { method: 'POST', body: JSON.stringify(data) }),
  update: (invitationId, storyId, data) => request(`/invitations/${invitationId}/love-stories/${storyId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (invitationId, storyId) => request(`/invitations/${invitationId}/love-stories/${storyId}`, { method: 'DELETE' }),
};

// ── Gift Accounts ──
export const giftAccounts = {
  list: (invitationId) => request(`/invitations/${invitationId}/gift-accounts`),
  create: (invitationId, data) => request(`/invitations/${invitationId}/gift-accounts`, { method: 'POST', body: JSON.stringify(data) }),
  update: (invitationId, accountId, data) => request(`/invitations/${invitationId}/gift-accounts/${accountId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (invitationId, accountId) => request(`/invitations/${invitationId}/gift-accounts/${accountId}`, { method: 'DELETE' }),
};

// ── Gallery ──
export const gallery = {
  list: (invitationId) => request(`/invitations/${invitationId}/gallery`),
  upload: (invitationId, formData) => request(`/invitations/${invitationId}/gallery`, { method: 'POST', body: formData }),
  delete: (invitationId, photoId) => request(`/invitations/${invitationId}/gallery/${photoId}`, { method: 'DELETE' }),
  reorder: (invitationId, data) => request(`/invitations/${invitationId}/gallery/reorder`, { method: 'POST', body: JSON.stringify(data) }),
};

// ── Analytics ──
export const analytics = {
  get: (invitationId) => request(`/invitations/${invitationId}/analytics`),
};

// ── Themes ──
export const themes = {
  list: () => request('/themes'),
  get: (id) => request(`/themes/${id}`),
};

// ── Subscriptions / Packages ──
export const packages = {
  list: () => request('/packages'),
};

// ── Payments ──
export const payments = {
  create: (data) => request('/payment/create', { method: 'POST', body: JSON.stringify(data) }),
  history: () => request('/payment/history'),
};

// ── Guestbook / Wishes ──
export const guestbook = {
  list: (invitationId) => request(`/invitations/${invitationId}/guestbook`),
  delete: (invitationId, entryId) => request(`/invitations/${invitationId}/guestbook/${entryId}`, { method: 'DELETE' }),
};

// ── RSVP ──
export const rsvp = {
  list: (invitationId) => request(`/invitations/${invitationId}/rsvp`),
  stats: (invitationId) => request(`/invitations/${invitationId}/rsvp/stats`),
};
