import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Mail, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { MARKETING } from '@/content/legalCopy';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

export default function Login() {
  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'https://proofstamp-server.onrender.com';
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState('signin');
  const [step, setStep] = useState('email');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [setupToken, setSetupToken] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const oauthError = searchParams.get('error');

  function resetFlow(nextMode = mode) {
    setStep('email');
    setCode('');
    setSetupToken(null);
    setError('');
    setInfo('');
    setMode(nextMode);
  }

  async function finishAuth(needsSetup) {
    await login();
    navigate(needsSetup ? '/setup' : '/dashboard');
  }

  function handleGoogleLogin(e) {
  e.preventDefault();
  setIsGoogleLoading(true);

  window.location.href = `${apiUrl}/auth/google`;
}

  async function handleSendCode() {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const purpose = mode === 'signin' ? 'login' : 'signup';
      const res = await api.post('/auth/email/send-code', { email, purpose });
      setInfo(res.data.devHint || 'Check your email for a 6-digit code.');
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const purpose = mode === 'signin' ? 'login' : 'signup';
      const res = await api.post('/auth/email/verify-code', { email, code, purpose });

      if (purpose === 'login') {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        await finishAuth(res.data.needsSetup);
        return;
      }

      setSetupToken(res.data.setupToken);
      setStep('profile');
      setInfo('Almost done — tell us your name.');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteSignup(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/email/complete-signup', {
        setupToken,
        displayName,
        username: username || undefined,
      });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      await finishAuth(res.data.needsSetup);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative selection:bg-white/20 overflow-hidden">
      <div className="ambient-glow" />
      
      <div className="w-full max-w-md relative z-10 px-4 animate-fade-up">
        <div className="apple-glass-panel rounded-[2.5rem] p-10 apple-shadow">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-[1.25rem] bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-6 shadow-inner">
              <Shield className="h-8 w-8 text-white/90" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">ProofStamp</h1>
            <p className="text-white/50 text-sm font-medium">{MARKETING.loginSub}</p>
          </div>

          <div className="space-y-6">
            {oauthError && (
              <p className="text-sm text-red-400 text-center bg-red-400/10 py-2 rounded-xl">Sign in failed. Please try again.</p>
            )}

            <div className="flex rounded-full border border-white/10 p-1 bg-white/[0.02]">
              <button
                type="button"
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all duration-300 ${
                  mode === 'signin' ? 'bg-white text-black shadow-md' : 'text-white/40 hover:text-white'
                }`}
                onClick={() => resetFlow('signin')}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all duration-300 ${
                  mode === 'signup' ? 'bg-white text-black shadow-md' : 'text-white/40 hover:text-white'
                }`}
                onClick={() => resetFlow('signup')}
              >
                Sign up
              </button>
            </div>

            {step === 'email' && (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCode();
                }}
              >
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                  <Input
                    type="email"
                    placeholder="Apple ID or Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 rounded-2xl apple-input text-base text-white placeholder:text-white/30 border-0"
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-400 pl-2">{error}</p>}
                {info && <p className="text-sm text-white/50 pl-2">{info}</p>}
                <Button type="submit" className="w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 font-semibold text-lg" disabled={loading || !email}>
                  {loading ? 'Sending...' : 'Continue'}
                </Button>
              </form>
            )}

            {step === 'code' && (
              <form className="space-y-4" onSubmit={handleVerifyCode}>
                <p className="text-sm text-white/50 text-center font-medium">
                  Enter the code sent to <br/><span className="text-white">{email}</span>
                </p>
                <Input
                  inputMode="numeric"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="h-16 text-center text-3xl tracking-[1em] rounded-2xl apple-input text-white border-0 font-medium"
                  required
                />
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                {info && <p className="text-sm text-white/50 text-center">{info}</p>}
                <Button type="submit" className="w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 font-semibold text-lg" disabled={loading || code.length < 6}>
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
                <div className="flex justify-between pt-2">
                  <button type="button" className="text-sm text-white/50 hover:text-white transition-colors font-medium" onClick={() => { setStep('email'); setCode(''); setError(''); }}>
                    Change Email
                  </button>
                  <button type="button" className="text-sm text-white/50 hover:text-white transition-colors font-medium" onClick={handleSendCode} disabled={loading}>
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {step === 'profile' && mode === 'signup' && (
              <form className="space-y-4" onSubmit={handleCompleteSignup}>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                  <Input
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-12 h-14 rounded-2xl apple-input text-base text-white placeholder:text-white/30 border-0"
                    required
                  />
                </div>
                <Input
                  placeholder="Username (optional)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  maxLength={20}
                  className="h-14 px-4 rounded-2xl apple-input text-base text-white placeholder:text-white/30 border-0"
                />
                {error && <p className="text-sm text-red-400 pl-2">{error}</p>}
                <Button type="submit" className="w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 font-semibold text-lg" disabled={loading || !displayName}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            )}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#141416] px-3 text-white/30 font-medium">or</span>
              </div>
            </div>

            <Button 
              className="w-full h-14 rounded-2xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white font-medium text-base transition-colors disabled:opacity-50" 
              asChild={!isGoogleLoading}
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <span className="flex justify-center items-center w-full h-full">
                  <Loader2 className="mr-3 h-5 w-5 animate-spin text-white/70" />
                  Connecting securely...
                </span>
              ) : (
                <a href={`${apiUrl}/auth/google`} className="flex justify-center items-center w-full h-full">
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </a>
              )}
            </Button>

            <p className="text-center text-xs text-white/30 font-medium mt-6">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-white/60 hover:text-white underline decoration-white/20 underline-offset-2 transition-colors">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-white/60 hover:text-white underline decoration-white/20 underline-offset-2 transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
