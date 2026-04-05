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

  const hostname = host?.split(':')[0]; // hostname tanpa port

  // === PRODUCTION: digitvitation.my.id ===
  const prodDomain = 'digitvitation.my.id';
  
  if (hostname && hostname.endsWith(prodDomain)) {
    // Cek apakah ada subdomain
    // Contoh: dimas-nisa.digitvitation.my.id → parts = ['dimas-nisa', 'digitvitation', 'my', 'id']
    // digitvitation.my.id → parts = ['digitvitation', 'my', 'id']
    // www.digitvitation.my.id → parts = ['www', 'digitvitation', 'my', 'id']
    const parts = hostname.split('.');
    const domainParts = prodDomain.split('.').length; // 3 untuk 'digitvitation.my.id'
    
    if (parts.length > domainParts) {
      // Ada subdomain
      const subdomain = parts.slice(0, parts.length - domainParts).join('.');
      
      // Subdomain undangan (bukan www/app)
      if (subdomain !== 'www' && subdomain !== 'app') {
        const newUrl = url.clone();
        
        if (url.pathname.startsWith('/preview')) {
          newUrl.pathname = `/invitation/preview/${subdomain}`;
        } else {
          newUrl.pathname = `/invitation/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
        }
        
        return NextResponse.rewrite(newUrl);
      }
      // www/app → lanjut ke logic main domain di bawah
    }

    // Main domain (atau www/app subdomain) — handle /preview/
    if (url.pathname.startsWith('/preview/')) {
      const slug = url.pathname.replace('/preview/', '');
      const newUrl = url.clone();
      newUrl.pathname = `/invitation/preview/${slug}`;
      return NextResponse.rewrite(newUrl);
    }
  }

  // === LOCAL DEV: localhost ===
  if (hostname && hostname.endsWith('localhost')) {
    if (hostname !== 'localhost') {
      const subdomain = hostname.replace('.localhost', '');
      
      if (subdomain !== 'www' && subdomain !== 'app') {
        const newUrl = url.clone();
        
        if (url.pathname.startsWith('/preview')) {
          newUrl.pathname = `/invitation/preview/${subdomain}`;
        } else {
          newUrl.pathname = `/invitation/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
        }
        
        return NextResponse.rewrite(newUrl);
      }
    } else {
      if (url.pathname.startsWith('/preview/')) {
        const slug = url.pathname.replace('/preview/', '');
        const newUrl = url.clone();
        newUrl.pathname = `/invitation/preview/${slug}`;
        return NextResponse.rewrite(newUrl);
      }
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
