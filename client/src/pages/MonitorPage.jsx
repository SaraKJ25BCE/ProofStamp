import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Radar, Shield, AlertTriangle, Eye, EyeOff, Loader2,
  ScanSearch, Bell, CheckCircle2, FileWarning, Info
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function MonitorPage() {
  const { toast } = useToast();
  const [monitors, setMonitors] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(null);
  const [stamps, setStamps] = useState([]);
  const [tab, setTab] = useState('overview');
  const [capabilities, setCapabilities] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [monRes, alertRes, stampRes, capRes] = await Promise.all([
        api.get('/monitor'),
        api.get('/monitor/alerts'),
        api.get('/passport/me'),
        api.get('/monitor/capabilities').catch(() => ({ data: null })),
      ]);
      setCapabilities(capRes.data);
      setMonitors(monRes.data.monitors);
      setStats(monRes.data.stats);
      setAlerts(alertRes.data.alerts);
      setStamps(stampRes.data.passport.stamps?.filter(s => s.category === 'image') || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function enableMonitor(stampId) {
    try {
      await api.post(`/monitor/enable/${stampId}`);
      loadData();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to enable monitoring', 'error');
    }
  }

  async function disableMonitor(stampId) {
    try {
      await api.post(`/monitor/disable/${stampId}`);
      loadData();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed', 'error');
    }
  }

  async function runScan(stampId) {
    setScanning(stampId);
    try {
      const res = await api.post(`/monitor/scan/${stampId}`);
      toast(`Scan complete: ${res.data.scanned} checked, ${res.data.matchesFound} matches, ${res.data.newAlerts} new alerts`, 'success');
      loadData();
    } catch (err) {
      toast(err.response?.data?.error || 'Scan failed', 'error');
    } finally {
      setScanning(null);
    }
  }

  async function dismissAlert(alertId) {
    try {
      await api.patch(`/monitor/alerts/${alertId}`, { status: 'dismissed' });
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'dismissed' } : a));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-up w-full">
          <div className="flex flex-col gap-4">
            <div className="h-10 w-64 bg-white/10 rounded-xl animate-pulse" />
            <div className="h-6 w-96 bg-white/5 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="apple-glass-panel p-6 rounded-[2rem] border border-white/5 h-32 animate-pulse bg-white/5" />
            ))}
          </div>
          <div className="flex gap-2 border-b border-white/10 pb-4">
             <div className="h-10 w-32 bg-white/10 rounded-full animate-pulse" />
             <div className="h-10 w-32 bg-white/5 rounded-full animate-pulse" />
             <div className="h-10 w-32 bg-white/5 rounded-full animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="apple-glass rounded-[2rem] border border-white/5 h-32 animate-pulse bg-white/5" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const unmonitoredStamps = stamps.filter(s => !monitors.find(m => m.stampId === s.id));

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
        {capabilities && !capabilities.webScan && (
          <div className="flex gap-4 p-5 rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 text-amber-200 apple-shadow backdrop-blur-md">
            <Info className="h-6 w-6 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-300">Web-wide scan off</p>
              <p className="mt-1 text-amber-200/80 text-sm font-medium">
                Add <code className="bg-amber-500/20 px-1.5 py-0.5 rounded text-xs border border-amber-500/30">SERPAPI_API_KEY</code>, <code className="bg-amber-500/20 px-1.5 py-0.5 rounded text-xs border border-amber-500/30">TINEYE_API_KEY</code> or Google Vision on the server to detect copies via Google Lens or on Instagram, Pinterest, etc.
                You still get in-app alerts and <strong className="text-amber-100">Similar work on ProofStamp</strong> scans.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white flex items-center gap-3">
              <Radar className="h-10 w-10 text-indigo-400" />
              Theft Monitor
            </h1>
            <p className="text-white/50 mt-2 text-lg font-medium">
              Track your images across the internet. Get alerted when copies are detected.
            </p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="apple-glass-panel p-6 rounded-[2rem] text-center border border-white/5 apple-shadow">
              <div className="text-4xl font-semibold text-indigo-400 mb-1">{stats.activeMonitors}</div>
              <p className="text-sm font-medium text-white/50">Active Monitors</p>
            </div>
            <div className="apple-glass-panel p-6 rounded-[2rem] text-center border border-white/5 apple-shadow">
              <div className="text-4xl font-semibold text-amber-400 mb-1">{stats.newAlerts}</div>
              <p className="text-sm font-medium text-white/50">New Alerts</p>
            </div>
            <div className="apple-glass-panel p-6 rounded-[2rem] text-center border border-white/5 apple-shadow">
              <div className="text-4xl font-semibold text-white/80 mb-1">{stats.totalAlerts}</div>
              <p className="text-sm font-medium text-white/50">Total Detections</p>
            </div>
            <div className="apple-glass-panel p-6 rounded-[2rem] text-center border border-white/5 apple-shadow">
              <div className="text-4xl font-semibold text-green-400 mb-1">{stats.totalMonitored}</div>
              <p className="text-sm font-medium text-white/50">Images Tracked</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-4">
          <button
            className={`px-5 py-2 rounded-full font-medium transition-all ${tab === 'overview' ? 'bg-white text-black' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            onClick={() => setTab('overview')}
          >
            Active Monitors
          </button>
          <button
            className={`px-5 py-2 rounded-full font-medium transition-all flex items-center ${tab === 'alerts' ? 'bg-white text-black' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            onClick={() => setTab('alerts')}
          >
            Alerts {stats?.newAlerts > 0 && <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">{stats.newAlerts}</span>}
          </button>
          <button
            className={`px-5 py-2 rounded-full font-medium transition-all ${tab === 'add' ? 'bg-white text-black' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            onClick={() => setTab('add')}
          >
            Add Images
          </button>
        </div>

        {/* Active Monitors */}
        {tab === 'overview' && (
          <div className="space-y-4 animate-fade-up">
            {monitors.length === 0 ? (
              <div className="apple-glass-panel rounded-[3rem] p-16 text-center border border-white/10 apple-shadow">
                <Radar className="h-16 w-16 text-white/20 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">No monitors active</h3>
                <p className="text-white/50 font-medium mb-8">Start monitoring your images to detect unauthorized use</p>
                <Button className="bg-white text-black hover:bg-white/90 rounded-full font-semibold px-8 h-12" onClick={() => setTab('add')}>Enable Monitoring</Button>
              </div>
            ) : (
              monitors.map(monitor => (
                <div key={monitor.id} className={`apple-glass rounded-[2rem] border transition-all ${monitor.status === 'active' ? 'border-white/10 hover:border-white/20 apple-shadow-sm' : 'border-white/5 opacity-60'}`}>
                  <div className="p-5 flex items-center gap-5">
                    {monitor.stamp.thumbnailUrl ? (
                      <img src={monitor.stamp.thumbnailUrl} alt="" className="h-20 w-20 rounded-[1.25rem] object-cover border border-white/10" />
                    ) : (
                      <div className="h-20 w-20 rounded-[1.25rem] bg-white/5 flex items-center justify-center border border-white/10">
                        <Shield className="h-8 w-8 text-white/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg text-white truncate mb-1">{monitor.stamp.title}</p>
                      <p className="text-sm text-white/40 font-mono">{monitor.stamp.id}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${monitor.status === 'active' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/10 text-white/50 border border-white/20'}`}>
                          {monitor.status === 'active' ? <Eye className="h-3 w-3 mr-1.5" /> : <EyeOff className="h-3 w-3 mr-1.5" />}
                          {monitor.status}
                        </div>
                        {monitor.matchCount > 0 && (
                          <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1.5" />
                            {monitor.matchCount} detections
                          </div>
                        )}
                        {monitor.lastScanAt && (
                          <span className="text-xs font-medium text-white/30">
                            Last scan: {new Date(monitor.lastScanAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full h-10 w-10 p-0"
                        onClick={() => runScan(monitor.stampId)}
                        disabled={scanning === monitor.stampId}
                        title="Run Scan"
                      >
                        {scanning === monitor.stampId ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
                      </Button>
                      {monitor.status === 'active' ? (
                        <Button size="sm" variant="ghost" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 p-0" onClick={() => disableMonitor(monitor.stampId)} title="Disable Monitor">
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 p-0" onClick={() => enableMonitor(monitor.stampId)} title="Enable Monitor">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Alerts */}
        {tab === 'alerts' && (
          <div className="space-y-4 animate-fade-up">
            {alerts.length === 0 ? (
              <div className="apple-glass-panel rounded-[3rem] p-16 text-center border border-white/10 apple-shadow">
                <Bell className="h-16 w-16 text-white/20 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">No alerts yet</h3>
                <p className="text-white/50 font-medium">When we detect copies of your work, alerts will appear here</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`apple-glass rounded-[2rem] border transition-all ${alert.status === 'new' ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10'}`}>
                  <div className="p-5">
                    <div className="flex items-start gap-5">
                      {alert.screenshotUrl ? (
                        <img src={alert.screenshotUrl} alt="" className="h-20 w-20 rounded-[1.25rem] object-cover border border-white/10" />
                      ) : (
                        <div className="h-20 w-20 rounded-[1.25rem] bg-red-500/10 flex items-center justify-center border border-red-500/20">
                          <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <p className="font-semibold text-white text-lg">{alert.sourceName || 'Unknown source'}</p>
                          <div className="px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-[10px] font-bold tracking-widest uppercase text-white/70">
                            {alert.sourceEngine === 'internal'
                              ? 'Internal'
                              : 'Web'}
                          </div>
                          {alert.status === 'new' && (
                            <div className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold tracking-widest uppercase">
                              New
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-blue-400 hover:text-blue-300 truncate font-medium max-w-lg mb-3">
                          <a href={alert.sourceUrl} target="_blank" rel="noreferrer">{alert.sourceUrl}</a>
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/80">
                            {Math.round(alert.confidence * 100)}% match
                          </div>
                          <span className="text-xs font-medium text-white/30">
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg font-semibold" asChild>
                          <Link to={`/takedowns?stampId=${alert.stampId}&url=${encodeURIComponent(alert.sourceUrl)}&alertId=${alert.id}`}>
                            <FileWarning className="h-4 w-4 mr-1.5" /> Takedown
                          </Link>
                        </Button>
                        {alert.status === 'new' && (
                          <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full font-medium" onClick={() => dismissAlert(alert.id)}>
                            Dismiss
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Images to Monitor */}
        {tab === 'add' && (
          <div className="space-y-4 animate-fade-up">
            {unmonitoredStamps.length === 0 ? (
              <div className="apple-glass-panel rounded-[3rem] p-16 text-center border border-white/10 apple-shadow">
                <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">All images are being monitored</h3>
                <p className="text-white/50 font-medium">Stamp more images to add them to monitoring</p>
              </div>
            ) : (
              <>
                <p className="text-white/60 font-medium mb-4">Select images to start monitoring for unauthorized copies:</p>
                {unmonitoredStamps.map(stamp => (
                  <div key={stamp.id} className="apple-glass rounded-[2rem] border border-white/10 hover:border-white/20 transition-colors">
                    <div className="p-5 flex items-center gap-5">
                      {stamp.thumbnailUrl ? (
                        <img src={stamp.thumbnailUrl} alt="" className="h-16 w-16 rounded-[1.25rem] object-cover border border-white/10" />
                      ) : (
                        <div className="h-16 w-16 rounded-[1.25rem] bg-white/5 border border-white/10" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-white text-lg">{stamp.title}</p>
                        <p className="text-sm text-white/40 font-mono">{stamp.id}</p>
                      </div>
                      <Button className="bg-white text-black hover:bg-white/90 rounded-full font-semibold px-6" onClick={() => enableMonitor(stamp.id)}>
                        <Eye className="h-4 w-4 mr-2" /> Enable Monitoring
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
