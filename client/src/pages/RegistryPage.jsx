import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert, Search, CheckCircle2, XCircle, Loader2,
  Database, Globe, FileText, Lock
} from 'lucide-react';

export default function RegistryPage() {
  const [stats, setStats] = useState(null);
  const [searchHash, setSearchHash] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await api.get('/registry/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchHash.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await api.get(`/registry/check?hash=${encodeURIComponent(searchHash.trim())}`);
      setSearchResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-white/20 selection:text-white">
      {/* Global Ambient Glow */}
      <div className="ambient-glow fixed inset-0 pointer-events-none" />
      
      {/* Header */}
      <nav className="border-b border-white/10 sticky top-0 z-50 bg-black/50 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <ShieldAlert className="h-8 w-8 text-red-500 group-hover:scale-105 transition-transform" />
            <span className="font-semibold text-xl tracking-tight text-white">Registry</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 font-medium">by ProofStamp</Badge>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12 relative z-10">
        {/* Hero */}
        <div className="text-center animate-fade-up">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-red-500/10 border border-red-500/20 mb-6 apple-shadow">
            <ShieldAlert className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-4">
            AI Training Opt-Out Registry
          </h1>
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
            A public, machine-readable registry of creative works whose owners have explicitly
            prohibited use for AI/ML model training.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="apple-glass-panel p-6 sm:p-8 rounded-[2rem] text-center border border-white/5 apple-shadow">
              <Database className="h-8 w-8 text-indigo-400 mx-auto mb-4" />
              <div className="text-4xl font-semibold text-white mb-2">{stats.totalProtectedWorks}</div>
              <p className="text-sm font-medium text-white/50">Works Protected</p>
            </div>
            <div className="apple-glass-panel p-6 sm:p-8 rounded-[2rem] text-center border border-white/5 apple-shadow">
              <Globe className="h-8 w-8 text-green-400 mx-auto mb-4" />
              <div className="text-4xl font-semibold text-white mb-2">{stats.totalCreators}</div>
              <p className="text-sm font-medium text-white/50">Creators Opted Out</p>
            </div>
            <div className="apple-glass-panel p-6 sm:p-8 rounded-[2rem] text-center border border-white/5 apple-shadow">
              <Lock className="h-8 w-8 text-red-400 mx-auto mb-4" />
              <div className="text-4xl font-semibold text-white mb-2">100%</div>
              <p className="text-sm font-medium text-white/50">Cryptographically Verified</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="apple-glass-panel border border-white/10 rounded-[2.5rem] overflow-hidden apple-shadow animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="p-8 sm:p-10">
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-6 flex items-center gap-3">
              <Search className="h-6 w-6 text-white/50" />
              Check if a work is in the registry
            </h2>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Enter SHA-256 hash of the file..."
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                className="flex-1 h-14 rounded-xl bg-black/50 border border-white/10 px-6 text-white placeholder:text-white/30 font-mono text-base focus:outline-none focus:border-white/30 transition-colors"
              />
              <Button type="submit" disabled={searching} className="h-14 rounded-xl bg-white text-black hover:bg-white/90 font-semibold px-8 shadow-xl">
                {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search Registry'}
              </Button>
            </form>

            {searchResult && (
              <div className={`mt-8 p-6 rounded-[2rem] border backdrop-blur-md transition-all ${searchResult.optedOut ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                {searchResult.optedOut ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-8 w-8 text-red-400" />
                      <p className="text-xl font-semibold text-red-300 tracking-tight">AI TRAINING PROHIBITED</p>
                    </div>
                    <p className="text-base text-red-200/80 font-medium leading-relaxed bg-black/20 p-4 rounded-xl border border-red-500/10">
                      {searchResult.notice}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-6 bg-black/30 p-5 rounded-2xl border border-white/5">
                      <div><span className="text-white/40 block mb-1">Title</span> <span className="font-semibold text-white">{searchResult.title}</span></div>
                      <div><span className="text-white/40 block mb-1">Creator</span> <span className="font-semibold text-white">{searchResult.creatorHandle}</span></div>
                      <div><span className="text-white/40 block mb-1">License</span> <span className="font-semibold text-white">{searchResult.license}</span></div>
                      <div><span className="text-white/40 block mb-1">Stamp ID</span> <span className="font-mono text-white/80">{searchResult.stampId}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-lg font-semibold text-green-300">Not found in opt-out registry</p>
                      <p className="text-sm font-medium text-green-200/60 mt-1">This specific file hash does not have an active opt-out record.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* API Docs */}
        <div className="apple-glass-panel border border-white/10 rounded-[2.5rem] overflow-hidden apple-shadow animate-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="p-8 sm:p-10">
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-2 flex items-center gap-3">
              <FileText className="h-6 w-6 text-indigo-400" />
              API for AI Companies
            </h2>
            <p className="text-white/50 font-medium mb-8">
              Query our registry before training on scraped content. Free to check.
            </p>
            <div className="space-y-4">
              <div className="bg-black/50 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-white/40 font-medium mb-2">Check a single file</p>
                  <code className="text-sm text-indigo-300 font-mono block">
                    GET /registry/check?hash=&#123;sha256&#125;&phash=&#123;perceptual_hash&#125;
                  </code>
                </div>
              </div>
              <div className="bg-black/50 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-white/40 font-medium mb-2">Bulk export (paginated)</p>
                  <code className="text-sm text-indigo-300 font-mono block">
                    GET /registry/bulk?page=1&limit=100
                  </code>
                </div>
              </div>
              <div className="bg-black/50 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-white/40 font-medium mb-2">Machine-readable declaration</p>
                  <code className="text-sm text-indigo-300 font-mono block">
                    GET /registry/declaration.txt
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-white/40 pt-12 pb-8 border-t border-white/10 animate-fade-up" style={{ animationDelay: '400ms' }}>
          <p className="font-medium">
            The ProofStamp AI Opt-Out Registry is a public good.
            All creators' works are opted out by default when stamped.
          </p>
          <p className="mt-4 flex items-center justify-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <Link to="/" className="text-white/70 hover:text-white font-semibold transition-colors">ProofStamp</Link> 
            <span>—</span>
            <span>Cryptographic proof of creative ownership</span>
          </p>
        </div>
      </div>
    </div>
  );
}
