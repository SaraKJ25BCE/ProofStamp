import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Shield,
  LogOut,
  User,
  Lock,
  Search,
  Radar,
  FileWarning,
  Bell,
  Home,
  Menu,
  X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Layout({ children }) {
  const { user, passport, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return undefined;

    const token = localStorage.getItem('proofstamp_token');
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(
          `${API_URL}/notifications?limit=1`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        );

        if (!res.ok) return;

        const data = await res.json();

        if (!cancelled) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        /* ignore */
      }
    }

    poll();

    const id = setInterval(poll, 60000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const DesktopNavLink = ({ to, icon: Icon, label, alertCount }) => (
    <Button
      variant="ghost"
      asChild
      className="relative !text-white/70 hover:!text-white hover:bg-white/10 rounded-xl justify-start w-full px-4 h-12 font-medium transition-colors"
    >
      <Link to={to} className="flex items-center gap-3" title={label}>
        <Icon className="h-6 w-6" />
        <span className="text-base">{label}</span>
        {alertCount > 0 && (
          <span className="ml-auto h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </Link>
    </Button>
  );

  const MobileNavLink = ({ to, icon: Icon, label, alertCount }) => (
    <Button
      variant="ghost"
      asChild
      className="justify-start h-14 px-4 font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
      onClick={() => setMobileMenuOpen(false)}
    >
      <Link to={to} className="flex items-center gap-3">
        <Icon className="h-6 w-6" />
        <span className="text-lg">{label}</span>
        {alertCount > 0 && (
          <span className="ml-auto h-6 min-w-6 px-2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </Link>
    </Button>
  );

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-white/20 selection:text-white flex flex-col md:flex-row">
      {/* Global Ambient Glow */}
      <div className="ambient-glow fixed inset-0 pointer-events-none" />

      {/* Navigation - Sidebar (Desktop) */}
      <nav className="hidden md:flex fixed top-0 h-screen w-64 apple-glass-panel border-r border-white/10 rounded-r-3xl rounded-l-none bg-black/50 backdrop-blur-2xl z-50 flex-col px-4 py-6">
        {/* Logo - Desktop Only */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3 group px-4 mb-8"
        >
          <Shield className="h-8 w-8 text-white group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
          <span className="font-semibold text-xl tracking-tight text-white">
            ProofStamp
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex flex-col items-stretch w-full gap-2">
          {user && (
            <>
              <DesktopNavLink to="/dashboard" icon={Home} label="Home" />
              <DesktopNavLink to="/verify" icon={Search} label="Verify" />
              <DesktopNavLink to="/stamp" icon={Lock} label="Protect" />
              <DesktopNavLink to="/monitor" icon={Radar} label="Monitor" />
              <DesktopNavLink to="/takedowns" icon={FileWarning} label="Takedowns" />
              <DesktopNavLink to="/notifications" icon={Bell} label="Alerts" alertCount={unreadCount} />
            </>
          )}
        </div>

        {/* Bottom actions (Desktop) */}
        {user && (
          <div className="mt-auto flex flex-col w-full gap-2">
            <Button
              variant="ghost"
              asChild
              className="!text-white/70 hover:!text-white hover:bg-white/10 rounded-xl justify-start w-full px-4 h-12 font-medium transition-colors"
            >
              <Link to="/settings" className="flex items-center gap-3" title="Profile & Settings">
                {passport?.user?.avatarUrl ? (
                  <img src={passport.user.avatarUrl} alt="Avatar" className="h-7 w-7 rounded-full border border-white/20" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <span className="text-base truncate">Profile</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="!text-white/70 hover:!text-white hover:bg-red-500/20 hover:!text-red-400 rounded-xl justify-start w-full px-4 h-12 font-medium transition-colors"
              title="Logout"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-6 w-6 shrink-0" />
                <span className="text-base">Logout</span>
              </div>
            </Button>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && user && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col pt-6 px-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-8 px-2">
            <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <Shield className="h-6 w-6 text-white" />
              <span className="font-semibold text-lg tracking-tight text-white">ProofStamp</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex flex-col gap-2 overflow-y-auto pb-20 px-2">
            <MobileNavLink to="/dashboard" icon={Home} label="Home" />
            <MobileNavLink to="/verify" icon={Search} label="Verify" />
            <MobileNavLink to="/stamp" icon={Lock} label="Protect" />
            <MobileNavLink to="/monitor" icon={Radar} label="Monitor" />
            <MobileNavLink to="/takedowns" icon={FileWarning} label="Takedowns" />
            <MobileNavLink to="/notifications" icon={Bell} label="Alerts" alertCount={unreadCount} />

            <div className="h-px bg-white/10 my-4" />

            <MobileNavLink to="/settings" icon={User} label="Profile & Settings" />
            
            <Button
              variant="ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="justify-start h-14 px-4 font-semibold text-white/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-6 w-6" />
                <span className="text-lg">Logout</span>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className="flex-1 w-full min-h-screen relative z-10 px-4 md:px-8 pb-8 pt-6 md:pt-8 md:ml-64">
        {/* Mobile Header (Shows only on mobile) */}
        {user && (
          <div className="md:hidden flex items-center justify-between mb-6 px-2">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-white" />
              <span className="font-semibold text-lg tracking-tight text-white">ProofStamp</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
}