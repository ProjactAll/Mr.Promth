"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface GitHubSyncButtonProps {
  projectId: string;
  files: Array<{
    path: string;
    content: string;
  }>;
}

export function GitHubSyncButton({ projectId, files }: GitHubSyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [config, setConfig] = useState({
    githubToken: '',
    owner: '',
    repo: '',
    message: 'Update from Mr.Prompt editor',
  });

  const handleSync = async () => {
    if (!config.githubToken || !config.owner || !config.repo) {
      toast.error('Please fill in all GitHub configuration fields');
      return;
    }

    try {
      setSyncing(true);

      const response = await fetch(`/api/projects/${projectId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          files,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sync');
      }

      const result = await response.json();
      toast.success(`Successfully synced to GitHub! Commit: ${result.commitSha.substring(0, 7)}`);
      setShowDialog(false);
    } catch (error) {
      console.error('Error syncing to GitHub:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sync to GitHub');
    } finally {
      setSyncing(false);
    }
  };

  if (!showDialog) {
    return (
      <Button
        onClick={() => setShowDialog(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        Sync to GitHub
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">Sync to GitHub</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              GitHub Token
            </label>
            <input
              type="password"
              value={config.githubToken}
              onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
              placeholder="ghp_..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Create a token at{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                github.com/settings/tokens
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Owner
            </label>
            <input
              type="text"
              value={config.owner}
              onChange={(e) => setConfig({ ...config, owner: e.target.value })}
              placeholder="username or organization"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Repository
            </label>
            <input
              type="text"
              value={config.repo}
              onChange={(e) => setConfig({ ...config, repo: e.target.value })}
              placeholder="repository-name"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Commit Message
            </label>
            <input
              type="text"
              value={config.message}
              onChange={(e) => setConfig({ ...config, message: e.target.value })}
              placeholder="Update from Mr.Prompt editor"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="flex-1"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
          <Button
            onClick={() => setShowDialog(false)}
            variant="outline"
            disabled={syncing}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
