import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FileWarning, Send, Copy, CheckCircle2, Clock, XCircle,
  Loader2, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-white/10 text-white/70 border-white/20', icon: FileWarning },
  sent: { label: 'Sent', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Send },
  acknowledged: { label: 'Acknowledged', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: XCircle },
};

export default function TakedownPage() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [takedowns, setTakedowns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stamps, setStamps] = useState([]);
  const [platforms, setPlatforms] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [copied, setCopied] = useState('');

  // Form state
  const [formStampId, setFormStampId] = useState(searchParams.get('stampId') || '');
  const [formUrl, setFormUrl] = useState(searchParams.get('url') || '');
  const [formPlatform, setFormPlatform] = useState('');
  const [formAlertId] = useState(searchParams.get('alertId') || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    if (searchParams.get('stampId')) setShowForm(true);
  }, []);

  async function loadData() {
    try {
      const [tdRes, stampRes, platRes] = await Promise.all([
        api.get('/takedowns'),
        api.get('/passport/me'),
        api.get('/takedowns/platforms'),
      ]);
      setTakedowns(tdRes.data.takedowns);
      setStats(tdRes.data.stats);
      setStamps(stampRes.data.passport.stamps || []);
      setPlatforms(platRes.data.platforms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formStampId || !formUrl || !formPlatform) return;
    setSubmitting(true);
    try {
      const res = await api.post('/takedowns', {
        stampId: formStampId,
        infringingUrl: formUrl,
        platform: formPlatform,
        alertId: formAlertId || undefined,
      });
      setTakedowns(prev => [res.data.takedown, ...prev]);
      setExpanded(res.data.takedown.id);
      setShowForm(false);
      setFormStampId('');
      setFormUrl('');
      setFormPlatform('');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to create takedown', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(takedownId, status) {
    try {
      await api.patch(`/takedowns/${takedownId}/status`, { status });
      setTakedowns(prev => prev.map(t => t.id === takedownId ? { ...t, status } : t));
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update', 'error');
    }
  }

  function copyText(text, id) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  }

  function detectPlatform(url) {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('pinterest.com')) return 'pinterest';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('behance.net')) return 'behance';
    if (url.includes('deviantart.com')) return 'deviantart';
    return 'other';
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white flex items-center gap-3">
              <FileWarning className="h-10 w-10 text-red-400" />
              Takedown Center
            </h1>
            <p className="text-white/50 mt-2 text-lg font-medium">
              File DMCA takedowns with one click. Track until content is removed.
            </p>
          </div>
          <Button className="bg-white text-black hover:bg-white/90 rounded-full font-semibold px-6 shadow-xl h-12" onClick={() => setShowForm(!showForm)}>
            <FileWarning className="h-4 w-4 mr-2" />
            New Takedown
          </Button>
        </div>

        {/* Stats */}
        {stats && stats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="apple-glass-panel p-6 rounded-[2rem] text-center border border-white/5 apple-shadow">
              <div className="text-4xl font-semibold text-white mb-1">{stats.total}</div>
              <p className="text-sm font-medium text-white/50">Total</p>
            </div>
            <div className="apple-glass-panel p-6 rounded-[2rem] text-center border border-white/5 apple-shadow">
              <div className="text-4xl font-semibold text-blue-400 mb-1">{stats.sent}</div>
              <p className="text-sm font-medium text-white/50">Sent</p>
            </div>
            <div className="apple-glass-panel p-6 rounded-[2rem] text-center border border-white/5 apple-shadow">
              <div className="text-4xl font-semibold text-green-400 mb-1">{stats.resolved}</div>
              <p className="text-sm font-medium text-white/50">Resolved</p>
            </div>
            <div className="apple-glass-panel p-6 rounded-[2rem] text-center border border-white/5 apple-shadow">
              <div className="text-4xl font-semibold text-white/60 mb-1">{stats.draft}</div>
              <p className="text-sm font-medium text-white/50">Drafts</p>
            </div>
          </div>
        )}

        {/* New Takedown Form */}
        {showForm && (
          <div className="apple-glass-panel border border-red-500/20 bg-red-500/5 rounded-[2.5rem] overflow-hidden apple-shadow mb-8">
            <div className="p-8 sm:p-10">
              <h2 className="text-2xl font-semibold text-white tracking-tight mb-8">File a DMCA Takedown</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block text-white/70">Your Stamp (the original work)</label>
                  <select
                    value={formStampId}
                    onChange={(e) => setFormStampId(e.target.value)}
                    className="flex h-12 w-full rounded-xl bg-black/50 border border-white/10 px-4 text-white focus:outline-none focus:border-white/30 transition-colors"
                    required
                  >
                    <option value="" className="text-black">Select your stamped work...</option>
                    {stamps.map(s => (
                      <option key={s.id} value={s.id} className="text-black">{s.title} ({s.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-white/70">URL of the stolen/infringing content</label>
                  <Input
                    placeholder="https://instagram.com/p/..."
                    value={formUrl}
                    onChange={(e) => {
                      setFormUrl(e.target.value);
                      if (!formPlatform) setFormPlatform(detectPlatform(e.target.value));
                    }}
                    className="h-12 rounded-xl bg-black/50 border border-white/10 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-white/70">Platform</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                    className="flex h-12 w-full rounded-xl bg-black/50 border border-white/10 px-4 text-white focus:outline-none focus:border-white/30 transition-colors"
                    required
                  >
                    <option value="" className="text-black">Select platform...</option>
                    {Object.entries(platforms).map(([key, info]) => (
                      <option key={key} value={key} className="text-black">{info.name}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-lg shadow-xl">
                  {submitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <FileWarning className="h-5 w-5 mr-2" />}
                  Generate DMCA Takedown Notice
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Takedown List */}
        <div className="space-y-4">
          {takedowns.length === 0 && !showForm ? (
            <div className="apple-glass-panel rounded-[3rem] p-16 text-center border border-white/10 apple-shadow">
              <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">No takedowns filed</h3>
              <p className="text-white/50 font-medium mb-8">
                When someone steals your work, file a takedown here to get it removed
              </p>
              <Button className="bg-white text-black hover:bg-white/90 rounded-full font-semibold px-8 h-12" onClick={() => setShowForm(true)}>
                <FileWarning className="h-4 w-4 mr-2" /> File a Takedown
              </Button>
            </div>
          ) : (
            takedowns.map(td => {
              const statusConf = STATUS_CONFIG[td.status];
              const StatusIcon = statusConf?.icon || FileWarning;
              const isExpanded = expanded === td.id;

              return (
                <div key={td.id} className="apple-glass rounded-[2rem] border border-white/10 transition-all hover:border-white/20">
                  <div className="p-6">
                    <div
                      className="flex items-center gap-5 cursor-pointer"
                      onClick={() => setExpanded(isExpanded ? null : td.id)}
                    >
                      <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                        <StatusIcon className="h-6 w-6 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-lg text-white truncate">{td.stamp?.title}</p>
                          <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border ${statusConf?.color}`}>
                            {statusConf?.label}
                          </div>
                        </div>
                        <p className="text-sm text-blue-400 hover:text-blue-300 truncate font-medium max-w-lg mb-1">{td.infringingUrl}</p>
                        <p className="text-xs font-medium text-white/30">
                          {td.platform} · {new Date(td.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-6 w-6 text-white/30" /> : <ChevronDown className="h-6 w-6 text-white/30" />}
                    </div>

                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
                        {/* DMCA Letter */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-white">DMCA Notice (ready to send)</p>
                            <Button
                              size="sm" variant="ghost"
                              className="text-white/50 hover:text-white hover:bg-white/10 rounded-full font-medium h-8"
                              onClick={() => copyText(td.dmcaLetter, td.id)}
                            >
                              {copied === td.id ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                              <span className="ml-1.5">{copied === td.id ? 'Copied!' : 'Copy'}</span>
                            </Button>
                          </div>
                          <pre className="text-xs bg-black/50 border border-white/10 text-white/80 p-5 rounded-[1.5rem] overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto font-mono leading-relaxed">
                            {td.dmcaLetter}
                          </pre>
                        </div>

                        {/* Platform link */}
                        {platforms[td.platform]?.reportUrl && (
                          <div className="flex items-center gap-4 p-5 bg-blue-500/10 rounded-[1.5rem] border border-blue-500/20">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-blue-300">
                                File on {platforms[td.platform]?.name}
                              </p>
                              <p className="text-xs font-medium text-blue-400/80 mt-1">
                                Method: {platforms[td.platform]?.method}
                              </p>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow-lg" asChild>
                              <a href={platforms[td.platform].reportUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1.5" /> Open Form
                              </a>
                            </Button>
                          </div>
                        )}

                        {/* Status actions */}
                        <div className="flex gap-3 flex-wrap">
                          {td.status === 'draft' && (
                            <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-full font-semibold shadow-lg" onClick={() => updateStatus(td.id, 'sent')}>
                              <Send className="h-4 w-4 mr-1.5" /> Mark as Sent
                            </Button>
                          )}
                          {td.status === 'sent' && (
                            <>
                              <Button size="sm" variant="outline" className="bg-white/5 text-white border-white/10 hover:bg-white/10 rounded-full font-medium" onClick={() => updateStatus(td.id, 'acknowledged')}>
                                Platform Acknowledged
                              </Button>
                              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white rounded-full font-medium shadow-lg" onClick={() => updateStatus(td.id, 'resolved')}>
                                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Content Removed
                              </Button>
                            </>
                          )}
                          {td.status === 'acknowledged' && (
                            <>
                              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white rounded-full font-medium shadow-lg" onClick={() => updateStatus(td.id, 'resolved')}>
                                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Content Removed
                              </Button>
                              <Button size="sm" variant="destructive" className="rounded-full font-medium shadow-lg" onClick={() => updateStatus(td.id, 'rejected')}>
                                <XCircle className="h-4 w-4 mr-1.5" /> Rejected
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
