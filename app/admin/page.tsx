'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  username: string
  full_name: string
  phone: string
  request_id: string
  status: 'pending' | 'approved' | 'rejected'
  bank_choice: string
  created_at: string
  approved_at: string
}

type FilterType = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.status === 401) { router.push('/'); return }
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  async function updateStatus(userId: string, status: 'approved' | 'rejected') {
    setActionLoading(userId)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    await loadUsers()
    setActionLoading(null)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const filtered = users.filter(u => {
    const matchFilter = filter === 'all' || u.status === filter
    const matchSearch = !search || u.username.includes(search) || u.full_name?.includes(search) || u.request_id.includes(search)
    return matchFilter && matchSearch
  })

  const counts = {
    all: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length,
  }

  const statusBadge = (s: string) => {
    if (s === 'pending') return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">⏳ قيد الانتظار</span>
    if (s === 'approved') return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">✅ مفعّل</span>
    return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">❌ مرفوض</span>
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏦</span>
            <span className="font-bold text-gray-800">لوحة التحكم</span>
          </div>
          <Link href="/admin" className="text-sm text-blue-600 border-b-2 border-blue-600">المستخدمون</Link>
          <Link href="/admin/settings" className="text-sm text-gray-500 hover:text-blue-600">إعدادات البنوك</Link>
          <Link href="/admin/rates" className="text-sm text-gray-500 hover:text-blue-600">جداول النسب</Link>
          <Link href="/admin/logs" className="text-sm text-gray-500 hover:text-blue-600">السجلات</Link>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600 transition">خروج ←</button>
      </nav>

      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {([['all', 'الكل', '👥'], ['pending', 'قيد الانتظار', '⏳'], ['approved', 'مفعّلون', '✅'], ['rejected', 'مرفوضون', '❌']] as const).map(([key, label, icon]) => (
            <button key={key} onClick={() => setFilter(key as FilterType)}
              className={`card !p-4 text-center transition hover:shadow-md ${filter === key ? 'border-blue-300 bg-blue-50' : ''}`}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-bold text-gray-800">{counts[key as FilterType]}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </button>
          ))}
        </div>

        <div className="card !p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <input className="input-field max-w-xs" placeholder="بحث بالاسم أو رقم الطلب..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <span className="text-sm text-gray-500">{filtered.length} مستخدم</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">لا يوجد مستخدمون</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-right">رقم الطلب</th>
                    <th className="px-4 py-3 text-right">الاسم</th>
                    <th className="px-4 py-3 text-right">المستخدم</th>
                    <th className="px-4 py-3 text-right">الجوال</th>
                    <th className="px-4 py-3 text-right">تاريخ التسجيل</th>
                    <th className="px-4 py-3 text-right">الحالة</th>
                    <th className="px-4 py-3 text-right">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">{u.request_id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{u.full_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{u.username}</td>
                      <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(u.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-4 py-3">{statusBadge(u.status)}</td>
                      <td className="px-4 py-3">
                        {u.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(u.id, 'approved')}
                              disabled={actionLoading === u.id}
                              className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                              {actionLoading === u.id ? '...' : 'موافقة'}
                            </button>
                            <button
                              onClick={() => updateStatus(u.id, 'rejected')}
                              disabled={actionLoading === u.id}
                              className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                              رفض
                            </button>
                          </div>
                        )}
                        {u.status === 'approved' && (
                          <button onClick={() => updateStatus(u.id, 'rejected')}
                            disabled={actionLoading === u.id}
                            className="text-xs text-red-600 hover:underline">إلغاء التفعيل</button>
                        )}
                        {u.status === 'rejected' && (
                          <button onClick={() => updateStatus(u.id, 'approved')}
                            disabled={actionLoading === u.id}
                            className="text-xs text-green-600 hover:underline">تفعيل</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}