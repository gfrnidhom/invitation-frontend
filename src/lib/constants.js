// KUMPULAN KONFIGURASI APLIKASI
// Ubah nilai di bawah ini untuk mengatur keseluruhan pengaturan aplikasi

export const APP_CONFIG = {
  // 1. Domain Utama Aplikasi (tanpa http://)
  // Saat production, ubah menjadi domain kamu misal: 'undanganku.com'
  DOMAIN: 'digitvitation.my.id',

  // 2. Base URL Backend/API (jika diperlukan untuk link lain)
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://app.digitvitation.my.id/api',

  // 3. Base URL Storage (untuk memuat gambar/file dari backend)
  STORAGE_URL: process.env.NEXT_PUBLIC_STORAGE_URL || 'https://app.digitvitation.my.id/storage',

  // 4. API Keys
  MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-Bg1b5RB7V2qKBDBT',
};


/**
 * HELPER FUNCTIONS (otomatis menggunakan konfigurasi di atas)
 */

export const getInvitationUrl = (slug) => {
  if (!slug) return '#';
  if (typeof window !== 'undefined') {
    if (window.location.hostname !== APP_CONFIG.DOMAIN) {
      return `${window.location.origin}/${slug}`;
    }
  }
  return `https://${APP_CONFIG.DOMAIN}/${slug}`;
};

// Mendapatkan URL lengkap untuk halaman preview tema berdasarkan slug tema
export const getThemePreviewUrl = (slug) => {
  if (!slug) return '#';
  return `/invitation/preview/${slug}`;
};
