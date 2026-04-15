import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const host = request.headers.get('host');

  // Skip requests for static resources (images, next static files, etc) or API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    /\.(.*)$/.test(url.pathname)
  ) {
    return NextResponse.next();
  }

  // Jika ada path khusus yang perlu ditangani middleware (selain subdomain)
  // Misalnya untuk `/preview/` atau `/tema/` agar sesuai logic sebelumnya
  if (url.pathname.startsWith('/preview/')) {
    const slug = url.pathname.replace('/preview/', '');
    const newUrl = url.clone();
    newUrl.pathname = `/invitation/preview/${slug}`;
    return NextResponse.rewrite(newUrl);
  }

  if (url.pathname.startsWith('/tema/')) {
    const slug = url.pathname.replace('/tema/', '');
    const newUrl = url.clone();
    newUrl.pathname = `/invitation/preview/${slug}`;
    return NextResponse.rewrite(newUrl);
  }

  // Tangkap path dari URL
  const pathParts = url.pathname.split('/');
  const firstSegment = pathParts[1]; // segment pertama stelah `/`

  // Daftar route/path utama aplikasi yang BUKAN merupakan slug undangan
  // Tambahkan path folder apapun yang ada di dalam `src/app` ke array ini (selain 'invitation')
  const reservedPaths = [
    '',          // Halaman utama (root /)
    'login',     // Halaman login
    'register',  // Halaman register
    'forgot-password', // Halaman lupa password
    'checkout',  // Halaman checkout/pembayaran
    'app',       // Halaman dashboard user
    'preview',   // Route internal Next.js (walaupun dicatch di atas, lebih aman dimasukkan)
    'tema',      // Alias untuk route preview tema
    'ticket',    // Route E-Ticket
    'invitation',// Explicitly ignore invitation route if accessed raw
    'api',       // API route
    'static',    // Static files
    '_next',     // Next.js internal
    'favicon.ico'
  ];

  // Jika URL bukan bagian dari sistem, kita anggap itu adalah slug undangan (misal: /jamal-ranti)
  if (firstSegment && !reservedPaths.includes(firstSegment)) {
    const newUrl = url.clone();
    // Rewrite dari /slug ke /invitation/slug
    // Contoh: /jamal-ranti menjadi /invitation/jamal-ranti
    newUrl.pathname = `/invitation${url.pathname}`;
    return NextResponse.rewrite(newUrl);
  }

  return NextResponse.next();
}

// Konfigurasi matcher supaya middleware ini bekerja disemua rute selain statis
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
