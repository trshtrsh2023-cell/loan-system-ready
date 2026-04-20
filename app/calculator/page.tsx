'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MILITARY_RANKS, calculateLoan, formatMoney, LoanResult } from '@/lib/calculations'

const JOB_TYPES = [
  { value: 'civil_government', label: 'مدني - قطاع حكومي' },
  { value: 'civil_private', label: 'مدني - قطاع خاص' },
  { value: 'military', label: 'عسكري' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - 18 - i)
const APT_YEARS = Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i)

// تم توحيد الواجهة لتتطابق مع البيانات القادمة من API
interface BankWithLogo {
  id: string;
  name: string; 
  bank_key: string;
  logo_url?: string;
  enabled: boolean;
  sakani_low_threshold: number;
  sakani_low_support: number;
  sakani_high_support: number;
}

interface FormState {
  basicSalary: string
  housingAllowance: string
  otherAllowances: string
  birthYear: string
  appointmentYear: string
  jobType: string
  militaryRank: string
  sakaniSupport: boolean
  selectedBank: string
}

function BankLogo({ bank, size = 48 }: { bank: BankWithLogo; size?: number }) {
  const [imgError, setImgError] = useState(false)
  // استخدام bank.name لضمان التوافق مع TypeScript
  const initial = (bank.name || '').replace('بنك ', '').replace('مصرف ', '').charAt(0)
  
  const colors: Record<string, string> = {
    ahli: 'bg-green-600',
    rajhi: 'bg-blue-700',
    inma: 'bg-purple-600',
    bilad: 'bg-orange-600',
    riyadh: 'bg-indigo-600',
    jazira: 'bg-teal-600',
    fransi: 'bg-red-600',
    samba: 'bg-cyan-600',
  }

  if (!bank.logo_url || imgError) {
    return (
      <div 
        className={`${colors[bank.bank_key] || 'bg-gray-500'} rounded-lg flex items-center justify-center text-white font-bold shadow-sm`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initial}
      </div>
    )
  }

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <img 
        src={bank.logo_url} 
        alt={bank.name}
        className="w-full h-full object-contain p-1"
        onError={() => setImgError(true)}
      />
    </div>
  )
}

export default function CalculatorPage() {
  const router = useRouter()
  const [banks, setBanks] = useState<BankWithLogo[]>([])
  const [form, setForm] = useState<FormState>({
    basicSalary: '', housingAllowance: '', otherAllowances: '',
    birthYear: '', appointmentYear: '',
    jobType: 'civil_government', militaryRank: '',
    sakaniSupport: false, selectedBank: ''
  })
  const [result, setResult] = useState<LoanResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/banks').then(r => r.json()).then(data => {
      const enabled = (data.banks || []).filter((b: BankWithLogo) => b.enabled)
      setBanks(enabled)
      if (enabled.length > 0) setForm(f => ({ ...f, selectedBank: enabled[0].bank_key }))
      setLoading(false)
    })
  }, [])

  const netSalary = (Number(form.basicSalary) || 0) + (Number(form.housingAllowance) || 0) + (Number(form.otherAllowances) || 0)
  const selectedBankCfg = banks.find(b => b.bank_key === form.selectedBank)

  function calculate() {
    if (!selectedBankCfg || !form.birthYear || !netSalary) return
    const r = calculateLoan({
      basicSalary: Number(form.basicSalary),
      housingAllowance: Number(form.housingAllowance),
      otherAllowances: Number(form.otherAllowances),
      netSalary,
      birthYear: Number(form.birthYear),
      appointmentYear: Number(form.appointmentYear) || CURRENT_YEAR,
      jobType: form.jobType as any,
      militaryRank: form.militaryRank || undefined,
      sakaniSupport: form.sakaniSupport,
      bankConfig: selectedBankCfg as any // استخدام as any لتجاوز فروقات بسيطة في الـ Types إن وجدت
    })
    setResult(r)
    setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">جاري التحميل...</p></div>

  return (
    <div className="min-h-screen bg-slate-50 text-right" dir="rtl">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏦</span>
          <span className="font-bold text-gray-800">حاسبة القروض</span>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600 transition">
          خروج ←
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-4 space-y-5">
        {/* Bank Selector */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-4">اختر البنك</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {banks.map(b => (
              <button 
                key={b.bank_key}
                onClick={() => { setForm(f => ({ ...f, selectedBank: b.bank_key })); setResult(null) }}
                className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  form.selectedBank === b.bank_key
                    ? 'bg-blue-50 border-blue-500 shadow-md'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <BankLogo bank={b} size={44} />
                <span className={`text-sm font-medium flex-1 ${
                  form.selectedBank === b.bank_key ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {b.name}
                </span>
                {form.selectedBank === b.bank_key && (
                  <span className="absolute top-1 left-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Salary Info */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b pb-2">بيانات الراتب</h3>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">الراتب الأساسي <span className="text-red-500">*</span></label>
              <input type="number" className="w-full border p-2 rounded-lg" placeholder="0" value={form.basicSalary}
                onChange={e => { setForm(f => ({ ...f, basicSalary: e.target.value })); setResult(null) }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">بدل السكن</label>
              <input type="number" className="w-full border p-2 rounded-lg" placeholder="0" value={form.housingAllowance}
                onChange={e => { setForm(f => ({ ...f, housingAllowance: e.target.value })); setResult(null) }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">البدلات الأخرى</label>
              <input type="number" className="w-full border p-2 rounded-lg" placeholder="0" value={form.otherAllowances}
                onChange={e => { setForm(f => ({ ...f, otherAllowances: e.target.value })); setResult(null) }} />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">الراتب الصافي</span>
              <span className="text-lg font-bold text-blue-700">{netSalary.toLocaleString('ar-SA')} ر.س</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" id="sakani" checked={form.sakaniSupport} className="w-4 h-4 accent-blue-600"
                onChange={e => { setForm(f => ({ ...f, sakaniSupport: e.target.checked })); setResult(null) }} />
              <label htmlFor="sakani" className="text-sm text-gray-700 cursor-pointer">
                مدعوم من برنامج <strong>سكني</strong>
                {form.sakaniSupport && selectedBankCfg && (
                  <span className="text-green-600 font-medium"> (+{formatMoney(netSalary < selectedBankCfg.sakani_low_threshold ? selectedBankCfg.sakani_low_support : selectedBankCfg.sakani_high_support)})</span>
                )}
              </label>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b pb-2">البيانات الشخصية والوظيفية</h3>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">سنة الميلاد <span className="text-red-500">*</span></label>
              <select className="w-full border p-2 rounded-lg" value={form.birthYear}
                onChange={e => { setForm(f => ({ ...f, birthYear: e.target.value })); setResult(null) }}>
                <option value="">اختر سنة الميلاد</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">سنة التعيين في الوظيفة</label>
              <select className="w-full border p-2 rounded-lg" value={form.appointmentYear}
                onChange={e => { setForm(f => ({ ...f, appointmentYear: e.target.value })); setResult(null) }}>
                <option value="">اختر سنة التعيين</option>
                {APT_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">نوع الوظيفة <span className="text-red-500">*</span></label>
              <select className="w-full border p-2 rounded-lg" value={form.jobType}
                onChange={e => { setForm(f => ({ ...f, jobType: e.target.value, militaryRank: '' })); setResult(null) }}>
                {JOB_TYPES.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
              </select>
            </div>

            {form.jobType === 'military' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">الرتبة العسكرية <span className="text-red-500">*</span></label>
                <select className="w-full border p-2 rounded-lg" value={form.militaryRank}
                  onChange={e => { setForm(f => ({ ...f, militaryRank: e.target.value })); setResult(null) }}>
                  <option value="">اختر الرتبة</option>
                  {MILITARY_RANKS.map(r => (
                    <option key={r.value} value={r.value}>{r.label} (تقاعد {r.retirementAge} سنة)</option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={calculate}
              disabled={!form.birthYear || !form.basicSalary || (form.jobType === 'military' && !form.militaryRank) || !form.selectedBank}
              className="bg-blue-600 text-white rounded-lg w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed text-base py-3 hover:bg-blue-700 transition">
              احسب المبلغ المتوقع
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div id="result-section" className="bg-white p-5 rounded-xl shadow-lg border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b">
              {selectedBankCfg && <BankLogo bank={selectedBankCfg} size={48} />}
              <div>
                <p className="text-xs text-gray-500">نتيجة الحساب من</p>
                <h3 className="font-bold text-gray-800 text-lg">
                  {selectedBankCfg?.name}
                </h3>
              </div>
            </div>

            {!result.canApply ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-700 font-medium">⚠️ {result.note}</p>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-l from-blue-600 to-blue-700 rounded-xl p-5 text-white mb-5 text-center">
                  <p className="text-blue-200 text-sm mb-1">إجمالي التمويل المتوقع</p>
                  <p className="text-4xl font-bold">{formatMoney(result.totalLoan)}</p>
                  <p className="text-blue-200 text-sm mt-1">معامل الضرب الفعلي: ×{result.effectiveMultiplier.toFixed(1)}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'مبلغ التمويل الأساسي', value: formatMoney(result.loanAmount), color: 'blue' },
                    { label: 'دعم سكني', value: result.sakaniAmount > 0 ? formatMoney(result.sakaniAmount) : 'غير مفعّل', color: result.sakaniAmount > 0 ? 'green' : 'gray' },
                    { label: 'القسط الشهري', value: formatMoney(result.installment), color: 'purple' },
                    { label: 'مدة التمويل', value: `${result.periodMonths} شهر (${result.periodYears} سنة)`, color: 'orange' },
                    { label: 'نسبة الربحية السنوية', value: `${result.annualRate}%`, color: 'gray' },
                    { label: 'المتبقي للتقاعد', value: `${Math.floor(result.remainingMonthsToRetirement / 12)} سنة`, color: 'gray' },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                      <p className={`font-bold text-sm ${item.color === 'blue' ? 'text-blue-700' : item.color === 'green' ? 'text-green-700' : item.color === 'purple' ? 'text-purple-700' : 'text-gray-700'}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {result.note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
                    ⚠️ {result.note}
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center mt-3">
                  * هذه نتيجة تقديرية. يرجى مراجعة البنك للحصول على عرض رسمي.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}