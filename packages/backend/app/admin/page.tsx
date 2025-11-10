'use client'

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Users, 
  Activity, 
  Database, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  totalApiKeys: number
  recentActivities: number
}

interface RecentActivity {
  id: string
  user_id: string
  action: string
  resource_type: string
  created_at: string
  user_email?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    totalApiKeys: 0,
    recentActivities: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load users count
      const { count: totalUsersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (usersError) throw usersError

      // Load active users count
      const { count: activeUsersCount, error: activeUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (activeUsersError) throw activeUsersError

      // Load projects count
      const { count: projectsCount, error: projectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })

      if (projectsError) throw projectsError

      // Load API keys count
      const { count: apiKeysCount, error: apiKeysError } = await supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })

      if (apiKeysError) throw apiKeysError

      // Load recent activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activity_logs')
        .select(`
          id,
          user_id,
          action,
          resource_type,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (activitiesError) throw activitiesError

      // Get user emails for activities
      const activitiesWithEmails = await Promise.all(
        (activitiesData || []).map(async (activity) => {
          const { data: userData } = await supabase.auth.admin.getUserById(activity.user_id)
          return {
            ...activity,
            user_email: userData?.user?.email || 'Unknown'
          }
        })
      )

      setStats({
        totalUsers: totalUsersCount || 0,
        activeUsers: activeUsersCount || 0,
        totalProjects: projectsCount || 0,
        totalApiKeys: apiKeysCount || 0,
        recentActivities: activitiesData?.length || 0
      })

      setRecentActivities(activitiesWithEmails)
    } catch (err: any) {
      console.error('Error loading dashboard data:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'create_project': 'สร้างโปรเจค',
      'update_project': 'อัปเดตโปรเจค',
      'delete_project': 'ลบโปรเจค',
      'create_api_key': 'สร้าง API Key',
      'delete_api_key': 'ลบ API Key',
      'update_system_setting': 'อัปเดตการตั้งค่า',
      'create_system_setting': 'สร้างการตั้งค่า',
      'user_login': 'เข้าสู่ระบบ',
      'user_logout': 'ออกจากระบบ'
    }
    return labels[action] || action
  }

  const getResourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'project': 'โปรเจค',
      'api_key': 'API Key',
      'system_setting': 'การตั้งค่า',
      'user': 'ผู้ใช้'
    }
    return labels[type] || type
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
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ผู้ใช้ที่ Active</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">โปรเจคทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProjects}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Keys</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalApiKeys}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h3>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentActivities.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              ยังไม่มีกิจกรรม
            </div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {activity.user_email}
                      </span>
                      <span className="text-gray-500">·</span>
                      <span className="text-sm text-gray-600">
                        {getActionLabel(activity.action)}
                      </span>
                      {activity.resource_type && (
                        <>
                          <span className="text-gray-500">·</span>
                          <span className="text-sm text-gray-500">
                            {getResourceTypeLabel(activity.resource_type)}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {new Date(activity.created_at).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <a
          href="/admin/users"
          className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">จัดการผู้ใช้</h4>
              <p className="text-sm text-gray-600 mt-1">ดู แก้ไข และจัดการผู้ใช้</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/settings"
          className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">การตั้งค่าระบบ</h4>
              <p className="text-sm text-gray-600 mt-1">ปรับแต่งการตั้งค่า</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/logs"
          className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Database className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Activity Logs</h4>
              <p className="text-sm text-gray-600 mt-1">ดูประวัติการใช้งาน</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}
