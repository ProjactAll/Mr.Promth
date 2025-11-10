'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Key, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Clock,
  User,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ApiKey {
  id: string
  user_id: string
  name: string
  key: string
  created_at: string
  last_used_at: string | null
  user_email?: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load all API keys
      const { data: keysData, error: keysError } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false })

      if (keysError) throw keysError

      // Get user emails for each API key
      const keysWithEmails = await Promise.all(
        (keysData || []).map(async (apiKey) => {
          const { data: userData } = await supabase.auth.admin.getUserById(apiKey.user_id)
          return {
            ...apiKey,
            user_email: userData?.user?.email || 'Unknown'
          }
        })
      )

      setApiKeys(keysWithEmails)
    } catch (err: any) {
      console.error('Error loading API keys:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(keyId)) {
        newSet.delete(keyId)
      } else {
        newSet.add(keyId)
      }
      return newSet
    })
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••'
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4)
  }

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ API Key นี้?')) return

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)

      if (error) throw error

      // Reload API keys
      await loadApiKeys()
    } catch (err: any) {
      console.error('Error deleting API key:', err)
      alert('เกิดข้อผิดพลาดในการลบ API Key: ' + err.message)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'ไม่เคยใช้งาน'
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">เกิดข้อผิดพลาด</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys Management</h1>
          <p className="text-sm text-gray-600 mt-1">จัดการ API Keys ของผู้ใช้ทั้งหมดในระบบ</p>
        </div>
        <Button onClick={loadApiKeys} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          รีเฟรช
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Keys ทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{apiKeys.length}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ใช้งานล่าสุด (7 วัน)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {apiKeys.filter(k => {
                  if (!k.last_used_at) return false
                  const lastUsed = new Date(k.last_used_at)
                  const sevenDaysAgo = new Date()
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                  return lastUsed > sevenDaysAgo
                }).length}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ไม่เคยใช้งาน</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {apiKeys.filter(k => !k.last_used_at).length}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">รายการ API Keys</h3>
        </div>

        <div className="overflow-x-auto">
          {apiKeys.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Key className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>ยังไม่มี API Keys ในระบบ</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้ใช้
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สร้างเมื่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ใช้งานล่าสุด
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{apiKey.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{apiKey.user_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(apiKey.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(apiKey.last_used_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
