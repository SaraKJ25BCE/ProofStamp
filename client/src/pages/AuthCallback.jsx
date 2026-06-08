import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Shield } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    async function handleAuth() {
      await login();
      const needsSetup = searchParams.get('needsSetup') === '1';
      navigate(needsSetup ? '/setup' : '/dashboard');
    }
    handleAuth();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <Shield className="h-12 w-12 text-white/50 mx-auto animate-pulse" />
        <p className="mt-4 text-white/70 font-medium">Signing you in...</p>
      </div>
    </div>
  );
}
