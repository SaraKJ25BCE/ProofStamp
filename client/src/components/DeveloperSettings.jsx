import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { Key, Webhook, Loader2, Trash2, Plus, Copy } from 'lucide-react';

export default function DeveloperSettings() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [maxWebhooks, setMaxWebhooks] = useState(3);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookLabel, setWebhookLabel] = useState('');
  const [createdWebhookSecret, setCreatedWebhookSecret] = useState(null);

  async function load() {
    try {
      const [keysRes, hooksRes] = await Promise.all([
        api.get('/passport/api-keys'),
        api.get('/passport/webhooks'),
      ]);
      setApiKeys(keysRes.data.apiKeys || []);
      setWebhooks(hooksRes.data.endpoints || []);
      setMaxWebhooks(hooksRes.data.maxEndpoints || 3);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to load developer settings', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createApiKey() {
    try {
      const res = await api.post('/passport/api-keys', { name: newKeyName || 'API Key' });
      setCreatedKey(res.data.apiKey);
      setNewKeyName('');
      toast('API key created — copy it now', 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to create API key', 'error');
    }
  }

  async function revokeKey(id) {
    try {
      await api.delete(`/passport/api-keys/${id}`);
      toast('API key revoked', 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to revoke key', 'error');
    }
  }

  async function addWebhook() {
    try {
      const res = await api.post('/passport/webhooks', {
        url: webhookUrl,
        label: webhookLabel || undefined,
      });
      setCreatedWebhookSecret(res.data.secret);
      setWebhookUrl('');
      setWebhookLabel('');
      toast('Webhook endpoint added', 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to add webhook', 'error');
    }
  }

  async function removeWebhook(id) {
    try {
      await api.delete(`/passport/webhooks/${id}`);
      toast('Webhook removed', 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to remove webhook', 'error');
    }
  }

  function copyText(text, label) {
    navigator.clipboard.writeText(text);
    toast(`${label} copied`, 'success');
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-12">
      <div className="apple-glass-panel rounded-[2.5rem] p-8 apple-shadow border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
            <Key className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">API Keys</h2>
        </div>
        <p className="text-white/50 text-sm font-medium mb-6">
          Use header <code className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/70">X-ProofStamp-Api-Key</code> for programmatic stamping.
        </p>

        <div className="space-y-6">
          {createdKey && (
            <div className="p-4 rounded-[1.5rem] border border-green-500/20 bg-green-500/10 backdrop-blur-md">
              <p className="font-semibold text-green-400 mb-2">New key generated (shown once)</p>
              <code className="block w-full break-all text-sm text-green-100 bg-black/20 p-3 rounded-xl mb-3">{createdKey}</code>
              <Button size="sm" className="w-full bg-green-500 text-black hover:bg-green-400 rounded-xl font-semibold" onClick={() => copyText(createdKey, 'API key')}>
                <Copy className="h-4 w-4 mr-2" /> Copy Key
              </Button>
            </div>
          )}

          <div className="flex gap-3">
            <Input
              placeholder="Key label (optional)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="h-12 rounded-2xl apple-input text-white border-0 px-4 flex-1 placeholder:text-white/30"
            />
            <Button onClick={createApiKey} className="h-12 rounded-2xl bg-white text-black hover:bg-white/90 font-semibold px-6">
              <Plus className="h-4 w-4 mr-2" /> Generate
            </Button>
          </div>

          {apiKeys.length === 0 ? (
            <p className="text-sm text-white/40 font-medium text-center py-4">No API keys yet.</p>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((k) => (
                <div key={k.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-[1.5rem]">
                  <div>
                    <div className="text-white font-medium mb-1">{k.name || 'API Key'}</div>
                    <div className="text-white/40 text-xs font-mono bg-black/20 px-2 py-1 rounded inline-block mb-1">{k.keyPrefix}…</div>
                    {k.lastUsedAt && (
                      <div className="text-white/30 text-xs">
                        Last used {new Date(k.lastUsedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => revokeKey(k.id)} className="hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-xl h-10 w-10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="apple-glass-panel rounded-[2.5rem] p-8 apple-shadow border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
            <Webhook className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Webhooks</h2>
        </div>
        <p className="text-white/50 text-sm font-medium mb-6">
          Up to {maxWebhooks} HTTPS endpoints. Payloads are signed with HMAC-SHA256 in <code className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/70">X-ProofStamp-Signature</code>.
        </p>

        <div className="space-y-6">
          {createdWebhookSecret && (
            <div className="p-4 rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 backdrop-blur-md">
              <p className="font-semibold text-amber-400 mb-2">Signing secret (shown once)</p>
              <code className="block w-full break-all text-sm text-amber-100 bg-black/20 p-3 rounded-xl mb-3">{createdWebhookSecret}</code>
              <Button size="sm" className="w-full bg-amber-500 text-black hover:bg-amber-400 rounded-xl font-semibold" onClick={() => copyText(createdWebhookSecret, 'Secret')}>
                <Copy className="h-4 w-4 mr-2" /> Copy Secret
              </Button>
            </div>
          )}

          {webhooks.length < maxWebhooks && (
            <div className="space-y-3">
              <Input
                className="h-12 rounded-2xl apple-input text-white border-0 px-4 placeholder:text-white/30"
                placeholder="https://your-server.com/webhooks/proofstamp"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <div className="flex gap-3">
                <Input
                  className="h-12 rounded-2xl apple-input text-white border-0 px-4 flex-1 placeholder:text-white/30"
                  placeholder="Label (optional)"
                  value={webhookLabel}
                  onChange={(e) => setWebhookLabel(e.target.value)}
                />
                <Button onClick={addWebhook} disabled={!webhookUrl.startsWith('https://')} className="h-12 rounded-2xl bg-white text-black hover:bg-white/90 font-semibold px-6">
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </div>
          )}

          {webhooks.length === 0 ? (
            <p className="text-sm text-white/40 font-medium text-center py-4">No webhook endpoints configured.</p>
          ) : (
            <div className="space-y-3">
              {webhooks.map((w) => (
                <div key={w.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 border border-white/10 rounded-[1.5rem] gap-4">
                  <div className="overflow-hidden">
                    {w.label && <div className="text-white font-medium mb-1 truncate">{w.label}</div>}
                    <code className="text-white/50 text-xs truncate block">{w.url}</code>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeWebhook(w.id)} className="hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-xl h-10 w-10 shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
