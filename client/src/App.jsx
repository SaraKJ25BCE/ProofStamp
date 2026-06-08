import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import ErrorBoundary from '@/components/ErrorBoundary';
import Login from '@/pages/Login';
import AuthCallback from '@/pages/AuthCallback';
import Setup from '@/pages/Setup';
import Dashboard from '@/pages/Dashboard';
import StampPage from '@/pages/StampPage';
import VerifyPage from '@/pages/VerifyPage';
import PublicPassport from '@/pages/PublicPassport';
import LandingPage from '@/pages/LandingPage';
import SharePage from '@/pages/SharePage';
import MonitorPage from '@/pages/MonitorPage';
import TakedownPage from '@/pages/TakedownPage';
import RegistryPage from '@/pages/RegistryPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import LegalGuidePage from '@/pages/LegalGuidePage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import ArtifactsPage from '@/pages/ArtifactsPage';
import ProofPage from '@/pages/ProofPage';
import { Loader2 } from 'lucide-react';
import { ToastProvider } from '@/components/ui/toast'; 
 
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/setup" element={<ProtectedRoute><Setup /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/stamp" element={<ProtectedRoute><StampPage /></ProtectedRoute>} />
      <Route path="/monitor" element={<ProtectedRoute><MonitorPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/takedowns" element={<ProtectedRoute><TakedownPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/registry" element={<RegistryPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/legal-guide" element={<LegalGuidePage />} />
      <Route path="/p/:stampId" element={<SharePage />} />
      <Route path="/legal/:stampId/artifacts" element={<ArtifactsPage />} />
      <Route path="/stamps/:stampId/proof" element={<ProofPage />} />
      <Route path="/u/:username" element={<PublicPassport />} />
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    const disableBFCache = () => {};
    window.addEventListener('unload', disableBFCache);

    // Silent Wakeup & Client-Side Keep-Alive for Python Stego Service
    const pingStego = () => {
      const isProd = window.location.hostname !== 'localhost';
      const stegoUrl = isProd ? 'https://proofstamp-stego.onrender.com' : 'http://localhost:8000';
      // Fire-and-forget network request to keep the service awake (no-cors prevents browser console errors)
      fetch(`${stegoUrl}/health`, { mode: 'no-cors' }).catch(() => {});
    };

    // Ping immediately when the user opens the app
    pingStego();

    // Ping every 10 minutes while the user has the tab open
    const intervalId = setInterval(pingStego, 10 * 60 * 1000);

    return () => {
      window.removeEventListener('unload', disableBFCache);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
