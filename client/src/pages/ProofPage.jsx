import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, FileJson, FileWarning, Fingerprint, ExternalLink, Loader2, Info, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function ProofPage() {
  const { stampId } = useParams();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/stamps/${stampId}/proof`);
        if (!response.ok) throw new Error('Failed to load proof bundle');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message === 'Failed to fetch' ? 'the backend is not live right now' : err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [stampId]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast('JSON payload copied to clipboard', 'success');
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stampId}-proof-bundle.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-fade-up">
          <Loader2 className="h-10 w-10 text-white/50 animate-spin" />
          <p className="text-white/50 font-medium">Loading Proof Bundle...</p>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-20 text-center animate-fade-up">
          <div className="apple-glass-panel p-10 rounded-[3rem] border border-red-500/20 apple-shadow">
            <FileWarning className="h-16 w-16 text-red-500/50 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-2">Failed to load Proof Bundle</h2>
            <p className="text-white/50">{error || 'Stamp not found'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto animate-fade-up space-y-8">
        
        {/* Header Section */}
        <div className="apple-glass-panel rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 apple-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2 md:mb-3">
              <Fingerprint className="h-6 w-6 md:h-8 md:w-8 text-indigo-400" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Authenticity Proof Bundle</h1>
            </div>
            <p className="text-white/60 font-medium flex items-center gap-2">
              <span className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-white/5">
                {stampId}
              </span>
              <span>Version: {data.version}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleCopyJson} className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-12 px-5">
              <Copy className="h-4 w-4 mr-2" /> Copy JSON
            </Button>
            <Button variant="outline" onClick={handleDownloadJson} className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-12 px-5">
              <FileJson className="h-4 w-4 mr-2" /> Download JSON
            </Button>
          </div>
        </div>

        {/* AI Notice Alert */}
        {data.aiNotice && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-[1.5rem] p-5 flex items-start gap-4">
            <Lock className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-200/90 leading-relaxed">
              {data.aiNotice}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="apple-glass rounded-[2rem] p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">File Metadata</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-sm font-medium text-white/50">Name</span>
                  <span className="text-sm text-white">{data.file.name}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-sm font-medium text-white/50">Type & Category</span>
                  <span className="text-sm text-white uppercase">{data.file.type} / {data.file.category}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-sm font-medium text-white/50">Size</span>
                  <span className="text-sm text-white">{(data.file.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="pt-2">
                  <span className="text-sm font-medium text-white/50 block mb-2">SHA-256 Hash</span>
                  <code className="block text-xs font-mono text-white/60 bg-black/40 p-4 rounded-xl break-all border border-white/5 shadow-inner">
                    {data.file.sha256}
                  </code>
                </div>
              </div>
            </div>

            <div className="apple-glass rounded-[2rem] p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">Protection & Keys</h3>
              <div className="space-y-4">
                <div className="pt-2">
                  <span className="text-sm font-medium text-white/50 block mb-2">Creator RSA Public Key</span>
                  <code className="block text-xs font-mono text-white/60 bg-black/40 p-4 rounded-xl break-all border border-white/5 shadow-inner whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                    {data.protection.publicKey}
                  </code>
                </div>
                <div className="pt-2">
                  <span className="text-sm font-medium text-white/50 block mb-2">Digital Signature</span>
                  <code className="block text-xs font-mono text-white/60 bg-black/40 p-4 rounded-xl break-all border border-white/5 shadow-inner whitespace-pre-wrap">
                    {data.protection.signature}
                  </code>
                </div>
                {data.protection.perceptualHashes && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <span className="text-xs font-medium text-white/50 block mb-1">pHash</span>
                      <code className="block text-[10px] font-mono text-white/60 bg-black/40 p-2 rounded-xl break-all">
                        {data.protection.perceptualHashes.pHash}
                      </code>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-white/50 block mb-1">dHash</span>
                      <code className="block text-[10px] font-mono text-white/60 bg-black/40 p-2 rounded-xl break-all">
                        {data.protection.perceptualHashes.dHash}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {data.trustedTimestamp && (
              <div className="apple-glass rounded-[2rem] p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-4">Trusted Timestamping (TSA)</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-sm font-medium text-white/50">Provider</span>
                    <span className="text-sm text-white">{data.trustedTimestamp.tsaProvider}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-sm font-medium text-white/50">Timestamp</span>
                    <span className="text-sm text-white">{new Date(data.trustedTimestamp.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-sm font-medium text-white/50">Verify Status</span>
                    <Badge className={`border-0 uppercase tracking-widest text-[10px] ${data.trustedTimestamp.verifyStatus === 'valid' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {data.trustedTimestamp.verifyStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="apple-glass-panel rounded-[2rem] p-6 border border-white/5 apple-shadow">
              <h3 className="text-sm font-bold tracking-widest uppercase text-white/40 mb-4">Creator Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/40 mb-1">Passport ID</p>
                  <p className="text-sm font-medium text-white">{data.creator.passportId}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Display Name</p>
                  <p className="text-sm font-medium text-white">{data.creator.displayName}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Handle</p>
                  <p className="text-sm font-medium text-white">@{data.creator.username}</p>
                </div>
              </div>
            </div>

            <div className="apple-glass-panel rounded-[2rem] p-6 border border-white/5 apple-shadow">
              <h3 className="text-sm font-bold tracking-widest uppercase text-white/40 mb-4">Proof Chain</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/40 mb-1">Audit Chain Valid</p>
                  <Badge className={`border-0 uppercase tracking-widest text-[10px] ${data.auditChainValid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {data.auditChainValid ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Audit Head Hash</p>
                  <code className="text-xs text-white/60 font-mono break-all">{data.auditChainHeadHash}</code>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">License</p>
                  <p className="text-sm font-medium text-white">{data.license}</p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10" asChild>
                    <a href={data.verification.url} target="_blank" rel="noreferrer">
                      View Public Verification
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
