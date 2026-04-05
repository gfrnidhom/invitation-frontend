'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://app.digitvitation.my.id/api';

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
  get: () => request('/user'),
  update: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Invitations ──
export const invitations = {
  list: (page = 1) => request(`/invitations?page=${page}`),
  get: (id) => request(`/invitations/${id}`),
  create: (data) => {
    if (data instanceof FormData) {
      return request('/invitations', { method: 'POST', body: data });
    }
    return request('/invitations', { method: 'POST', body: JSON.stringify(data) });
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      if (!data.has('_method')) data.append('_method', 'PUT');
      return request(`/invitations/${id}`, { method: 'POST', body: data });
    }
    return request(`/invitations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
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
  update: (invitationId, guestId, data) => request(`/guests/${guestId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (invitationId, guestId) => request(`/guests/${guestId}`, { method: 'DELETE' }),
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
  update: (invitationId, eventId, data) => request(`/events/${eventId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (invitationId, eventId) => request(`/events/${eventId}`, { method: 'DELETE' }),
};

// ── Love Stories ──
export const loveStories = {
  list: (invitationId) => request(`/invitations/${invitationId}/love-stories`),
  create: (invitationId, data) => {
    if (data instanceof FormData) return request(`/invitations/${invitationId}/love-stories`, { method: 'POST', body: data });
    return request(`/invitations/${invitationId}/love-stories`, { method: 'POST', body: JSON.stringify(data) });
  },
  update: (invitationId, storyId, data) => {
    if (data instanceof FormData) {
      if (!data.has('_method')) data.append('_method', 'PUT');
      return request(`/love-stories/${storyId}`, { method: 'POST', body: data });
    }
    return request(`/love-stories/${storyId}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  delete: (invitationId, storyId) => request(`/love-stories/${storyId}`, { method: 'DELETE' }),
};

// ── Gift Accounts ──
export const giftAccounts = {
  list: (invitationId) => request(`/invitations/${invitationId}/gift-accounts`),
  create: (invitationId, data) => request(`/invitations/${invitationId}/gift-accounts`, { method: 'POST', body: JSON.stringify(data) }),
  update: (invitationId, accountId, data) => request(`/gift-accounts/${accountId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (invitationId, accountId) => request(`/gift-accounts/${accountId}`, { method: 'DELETE' }),
};

// ── Gallery ──
export const gallery = {
  list: (invitationId) => request(`/invitations/${invitationId}/gallery`),
  upload: (invitationId, formData) => request(`/invitations/${invitationId}/gallery`, { method: 'POST', body: formData }),
  delete: (invitationId, photoId) => request(`/invitations/${invitationId}/gallery/${photoId}`, { method: 'DELETE' }),
  reorder: (invitationId, data) => request(`/invitations/${invitationId}/gallery/reorder`, { method: 'POST', body: JSON.stringify(data) }),
};

// ── Music Library ──
export const music = {
  list: () => request('/music/my'),
  upload: (formData) => request('/music', { method: 'POST', body: formData }),
  delete: (id) => request(`/music/${id}`, { method: 'DELETE' }),
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

// ── User Active Theme ──
export const userThemes = {
  current: () => request('/user-themes/current'),
  set: (themeId) => request('/user-themes', { method: 'POST', body: JSON.stringify({ theme_id: themeId }) }),
};

// ── Subscriptions / Packages ──
export const packages = {
  list: () => request('/packages'),
};

// ── Subscriptions (user's active subscriptions) ──
export const subscriptions = {
  list: () => request('/subscriptions'),
  current: () => request('/subscriptions/current'),
};

// ── Check-in ──
export const checkin = {
  scan: (token) => request(`/checkin/${token}`, { method: 'POST' }),
};

export const payments = {
  create: (data) => request('/payment/create', { method: 'POST', body: JSON.stringify(data) }),
  history: () => request('/payment/history'),
  get: (id) => request(`/payment/${id}`),
  charge: (id, data) => request(`/payment/${id}/charge`, { method: 'POST', body: JSON.stringify(data) }),
  checkStatus: (orderId) => request(`/payment/${orderId}/status`),
};

// ── Guestbook / Wishes ──
export const guestbook = {
  list: (invitationId, page = 1) => request(`/invitations/${invitationId}/guestbook?page=${page}`),
  delete: (invitationId, entryId) => request(`/invitations/${invitationId}/guestbook/${entryId}`, { method: 'DELETE' }),
};

// ── RSVP ──
export const rsvp = {
  list: (invitationId) => request(`/invitations/${invitationId}/rsvp`),
  stats: (invitationId) => request(`/invitations/${invitationId}/rsvp/stats`),
};

// ── Landing Page Content ──
export const testimonials = {
  list: () => request('/testimonials')
};
export const faqs = {
  list: () => request('/faqs')
};

// ── Public Invitation ──
export const publicInvitation = {
  get: (slug, token = '') => {
    let url = `/public-invitation/${slug}`;
    if (token) url += `?to=${encodeURIComponent(token)}`;
    return request(url);
  },
  preview: (slug) => {
    return request(`/public-invitation/preview/${slug}`);
  }
};
