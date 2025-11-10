'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Settings, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface SystemSetting {
  id: string
  setting_key: string
  setting_value: any
  description: string | null
  updated_at: string
}

interface SettingsState {
  agent_mode_enabled: boolean
  maintenance_mode: boolean
  enable_user_registration: boolean
  max_prompts_per_user: number
  max_api_keys_per_user: number
  session_timeout: number
  rate_limit_api: { requests: number; window: string }
  rate_limit_auth: { requests: number; window: string }
  rate_limit_admin: { requests: number; window: string }
  rate_limit_ai: { requests: number; window: string }
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    agent_mode_enabled: true,
    maintenance_mode: false,
    enable_user_registration: true,
    max_prompts_per_user: 100,
    max_api_keys_per_user: 5,
    session_timeout: 3600,
    rate_limit_api: { requests: 60, window: '60s' },
    rate_limit_auth: { requests: 5, window: '60s' },
    rate_limit_admin: { requests: 100, window: '60s' },
    rate_limit_ai: { requests: 10, window: '60s' }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')

      if (error) throw error

      // Parse settings into state
      const settingsMap: any = {}
      data?.forEach((setting: SystemSetting) => {
        try {
          // Parse JSON values
          if (typeof setting.setting_value === 'string') {
            settingsMap[setting.setting_key] = JSON.parse(setting.setting_value)
          } else {
            settingsMap[setting.setting_key] = setting.setting_value
          }
        } catch {
          settingsMap[setting.setting_key] = setting.setting_value
        }
      })

      setSettings(prev => ({
        ...prev,
        ...settingsMap
      }))
    } catch (error: any) {
      console.error('Error loading settings:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดการตั้งค่า')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting_key: key,
          setting_value: value
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update setting')
      }

      return true
    } catch (error: any) {
      console.error('Error updating setting:', error)
      throw error
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const updates = Object.entries(settings).map(([key, value]) =>
        updateSetting(key, value)
      )

      await Promise.all(updates)
      toast.success('บันทึกการตั้งค่าสำเร็จ')
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (key: keyof SettingsState, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    try {
      await updateSetting(key, value)
      toast.success('อัปเดตการตั้งค่าสำเร็จ')
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัปเดตการตั้งค่า')
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !value }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การตั้งค่าระบบ</h1>
          <p className="text-gray-600 mt-1">จัดการการตั้งค่าและพารามิเตอร์ของระบบ</p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
        </Button>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>สถานะระบบ</CardTitle>
          <CardDescription>เปิด/ปิดฟีเจอร์หลักของระบบ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="agent_mode">Agent Mode</Label>
              <p className="text-sm text-gray-500">เปิดใช้งานโหมด Agent</p>
            </div>
            <Switch
              id="agent_mode"
              checked={settings.agent_mode_enabled}
              onCheckedChange={(checked) => handleToggle('agent_mode_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance">Maintenance Mode</Label>
              <p className="text-sm text-gray-500">ปิดระบบเพื่อบำรุงรักษา</p>
            </div>
            <Switch
              id="maintenance"
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) => handleToggle('maintenance_mode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="registration">User Registration</Label>
              <p className="text-sm text-gray-500">อนุญาตให้ผู้ใช้ใหม่ลงทะเบียน</p>
            </div>
            <Switch
              id="registration"
              checked={settings.enable_user_registration}
              onCheckedChange={(checked) => handleToggle('enable_user_registration', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* User Limits */}
      <Card>
        <CardHeader>
          <CardTitle>ขอบเขตการใช้งาน</CardTitle>
          <CardDescription>กำหนดขีดจำกัดสำหรับผู้ใช้แต่ละคน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max_prompts">Max Prompts per User</Label>
              <Input
                id="max_prompts"
                type="number"
                value={settings.max_prompts_per_user}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  max_prompts_per_user: parseInt(e.target.value)
                }))}
              />
              <p className="text-xs text-gray-500">จำนวน prompts สูงสุดที่ผู้ใช้สามารถสร้างได้</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_api_keys">Max API Keys per User</Label>
              <Input
                id="max_api_keys"
                type="number"
                value={settings.max_api_keys_per_user}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  max_api_keys_per_user: parseInt(e.target.value)
                }))}
              />
              <p className="text-xs text-gray-500">จำนวน API keys สูงสุดที่ผู้ใช้สามารถสร้างได้</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session_timeout">Session Timeout (seconds)</Label>
              <Input
                id="session_timeout"
                type="number"
                value={settings.session_timeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  session_timeout: parseInt(e.target.value)
                }))}
              />
              <p className="text-xs text-gray-500">เวลาที่ session จะหมดอายุ (วินาที)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting</CardTitle>
          <CardDescription>กำหนดขีดจำกัดอัตราการเรียก API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>API Rate Limit</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={settings.rate_limit_api.requests}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    rate_limit_api: {
                      ...prev.rate_limit_api,
                      requests: parseInt(e.target.value)
                    }
                  }))}
                  placeholder="Requests"
                />
                <Input
                  value={settings.rate_limit_api.window}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    rate_limit_api: {
                      ...prev.rate_limit_api,
                      window: e.target.value
                    }
                  }))}
                  placeholder="Window"
                />
              </div>
              <p className="text-xs text-gray-500">จำนวนคำขอ API ต่อช่วงเวลา</p>
            </div>

            <div className="space-y-2">
              <Label>Auth Rate Limit</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={settings.rate_limit_auth.requests}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    rate_limit_auth: {
                      ...prev.rate_limit_auth,
                      requests: parseInt(e.target.value)
                    }
                  }))}
                  placeholder="Requests"
                />
                <Input
                  value={settings.rate_limit_auth.window}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    rate_limit_auth: {
                      ...prev.rate_limit_auth,
                      window: e.target.value
                    }
                  }))}
                  placeholder="Window"
                />
              </div>
              <p className="text-xs text-gray-500">จำนวนความพยายาม login ต่อช่วงเวลา</p>
            </div>

            <div className="space-y-2">
              <Label>Admin Rate Limit</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={settings.rate_limit_admin.requests}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    rate_limit_admin: {
                      ...prev.rate_limit_admin,
                      requests: parseInt(e.target.value)
                    }
                  }))}
                  placeholder="Requests"
                />
                <Input
                  value={settings.rate_limit_admin.window}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    rate_limit_admin: {
                      ...prev.rate_limit_admin,
                      window: e.target.value
                    }
                  }))}
                  placeholder="Window"
                />
              </div>
              <p className="text-xs text-gray-500">จำนวนคำขอ Admin API ต่อช่วงเวลา</p>
            </div>

            <div className="space-y-2">
              <Label>AI Rate Limit</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={settings.rate_limit_ai.requests}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    rate_limit_ai: {
                      ...prev.rate_limit_ai,
                      requests: parseInt(e.target.value)
                    }
                  }))}
                  placeholder="Requests"
                />
                <Input
                  value={settings.rate_limit_ai.window}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    rate_limit_ai: {
                      ...prev.rate_limit_ai,
                      window: e.target.value
                    }
                  }))}
                  placeholder="Window"
                />
              </div>
              <p className="text-xs text-gray-500">จำนวนคำขอ AI generation ต่อช่วงเวลา</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900">หมายเหตุ</h4>
            <p className="text-sm text-blue-800 mt-1">
              การเปลี่ยนแปลงการตั้งค่าบางอย่างอาจต้องรีสตาร์ทระบบเพื่อให้มีผลทันที
              กรุณาตรวจสอบให้แน่ใจก่อนบันทึกการเปลี่ยนแปลง
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
