import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { APP_CONFIG } from '@/lib/constants';

export const metadata = {
  title: 'Wedding Invitation Manager',
  description: 'Buat dan kelola undangan pernikahan digital Anda',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          src="https://app.midtrans.com/snap/snap.js"
          data-client-key={APP_CONFIG.MIDTRANS_CLIENT_KEY}
        />
      </head>
      <body>  
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
