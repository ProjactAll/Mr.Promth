'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, Download, Clock, User, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

interface ActivityLog {
  id: string
  user_id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user_email?: string
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [resourceFilter, setResourceFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 50
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadLogs()
  }, [page])

  useEffect(() => {
    filterLogs()
  }, [searchQuery, actionFilter, resourceFilter, logs])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // Get total count
      const { count } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })

      if (count) {
        setTotalPages(Math.ceil(count / pageSize))
      }

      // Get logs
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      // Get user emails
      const logsWithEmails = await Promise.all(
        (data || []).map(async (log) => {
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(log.user_id)
            return {
              ...log,
              user_email: userData?.user?.email || 'Unknown'
            }
          } catch {
            return {
              ...log,
              user_email: 'Unknown'
            }
          }
        })
      )

      setLogs(logsWithEmails)
      setFilteredLogs(logsWithEmails)
    } catch (error: any) {
      console.error('Error loading logs:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลด logs')
    } finally {
      setLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = [...logs]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource_type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter)
    }

    // Resource filter
    if (resourceFilter !== 'all') {
      filtered = filtered.filter(log => log.resource_type === resourceFilter)
    }

    setFilteredLogs(filtered)
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
      'user_logout': 'ออกจากระบบ',
      'update_user_role': 'เปลี่ยน Role',
      'update_user_status': 'เปลี่ยนสถานะผู้ใช้'
    }
    return labels[action] || action
  }

  const getResourceTypeLabel = (type: string | null) => {
    if (!type) return '-'
    const labels: Record<string, string> = {
      'project': 'โปรเจค',
      'api_key': 'API Key',
      'system_setting': 'การตั้งค่า',
      'user': 'ผู้ใช้'
    }
    return labels[type] || type
  }

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'text-green-600 bg-green-50'
    if (action.includes('delete')) return 'text-red-600 bg-red-50'
    if (action.includes('update')) return 'text-blue-600 bg-blue-50'
    return 'text-gray-600 bg-gray-50'
  }

  const exportLogs = () => {
    // Convert logs to CSV
    const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'IP Address']
    const rows = filteredLogs.map(log => [
      new Date(log.created_at).toLocaleString('th-TH'),
      log.user_email,
      getActionLabel(log.action),
      getResourceTypeLabel(log.resource_type),
      log.ip_address || '-'
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity-logs-${new Date().toISOString()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success('ส่งออก logs สำเร็จ')
  }

  // Get unique actions and resource types for filters
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)))
  const uniqueResourceTypes = Array.from(new Set(logs.map(log => log.resource_type).filter(Boolean)))

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
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">ดูประวัติการใช้งานและกิจกรรมทั้งหมดในระบบ</p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          ส่งออก CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ค้นหา logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุก Action</SelectItem>
            {uniqueActions.map(action => (
              <SelectItem key={action} value={action}>
                {getActionLabel(action)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุก Resource</SelectItem>
            {uniqueResourceTypes.map(type => (
              <SelectItem key={type} value={type!}>
                {getResourceTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(logs.map(log => log.user_id)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
              <Filter className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Filtered</p>
              <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  ไม่พบ logs
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {new Date(log.created_at).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{log.user_email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                  </TableCell>
                  <TableCell>{getResourceTypeLabel(log.resource_type)}</TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">
                    {log.ip_address || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {log.details ? (
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800">
                          View
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-w-md">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            หน้า {page} จาก {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ก่อนหน้า
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              ถัดไป
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
