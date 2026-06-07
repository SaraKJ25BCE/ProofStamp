import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, FileJson, FileWarning, ShieldCheck, ExternalLink, Loader2, Info } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function ArtifactsPage() {
  const { stampId } = useParams();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/legal/${stampId}/artifacts`);
        if (!response.ok) throw new Error('Failed to load artifacts data');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message);
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
    a.download = `${stampId}-artifacts.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSystemCert = () => {
    window.open(`${import.meta.env.VITE_API_URL}/legal/${stampId}/system-certificate`, '_blank');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-fade-up">
          <Loader2 className="h-10 w-10 text-white/50 animate-spin" />
          <p className="text-white/50 font-medium">Loading Legal Artifacts...</p>
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
            <h2 className="text-2xl font-semibold text-white mb-2">Failed to load Artifacts</h2>
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
        <div className="apple-glass-panel rounded-[2.5rem] p-10 apple-shadow flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="h-8 w-8 text-indigo-400" />
              <h1 className="text-3xl font-bold tracking-tight text-white">Legal Artifacts</h1>
            </div>
            <p className="text-white/60 font-medium flex items-center gap-2">
              <span className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-white/5">
                {stampId}
              </span>
              <span>Jurisdiction: {data.jurisdiction}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleCopyJson} className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-12 px-5">
              <Copy className="h-4 w-4 mr-2" /> Copy JSON
            </Button>
            <Button variant="outline" onClick={handleDownloadJson} className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-12 px-5">
              <FileJson className="h-4 w-4 mr-2" /> Download JSON
            </Button>
            <Button onClick={handleDownloadSystemCert} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-5 shadow-lg shadow-indigo-500/20 font-semibold border-0">
              <Download className="h-4 w-4 mr-2" /> System Certificate
            </Button>
          </div>
        </div>

        {/* Disclaimer Alert */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] p-5 flex items-start gap-4">
          <Info className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-amber-200/90 leading-relaxed">
            {data.disclaimer}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Claims List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-white tracking-tight ml-2">Evidence & Artifacts</h2>
            
            {data.claims.map((claim, index) => (
              <div key={index} className="apple-glass rounded-[2rem] p-6 border border-white/5 transition-all hover:bg-white/5 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white/90 mb-1">{claim.claim}</h3>
                    <p className="text-sm text-white/50">{claim.artifact}</p>
                  </div>
                  <Badge className={`border-0 uppercase tracking-widest text-[10px] ${claim.available ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/40'}`}>
                    {claim.available ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                
                {claim.value && (
                  <code className="block text-xs font-mono text-white/60 bg-black/40 p-4 rounded-xl break-all border border-white/5 mb-3 shadow-inner">
                    {claim.value}
                  </code>
                )}
                
                {claim.note && (
                  <p className="text-xs text-white/40 mb-3 italic">Note: {claim.note}</p>
                )}
                
                {claim.url && (
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="h-9 rounded-full bg-white/5 border-white/10 text-white/80 hover:bg-white/10 text-xs" asChild>
                      <a href={claim.url} target="_blank" rel="noreferrer">
                        {claim.url.endsWith('.pdf') ? 'View PDF' : 'View Data'} <ExternalLink className="h-3 w-3 ml-1.5 opacity-50" />
                      </a>
                    </Button>
                    {claim.verifyUrl && (
                      <Button variant="outline" size="sm" className="h-9 rounded-full bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 text-xs" asChild>
                        <a href={claim.verifyUrl} target="_blank" rel="noreferrer">
                          Verify Token <ExternalLink className="h-3 w-3 ml-1.5 opacity-50" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
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
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-white/40 mb-2">Creator Declaration</p>
                  <Badge className={`border-0 ${data.creatorAttestation.attested ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {data.creatorAttestation.attested ? 'Signed & Verified' : 'Not Signed'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="apple-glass-panel rounded-[2rem] p-6 border border-white/5 apple-shadow">
              <h3 className="text-sm font-bold tracking-widest uppercase text-white/40 mb-4">System Attestation</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/40 mb-1">Platform</p>
                  <p className="text-sm font-medium text-white">{data.systemAttestation.platform} v{data.systemAttestation.version}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Key Storage</p>
                  <p className="text-sm font-medium text-white">{data.systemAttestation.privateKeyStorage}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-2">Integrity Controls</p>
                  <div className="flex flex-wrap gap-2">
                    {data.systemAttestation.integrityControls.map((control, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-white/5 text-white/60 border-0 hover:bg-white/10 text-[10px]">
                        {control}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
