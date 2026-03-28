'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Mail, Palette, Gem, User, LogOut, Menu, X, Heart, Image as ImageIcon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/app/invitations', icon: Mail, label: 'Undangan' },
  { href: '/app/themes', icon: Palette, label: 'Tema' },
  { href: '/app/gallery', icon: ImageIcon, label: 'Media Gallery' },
  { href: '/app/subscriptions', icon: Gem, label: 'Langganan' },
  { href: '/app/profile', icon: User, label: 'Profil' },
];

function Sidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 39, display: 'none' }}
          className="mobile-overlay"
          onClick={onClose}
        />
      )}

      <aside
        style={{
          width: '260px', background: '#0f172a', color: '#f8fafc',
          display: 'flex', flexDirection: 'column', position: 'fixed',
          zIndex: 40, transition: 'all 0.3s ease',
        }}
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        <div style={{
          padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={20} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '18px', color: '#f8fafc', letterSpacing: '-0.02em' }}>Wedding App</div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#94a3b8' }}>Admin Panel</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  borderRadius: '12px', textDecoration: 'none',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  background: isActive ? '#1e293b' : 'transparent',
                  fontSize: '14px', fontWeight: isActive ? '600' : '500', transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#ffffff'; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '20px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const handleLogout = async () => { await logout(); router.push('/login'); };

  return (
    <button onClick={handleLogout}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
        borderRadius: '12px', background: 'transparent', border: 'none', color: '#94a3b8',
        fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
    >
      <LogOut size={18} />
      Keluar
    </button>
  );
}

function Topbar({ onMenuClick, mobileOpen }) {
  const { user } = useAuth();
  return (
    <header className="topbar" style={{
      position: 'sticky', top: '0', zIndex: 30, padding: '16px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px'
    }}>
      <button onClick={onMenuClick} className="mobile-menu-btn"
        style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#475569' }}>
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      <div />
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && typeof user.invitation_quota !== 'undefined' && (
          <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'none', '@media (minWidth: 640px)': { display: 'flex' }, alignItems: 'center', gap: '6px' }} className="quota-badge">
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Kuota Undangan:</span>
            <span style={{ fontSize: '13px', fontWeight: '800', color: user.invitation_used >= user.invitation_quota ? '#ef4444' : '#10b981' }}>
              {user.invitation_used} / {user.invitation_quota}
            </span>
          </div>
        )}
        <div style={{ textAlign: 'right', display: 'none' }} className="user-info">
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{user?.name || 'User'}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{user?.email || ''}</div>
        </div>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0
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
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="page-loading" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;
  }

  return (
    <>
      <style>{`
        .sidebar {
          top: 0; left: -260px;
          min-height: 100vh;
        }
        .sidebar.mobile-open {
          left: 0;
        }
        
        @media (min-width: 1024px) {
          .sidebar {
            top: 24px; left: 24px;
            height: calc(100vh - 48px);
            min-height: auto;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          }
          .main-content { margin-left: 310px !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-overlay { display: none !important; }
        }
        @media (max-width: 1023px) {
          .mobile-menu-btn { display: block !important; }
          .mobile-overlay { display: block !important; }
          .topbar {
            top: 0 !important; margin: 0 !important; border-radius: 0 !important;
          }
        }
        @media (min-width: 640px) {
          .quota-badge { display: flex !important; }
          .user-info { display: block !important; }
        }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="main-content" style={{ flex: 1, marginLeft: 0, transition: 'margin-left 0.3s ease', padding: '24px 24px 24px 0', height: '100vh', display: 'flex' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <Topbar onMenuClick={() => setMobileOpen(!mobileOpen)} mobileOpen={mobileOpen} />
            <main style={{ padding: '0 32px 32px', flex: 1, overflowY: 'auto' }}>
              {children}
              <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: '12px', background: '#1e293b', color: '#fff' } }} />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
