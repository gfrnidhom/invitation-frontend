'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/invitations', icon: '💌', label: 'Undangan' },
  { href: '/themes', icon: '🎨', label: 'Tema' },
  { href: '/subscriptions', icon: '💎', label: 'Langganan' },
  { href: '/profile', icon: '👤', label: 'Profil' },
];

function Sidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 39, display: 'none',
          }}
          className="mobile-overlay"
          onClick={onClose}
        />
      )}

      <aside
        style={{
          width: '260px',
          minHeight: '100vh',
          background: 'var(--color-sidebar)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: mobileOpen ? 0 : '-260px',
          zIndex: 40,
          transition: 'left 0.3s ease',
        }}
        className="sidebar"
      >
        {/* Brand */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>💍</div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '16px' }}>
              Wedding App
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Kelola Undangan</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? 'white' : '#94a3b8',
                  background: isActive ? 'var(--color-sidebar-active)' : 'transparent',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--color-sidebar-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        width: '100%', padding: '12px 16px', borderRadius: '12px',
        background: 'transparent', border: 'none', color: '#94a3b8',
        fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
        e.currentTarget.style.color = '#fca5a5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#94a3b8';
      }}
    >
      <span style={{ fontSize: '18px' }}>🚪</span>
      Keluar
    </button>
  );
}

function Topbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="glass" style={{
      position: 'sticky', top: 0, zIndex: 30,
      padding: '16px 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <button
        onClick={onMenuClick}
        className="mobile-menu-btn"
        style={{
          display: 'none', background: 'none', border: 'none',
          fontSize: '22px', cursor: 'pointer', padding: '4px',
        }}
      >
        ☰
      </button>
      <div />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {user?.email || ''}
          </div>
        </div>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '700', fontSize: '16px',
        }}>
          {(user?.name || 'U')[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="page-loading" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .sidebar { left: 0 !important; }
          .main-content { margin-left: 260px !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-overlay { display: none !important; }
        }
        @media (max-width: 1023px) {
          .mobile-menu-btn { display: block !important; }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="main-content" style={{ flex: 1, marginLeft: 0, transition: 'margin-left 0.3s ease' }}>
          <Topbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
          <main style={{ padding: '28px', animation: 'fade-in 0.4s ease-out' }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
