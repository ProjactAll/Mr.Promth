'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface User {
  id: string
  email: string
}

interface AddRateLimitFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddRateLimitForm({ onClose, onSuccess }: AddRateLimitFormProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    user_id: '',
    limit_type: 'api',
    requests: 60,
    window_seconds: 60,
    reason: '',
    expires_at: ''
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data } = await supabase.auth.admin.listUsers()
      if (data?.users) {
        setUsers(data.users.map(u => ({ id: u.id, email: u.email || 'Unknown' })))
      }
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Call the admin function to set rate limit
      const { data, error } = await supabase.rpc('admin_set_user_rate_limit', {
        p_user_id: formData.user_id,
        p_limit_type: formData.limit_type,
        p_requests: formData.requests,
        p_window_seconds: formData.window_seconds,
        p_reason: formData.reason || null,
        p_expires_at: formData.expires_at || null
      })

      if (error) throw error

      alert('Rate limit override created successfully!')
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error creating rate limit:', err)
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add Rate Limit Override</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ผู้ใช้ *
            </label>
            <select
              required
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">เลือกผู้ใช้</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Limit Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภท Rate Limit *
            </label>
            <select
              required
              value={formData.limit_type}
              onChange={(e) => setFormData({ ...formData, limit_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="api">API Requests</option>
              <option value="auth">Authentication</option>
              <option value="ai">AI Generation</option>
              <option value="admin">Admin Operations</option>
            </select>
          </div>

          {/* Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              จำนวน Requests *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.requests}
              onChange={(e) => setFormData({ ...formData, requests: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Window (seconds) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ช่วงเวลา (วินาที) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.window_seconds}
              onChange={(e) => setFormData({ ...formData, window_seconds: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              ตัวอย่าง: 60 วินาที = 1 นาที, 3600 = 1 ชั่วโมง
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เหตุผล
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ระบุเหตุผลในการตั้งค่า rate limit นี้..."
            />
          </div>

          {/* Expires At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมดอายุ (ถ้ามี)
            </label>
            <input
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              ถ้าไม่ระบุ override นี้จะไม่มีวันหมดอายุ
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
