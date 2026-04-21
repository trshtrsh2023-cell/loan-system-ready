'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface LoanProduct {
  product_key: string
  product_name: string
  description: string
  max_deduction_rate: number
  min_years: number
  max_years: number
  enabled: boolean
}

interface Rate {
  product_key: string
  years: number
  annual_rate: number
}

export default function AdminRatesPage() {
  const router = useRouter()
  const [products, setProducts] = useState<LoanProduct[]>([])
  const [rates, setRates] = useState<Rate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeProduct, setActiveProduct] = useState<string>('')
  const [saving, setSaving] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/rates')
      if (res.status === 401) {
        router.push('/')
        return
      }
      const data = await res.json()
      setProducts(data.products || [])
      setRates(data.rates || [])
      if (data.products?.length > 0) {
        setActiveProduct(data.products[0].product_key)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function saveRate(product_key: string, years: number, annual_rate: number) {
    const key = `${product_key}-${years}`
    setSaving(key)
    try {
      const res = await fetch('/api/admin/rates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_key, years, annual_rate })
      })
      if (res.ok) {
        setRates(prev => prev.map(r => 
          r.product_key === product_key && r.years === years 
            ? { ...r, annual_rate } 
            : r
        ))
        setSavedKey(key)
        setTimeout(() => setSavedKey(null), 1500)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(null)
    }
  }

  function updateLocalRate(product_key: string, years: number, value: string) {
    const rate = parseFloat(value)
    setRates(prev => prev.map(r => 
      r.product_key === product_key && r.years === years 
        ? { ...r, annual_rate: isNaN(rate) ? 0 : rate } 
        : r
    ))
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

  const activeProductData = products.find(p => p.product_key === activeProduct)
  const activeRates = rates.filter(r => r.product_key === activeProduct).sort((a, b) => a.years - b.years)

  return (
    <div className="app-bg">
      <nav className="bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏦</span>
            <span className="font-bold text-gray-800">لوحة التحكم</span>
          </div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600">المستخدمون</Link>
          <Link href="/admin/settings" className="text-sm text-gray-500 hover:text-blue-600">إعدادات البنوك</Link>
          <Link href="/admin/rates" className="text-sm text-blue-600 border-b-2 border-blue-600">جداول النسب</Link>
          <Link href="/admin/logs" className="text-sm text-gray-500 hover:text-blue-600">السجلات</Link>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600 transition">خروج ←</button>
      </nav>

      <div className="max-w-6xl mx-auto p-4 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">جداول نسب هوامش الربح</h2>
          <p className="text-sm text-gray-500">هذه النسب مخفية عن العملاء، يستخدمها النظام في الحساب تلقائياً</p>
        </div>

        {/* Product Tabs */}
        <div className="card !p-3">
          <div className="flex flex-wrap gap-2">
            {products.map(p => (
              <button key={p.product_key}
                onClick={() => setActiveProduct(p.product_key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeProduct === p.product_key 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {p.product_name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Product Info */}
        {activeProductData && (
          <div className="card border-2 border-blue-100">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{activeProductData.product_name}</h3>
                <p className="text-sm text-gray-500">{activeProductData.description}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-blue-50 px-3 py-1.5 rounded-lg">
                  <span className="text-gray-500">المدة: </span>
                  <span className="font-bold text-blue-700">{activeProductData.min_years}-{activeProductData.max_years} سنة</span>
                </div>
                <div className="bg-purple-50 px-3 py-1.5 rounded-lg">
                  <span className="text-gray-500">حد الاستقطاع: </span>
                  <span className="font-bold text-purple-700">{(activeProductData.max_deduction_rate * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Rates Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200">
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">عدد السنوات</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">النسبة السنوية %</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRates.map(r => {
                    const key = `${r.product_key}-${r.years}`
                    return (
                      <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <span className="font-medium text-gray-800">{r.years} سنة</span>
                          <span className="text-xs text-gray-400 mr-2">({r.years * 12} شهر)</span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <input type="number" step="0.01" min="0" max="20"
                              value={r.annual_rate}
                              onChange={e => updateLocalRate(r.product_key, r.years, e.target.value)}
                              className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 outline-none" />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => saveRate(r.product_key, r.years, r.annual_rate)}
                              disabled={saving === key}
                              className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-lg text-xs font-medium disabled:opacity-50">
                              {saving === key ? '...' : 'حفظ'}
                            </button>
                            {savedKey === key && (
                              <span className="text-xs text-green-600 font-medium">✓ تم</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}