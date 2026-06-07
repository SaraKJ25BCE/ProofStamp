import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield, CheckCircle2, Calendar, ExternalLink,
  Copy, Loader2, AlertTriangle, Fingerprint, GitBranch, Upload,
  Scale, Download, Trash2
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import LegalEvidenceSummary from '@/components/LegalEvidenceSummary';
import { downloadCounselPacket, MARKETING } from '@/lib/legalProof';
import { downloadStampedFile, hasStampedFile } from '@/lib/stampFiles';
import { useToast } from '@/components/ui/toast';
import Layout from '@/components/Layout';

export default function SharePage() {
  const { stampId } = useParams();
  const { passport: authPassport } = useAuth();
  const { toast } = useToast();
  const [stamp, setStamp] = useState(null);
  const [passport, setPassport] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [showVersionUpload, setShowVersionUpload] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');
  const [versionNote, setVersionNote] = useState('');
  const [versionFile, setVersionFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadStamp();
  }, [stampId]);

  async function loadStamp() {
    try {
      const [stampRes, versionsRes] = await Promise.all([
        api.get(`/stamps/${stampId}`),
        api.get(`/versions/${stampId}`).catch(() => ({ data: { versions: [] } })),
      ]);
      setStamp(stampRes.data.stamp);
      setPassport(stampRes.data.passport);
      setVersions(versionsRes.data.versions || []);
    } catch (err) {
      setError(err.response?.status === 404 ? 'Stamp not found' : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  async function uploadVersion(e) {
    e.preventDefault();
    if (!versionFile || !versionLabel) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', versionFile);
      formData.append('label', versionLabel);
      formData.append('note', versionNote);
      await api.post(`/versions/${stampId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      setShowVersionUpload(false);
      setVersionLabel('');
      setVersionNote('');
      setVersionFile(null);
      loadStamp();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to upload version', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this stamp? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/stamps/${stampId}`);
      toast('Stamp deleted successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to delete', 'error');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-white/50 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">{error}</h1>
          <Button className="mt-6 bg-white text-black hover:bg-white/90 rounded-full" asChild><Link to="/">Go Home</Link></Button>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/p/${stamp.id}`;
  const apiUrl = import.meta.env.VITE_API_URL;
  const embedUrl = `${apiUrl}/embed/badge/${stamp.id}`;
  const embedSnippet = `<iframe src="${embedUrl}" width="240" height="96" frameborder="0" title="ProofStamp verification badge" loading="lazy"></iframe>`;
  const isOwner = !!(stamp?.passportId && authPassport?.id === stamp.passportId);
  const attested = !!(stamp.creatorAttestationAt && stamp.creatorAttestationSignature);
  const systemCertUrl =
    stamp.evidenceCertificateUrl || `${apiUrl}/legal/${stamp.id}/system-certificate`;

  async function handleCounselDownload() {
    try {
      await downloadCounselPacket(stamp.id);
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('REATTEST') || msg.includes('attestation')) {
        toast('Re-attestation required: sign your declaration again.', 'warning');
      } else if (msg.includes('401') || msg.toLowerCase().includes('auth')) {
        toast('Sign in as the creator to download the Counsel Evidence Packet.', 'error');
      } else {
        toast(msg || 'Complete creator declaration first', 'error');
      }
    }
  }

  function copySharePage() {
    copyToClipboard(shareUrl, 'share');
    toast('Share page link copied', 'default');
  }

  async function handleStampedDownload() {
    try {
      await downloadStampedFile(stamp);
    } catch (e) {
      toast(e.message || 'Download failed', 'error');
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-fade-up">
        <div className="apple-glass-panel rounded-[3rem] overflow-hidden apple-shadow border border-white/10">
          {/* Image display */}
          {stamp.category === 'image' && (stamp.originalFileUrl || stamp.stampedFileUrl) && (
            <div className="relative bg-black flex items-center justify-center min-h-[400px] max-h-[600px] group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={stamp.stampedFileUrl || stamp.originalFileUrl}
                alt={stamp.title}
                className="max-w-full max-h-[600px] object-contain transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-8 pt-24">
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-4">
                    {passport?.user?.avatarUrl ? (
                      <img src={passport.user.avatarUrl} alt="" className="h-14 w-14 rounded-full border-2 border-white/20 shadow-xl" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-xl">
                        <Shield className="h-6 w-6 text-white/50" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold text-lg">{passport?.displayName}</p>
                      <p className="text-white/50 text-sm font-medium">@{passport?.username}</p>
                    </div>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 backdrop-blur-md flex items-center font-medium text-sm shadow-xl">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Verified Owner
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">{stamp.title}</h1>
                {stamp.description && <p className="text-white/60 text-lg">{stamp.description}</p>}
              </div>
              <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg font-mono text-sm text-white/50 shrink-0">
                {stamp.id}
              </div>
            </div>

            {/* Creator info */}
            <div className="flex items-center gap-4 p-5 apple-glass rounded-[2rem] border border-white/5 mb-8">
              {passport?.user?.avatarUrl ? (
                <img src={passport.user.avatarUrl} alt="" className="h-12 w-12 rounded-full" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <Shield className="h-5 w-5 text-white/50" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-white">{passport?.displayName}</p>
                <Link to={`/u/${passport?.username}`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  @{passport?.username}
                </Link>
              </div>
              <div className="text-right text-sm text-white/50 font-medium">
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar className="h-4 w-4" />
                  {new Date(stamp.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <p className="capitalize mt-1 text-white/40">{stamp.license}</p>
              </div>
            </div>

            <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] mb-8">
              <h3 className="font-semibold text-indigo-300 text-sm mb-3 flex items-center gap-2">
                <Scale className="h-4 w-4" /> Legal evidence on record
              </h3>
              <div className="text-indigo-200/80 font-medium">
                <LegalEvidenceSummary stamp={stamp} />
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <Button variant="outline" className="bg-white/5 text-indigo-200 border-indigo-500/30 hover:bg-white/10 rounded-full font-medium" asChild>
                  <Link to={`/legal/${stamp.id}/artifacts`} target="_blank" className="hover:text-white transition-colors">
                    Evidence catalog
                  </Link>
                </Button>
                <Button variant="outline" className="bg-white/5 text-white border-white/10 hover:bg-white/10 rounded-full font-medium" asChild>
                  <Link to={`/verify?id=${stamp.id}`}>Verify this work</Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mb-10">
              {isOwner && attested ? (
                <Button
                  className="bg-white text-black hover:bg-white/90 rounded-full font-semibold px-6 shadow-xl"
                  onClick={handleCounselDownload}
                >
                  <Scale className="h-4 w-4 mr-2" />
                  Download Evidence Package
                </Button>
              ) : isOwner ? (
                <Button className="bg-white text-black hover:bg-white/90 rounded-full font-semibold px-6 shadow-xl" asChild>
                  <Link to={`/stamp?sign=${stamp.id}`}>
                    <Scale className="h-4 w-4 mr-2" />
                    Sign declaration for Counsel Packet
                  </Link>
                </Button>
              ) : (
                <Button
                  className="bg-white/20 text-white/50 cursor-not-allowed rounded-full font-semibold px-6"
                  disabled
                  title="Only the creator can download the Counsel Evidence Packet"
                >
                  <Scale className="h-4 w-4 mr-2" />
                  {MARKETING.downloadCounselPacketCta}
                </Button>
              )}
              <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full font-medium px-6" onClick={copySharePage}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {copied === 'share' ? 'Copied!' : 'Share Page'}
              </Button>
              {hasStampedFile(stamp) && (
                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full font-medium px-6" onClick={handleStampedDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Stamped file
                </Button>
              )}
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full font-medium px-6"
                onClick={() => window.open(systemCertUrl, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                System cert
              </Button>
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full font-medium px-6"
                onClick={() => window.open(`/stamps/${stamp.id}/proof`, '_blank')}
              >
                Proof Bundle (JSON)
              </Button>
              {isOwner && (
                <Button
                  variant="outline"
                  className="bg-white/5 border-white/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 rounded-full font-medium px-6"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Delete Stamp
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Category', value: stamp.category },
                { label: 'Format', value: stamp.fileType?.toUpperCase() },
                { label: 'Protection', value: 'Multi-layer legal proof' },
                { label: 'AI Training', value: stamp.aiOptOut ? 'Prohibited' : 'Allowed', color: stamp.aiOptOut ? 'text-red-400' : 'text-green-400' },
              ].map((item) => (
                <div key={item.label} className="p-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-center">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">{item.label}</p>
                  <p className={`font-semibold capitalize text-sm ${item.color || 'text-white/90'}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* AI Opt-Out Notice */}
            {stamp.aiOptOut && (
              <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-[1.5rem] mb-8">
                <p className="font-semibold text-red-400 flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4" /> AI Training Prohibited
                </p>
                <p className="text-red-300/80 text-sm font-medium">
                  This work is registered in the ProofStamp AI Opt-Out Registry.
                  Use for AI/ML training without explicit permission is prohibited.
                </p>
                <Link to="/registry" className="text-sm font-semibold text-red-400 hover:text-red-300 mt-2 inline-block transition-colors">View Registry →</Link>
              </div>
            )}

            {/* Creation Timeline (Proof of Process) */}
            {versions.length > 0 && (
              <div className="pt-8 border-t border-white/10 mb-8">
                <h3 className="font-semibold text-white flex items-center gap-2 mb-6 text-lg">
                  <GitBranch className="h-5 w-5 text-indigo-400" />
                  Creation Timeline <span className="text-white/30 font-normal">({versions.length} versions)</span>
                </h3>
                <div className="relative pl-8 space-y-6">
                  <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/10" />
                  {versions.map((v, i) => (
                    <div key={v.id} className="relative">
                      <div className={`absolute -left-10 top-2 h-4 w-4 rounded-full border-4 ${
                        i === versions.length - 1 ? 'bg-indigo-500 border-black shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/20 border-black'
                      }`} />
                      <div className="flex items-center gap-4 apple-glass p-4 rounded-[1.5rem] border border-white/5">
                        {v.thumbnailUrl && (
                          <img src={v.thumbnailUrl} alt="" className="h-12 w-12 rounded-xl object-cover border border-white/10" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white">v{v.version}: {v.label}</p>
                          {v.note && <p className="text-sm text-white/50 mt-0.5">{v.note}</p>}
                        </div>
                        <span className="text-xs font-medium text-white/30 shrink-0 bg-black/20 px-3 py-1.5 rounded-full">
                          {new Date(v.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-6 bg-white/5 text-white border-white/10 hover:bg-white/10 rounded-full font-medium" onClick={() => {
                  window.open(`/stamps/${stamp.id}/proof`, '_blank');
                }}>
                  <ExternalLink className="h-4 w-4 mr-2 text-white/50" /> Export Creation Proof (JSON)
                </Button>
              </div>
            )}

            {/* Owner: Add Version */}
            {isOwner && (
              <div className="pt-8 border-t border-white/10 mb-8">
                {!showVersionUpload ? (
                  <Button variant="outline" className="bg-white/5 text-white border-white/10 hover:bg-white/10 rounded-full font-medium" onClick={() => setShowVersionUpload(true)}>
                    <Upload className="h-4 w-4 mr-2" /> Add Version to Creation Timeline
                  </Button>
                ) : (
                  <form onSubmit={uploadVersion} className="space-y-4 p-6 apple-glass rounded-[2rem] border border-white/10">
                    <p className="text-sm font-semibold text-white">Add a version (sketch, draft, revision...)</p>
                    <input
                      type="text"
                      placeholder="Label (e.g. 'Initial Sketch', 'Color Pass')"
                      value={versionLabel}
                      onChange={(e) => setVersionLabel(e.target.value)}
                      className="flex h-12 w-full rounded-xl bg-black/50 border border-white/10 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Note (optional)"
                      value={versionNote}
                      onChange={(e) => setVersionNote(e.target.value)}
                      className="flex h-12 w-full rounded-xl bg-black/50 border border-white/10 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    />
                    <div className="relative">
                      <input
                        type="file"
                        onChange={(e) => setVersionFile(e.target.files[0])}
                        className="flex w-full text-sm text-white/50 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button type="submit" className="rounded-full bg-white text-black hover:bg-white/90 font-semibold" disabled={uploading}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        Upload Version
                      </Button>
                      <Button type="button" variant="ghost" className="rounded-full text-white/50 hover:text-white hover:bg-white/10" onClick={() => setShowVersionUpload(false)}>Cancel</Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div className="pt-8 border-t border-white/10 mb-8">
              <h3 className="font-semibold text-white mb-2">Embed verification badge</h3>
              <p className="text-sm text-white/50 mb-4">
                Add this to your portfolio — viewers can click through to verify authenticity.
              </p>
              <pre className="text-xs bg-black/50 border border-white/10 rounded-[1.5rem] p-4 overflow-x-auto text-white/80 font-mono leading-relaxed">{embedSnippet}</pre>
              <Button
                variant="outline"
                className="mt-4 bg-white/5 text-white border-white/10 hover:bg-white/10 rounded-full font-medium"
                onClick={() => {
                  copyToClipboard(embedSnippet, 'embed');
                  toast('Embed code copied', 'success');
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied === 'embed' ? 'Copied!' : 'Copy embed code'}
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 justify-center text-sm border-t border-white/10 pt-8">
              <button className="flex items-center text-white/40 hover:text-white transition-colors font-medium" onClick={() => copyToClipboard(shareUrl, 'link')}>
                <Copy className="h-4 w-4 mr-1.5" />
                {copied === 'link' ? 'Copied!' : 'Copy link'}
              </button>
              {stamp.certificateUrl && (
                <a href={stamp.certificateUrl} target="_blank" rel="noreferrer" className="flex items-center text-white/40 hover:text-white transition-colors font-medium">
                  <ExternalLink className="h-4 w-4 mr-1.5" /> Certificate PDF
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-10 text-sm font-medium text-white/30">
          <p>
            Protected with <Shield className="h-4 w-4 inline text-indigo-400 mx-1" />{' '}
            <Link to="/" className="text-white hover:text-indigo-300 transition-colors">ProofStamp</Link>
            {' '}— Cryptographic proof of creative ownership
          </p>
        </div>
      </div>
    </Layout>
  );
}
