import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AtSign, Scale, Radar, FileText } from 'lucide-react';

export default function Setup() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { passport, fetchUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (passport?.username) {
      navigate('/dashboard');
    }
  }, [passport, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('Username must be 3-20 characters, letters, numbers, and underscores only');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/passport/username', { username });
      await fetchUser();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set username');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-6">
      <div className="ambient-glow opacity-60" />
      
      <div className="w-full max-w-lg space-y-6 relative z-10 animate-fade-up">
        <div className="apple-glass-panel rounded-[2.5rem] p-10 apple-shadow border border-white/10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Choose Your Handle</h1>
            <p className="text-white/50 font-medium">
              Your public username for share pages and verification.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
              <Input
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="h-14 pl-12 rounded-2xl apple-input text-lg border-0 text-white placeholder:text-white/30"
                maxLength={20}
              />
            </div>
            {error && <p className="text-sm text-red-400 font-medium text-center">{error}</p>}
            <Button type="submit" className="w-full h-14 rounded-full bg-white text-black hover:bg-white/90 font-semibold text-lg shadow-xl transition-transform hover:scale-[1.02]" disabled={loading || !username}>
              {loading ? 'Setting up...' : 'Claim Username'}
            </Button>
          </form>
        </div>

        <div className="apple-glass-panel rounded-[2.5rem] p-8 apple-shadow border border-white/5">
          <h2 className="text-xl font-semibold tracking-tight text-white mb-6">What you get (full access)</h2>
          <div className="space-y-4">
            {[
              { icon: Scale, text: 'RFC 3161 trusted timestamp + BSA 2023 Section 63 system certificate on every stamp' },
              { icon: FileText, text: 'Counsel Evidence Packet ZIP for DMCA notices and advocate review' },
              { icon: Radar, text: 'Theft monitoring for images (when TinEye is configured)' },
              { icon: Shield, text: 'Invisible watermark + verify for anyone' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-white/80 leading-relaxed pt-1">{text}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link to="/legal-guide" className="text-white/60 hover:text-white transition-colors font-medium text-sm inline-flex items-center gap-1">
              Read the India admissibility guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
