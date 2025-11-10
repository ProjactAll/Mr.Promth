'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Key, Check, X, Loader2, RefreshCw } from 'lucide-react';

interface APIKey {
  id: string;
  provider: string;
  masked_key: string;
  last_used: string | null;
  created_at: string;
}

const PROVIDER_LABELS = {
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
} as const;

type ProviderValue = keyof typeof PROVIDER_LABELS;

const PROVIDER_OPTIONS: Array<{ value: ProviderValue; label: string }> = (
  Object.entries(PROVIDER_LABELS) as Array<[ProviderValue, string]>
).map(([value, label]) => ({ value, label }));

const PROVIDER_PLACEHOLDERS: Record<ProviderValue, string> = {
  openai: 'sk-... (OpenAI secret key)',
  anthropic: 'sk-ant-... (Claude API key)',
};

export function APIKeysTab() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newApiKey, setNewApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderValue>('openai');

  const resolveProviderLabel = (provider: string) =>
    PROVIDER_LABELS[provider as ProviderValue] ?? provider;

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch('/api/api-keys');
      if (!response.ok) {
        throw new Error('Unable to load API keys');
      }

      const payload = await response.json();
      const keys = Array.isArray(payload.keys) ? payload.keys : [];
      setApiKeys(keys);
    } catch (err) {
      setError('Failed to fetch API keys');
      console.error('Error fetching API keys:', err);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKey.trim()) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    setTestResult(null);

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          key: newApiKey.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save API key');
      }

      setSuccess(`${PROVIDER_LABELS[selectedProvider]} API key saved successfully!`);
      setNewApiKey('');
      fetchAPIKeys();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (keyId: string) => {
    setTestingKeyId(keyId);
    setTestResult(null);
    setError(null);

    try {
      const response = await fetch('/api/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_id: keyId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to test connection');
      }

      setTestResult({ success: true, message: result.message });
      fetchAPIKeys();
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      });
    } finally {
      setTestingKeyId(null);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    setIsDeleting(keyId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      setSuccess('API key deleted successfully!');
      fetchAPIKeys();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete API key');
    } finally {
      setIsDeleting(null);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setTestResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">API Keys</h2>
        <p className="text-muted-foreground">
          Manage the API keys Mr.Prompt uses when calling OpenAI and Anthropic models.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="max-w-md bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"} className="max-w-md">
          <AlertDescription>
            {testResult.success ? (
              <span className="text-green-800 flex items-center gap-2">
                <Check className="h-4 w-4" />
                {testResult.message}
              </span>
            ) : (
              <span className="text-red-800 flex items-center gap-2">
                <X className="h-4 w-4" />
                {testResult.message}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Add New API Key Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Add New API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddKey} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-foreground mb-2">
                  Provider
                </label>
                <select
                  id="provider"
                  value={selectedProvider}
                  onChange={(event) => setSelectedProvider(event.target.value as ProviderValue)}
                  disabled={isSaving}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PROVIDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-foreground mb-2">
                  API Key
                </label>
                <Input
                  id="api-key"
                  type="password"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder={PROVIDER_PLACEHOLDERS[selectedProvider]}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Keys are encrypted at rest. Mr.Prompt only forwards them to the selected provider during requests.
                </p>
              </div>
            </div>
            <Button type="submit" disabled={isSaving || !newApiKey.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Key'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Saved API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No API keys saved yet. Add your first key above.
              </p>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium uppercase text-muted-foreground">
                          {resolveProviderLabel(key.provider)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Created: {new Date(key.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Last used: {key.last_used ? new Date(key.last_used).toLocaleString() : 'Never'}
                        </span>
                      </div>
                      <div className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block">
                        {key.masked_key}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(key.id)}
                        disabled={testingKeyId !== null}
                      >
                        {testingKeyId === key.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Verify
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                        disabled={isDeleting === key.id}
                      >
                        {isDeleting === key.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}