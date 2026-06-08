import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileCheck, Plus, Calendar, Shield, FileImage, Music, Video,
  Code, File, Package, Type, Lock, Download, Trash2, AlertTriangle, Scale, Loader2
} from 'lucide-react';
import { downloadCounselPacket, legalStatusBadges, MARKETING } from '@/lib/legalProof';
import { useToast } from '@/components/ui/toast';
import DeveloperSettings from '@/components/DeveloperSettings';

function getCategoryIcon(category) {
  const map = { image: FileImage, audio: Music, video: Video, code: Code, archive: Package, font: Type, design: FileImage };
  return map[category] || File;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { user, passport } = useAuth();
  const [stamps, setStamps] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [draftTakedowns, setDraftTakedowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [usage, setUsage] = useState(null);
  const [showDeveloperSettings, setShowDeveloperSettings] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [passportRes, alertRes, tdRes, usageRes] = await Promise.all([
        api.get('/passport/me'),
        api.get('/monitor/alerts').catch(() => ({ data: { alerts: [] } })),
        api.get('/takedowns').catch(() => ({ data: { takedowns: [] } })),
        api.get('/passport/me/usage').catch(() => ({ data: null })),
      ]);
      setStamps((passportRes.data.passport.stamps || []).filter(Boolean));
      setUsage(usageRes.data);
      setAlerts((alertRes.data.alerts || []).filter(Boolean).filter((a) => a.status === 'new'));
      setDraftTakedowns((tdRes.data.takedowns || []).filter(Boolean).filter((t) => t.status === 'draft'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(stampId, e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this stamp? This cannot be undone.')) return;
    setDeleting(stampId);
    try {
      await api.delete(`/stamps/${stampId}`);
      setStamps((prev) => prev.filter((s) => s.id !== stampId));
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to delete', 'error');
    } finally {
      setDeleting(null);
    }
  }

  async function handleDownload(stamp, e) {
    e.preventDefault();
    e.stopPropagation();
    const url = stamp.stampedFileUrl || stamp.originalFileUrl;
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${stamp.id}-${stamp.fileName || 'file'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch {
      window.open(url, '_blank');
    }
  }

  const categories = stamps.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <Layout>
      <div className="space-y-10 animate-fade-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2">
              Your Protected Assets
            </h1>
            <p className="text-white/50 text-base md:text-lg font-medium">
              Manage and monitor your cryptographically secured files.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <Button
              variant="ghost"
              onClick={() => setShowDeveloperSettings(!showDeveloperSettings)}
              className="text-white/40 hover:text-white hover:bg-white/5 rounded-full px-4 md:px-6 transition-colors h-10 md:h-12 flex-1 md:flex-none justify-center"
            >
              {showDeveloperSettings ? "Hide API Keys" : "API Keys"}
            </Button>
            <Button
              asChild
              className="bg-white text-black hover:bg-white/90 rounded-full px-4 md:px-6 h-10 md:h-12 font-semibold shadow-lg transition-all hover:scale-105 flex-1 md:flex-none justify-center"
            >
              <Link to="/stamp">
                <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Protect New File
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        {stamps.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(categories).map(([cat, count]) => {
              const Icon = getCategoryIcon(cat);
              return (
                <div key={cat} className="apple-glass rounded-[2rem] p-6 apple-shadow">
                  <div className="h-12 w-12 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-4 border border-white/10">
                    <Icon className="h-6 w-6 text-white/80" />
                  </div>
                  <div className="text-3xl font-semibold tracking-tight text-white mb-1">
                    {count}
                  </div>
                  <div className="text-sm text-white/50 font-medium capitalize">
                    {cat}
                  </div>
                </div>
              );
            })}

            <div className="apple-glass rounded-[2rem] p-6 apple-shadow">
              <div className="h-12 w-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-3xl font-semibold tracking-tight text-white mb-1">
                100%
              </div>
              <div className="text-sm text-white/50 font-medium">
                Verified Cryptography
              </div>
            </div>
          </div>
        )}

        {showDeveloperSettings && (
          <div className="animate-fade-up">
            <DeveloperSettings />
          </div>
        )}

        {/* Protected Files Grid */}
        <div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="apple-glass rounded-[2.5rem] p-4 animate-pulse">
                  <div className="aspect-video bg-white/5 rounded-3xl mb-4" />
                  <div className="h-6 bg-white/5 rounded-full w-3/4 mx-4 mb-3" />
                  <div className="h-4 bg-white/5 rounded-full w-1/2 mx-4" />
                </div>
              ))}
            </div>
          ) : stamps.length === 0 ? (
            <div className="apple-glass-panel rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 text-center apple-shadow border border-white/10">
              <div className="mx-auto h-16 w-16 md:h-24 md:w-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 md:mb-8">
                <FileImage className="h-8 w-8 md:h-10 md:w-10 text-white/40" />
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-3 md:mb-4">No files protected yet</h3>
              <p className="text-white/50 text-base md:text-lg font-medium max-w-md mx-auto mb-8 md:mb-10 leading-relaxed px-4 md:px-0">
                Secure your first piece of intellectual property using our zero-knowledge cryptographic engine.
              </p>
              <Button asChild size="lg" className="h-12 md:h-14 px-6 md:px-8 rounded-full bg-white text-black hover:bg-white/90 font-semibold shadow-xl transition-transform hover:scale-105">
                <Link to="/stamp">
                  Protect Your First File
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stamps.map((stamp) => {
                const Icon = getCategoryIcon(stamp.category);

                return (
                  <Link key={stamp.id} to={`/p/${stamp.id}`} className="group outline-none">
                    <div className="apple-glass rounded-[2.5rem] p-4 apple-shadow border border-white/5 group-hover:border-white/20 transition-all duration-500 group-hover:-translate-y-2 group-focus-visible:ring-4 group-focus-visible:ring-white/20">
                      {stamp.thumbnailUrl ? (
                        <div className="aspect-video rounded-[2rem] overflow-hidden bg-black mb-5 relative group-hover:shadow-lg transition-shadow">
                          <img
                            src={stamp.thumbnailUrl}
                            alt={stamp.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-[2rem] bg-white/[0.02] border border-white/[0.05] mb-5 flex items-center justify-center group-hover:bg-white/[0.05] transition-colors">
                          <Icon className="h-12 w-12 text-white/20 group-hover:text-white/40 transition-colors" />
                        </div>
                      )}

                      <div className="px-3 pb-2 space-y-3">
                        <h3 className="font-semibold text-xl tracking-tight text-white truncate">
                          {stamp.title}
                        </h3>

                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 rounded-full px-3 py-1 font-medium">
                            <Icon className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                            {stamp.fileType?.toUpperCase() || 'FILE'}
                          </Badge>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white/40 hidden sm:flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(stamp.createdAt).toLocaleDateString()}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-full z-10 relative"
                              onClick={(e) => handleDelete(stamp.id, e)}
                              disabled={deleting === stamp.id}
                              title="Delete Stamp"
                            >
                              {deleting === stamp.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
