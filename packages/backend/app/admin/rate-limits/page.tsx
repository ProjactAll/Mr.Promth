'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Shield, 
  AlertCircle,
  User,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AddRateLimitForm from './components/AddRateLimitForm'

interface RateLimitOverride {
  id: string
  user_id: string
  limit_type: string
  requests: number
  window_seconds: number
  reason: string | null
  created_by: string | null
  created_at: string
  expires_at: string | null
  user_email?: string
}

export default function RateLimitsPage() {
  const [overrides, setOverrides] = useState<RateLimitOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadRateLimitOverrides()
  }, [])

  const loadRateLimitOverrides = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: overridesError } = await supabase
        .from('rate_limit_overrides')
        .select('*')
        .order('created_at', { ascending: false })

      if (overridesError) throw overridesError

      // Get user emails
      const overridesWithEmails = await Promise.all(
        (data || []).map(async (override) => {
          const { data: userData } = await supabase.auth.admin.getUserById(override.user_id)
          return {
            ...override,
            user_email: userData?.user?.email || 'Unknown'
          }
        })
      )

      setOverrides(overridesWithEmails)
    } catch (err: any) {
      console.error('Error loading rate limit overrides:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const deleteOverride = async (overrideId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Rate Limit Override นี้?')) return

    try {
      const { error } = await supabase
        .from('rate_limit_overrides')
        .delete()
        .eq('id', overrideId)

      if (error) throw error

      await loadRateLimitOverrides()
    } catch (err: any) {
      console.error('Error deleting override:', err)
      alert('เกิดข้อผิดพลาดในการลบ: ' + err.message)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'ไม่มีกำหนด'
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLimitTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'api': 'API Requests',
      'auth': 'Authentication',
      'ai': 'AI Generation',
      'admin': 'Admin Operations'
    }
    return labels[type] || type
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
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
          <h1 className="text-2xl font-bold text-gray-900">Rate Limits Management</h1>
          <p className="text-sm text-gray-600 mt-1">จัดการ Rate Limit Overrides สำหรับผู้ใช้เฉพาะ</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadRateLimitOverrides} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            รีเฟรช
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            เพิ่ม Override
          </Button>
        </div>
      </div>

      {/* Default Rate Limits Info */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Rate Limits</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600">API Requests</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">60 / นาที</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600">Authentication</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">5 / นาที</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600">AI Generation</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">10 / นาที</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600">Admin Operations</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">100 / นาที</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overrides ทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{overrides.length}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {overrides.filter(o => !isExpired(o.expires_at)).length}
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
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                {overrides.filter(o => isExpired(o.expires_at)).length}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Overrides List */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Rate Limit Overrides</h3>
        </div>

        <div className="overflow-x-auto">
          {overrides.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>ยังไม่มี Rate Limit Overrides</p>
              <p className="text-sm mt-2">คลิก "เพิ่ม Override" เพื่อสร้าง custom rate limit สำหรับผู้ใช้เฉพาะ</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้ใช้
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เหตุผล
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    หมดอายุ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overrides.map((override) => (
                  <tr key={override.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{override.user_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {getLimitTypeLabel(override.limit_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {override.requests} / {override.window_seconds}s
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {override.reason || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(override.expires_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isExpired(override.expires_at) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOverride(override.id)}
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

      {/* Add Rate Limit Form Modal */}
      {showAddForm && (
        <AddRateLimitForm
          onClose={() => setShowAddForm(false)}
          onSuccess={loadRateLimitOverrides}
        />
      )}
    </div>
  )
}
