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
  // Misalnya untuk `/preview/` agar tetap sesuai logic sebelumnya
  if (url.pathname.startsWith('/preview/')) {
    const slug = url.pathname.replace('/preview/', '');
    const newUrl = url.clone();
    newUrl.pathname = `/invitation/preview/${slug}`;
    return NextResponse.rewrite(newUrl);
  }

  // Jika user mengakses /app/slug, rewrite ke struktur internal /invitation/slug
  // KECUALI untuk halaman bawaan dashboard aplikasi (seperti /app/dashboard)
  if (url.pathname.startsWith('/app/')) {
    const slug = url.pathname.replace('/app/', '');
    const firstSegment = slug.split('/')[0];
    const reservedDashboardRoutes = ['dashboard', 'gallery', 'invitations', 'profile', 'subscriptions', 'themes'];
    
    // Pastikan ini bukan halaman dashboard
    if (!reservedDashboardRoutes.includes(firstSegment)) {
      const newUrl = url.clone();
      newUrl.pathname = `/invitation/${slug}`;
      return NextResponse.rewrite(newUrl);
    }
  }

  return NextResponse.next();
}

// Konfigurasi matcher supaya middleware ini bekerja disemua rute selain statis
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
