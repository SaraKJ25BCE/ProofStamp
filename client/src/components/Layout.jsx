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
  Bell
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Layout({ children }) {
  const { user, passport, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

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

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-white/20 selection:text-white flex flex-col md:flex-row">
      {/* Global Ambient Glow */}
      <div className="ambient-glow fixed inset-0 pointer-events-none" />

      {/* Navigation - Sidebar (Desktop) / Bottom Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:bottom-auto md:top-0 md:h-screen md:w-64 apple-glass-panel border-t md:border-t-0 md:border-r border-white/10 md:rounded-r-3xl md:rounded-l-none md:bg-black/50 bg-black/80 backdrop-blur-2xl">
        <div className="flex md:flex-col h-16 md:h-full justify-around md:justify-start items-center md:items-stretch px-2 md:px-4 md:py-6">
          
          {/* Logo - Desktop Only */}
          <Link
            to="/dashboard"
            className="hidden md:flex items-center gap-3 group px-4 mb-8"
          >
            <Shield className="h-8 w-8 text-white group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
            <span className="font-semibold text-xl tracking-tight text-white">
              ProofStamp
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex md:flex-col items-center md:items-stretch justify-around md:justify-start w-full gap-1 md:gap-2">
            {user && (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="!text-white/70 hover:!text-white hover:bg-white/10 rounded-xl md:justify-start h-12 w-12 md:w-full md:px-4 md:h-12 font-medium transition-colors"
                >
                  <Link to="/dashboard" className="flex items-center gap-3" title="Home">
                    <User className="h-6 w-6" />
                    <span className="hidden md:inline text-base">Home</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className="!text-white/70 hover:!text-white hover:bg-white/10 rounded-xl md:justify-start h-12 w-12 md:w-full md:px-4 md:h-12 font-medium transition-colors"
                >
                  <Link to="/verify" className="flex items-center gap-3" title="Verify">
                    <Search className="h-6 w-6" />
                    <span className="hidden md:inline text-base">Verify</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className="!text-white/70 hover:!text-white hover:bg-white/10 rounded-xl md:justify-start h-12 w-12 md:w-full md:px-4 md:h-12 font-medium transition-colors"
                >
                  <Link to="/stamp" className="flex items-center gap-3" title="Protect">
                    <Lock className="h-6 w-6" />
                    <span className="hidden md:inline text-base">Protect</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className="!text-white/70 hover:!text-white hover:bg-white/10 rounded-xl md:justify-start h-12 w-12 md:w-full md:px-4 md:h-12 font-medium transition-colors hidden sm:flex"
                >
                  <Link to="/monitor" className="flex items-center gap-3" title="Monitor">
                    <Radar className="h-6 w-6" />
                    <span className="hidden md:inline text-base">Monitor</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className="!text-white/70 hover:!text-white hover:bg-white/10 rounded-xl md:justify-start h-12 w-12 md:w-full md:px-4 md:h-12 font-medium transition-colors hidden sm:flex"
                >
                  <Link to="/takedowns" className="flex items-center gap-3" title="Takedowns">
                    <FileWarning className="h-6 w-6" />
                    <span className="hidden md:inline text-base">Takedowns</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className="relative !text-white/70 hover:!text-white hover:bg-white/10 rounded-xl md:justify-start h-12 w-12 md:w-full md:px-4 md:h-12 font-medium transition-colors"
                >
                  <Link to="/notifications" className="flex items-center gap-3" title="Alerts">
                    <Bell className="h-6 w-6" />
                    <span className="hidden md:inline text-base">Alerts</span>
                    {unreadCount > 0 && (
                      <span className="absolute md:relative top-2 right-2 md:top-auto md:right-auto md:ml-auto h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Bottom actions (Desktop) / Last icon (Mobile) */}
          {user && (
            <div className="flex md:mt-auto md:flex-col w-auto md:w-full gap-2">
              <Button
                variant="ghost"
                asChild
                className="!text-white/70 hover:!text-white hover:bg-white/10 rounded-xl md:justify-start h-12 w-12 md:w-full md:px-4 md:h-12 font-medium transition-colors"
              >
                <Link to="/settings" className="flex items-center gap-3" title="Profile & Settings">
                  {passport?.user?.avatarUrl ? (
                    <img src={passport.user.avatarUrl} alt="Avatar" className="h-7 w-7 rounded-full border border-white/20" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span className="hidden md:inline text-base">Profile</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="!text-white/70 hover:!text-white hover:bg-red-500/20 hover:!text-red-400 rounded-xl md:justify-start h-12 w-12 md:w-full md:px-4 md:h-12 font-medium transition-colors hidden md:flex"
                title="Logout"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-6 w-6" />
                  <span className="hidden md:inline text-base">Logout</span>
                </div>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 w-full min-h-screen relative z-10 px-4 md:px-8 pb-24 pt-6 md:pb-8 md:pt-8 md:ml-64">
        {/* Mobile Header (Shows only on mobile) */}
        {user && (
          <div className="md:hidden flex items-center justify-between mb-6 px-2">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-white" />
              <span className="font-semibold text-lg tracking-tight text-white">ProofStamp</span>
            </Link>
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
}