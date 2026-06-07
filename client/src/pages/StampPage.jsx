import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload, FileImage, Loader2, CheckCircle2, Copy, Download, ExternalLink,
  File, Music, Video, Code, Package, Type, Scale, Radar
} from 'lucide-react';
import { MARKETING, TSA_BADGES, BSA_FRAME } from '@/content/legalCopy';
import { CREATOR_ATTESTATION_STATEMENT } from '@/content/legalCopy';
import { downloadCounselPacket, attestCreator } from '@/lib/legalProof';
import { downloadStampedFile, hasStampedFile } from '@/lib/stampFiles';
import { useToast } from '@/components/ui/toast';

async function computeSHA256(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const LICENSE_OPTIONS = [
  { value: 'All Rights Reserved', label: 'All Rights Reserved — No one can use without permission' },
  { value: 'CC BY', label: 'CC BY — Others can use with credit' },
  { value: 'CC BY-SA', label: 'CC BY-SA — Use with credit, share alike' },
  { value: 'CC BY-NC', label: 'CC BY-NC — Non-commercial use with credit' },
  { value: 'CC BY-NC-ND', label: 'CC BY-NC-ND — No derivatives, non-commercial' },
  { value: 'No AI Training', label: 'No AI/ML Training — Prohibit AI training use' },
  { value: 'Public Domain', label: 'Public Domain — Free for any use' },
];

function getCategoryIcon(category) {
  switch (category) {
    case 'image': return FileImage;
    case 'audio': return Music;
    case 'video': return Video;
    case 'code': return Code;
    case 'archive': return Package;
    case 'font': return Type;
    default: return File;
  }
}

function getFileCategory(type, name) {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('text/') || type.includes('javascript') || type.includes('json')) return 'code';
  if (type === 'application/pdf') return 'document';
  if (type.includes('zip') || type.includes('tar')) return 'archive';
  if (type.startsWith('font/')) return 'font';
  const ext = name?.split('.').pop()?.toLowerCase();
  if (['py', 'js', 'ts', 'jsx', 'tsx', 'go', 'rs', 'c', 'cpp', 'java', 'rb'].includes(ext)) return 'code';
  if (['psd', 'ai', 'sketch', 'fig', 'xd'].includes(ext)) return 'design';
  return 'other';
}

export default function StampPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [hash, setHash] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [license, setLicense] = useState('All Rights Reserved');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [bulkResults, setBulkResults] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('single');
  const [polledStamp, setPolledStamp] = useState(null);
  const [legalReady, setLegalReady] = useState(false);
  const [showMonitorPrompt, setShowMonitorPrompt] = useState(false);
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [attestName, setAttestName] = useState('');
  const [attestCity, setAttestCity] = useState('');
  const [attestCountry, setAttestCountry] = useState('');
  const [attestConfirm, setAttestConfirm] = useState(false);
  const [statementConfirm, setStatementConfirm] = useState(false);
  const [attestLoading, setAttestLoading] = useState(false);
  const [attested, setAttested] = useState(false);

  useEffect(() => {
    if (!result?.stamp?.id) return undefined;
    setShowMonitorPrompt(result.stamp.category === 'image');
    let cancelled = false;
    let polls = 0;
    const maxPolls = 40;

    const poll = async () => {
      if (cancelled || polls >= maxPolls) return;
      polls += 1;
      try {
        const res = await api.get(`/stamps/${result.stamp.id}`);
        if (cancelled) return;
        const s = res.data.stamp;
        setPolledStamp(s);
        if (s.creatorAttestationAt) setAttested(true);
        const cdnReady = s.cdnReady || (!s.processing && /cloudinary/i.test(s.originalFileUrl || ''));
        if (cdnReady && s.tsaVerifyStatus === 'valid' && s.evidenceCertificateUrl) {
          setLegalReady(true);
        }
      } catch (err) {
        if (err.response?.status === 429) return;
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [result?.stamp?.id]);

  async function enableMonitoring() {
    if (!result?.stamp?.id) return;
    setMonitorLoading(true);
    try {
      await api.post(`/monitor/enable/${result.stamp.id}`);
      setShowMonitorPrompt(false);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to enable monitoring', 'error');
    } finally {
      setMonitorLoading(false);
    }
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    if (mode === 'bulk') {
      setFiles(acceptedFiles);
      setError('');
      setBulkResults(null);
      return;
    }

    const f = acceptedFiles[0];
    if (!f) return;

    setFiles([f]);
    setError('');
    setResult(null);

    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }

    const fileHash = await computeSHA256(f);
    setHash(fileHash);
  }, [mode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: mode === 'bulk' ? 20 : 1,
    maxSize: 100 * 1024 * 1024,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'bulk') {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        formData.append('license', license);
        formData.append('titles', JSON.stringify(files.map(f => f.name)));

        const res = await api.post('/stamps/bulk', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 300000,
        });
        setBulkResults(res.data);
      } else {
        if (!files[0] || !title) return;
        const formData = new FormData();
        formData.append('file', files[0]);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('license', license);
        formData.append('clientHash', hash);

        const res = await api.post('/stamps', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 300000,
        });
        setResult(res.data);
      }
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409 && data) {
        let msg = data.error || 'This file is already registered';
        if (data.registeredBy) msg += ` (${data.registeredBy})`;
        if (data.existingStampId) msg += ` — Stamp ID: ${data.existingStampId}`;
        setError(msg);
      } else {
        setError(data?.error || 'Failed to stamp file(s)');
      }
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  function reset() {
    setResult(null);
    setBulkResults(null);
    setFiles([]);
    setPreview(null);
    setTitle('');
    setDescription('');
    setHash('');
    setError('');
    setPolledStamp(null);
    setLegalReady(false);
    setShowMonitorPrompt(false);
    setAttestName('');
    setAttestConfirm(false);
    setAttested(false);
  }

  async function submitAttestation() {
    if (!result?.stamp?.id || !attestConfirm || !attestName.trim()) return;
    setAttestLoading(true);
    try {
      await attestCreator(result.stamp.id, {
        fullName: attestName.trim(),
        city: attestCity.trim(),
        country: attestCountry.trim(),
      });
      setAttested(true);
      toast('Declaration signed and cryptographically bound to your Passport key.', 'success');
      const res = await api.get(`/stamps/${result.stamp.id}`);
      setPolledStamp(res.data.stamp);
    } catch (e) {
      toast(e.message || 'Attestation failed', 'error');
    } finally {
      setAttestLoading(false);
    }
  }

  const displayStamp = polledStamp || result?.stamp;

  // Success state — single file
  if (result) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto animate-fade-up">
          <div className="apple-glass-panel rounded-[2.5rem] p-10 apple-shadow text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
              <CheckCircle2 className="h-10 w-10 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-white tracking-tight">{MARKETING.stampSuccessTitle}</h2>
            <p className="text-white/50 mb-8 font-medium">
              {TSA_BADGES[displayStamp?.tsaTier || 'development']} · {BSA_FRAME.colloquialLabel}{' '}
              {legalReady ? 'ready' : 'generating…'}
            </p>

            {showMonitorPrompt && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left backdrop-blur-sm">
                <p className="text-base font-semibold text-white flex items-center gap-2">
                  <Radar className="h-5 w-5" /> Enable theft monitoring?
                </p>
                <p className="text-sm text-white/70 mt-2 mb-4 leading-relaxed">
                  {MARKETING.monitoringLanding}
                </p>
                <div className="flex gap-3">
                  <Button size="sm" className="bg-white hover:bg-white/90 text-black rounded-xl" onClick={enableMonitoring} disabled={monitorLoading}>
                    {monitorLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Enable monitoring
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl" onClick={() => setShowMonitorPrompt(false)}>Later</Button>
                </div>
              </div>
            )}

            <div className="bg-black/40 rounded-[1.5rem] border border-white/5 p-5 mb-8 text-left space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-sm font-medium text-white/50">Stamp ID</span>
                <Badge className="bg-white/10 text-white hover:bg-white/10 border-0">{result.stamp.id}</Badge>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-sm font-medium text-white/50">Category</span>
                <Badge variant="secondary" className="bg-white/5 text-white/80 hover:bg-white/5 border-0 capitalize">{result.stamp.category}</Badge>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-sm font-medium text-white/50">CDN upload</span>
                <Badge className={`border-0 ${displayStamp?.cdnReady || (!displayStamp?.processing && /cloudinary/i.test(displayStamp?.originalFileUrl || '')) ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/80'}`}>
                  {displayStamp?.cdnReady || (!displayStamp?.processing && /cloudinary/i.test(displayStamp?.originalFileUrl || ''))
                    ? 'ready'
                    : 'processing…'}
                </Badge>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-sm font-medium text-white/50">TSA</span>
                <Badge
                  className={`border-0 ${displayStamp?.tsaVerifyStatus === 'valid' && displayStamp?.tsaStatus !== 'pending' ? 'bg-green-500/10 text-green-400' : (displayStamp?.tsaStatus === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/10 text-white/80')}`}
                >
                  {displayStamp?.tsaStatus === 'pending'
                    ? 'pending (retrying)'
                    : displayStamp?.tsaVerifyStatus || 'pending'}
                </Badge>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-sm font-medium text-white/50">{BSA_FRAME.section}</span>
                <Badge className={`border-0 ${displayStamp?.evidenceCertificateUrl ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/80'}`}>
                  {displayStamp?.evidenceCertificateUrl ? 'ready' : 'generating'}
                </Badge>
              </div>
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white/50">Verification URL</span>
                  <button
                    onClick={() => copyToClipboard(result.verifyUrl)}
                    className="text-xs font-medium text-white/70 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Link
                  </button>
                </div>
                <code className="block text-xs font-mono text-white/60 bg-white/5 p-3 rounded-xl break-all border border-white/5">{result.verifyUrl}</code>
              </div>
            </div>

            {/* Share link */}
            <div className="bg-white/5 rounded-[1.5rem] border border-white/10 p-5 mb-8 text-left">
              <p className="text-sm font-semibold text-white/80 mb-3">Share your protected work:</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-xs font-mono text-white/60 bg-black/40 p-3.5 rounded-xl break-all border border-white/5">
                  {window.location.origin}/p/{result.stamp.id}
                </code>
                <Button variant="outline" className="border-white/10 hover:bg-white/10 hover:text-white bg-white/5 text-white h-[46px] w-[46px] shrink-0 rounded-xl" onClick={() => copyToClipboard(`${window.location.origin}/p/${result.stamp.id}`)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!attested && !displayStamp?.creatorAttestationAt && (
              <div className="mb-8 text-left border border-amber-500/20 bg-amber-500/[0.03] rounded-[1.5rem] p-6 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-amber-200/90 mb-1 flex items-center gap-2">
                    <Scale className="h-5 w-5" /> Creator declaration (required)
                  </h3>
                  <p className="text-sm text-amber-200/60 font-medium">
                    Sign your authorship declaration before downloading the {MARKETING.counselPacketName}.
                  </p>
                </div>
                
                <div className="space-y-5">
                  <div className="text-xs text-white/70 font-mono leading-relaxed border border-white/10 rounded-xl p-4 bg-black/40 shadow-inner">
                    {CREATOR_ATTESTATION_STATEMENT}
                  </div>
                  
                  <label className="flex items-start gap-3 text-sm leading-relaxed cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={statementConfirm}
                      onChange={(e) => setStatementConfirm(e.target.checked)}
                      className="mt-1 h-4.5 w-4.5 shrink-0 rounded border-white/20 bg-white/5 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-white/70 group-hover:text-white/90 transition-colors">
                      I have read and confirm the statement above
                      <span className="opacity-70 block mt-0.5 text-xs">(type your name below — do not use autofill)</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm leading-relaxed cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={attestConfirm}
                      onChange={(e) => setAttestConfirm(e.target.checked)}
                      className="mt-1 h-4.5 w-4.5 shrink-0 rounded border-white/20 bg-white/5 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-white/70 group-hover:text-white/90 transition-colors">
                      I understand this cryptographically binds my Passport RSA key
                      and is separate from the automated system certificate.
                    </span>
                  </label>
                  
                  <div className="pt-2">
                    <Input 
                      placeholder="Full legal name (typed)" 
                      value={attestName} 
                      onChange={(e) => setAttestName(e.target.value)} 
                      autoComplete="off" 
                      className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 mb-3"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="City" 
                        value={attestCity} 
                        onChange={(e) => setAttestCity(e.target.value)} 
                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                      <Input 
                        placeholder="Country" 
                        value={attestCountry} 
                        onChange={(e) => setAttestCountry(e.target.value)} 
                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={submitAttestation}
                    className="w-full h-12 rounded-xl bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border border-amber-500/30 font-semibold mt-2"
                    disabled={
                      !attestConfirm ||
                      !statementConfirm ||
                      !attestName.trim() ||
                      !attestCity.trim() ||
                      !attestCountry.trim() ||
                      attestLoading
                    }
                  >
                    {attestLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    Sign Cryptographic Declaration
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 h-11 px-5 font-semibold"
                disabled={!attested && !displayStamp?.creatorAttestationAt}
                onClick={() =>
                  downloadCounselPacket(result.stamp.id).catch((e) => {
                    const msg = e.message || '';
                    if (msg.includes('REATTEST') || msg.includes('attestation')) {
                      toast('Re-attestation required: sign your declaration again to bind your RSA key.', 'warning');
                    } else {
                      toast(msg || 'Complete creator declaration first', 'error');
                    }
                  })
                }
              >
                <Scale className="h-4 w-4 mr-2" /> {MARKETING.downloadCounselPacketCta}
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white h-11">
                <a href={`/p/${result.stamp.id}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" /> Share Page
                </a>
              </Button>
              {hasStampedFile(displayStamp || result.stamp) && (
                <Button
                  variant="outline"
                  className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white h-11"
                  onClick={() =>
                    downloadStampedFile(displayStamp || result.stamp).catch((e) =>
                      toast(e.message || 'Download failed', 'error')
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-2" /> Stamped file
                </Button>
              )}
              {(displayStamp?.evidenceCertificateUrl || result.legalProof?.systemCertificateUrl) && (
                <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white h-11" onClick={() => window.open(displayStamp?.evidenceCertificateUrl || result.legalProof.systemCertificateUrl, '_blank')}>
                  <Download className="h-4 w-4 mr-2" /> System cert
                </Button>
              )}
              <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white h-11" asChild>
                <Link to={`/stamps/${result.stamp.id}/proof`} target="_blank">
                  Proof Bundle (JSON)
                </Link>
              </Button>
              <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white h-11" asChild>
                <Link to="/legal-guide">What this proves</Link>
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/5 rounded-xl font-medium" onClick={reset}>Stamp Another File</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Success state — bulk
  if (bulkResults) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto animate-fade-up">
          <div className="apple-glass-panel rounded-[2.5rem] p-10 apple-shadow">
            <div className="text-center mb-8">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                <CheckCircle2 className="h-10 w-10 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">{bulkResults.count} Files Protected!</h2>
              <p className="text-white/50 mt-2 font-medium">All files are now securely registered and protected</p>
            </div>

            <div className="space-y-3">
              {bulkResults.stamps.map((s) => {
                const Icon = getCategoryIcon(s.category);
                return (
                  <div key={s.stampId} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-[1.5rem] p-4 backdrop-blur-sm transition-all hover:bg-white/10">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-white/80" />
                    </div>
                    <span className="text-base flex-1 truncate text-white font-medium">{s.title}</span>
                    <Badge variant="secondary" className="bg-white/10 text-white/80 hover:bg-white/10 border-0 capitalize">{s.category}</Badge>
                    <Badge className="bg-white/5 text-white/60 hover:bg-white/5 border-white/10">{s.stampId}</Badge>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-10 pt-6 border-t border-white/5">
              <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/5 rounded-xl font-medium" onClick={reset}>Stamp More Files</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto animate-fade-up">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold tracking-tight text-white mb-3">Protect Your Work</h1>
          <p className="text-white/50 text-lg font-medium max-w-lg mx-auto">
            Register any digital file — images, audio, video, code, documents, designs
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full border border-white/10 p-1 bg-white/[0.02] backdrop-blur-md">
            <button
              type="button"
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                mode === 'single' ? 'bg-white text-black shadow-md' : 'text-white/40 hover:text-white'
              }`}
              onClick={() => { setMode('single'); reset(); }}
            >
              Single File
            </button>
            <button
              type="button"
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                mode === 'bulk' ? 'bg-white text-black shadow-md' : 'text-white/40 hover:text-white'
              }`}
              onClick={() => { setMode('bulk'); reset(); }}
            >
              Bulk Upload
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AirDrop Style Drop Zone */}
          <div className="apple-glass-panel rounded-[3rem] p-2 apple-shadow">
            <div
              {...getRootProps()}
              className={`relative overflow-hidden rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center min-h-[320px] cursor-pointer group ${
                isDragActive ? 'border-white/40 bg-white/10 scale-[0.98]' : 'border-white/10 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <input {...getInputProps()} />
              
              {/* Animated rings for AirDrop feel */}
              {!files.length && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                  <div className="absolute h-[400px] w-[400px] rounded-full border border-white/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  <div className="absolute h-[600px] w-[600px] rounded-full border border-white/10 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
                </div>
              )}

              {files.length > 0 ? (
                <div className="space-y-6 w-full px-8 relative z-10">
                  {preview && (
                    <div className="mx-auto w-48 h-48 rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-white/10 relative group-hover:scale-105 transition-transform duration-500">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {mode === 'bulk' ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {files.map((f, i) => {
                        const Icon = getCategoryIcon(getFileCategory(f.type, f.name));
                        return (
                          <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                              <Icon className="h-5 w-5 text-white/80" />
                            </div>
                            <span className="truncate flex-1 text-white font-medium">{f.name}</span>
                            <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 rounded-full px-3">
                              {(f.size / 1024).toFixed(0)} KB
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-16 w-16 rounded-[1.5rem] bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
                        {(() => { const Icon = getCategoryIcon(getFileCategory(files[0].type, files[0].name)); return <Icon className="h-8 w-8 text-white/90" />; })()}
                      </div>
                      <span className="text-lg text-white font-semibold tracking-tight">{files[0]?.name}</span>
                      <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 rounded-full px-4 py-1 text-sm">
                        {(files[0]?.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 text-center relative z-10 px-6">
                  <div className="mx-auto h-24 w-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 group-hover:bg-white/10 shadow-xl">
                    <Upload className="h-10 w-10 text-white/70" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white tracking-tight mb-2">
                      {mode === 'bulk' ? 'Drop files to protect' : 'Drop a file to protect'}
                    </p>
                    <p className="text-white/40 font-medium max-w-sm mx-auto">
                      Any file up to 100MB. Click to browse.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {hash && mode === 'single' && (
              <div className="mt-4 px-6 pb-4 text-center">
                <p className="text-xs text-white/40 font-medium uppercase tracking-widest mb-2">File Fingerprint (SHA-256)</p>
                <code className="text-xs text-white/60 break-all font-mono bg-white/5 px-4 py-2 rounded-xl inline-block border border-white/10">{hash}</code>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="apple-glass-panel rounded-[2.5rem] p-8 apple-shadow space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-white mb-1">Protection Details</h2>
              <p className="text-sm text-white/50 font-medium">
                {mode === 'bulk'
                  ? 'These settings apply to all files'
                  : 'Describe your work and choose protection level'
                }
              </p>
            </div>

            {mode === 'single' && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-white/70 mb-2 block ml-1">Title <span className="text-red-400">*</span></label>
                  <Input
                    placeholder="My Creative Work"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-14 rounded-2xl apple-input text-base text-white placeholder:text-white/30 border-0 px-4"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white/70 mb-2 block ml-1">Description</label>
                  <Input
                    placeholder="Brief description of this work..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-14 rounded-2xl apple-input text-base text-white placeholder:text-white/30 border-0 px-4"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-white/70 mb-2 block ml-1">License & Protection Level</label>
              <div className="relative">
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full h-14 rounded-2xl apple-input text-base text-white border-0 px-4 appearance-none outline-none focus:ring-2 focus:ring-white/20"
                >
                  {LICENSE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">{opt.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Protection summary */}
            <div className="p-5 bg-white/5 rounded-[1.5rem] border border-white/10 mt-6">
              <p className="text-sm font-semibold text-white/80 mb-4">Cryptographic layers applied:</p>
              <div className="grid grid-cols-2 gap-3 text-sm text-white/60 font-medium">
                <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-400" /> SHA-256 fingerprint</span>
                <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-400" /> RSA digital signature</span>
                <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-400" /> Timestamp proof</span>
                <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-400" /> Certificate of authenticity</span>
                {files[0]?.type?.startsWith('image/') && (
                  <>
                    <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Perceptual hash (pHash)</span>
                    <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> DWT-DCT watermark</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full h-16 rounded-[2rem] bg-white text-black hover:bg-white/90 font-semibold text-lg shadow-xl transition-transform hover:scale-[1.02]"
            disabled={(mode === 'single' && (!files[0] || !title)) || (mode === 'bulk' && files.length === 0) || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                Protecting {mode === 'bulk' ? `${files.length} files` : 'your file'}...
              </>
            ) : (
              mode === 'bulk' ? `Protect ${files.length || 0} Files` : 'Protect This File'
            )}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
