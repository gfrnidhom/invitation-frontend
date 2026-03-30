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

  // Pengecekan Subdomain
  // Saat production, ganti 'localhost:3000' dengan main domain, misalnya 'undanganku.com'
  const mainDomain = 'localhost:3000'; 
  
  if (host && host.includes(mainDomain)) {
    // Memisahkan subdomain
    // Contoh host: 'dimas-nisa.localhost:3000' -> subdomain: 'dimas-nisa'
    // Contoh host: 'localhost:3000' -> arr akan berupa ['localhost:3000'], yang jika pop() itu 'localhost:3000', tidak akan masuk kondisi
    const hostname = host.split(':')[0]; // get hostname only without port
    const parts = hostname.split('.');
    
    // Asumsi: maindomain di localhost adalah localhost. Jadi dimas-nisa.localhost akan jadi ['dimas-nisa', 'localhost']
    // Saat dionlinekan bisa 3 parts: ['dimas-nisa', 'undangan', 'com'] 
    
    // Kita filter dulu untuk domain lokal (localhost)
    if (hostname !== 'localhost' && hostname.endsWith('.localhost')) {
      const subdomain = hostname.replace('.localhost', '');
      
      // Jika subdomain valid, bukan 'www', bukan 'app', maka anggap itu adalah slug undangan/tema
      if (subdomain !== 'www' && subdomain !== 'app') {
        const newUrl = url.clone();
        
        // Handle route khusus '/preview' untuk preview tema
        if (url.pathname.startsWith('/preview')) {
          newUrl.pathname = `/invitation/preview/${subdomain}`;
        } else {
          // Redirect logic internal tanpa merubah URL yg ada di browser
          // User mengetik dimas-nisa.localhost:3000, Next.js akan memanggil path /invitation/dimas-nisa
          newUrl.pathname = `/invitation/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
        }
        
        return NextResponse.rewrite(newUrl);
      }
    } else {
      // Main Domain logic
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
