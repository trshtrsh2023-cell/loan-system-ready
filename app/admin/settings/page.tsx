'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BankConfig {
  id: string
  bank_key: string
  bank_name: string
  personal_multiplier: number
  deduction_rate: number
  annual_rate: number
  max_period_months: number
  sakani_low_threshold: number
  sakani_low_support: number
  sakani_high_support: number
  enabled: boolean
  logo_url?: string
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [banks, setBanks] = useState<BankConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<BankConfig>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => {
        if (r.status === 401) {
          router.push('/')
          return { banks: [] }
        }
        return r.json()
      })
      .then(data => {
        setBanks(data.banks || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [router])

  function startEdit(bank: BankConfig) {
    setEditing(bank.bank_key)
    setDraft({ ...bank })
  }

  async function saveBank() {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/settings/${editing}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      })
      if (res.ok) {
        const data = await res.json()
        setBanks(bs => bs.map(b => b.bank_key === editing ? data.bank : b))
        setSaved(editing)
        setTimeout(() => setSaved(null), 2000)
        setEditing(null)
      }
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  async function toggleBank(bank_key: string, enabled: boolean) {
    try {
      const res = await fetch(`/api/admin/settings/${bank_key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })
      if (res.ok) {
        setBanks(bs => bs.map(b => b.bank_key === bank_key ? { ...b, enabled } : b))
      }
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-right" dir="rtl">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏦</span>
            <span className="font-bold text-gray-800">لوحة التحكم</span>
          </div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600">المستخدمون</Link>
          <Link href="/admin/settings" className="text-sm text-blue-600 border-b-2 border-blue-600">إعدادات البنوك</Link>
          <Link href="/admin/rates" className="text-sm text-gray-500 hover:text-blue-600">جداول النسب</Link>
          <Link href="/admin/logs" className="text-sm text-gray-500 hover:text-blue-600">السجلات</Link>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600 transition">خروج ←</button>
      </nav>

      <div className="max-w-5xl mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">إعدادات البنوك والمعادلات</h2>
          <p className="text-sm text-gray-500">التعديلات تنعكس فوراً على حاسبة العملاء</p>
        </div>

        {banks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">لا توجد بنوك متاحة.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {banks.map(bank => (
              <div key={bank.bank_key} className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-sm transition ${!bank.enabled ? 'opacity-60 bg-gray-50' : ''}`}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    {bank.logo_url && (
                      <img
                        src={bank.logo_url}
                        alt={bank.bank_name}
                        className="w-12 h-12 object-contain bg-white rounded-lg border p-1"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{bank.bank_name}</h3>
                      <p className="text-xs text-gray-400">{bank.bank_key}</p>
                    </div>
                    {saved === bank.bank_key && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ تم الحفظ</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                      <input type="checkbox" checked={bank.enabled} onChange={e => toggleBank(bank.bank_key, e.target.checked)} className="w-4 h-4 accent-blue-600" />
                      مفعّل
                    </label>
                    {editing !== bank.bank_key ? (
                      <button onClick={() => startEdit(bank)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-xs font-medium transition">تعديل</button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={saveBank} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50">
                          {saving ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <button onClick={() => setEditing(null)} className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-1.5 rounded-lg text-xs font-medium transition">إلغاء</button>
                      </div>
                    )}
                  </div>
                </div>

                {editing === bank.bank_key ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">معامل الضرب (× الراتب)</label>
                      <input type="number" step="0.1" className="w-full border border-gray-200 p-2 rounded-lg text-sm" value={draft.personal_multiplier ?? ''} onChange={e => setDraft(d => ({ ...d, personal_multiplier: parseFloat(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">نسبة الاستقطاع (مثال: 0.33)</label>
                      <input type="number" step="0.01" className="w-full border border-gray-200 p-2 rounded-lg text-sm" value={draft.deduction_rate ?? ''} onChange={e => setDraft(d => ({ ...d, deduction_rate: parseFloat(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">نسبة الأرباح السنوية %</label>
                      <input type="number" step="0.1" className="w-full border border-gray-200 p-2 rounded-lg text-sm" value={draft.annual_rate ?? ''} onChange={e => setDraft(d => ({ ...d, annual_rate: parseFloat(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">مدة التمويل القصوى (شهر)</label>
                      <input type="number" className="w-full border border-gray-200 p-2 rounded-lg text-sm" value={draft.max_period_months ?? ''} onChange={e => setDraft(d => ({ ...d, max_period_months: parseInt(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">حد راتب سكني المنخفض (ر.س)</label>
                      <input type="number" className="w-full border border-gray-200 p-2 rounded-lg text-sm" value={draft.sakani_low_threshold ?? ''} onChange={e => setDraft(d => ({ ...d, sakani_low_threshold: parseFloat(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">دعم سكني - تحت الحد (ر.س)</label>
                      <input type="number" className="w-full border border-gray-200 p-2 rounded-lg text-sm" value={draft.sakani_low_support ?? ''} onChange={e => setDraft(d => ({ ...d, sakani_low_support: parseFloat(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">دعم سكني - فوق الحد (ر.س)</label>
                      <input type="number" className="w-full border border-gray-200 p-2 rounded-lg text-sm" value={draft.sakani_high_support ?? ''} onChange={e => setDraft(d => ({ ...d, sakani_high_support: parseFloat(e.target.value) }))} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">معامل الضرب</p>
                      <p className="font-bold text-blue-700 text-lg">×{bank.personal_multiplier}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">نسبة الأرباح</p>
                      <p className="font-semibold text-gray-800">{bank.annual_rate}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">نسبة الاستقطاع</p>
                      <p className="font-semibold text-gray-800">{(bank.deduction_rate * 100).toFixed(0)}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">أقصى مدة</p>
                      <p className="font-semibold text-gray-800">{bank.max_period_months} شهر</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">دعم سكني (منخفض)</p>
                      <p className="font-semibold text-green-600">{bank.sakani_low_support?.toLocaleString('ar-SA')} ر.س</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">دعم سكني (مرتفع)</p>
                      <p className="font-semibold text-green-600">{bank.sakani_high_support?.toLocaleString('ar-SA')} ر.س</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">حد راتب سكني</p>
                      <p className="font-semibold text-gray-800">{bank.sakani_low_threshold?.toLocaleString('ar-SA')} ر.س</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}