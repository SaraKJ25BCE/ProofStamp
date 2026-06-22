import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Calendar, Loader2 } from 'lucide-react';

export default function PublicPassport() {
  const { username } = useParams();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPassport() {
      try {
        const res = await api.get(`/passport/${username}`);
        setPassport(res.data.passport);
      } catch (err) {
        setError(err.response?.status === 404 ? 'User not found' : (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    }
    fetchPassport();
  }, [username]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-20">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">{error}</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="apple-glass-panel rounded-[2.5rem] p-10 apple-shadow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-50" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            {passport.user?.avatarUrl ? (
              <img src={passport.user.avatarUrl} alt="" className="h-28 w-28 rounded-full ring-4 ring-white/10 shadow-xl object-cover" />
            ) : (
              <div className="h-28 w-28 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <Shield className="h-10 w-10 text-white/50" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-semibold tracking-tight text-white mb-1">{passport.displayName}</h1>
              <p className="text-white/50 font-medium text-lg">@{passport.username}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70">
                Member since {new Date(passport.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-10">
              <div className="text-6xl font-semibold tracking-tighter text-white mb-2">{passport.stamps?.length || 0}</div>
              <div className="text-white/50 font-medium uppercase tracking-widest text-xs">Public Files</div>
            </div>
          </div>
        </div>

        {/* Stamps Grid */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-8">Public Proofs</h2>
          {passport.stamps?.length === 0 ? (
            <div className="apple-glass-panel rounded-[3rem] p-20 text-center apple-shadow border border-white/10">
              <Shield className="h-16 w-16 text-white/20 mx-auto mb-6" />
              <p className="text-xl font-medium text-white/50">No public proofs yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {passport.stamps?.map((stamp) => (
                <Link key={stamp.id} to={`/verify?id=${stamp.id}`} className="group outline-none">
                  <div className="apple-glass rounded-[2.5rem] p-4 apple-shadow border border-white/5 group-hover:border-white/20 transition-all duration-500 group-hover:-translate-y-2">
                    <div className="aspect-video rounded-[2rem] overflow-hidden bg-black mb-5 relative">
                      <img
                        src={stamp.thumbnailUrl}
                        alt={stamp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="px-3 pb-2 space-y-3">
                      <h3 className="font-semibold text-xl tracking-tight text-white truncate">{stamp.title}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 rounded-full px-3 py-1 font-medium">
                          {stamp.fileType?.toUpperCase() || 'FILE'}
                        </Badge>
                        <span className="text-sm font-medium text-white/40 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(stamp.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
