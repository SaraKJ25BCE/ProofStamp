import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import LegalEvidenceSummary from '@/components/LegalEvidenceSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload, CheckCircle2, AlertTriangle, HelpCircle, Loader2,
  Calendar, Shield, ExternalLink, FileCheck, Lock, Fingerprint, Scale
} from 'lucide-react';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('upload');
  const [stampIdInput, setStampIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setStampIdInput(id);
      setActiveTab('link');
      verifyByStampId(id);
    }
  }, [searchParams]);

  async function verifyByFile(file) {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/verify/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyByStampId(id) {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const stampId = (id || stampIdInput || '').trim();
      const match = stampId.match(/PS-\d{4}-[A-Z0-9]{5}/);
      const cleanId = match ? match[0] : null;
      if (!cleanId) {
        setError('Invalid stamp ID format. Expected PS-YYYY-XXXXX (e.g. PS-2026-A1B2C)');
        setLoading(false);
        return;
      }
      const res = await api.get(`/verify/${cleanId}`);
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setResult({ outcome: 'C', message: 'No ProofStamp found', stamp: null, passport: null });
      } else {
        setError(err.response?.data?.error || err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    const f = acceptedFiles[0];
    if (f) verifyByFile(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto animate-fade-up">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white">Verify Ownership</h1>
          <p className="text-white/50 mt-2 font-medium">
            Check if any digital file is registered and protected with ProofStamp
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            className={`px-6 py-3 rounded-full flex items-center font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
            onClick={() => { setActiveTab('upload'); setResult(null); setError(''); }}
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Upload File
          </button>
          <button
            className={`px-6 py-3 rounded-full flex items-center font-medium transition-all ${
              activeTab === 'link'
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
            onClick={() => { setActiveTab('link'); setResult(null); setError(''); }}
          >
            <Fingerprint className="h-4 w-4 mr-2" />
            Stamp ID
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && !result && (
          <div className="apple-glass-panel rounded-[3rem] p-12 text-center apple-shadow border border-white/10">
            <div
              {...getRootProps()}
              className={`relative rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-500 outline-none ${
                isDragActive ? 'bg-white/10 scale-105 shadow-2xl shadow-white/5' : 'bg-transparent hover:bg-white/5'
              }`}
            >
              {isDragActive && (
                <div className="absolute inset-0 rounded-[2rem] border-2 border-white/20 animate-pulse" />
              )}
              <input {...getInputProps()} />
              {loading ? (
                <div className="space-y-4 animate-fade-up">
                  <div className="relative mx-auto h-24 w-24 flex items-center justify-center">
                    <div className="absolute inset-0 border-[3px] border-white/20 rounded-full" />
                    <div className="absolute inset-0 border-[3px] border-white rounded-full border-t-transparent animate-spin" />
                    <Shield className="h-8 w-8 text-white animate-pulse" />
                  </div>
                  <p className="font-semibold text-xl text-white tracking-tight">Analyzing file...</p>
                  <p className="text-white/50 text-sm font-medium">Checking fingerprint, perceptual hash, and watermark</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="mx-auto h-24 w-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500">
                    <Upload className="h-10 w-10 text-white/40" />
                    <div className="absolute inset-0 rounded-full border border-white/20 scale-150 opacity-0 group-hover:animate-ping" />
                  </div>
                  <div>
                    <p className="font-semibold text-2xl text-white tracking-tight mb-2">Drop any file to verify</p>
                    <p className="text-white/40 font-medium">
                      Any format — images, audio, video, code, documents
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Link Tab */}
        {activeTab === 'link' && !result && (
          <div className="apple-glass-panel rounded-[2.5rem] p-10 apple-shadow border border-white/10">
            <form onSubmit={(e) => { e.preventDefault(); verifyByStampId(); }} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-white/50 mb-3 block pl-1">Stamp ID or Verification URL</label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                  <Input
                    placeholder="PS-2026-XXXXX or paste the full URL"
                    value={stampIdInput}
                    onChange={(e) => setStampIdInput(e.target.value)}
                    className="h-14 pl-12 rounded-2xl apple-input text-lg border-0 text-white placeholder:text-white/20"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 font-semibold shadow-xl transition-transform hover:scale-[1.02]" disabled={!stampIdInput || loading}>
                {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Shield className="h-5 w-5 mr-2" />}
                Verify Stamp
              </Button>
            </form>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-center backdrop-blur-md">
            {error}
          </div>
        )}

        {result && <VerificationResult result={result} onReset={() => { setResult(null); setError(''); }} />}
      </div>
    </Layout>
  );
}

function VerificationResult({ result, onReset }) {
  const { outcome, stamp, passport, confidence } = result;

  const config = {
    A: {
      icon: CheckCircle2,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      badge: 'bg-green-500/20 text-green-300 border border-green-500/30',
      title: 'Verified & Protected',
      subtitle: result.message || 'This file is registered and owned',
    },
    B: {
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      badge: 'bg-red-500/20 text-red-300 border border-red-500/30',
      title: 'Tampered',
      subtitle: 'This file has been modified since registration',
    },
    C: {
      icon: HelpCircle,
      color: 'text-white/60',
      bg: 'bg-white/5 border-white/10',
      badge: 'bg-white/10 text-white/60 border border-white/20',
      title: 'Not Registered',
      subtitle: 'No ProofStamp found on this file',
    },
  };

  const c = config[outcome];
  const Icon = c.icon;

  return (
    <div className={`mt-6 apple-glass-panel rounded-[3rem] p-10 border backdrop-blur-xl ${c.bg}`}>
      <div className="text-center mb-10">
        <div className={`inline-flex h-20 w-20 items-center justify-center rounded-[2rem] border shadow-inner mb-6 ${outcome === 'A' ? 'bg-green-500/10 border-green-500/20' : outcome === 'B' ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'}`}>
          <Icon className={`h-10 w-10 ${c.color}`} />
        </div>
        <h2 className="text-3xl font-semibold text-white tracking-tight">{c.title}</h2>
        <p className="text-white/60 font-medium mt-2 text-lg">{c.subtitle}</p>
        {confidence && outcome === 'A' && (
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 font-medium text-sm">
            <Lock className="h-3.5 w-3.5" />
            {confidence === 'exact' ? 'Exact match' : confidence === 'high' ? 'High confidence' : confidence === 'watermark' ? 'Watermark verified' : 'Content match'}
          </div>
        )}
      </div>

      {stamp && passport && (
        <div className="apple-glass rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-white/10">
            {passport.user?.avatarUrl ? (
              <img src={passport.user.avatarUrl} alt="" className="h-14 w-14 rounded-full border-2 border-white/20" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <Shield className="h-6 w-6 text-white/50" />
              </div>
            )}
            <div>
              <p className="font-semibold text-xl text-white">{passport.displayName}</p>
              <Link to={`/u/${passport.username}`} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                @{passport.username}
              </Link>
            </div>
            <div className={`ml-auto px-4 py-1.5 rounded-full font-medium text-sm ${c.badge}`}>
              {outcome === 'A' ? 'Owner Verified' : 'Tampered'}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-white/40 font-medium block mb-1">Title</span>
              <p className="font-semibold text-white text-base truncate">{stamp.title}</p>
            </div>
            <div>
              <span className="text-white/40 font-medium block mb-1">Stamp ID</span>
              <p className="font-mono text-white/80">{stamp.id}</p>
            </div>
            <div>
              <span className="text-white/40 font-medium block mb-1">Category</span>
              <p className="font-medium text-white capitalize">{stamp.category}</p>
            </div>
            <div>
              <span className="text-white/40 font-medium block mb-1">File Type</span>
              <p className="font-medium text-white">{stamp.fileType?.toUpperCase()}</p>
            </div>
            <div>
              <span className="text-white/40 font-medium block mb-1">License</span>
              <p className="font-medium text-white">{stamp.license}</p>
            </div>
            <div>
              <span className="text-white/40 font-medium block mb-1">Registered On</span>
              <p className="font-medium text-white flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-white/40" />
                {new Date(stamp.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {outcome === 'A' && result.verification && (
            <div className="p-5 rounded-[1.5rem] bg-indigo-500/10 border border-indigo-500/20 space-y-3">
              <p className="font-semibold text-indigo-300 flex items-center gap-2">
                <Scale className="h-4 w-4" /> Legal evidence layers
              </p>
              <div className="text-indigo-200/80 font-medium">
                <LegalEvidenceSummary stamp={stamp} verification={result.verification} />
              </div>
              <p className="text-sm text-indigo-300/80">RSA signature: <span className="text-white">{result.verification.signatureValid ? 'Valid' : 'Invalid'}</span></p>
              {result.verification.legalArtifactsUrl && (
                <a
                  href={result.verification.legalArtifactsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1.5 mt-2"
                >
                  <Shield className="h-4 w-4" /> View evidence catalog
                </a>
              )}
              <p className="text-xs font-medium text-white/30 pt-2 border-t border-indigo-500/20 mt-2">
                Technical verification only — not a legal ruling.{' '}
                <Link to="/faqs" className="text-indigo-400 hover:text-indigo-300">Learn more</Link>
              </p>
            </div>
          )}

          {stamp.license?.includes('AI') && (
            <div className="p-5 bg-red-500/10 rounded-[1.5rem] border border-red-500/20">
              <p className="font-semibold text-red-400 flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4" /> AI Training Prohibited
              </p>
              <p className="text-sm font-medium text-red-300/80">
                The creator has explicitly prohibited use of this work for AI/ML training.
              </p>
            </div>
          )}

          {result.c2pa && (
            <div className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 space-y-3">
              <p className="font-semibold text-white/80 flex items-center gap-2">
                <Fingerprint className="h-4 w-4" /> C2PA Content Provenance
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/40 block mb-1">Generator</span>
                  <span className="font-medium text-white">{result.c2pa.claim_generator || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-1">Origin Assertion</span>
                  <span className="font-semibold text-emerald-400">
                    {result.c2pa.assertions?.find(a => a.label === 'proofstamp.provenance')?.data?.origin || 'Human Created'}
                  </span>
                </div>
                {result.c2pa.assertions?.find(a => a.label === 'c2pa.training-mining') && (
                  <div className="col-span-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                    <span className="text-red-400 font-medium block">AI Training</span>
                    <span className="font-semibold text-red-300">Opt-out Enforced (Do Not Train)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {outcome === 'A' && (
            <div className="p-5 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20">
              <p className="font-semibold text-amber-400 flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" /> Indian IT Rules 2021 Readiness
              </p>
              <p className="text-amber-200/80 text-sm font-medium leading-relaxed">
                This cryptographic proof satisfies Section 63 of the BSA 2023. It can be used to issue a mandatory 24-hour deepfake takedown under Rule 3(2)(b) or a 72-hour copyright takedown under Rule 3(1)(b).
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-white/10 flex gap-3 flex-wrap">
            <Button variant="outline" className="bg-white/5 text-white border-white/10 hover:bg-white/10 hover:text-white rounded-full font-medium" asChild>
              <Link to={`/p/${stamp.id}`}>
                <ExternalLink className="h-4 w-4 mr-2 text-white/50" /> Share Page
              </Link>
            </Button>
            {stamp.certificateUrl && (
              <Button variant="outline" className="bg-white/5 text-white border-white/10 hover:bg-white/10 hover:text-white rounded-full font-medium" asChild>
                <a href={stamp.certificateUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2 text-white/50" /> Certificate
                </a>
              </Button>
            )}
            <Button variant="outline" className="bg-white/5 text-white border-white/10 hover:bg-white/10 hover:text-white rounded-full font-medium" onClick={() => {
              window.open(`/stamps/${stamp.id}/proof`, '_blank');
            }}>
              <Shield className="h-4 w-4 mr-2 text-white/50" /> Proof Bundle
            </Button>
          </div>
        </div>
      )}

      {outcome === 'C' && (
        <div className="text-center mt-8">
          <Button asChild className="h-14 rounded-full bg-white text-black hover:bg-white/90 font-semibold px-8 text-lg">
            <Link to="/stamp">
              <Shield className="h-5 w-5 mr-2" />
              Protect This File
            </Link>
          </Button>
        </div>
      )}

      <div className="text-center mt-8 space-y-6">
        <button className="text-white/40 hover:text-white font-medium transition-colors" onClick={onReset}>
          Verify Another File
        </button>
        <div className="flex justify-center pb-8">
          <a href="//www.dmca.com/Protection/Status.aspx?ID=4812b976-9838-4138-bd63-76f1b1d4d300" title="DMCA.com Protection Status" className="dmca-badge opacity-70 hover:opacity-100 transition-opacity"> <img src ="https://images.dmca.com/Badges/dmca-badge-w100-2x1-04.png?ID=4812b976-9838-4138-bd63-76f1b1d4d300"  alt="DMCA.com Protection Status" /></a>
        </div>
      </div>
    </div>
  );
}
