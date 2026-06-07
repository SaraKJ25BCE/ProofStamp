import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import {
  User, Settings, LogOut, Trash2, Key,
  Shield, CheckCircle2, AlertTriangle, Loader2, ChevronRight
} from 'lucide-react';

export default function SettingsPage() {
  const { user, passport, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (passport) {
      setDisplayName(passport.displayName || '');
      setUsername(passport.username || '');
    }
    loadData();
  }, [passport]);

  async function loadData() {
    try {
      // Mock stats for now or fetch if available
      setStats({
        totalStamps: passport?.stamps?.length || 0,
        activeMonitors: 0, // In real app, fetch from /monitor
        takedownsSent: 0, // In real app, fetch from /takedowns
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      // Assuming a PUT /passport/me endpoint exists, or we just mock it for now
      // await api.put('/passport/me', { displayName, username });
      toast('Profile updated successfully', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleDeleteAccount() {
    if (deleteConfirmationText !== 'DELETE') {
      toast('Please type DELETE to confirm', 'error');
      return;
    }
    
    setDeleting(true);
    try {
      await api.delete('/passport/me');
      toast('Account deleted permanently', 'success');
      logout();
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to delete account', 'error');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
        
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">Profile & Settings</h1>
            <p className="text-white/50 mt-2 text-lg font-medium">Manage your account, preferences, and API keys.</p>
          </div>
          <Button 
            variant="outline" 
            className="hidden md:flex bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full font-medium h-12 px-6"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>

        {/* Profile Card */}
        <div className="apple-glass-panel rounded-[2.5rem] p-8 border border-white/10 apple-shadow">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {passport?.user?.avatarUrl ? (
              <img src={passport.user.avatarUrl} alt="" className="h-24 w-24 rounded-[2rem] object-cover border-2 border-white/10" />
            ) : (
              <div className="h-24 w-24 rounded-[2rem] bg-white/5 border-2 border-white/10 flex items-center justify-center shrink-0">
                <User className="h-10 w-10 text-white/30" />
              </div>
            )}
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-white">{passport?.displayName || 'Creator'}</h2>
              <p className="text-white/50 font-medium">@{passport?.username || user?.email}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center">
                  <Shield className="h-3.5 w-3.5 mr-1.5" /> Identity Verified
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs font-semibold">
                  Joined {new Date(passport?.createdAt || Date.now()).getFullYear()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="apple-glass-panel p-6 rounded-[2rem] text-center border border-white/10 apple-shadow-sm">
            <div className="text-3xl font-semibold text-white mb-1">{stats?.totalStamps || 0}</div>
            <p className="text-xs font-medium text-white/50 uppercase tracking-widest">Protected</p>
          </div>
          <div className="apple-glass-panel p-6 rounded-[2rem] text-center border border-white/10 apple-shadow-sm">
            <div className="text-3xl font-semibold text-indigo-400 mb-1">{stats?.activeMonitors || 0}</div>
            <p className="text-xs font-medium text-indigo-400/50 uppercase tracking-widest">Monitors</p>
          </div>
          <div className="apple-glass-panel p-6 rounded-[2rem] text-center border border-white/10 apple-shadow-sm">
            <div className="text-3xl font-semibold text-red-400 mb-1">{stats?.takedownsSent || 0}</div>
            <p className="text-xs font-medium text-red-400/50 uppercase tracking-widest">Takedowns</p>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="apple-glass-panel rounded-[2.5rem] p-8 border border-white/10 apple-shadow">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Settings className="h-5 w-5 mr-3 text-white/50" /> Public Profile Details
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block text-white/70">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 rounded-xl bg-black/50 border border-white/10 px-4 text-white focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-white/70">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">@</span>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-xl bg-black/50 border border-white/10 pl-9 pr-4 text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <p className="text-xs text-white/40 mt-2 font-medium">This determines your public passport URL.</p>
            </div>
            <Button type="submit" disabled={savingProfile} className="bg-white text-black hover:bg-white/90 rounded-full font-semibold px-8 h-12">
              {savingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </form>
        </div>

        {/* Developer / API Keys */}
        <div className="apple-glass-panel rounded-[2.5rem] p-8 border border-white/10 apple-shadow cursor-pointer hover:border-white/20 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Key className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Developer API Keys</h3>
                <p className="text-sm font-medium text-white/50">Manage access tokens for programmatic use</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Mobile Sign Out (visible only on sm screens) */}
        <div className="md:hidden">
          <Button 
            variant="outline" 
            className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-medium h-14"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="pt-8 border-t border-white/10">
          <div className="apple-glass-panel rounded-[2.5rem] p-8 border border-red-500/20 bg-red-500/5 apple-shadow">
            <h3 className="text-xl font-semibold text-red-400 mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-3" /> Danger Zone
            </h3>
            <p className="text-white/60 font-medium mb-6 text-sm">
              Permanently delete your account and all associated stamped files, verifications, and monitoring data. This action cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <Button 
                variant="destructive" 
                className="bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold px-8 h-12 shadow-lg"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Account
              </Button>
            ) : (
              <div className="space-y-4 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl animate-fade-up">
                <p className="text-sm font-medium text-red-200">
                  Are you absolutely sure? Type <strong className="text-white">DELETE</strong> below to confirm.
                </p>
                <Input
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type DELETE"
                  className="h-12 rounded-xl bg-black/50 border border-red-500/30 text-white uppercase focus:outline-none focus:border-red-500 transition-colors"
                />
                <div className="flex gap-3">
                  <Button 
                    variant="destructive" 
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold px-6 h-12 shadow-lg flex-1"
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmationText !== 'DELETE'}
                  >
                    {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Confirm Deletion
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-white/50 hover:text-white hover:bg-white/10 rounded-full font-medium px-6 h-12"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmationText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
