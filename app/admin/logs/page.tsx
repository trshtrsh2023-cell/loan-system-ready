'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ActivityLog {
  id: string
  user_id: string
  username: string
  action_type: string
  bank_key: string | null
  details: any
  created_at: string
}

const ACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  calculate_loan: { label: 'حساب قرض', color: 'bg-blue-100 text-blue-700', icon: '🧮' },
  login: { label: 'تسجيل دخول', color: 'bg-green-100 text-green-700', icon: '🔐' },
  register: { label: 'تسجيل حساب', color: 'bg-purple-100 text-purple-700', icon: '✨' },
  approve_user: { label: 'موافقة مستخدم', color: 'bg-green-100 text-green-700', icon: '✅' },
  reject_user: { label: 'رفض مستخدم', color: 'bg-red-100 text-red-700', icon: '❌' },
  update_bank: { label: 'تعديل بنك', color: 'bg-amber-100 text-amber-700', icon: '⚙️' },
}

export default function AdminLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchUser, setSearchUser] = useState('')

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    setLoading(true)
    try {
      const res = await fetch('/api/logs')
      if (res.status === 401) {
        router.push('/')
        return
      }
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'الآن'
    if (mins < 60) return `قبل ${mins} دقيقة`
    if (hours < 24) return `قبل ${hours} ساعة`
    return `قبل ${days} يوم`
  }

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.action_type !== filter) return false
    if (searchUser && !log.username?.toLowerCase().includes(searchUser.toLowerCase())) return false
    return true
  })

  const stats = {
    total: logs.length,
    today: logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length,
    calculations: logs.filter(l => l.action_type === 'calculate_loan').length,
    uniqueUsers: new Set(logs.map(l => l.user_id)).size,
  }

  return (
    <div className="app-bg" dir="rtl">
      <nav className="bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏦</span>
            <span className="font-bold text-gray-800">لوحة التحكم</span>
          </div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600">المستخدمون</Link>
          <Link href="/admin/settings" className="text-sm text-gray-500 hover:text-blue-600">إعدادات البنوك</Link>
          <Link href="/admin/rates" className="text-sm text-gray-500 hover:text-blue-600">جداول النسب</Link>
          <Link href="/admin/logs" className="text-sm text-blue-600 border-b-2 border-blue-600">السجلات</Link>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600 transition">خروج ←</button>
      </nav>

      <div className="max-w-7xl mx-auto p-4 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">سجلات النشاط</h2>
          <p className="text-sm text-gray-500">جميع عمليات البحث والحسابات التي قام بها المستخدمون</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card !p-4">
            <p className="text-xs text-gray-500 mb-1">إجمالي السجلات</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="card !p-4">
            <p className="text-xs text-gray-500 mb-1">اليوم</p>
            <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
          </div>
          <div className="card !p-4">
            <p className="text-xs text-gray-500 mb-1">عمليات حساب</p>
            <p className="text-2xl font-bold text-purple-600">{stats.calculations}</p>
          </div>
          <div className="card !p-4">
            <p className="text-xs text-gray-500 mb-1">مستخدمون نشطون</p>
            <p className="text-2xl font-bold text-green-600">{stats.uniqueUsers}</p>
          </div>
        </div>

        <div className="card !p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <input type="text" placeholder="🔍 ابحث عن مستخدم..." value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                className="input-field" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                الكل ({logs.length})
              </button>
              {Object.entries(ACTION_LABELS).map(([key, info]) => {
                const count = logs.filter(l => l.action_type === key).length
                if (count === 0) return null
                return (
                  <button key={key} onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filter === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {info.icon} {info.label} ({count})
                  </button>
                )
              })}
            </div>
            <button onClick={loadLogs} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium">
              🔄 تحديث
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">جاري التحميل...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">لا توجد سجلات</p>
          </div>
        ) : (
          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">#</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">المستخدم</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">النشاط</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">التفاصيل</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">الوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log, idx) => {
                    const action = ACTION_LABELS[log.action_type] || { label: log.action_type, color: 'bg-gray-100 text-gray-700', icon: '📝' }
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-l from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {log.username?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="font-medium text-gray-800 text-sm">{log.username || 'غير معروف'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${action.color}`}>
                            {action.icon} {action.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {log.details && (
                            <div className="space-y-0.5">
                              {log.details.bank_name && (
                                <div>🏦 {log.details.bank_name}</div>
                              )}
                              {log.details.net_salary && (
                                <div className="text-xs text-gray-500">
                                  الراتب: {log.details.net_salary.toLocaleString('ar-SA')} ر.س
                                </div>
                              )}
                              {log.details.total_loan && (
                                <div className="text-xs text-green-600">
                                  التمويل: {log.details.total_loan.toLocaleString('ar-SA')} ر.س
                                </div>
                              )}
                              {log.details.installment && (
                                <div className="text-xs text-purple-600">
                                  القسط: {log.details.installment.toLocaleString('ar-SA')} ر.س
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600">{formatTimeAgo(log.created_at)}</div>
                          <div className="text-xs text-gray-400">{formatDate(log.created_at)}</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-xs text-gray-500 text-center">
              عرض {filteredLogs.length} من أصل {logs.length} سجل • آخر 200 عملية فقط
            </div>
          </div>
        )}
      </div>
    </div>
  )
}