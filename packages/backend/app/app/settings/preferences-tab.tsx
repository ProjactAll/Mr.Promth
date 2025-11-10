'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Moon, Sun, Bell, MessageSquare } from 'lucide-react';

export function PreferencesTab() {
  const [preferences, setPreferences] = useState({
    darkMode: false,
    notifications: true,
    autoSave: true,
    compactMode: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save preferences to user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          preferences,
        },
      });

      if (error) throw error;

      setSuccess('Preferences saved successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Preferences</h2>
        <p className="text-muted-foreground">
          Customize your Mr.Prompt experience
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePreferences} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun className="h-4 w-4 text-yellow-500" />
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark theme for better night-time usage
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={preferences.darkMode}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, darkMode: checked })
                }
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-blue-500" />
                <div>
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive desktop notifications for new messages
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={preferences.notifications}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, notifications: checked })
                }
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <div>
                  <Label htmlFor="auto-save">Auto Save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save chat sessions and prompts
                  </p>
                </div>
              </div>
              <Switch
                id="auto-save"
                checked={preferences.autoSave}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, autoSave: checked })
                }
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-purple-500" />
                <div>
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use compact layout for more content visibility
                  </p>
                </div>
              </div>
              <Switch
                id="compact-mode"
                checked={preferences.compactMode}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, compactMode: checked })
                }
                disabled={isSaving}
              />
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Settings className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}