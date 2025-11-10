'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { 
  Search, 
  UserCheck, 
  UserX, 
  Shield, 
  User,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  display_name: string | null
  role: 'user' | 'admin' | 'moderator'
  is_active: boolean
  created_at: string
  last_sign_in_at: string | null
  email?: string
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchQuery, roleFilter, statusFilter, users])

  const loadUsers = async () => {
    setLoading(true)
    try {
      // Load profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Get emails from auth.users
      const usersWithEmails = await Promise.all(
        (profilesData || []).map(async (profile) => {
          try {
            const { data } = await supabase.auth.admin.getUserById(profile.id)
            return {
              ...profile,
              email: data?.user?.email || 'Unknown'
            }
          } catch (err) {
            return {
              ...profile,
              email: 'Unknown'
            }
          }
        })
      )

      setUsers(usersWithEmails)
      setFilteredUsers(usersWithEmails)
    } catch (error: any) {
      console.error('Error loading users:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      )
    }

    setFilteredUsers(filtered)
  }

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, is_active: isActive } : user
      ))

      toast.success(isActive ? 'เปิดใช้งานบัญชีสำเร็จ' : 'ระงับบัญชีสำเร็จ')
    } catch (error: any) {
      console.error('Error updating user status:', error)
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ')
    }
  }

  const updateUserRole = async (userId: string, role: 'user' | 'admin' | 'moderator') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, role } : user
      ))

      toast.success('อัปเดต Role สำเร็จ')
    } catch (error: any) {
      console.error('Error updating user role:', error)
      toast.error('เกิดข้อผิดพลาดในการอัปเดต Role')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'moderator':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />
      case 'moderator':
        return <UserCheck className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
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
          <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h1>
          <p className="text-gray-600 mt-1">ดู แก้ไข และจัดการผู้ใช้ทั้งหมดในระบบ</p>
        </div>
        <div className="text-sm text-gray-600">
          ทั้งหมด {filteredUsers.length} คน
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ค้นหาด้วย email หรือชื่อ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุก Role</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="สถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสถานะ</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>สร้างเมื่อ</TableHead>
              <TableHead>Login ล่าสุด</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  ไม่พบผู้ใช้
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.display_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value as any)}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('th-TH')}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString('th-TH')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={user.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => updateUserStatus(user.id, !user.is_active)}
                    >
                      {user.is_active ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          ระงับ
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          เปิดใช้
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
