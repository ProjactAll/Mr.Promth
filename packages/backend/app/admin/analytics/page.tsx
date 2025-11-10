'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  BarChart3, 
  AlertCircle,
  TrendingUp,
  Users,
  Activity,
  Database,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  totalProjects: number
  projectsToday: number
  projectsThisWeek: number
  projectsThisMonth: number
  totalActivities: number
  activitiesToday: number
  activitiesThisWeek: number
  activitiesThisMonth: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    totalProjects: 0,
    projectsToday: 0,
    projectsThisWeek: 0,
    projectsThisMonth: 0,
    totalActivities: 0,
    activitiesToday: 0,
    activitiesThisWeek: 0,
    activitiesThisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)

      // Users analytics
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      const { count: newUsersThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString())

      // Projects analytics
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })

      const { count: projectsToday } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      const { count: projectsThisWeek } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      const { count: projectsThisMonth } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString())

      // Activities analytics
      const { count: totalActivities } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })

      const { count: activitiesToday } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      const { count: activitiesThisWeek } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      const { count: activitiesThisMonth } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString())

      setAnalytics({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        newUsersToday: newUsersToday || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        totalProjects: totalProjects || 0,
        projectsToday: projectsToday || 0,
        projectsThisWeek: projectsThisWeek || 0,
        projectsThisMonth: projectsThisMonth || 0,
        totalActivities: totalActivities || 0,
        activitiesToday: activitiesToday || 0,
        activitiesThisWeek: activitiesThisWeek || 0,
        activitiesThisMonth: activitiesThisMonth || 0
      })
    } catch (err: any) {
      console.error('Error loading analytics:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">ภาพรวมสถิติการใช้งานระบบ</p>
        </div>
        <Button onClick={loadAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          รีเฟรช
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">ผู้ใช้ทั้งหมด</p>
              <p className="text-4xl font-bold mt-2">{analytics.totalUsers}</p>
              <p className="text-sm text-blue-100 mt-2">
                Active: {analytics.activeUsers}
              </p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-lg">
              <Users className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">โปรเจคทั้งหมด</p>
              <p className="text-4xl font-bold mt-2">{analytics.totalProjects}</p>
              <p className="text-sm text-purple-100 mt-2">
                วันนี้: +{analytics.projectsToday}
              </p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-lg">
              <Database className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">กิจกรรมทั้งหมด</p>
              <p className="text-4xl font-bold mt-2">{analytics.totalActivities}</p>
              <p className="text-sm text-green-100 mt-2">
                วันนี้: +{analytics.activitiesToday}
              </p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-lg">
              <Activity className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Growth */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">การเติบโตของผู้ใช้</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">วันนี้</span>
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.newUsersToday}</p>
              <p className="text-xs text-gray-500 mt-1">ผู้ใช้ใหม่</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">7 วันที่แล้ว</span>
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.newUsersThisWeek}</p>
              <p className="text-xs text-gray-500 mt-1">ผู้ใช้ใหม่</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">30 วันที่แล้ว</span>
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.newUsersThisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">ผู้ใช้ใหม่</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Growth */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">การสร้างโปรเจค</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">วันนี้</span>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.projectsToday}</p>
              <p className="text-xs text-gray-500 mt-1">โปรเจคใหม่</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">7 วันที่แล้ว</span>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.projectsThisWeek}</p>
              <p className="text-xs text-gray-500 mt-1">โปรเจคใหม่</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">30 วันที่แล้ว</span>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.projectsThisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">โปรเจคใหม่</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">กิจกรรมในระบบ</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">วันนี้</span>
                <Activity className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.activitiesToday}</p>
              <p className="text-xs text-gray-500 mt-1">กิจกรรม</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">7 วันที่แล้ว</span>
                <Activity className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.activitiesThisWeek}</p>
              <p className="text-xs text-gray-500 mt-1">กิจกรรม</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">30 วันที่แล้ว</span>
                <Activity className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.activitiesThisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">กิจกรรม</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
