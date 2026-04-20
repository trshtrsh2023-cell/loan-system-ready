'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MILITARY_RANKS, calculateLoan, formatMoney, BankConfig, LoanResult } from '@/lib/calculations'

const JOB_TYPES = [
  { value: 'civil_government', label: 'مدني - قطاع حكومي' },
  { value: 'civil_private', label: 'مدني - قطاع خاص' },
  { value: 'military', label: 'عسكري' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - 18 - i)
const APT_YEARS = Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i)

interface BankWithLogo extends BankConfig {
  logo_url?: string
}

function BankLogo({ bank, size = 48 }: { bank: BankWithLogo; size?: number }) {
  const [imgError, setImgError] = useState(false)
  const initial = bank.bank_name.replace('بنك ', '').replace('مصرف ', '').charAt(0)
  
  const colors: Record<string, string> = {
    ahli: 'bg-green-600', rajhi: 'bg-blue-700', inma: 'bg-purple-600',
    bilad: 'bg-orange-600', riyadh: 'bg-indigo-600', jazira: 'bg-teal-600',
    fransi: 'bg-red-600', samba: 'bg-cyan-600',
  }

  if (!bank.logo_url || imgError) {
    return (
      <div className={`${colors[bank.bank_key] || 'bg-gray-500'} rounded-lg flex items-center justify-center text-white font-bold shadow-sm`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}>
        {initial}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center"
      style={{ width: size, height: size }}>
      <img src={bank.logo_url} alt={bank.bank_name}
        className="w-full h-full object-contain p-1"
        onError={() => setImgError(true)} />
    </div>
  )
}

export default function CalculatorPage() {
  const router = useRouter()
  const [banks, setBanks] = useState<BankWithLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1) // 1: Personal, 2: Job, 3: Salary, 4: Bank
  const [calculating, setCalculating] = useState(false)
  const [calcProgress, setCalcProgress] = useState(0)
  const [calcStage, setCalcStage] = useState('')
  
  const [form, setForm] = useState({
    birthYear: '',
    appointmentYear: '',
    jobType: '',
    militaryRank: '',
    basicSalary: '',
    housingAllowance: '',
    otherAllowances: '',
    sakaniSupport: null as boolean | null,
    selectedBank: ''
  })
  
  const [result, setResult] = useState<LoanResult | null>(null)

  useEffect(() => {
    fetch('/api/banks').then(r => r.json()).then(data => {
      const enabled = (data.banks || []).filter((b: BankWithLogo) => b.enabled)
      setBanks(enabled)
      setLoading(false)
    })
  }, [])

  const netSalary = (Number(form.basicSalary) || 0) + (Number(form.housingAllowance) || 0) + (Number(form.otherAllowances) || 0)
  const selectedBankCfg = banks.find(b => b.bank_key === form.selectedBank)

  // التحقق من اكتمال كل خطوة
  const step1Complete = form.birthYear !== ''
  const step2Complete = form.jobType !== '' && (form.jobType !== 'military' || form.militaryRank !== '')
  const step3Complete = Number(form.basicSalary) > 0 && form.sakaniSupport !== null
  const step4Complete = form.selectedBank !== ''

  async function handleCalculate() {
    if (!selectedBankCfg) return
    
    setCalculating(true)
    setResult(null)
    setCalcProgress(0)

    // محاكاة مراحل الحساب
    const stages = [
      { text: 'جاري التحقق من البيانات...', progress: 20 },
      { text: 'جاري حساب المتبقي للتقاعد...', progress: 40 },
      { text: 'جاري حساب الدعم السكني...', progress: 60 },
      { text: 'جاري حساب القسط الشهري...', progress: 80 },
      { text: 'جاري إعداد النتيجة...', progress: 100 },
    ]

    for (const stage of stages) {
      setCalcStage(stage.text)
      setCalcProgress(stage.progress)
      await new Promise(resolve => setTimeout(resolve, 600))
    }

    // الحساب الفعلي
    const r = calculateLoan({
      basicSalary: Number(form.basicSalary),
      housingAllowance: Number(form.housingAllowance),
      otherAllowances: Number(form.otherAllowances),
      netSalary,
      birthYear: Number(form.birthYear),
      appointmentYear: Number(form.appointmentYear) || CURRENT_YEAR,
      jobType: form.jobType as any,
      militaryRank: form.militaryRank || undefined,
      sakaniSupport: form.sakaniSupport === true,
      bankConfig: selectedBankCfg
    })

    // تسجيل في السجلات
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: 'calculate_loan',
          bank_key: form.selectedBank,
          details: {
            bank_name: selectedBankCfg.bank_name,
            net_salary: netSalary,
            total_loan: r.totalLoan,
            installment: r.installment,
          }
        })
      })
    } catch (e) {
      console.error('Log failed:', e)
    }

    setResult(r)
    setCalculating(false)
    setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  function resetForm() {
    setForm({
      birthYear: '', appointmentYear: '', jobType: '', militaryRank: '',
      basicSalary: '', housingAllowance: '', otherAllowances: '',
      sakaniSupport: null, selectedBank: ''
    })
    setResult(null)
    setCurrentStep(1)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">جاري التحميل...</p></div>

  return (
    <div className="app-bg">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏦</span>
          <span className="font-bold text-gray-800">حاسبة القروض البنكية</span>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600 transition">
          خروج ←
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-4 space-y-5">
        {/* Progress Steps */}
        <div className="card !p-5">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 -z-0"></div>
            <div className="absolute top-5 right-[12.5%] h-0.5 bg-blue-500 -z-0 transition-all"
              style={{ width: `${(currentStep - 1) * 25}%` }}></div>
            
            {[
              { num: 1, label: 'البيانات الشخصية', done: step1Complete },
              { num: 2, label: 'البيانات الوظيفية', done: step2Complete },
              { num: 3, label: 'بيانات الراتب', done: step3Complete },
              { num: 4, label: 'اختيار البنك', done: step4Complete },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-2 z-10 bg-white px-2">
                <div className={`step-dot ${
                  currentStep === s.num ? 'step-dot-active' : 
                  s.done ? 'step-dot-done' : 'step-dot-pending'
                }`}>
                  {s.done && currentStep !== s.num ? '✓' : s.num}
                </div>
                <span className={`text-xs font-medium ${currentStep === s.num ? 'text-blue-600' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="card space-y-4">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">الخطوة 1: البيانات الشخصية</h3>
            <div>
              <label className="label">سنة الميلاد <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.birthYear}
                onChange={e => setForm(f => ({ ...f, birthYear: e.target.value }))}>
                <option value="">اختر سنة الميلاد</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={() => setCurrentStep(2)} disabled={!step1Complete}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              التالي ←
            </button>
          </div>
        )}

        {/* Step 2: Job Info */}
        {currentStep === 2 && (
          <div className="card space-y-4">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">الخطوة 2: البيانات الوظيفية</h3>
            <div>
              <label className="label">سنة التعيين في الوظيفة</label>
              <select className="input-field" value={form.appointmentYear}
                onChange={e => setForm(f => ({ ...f, appointmentYear: e.target.value }))}>
                <option value="">اختر سنة التعيين</option>
                {APT_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">نوع الوظيفة <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.jobType}
                onChange={e => setForm(f => ({ ...f, jobType: e.target.value, militaryRank: '' }))}>
                <option value="">اختر نوع الوظيفة</option>
                {JOB_TYPES.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
              </select>
            </div>
            {form.jobType === 'military' && (
              <div>
                <label className="label">الرتبة العسكرية <span className="text-red-500">*</span></label>
                <select className="input-field" value={form.militaryRank}
                  onChange={e => setForm(f => ({ ...f, militaryRank: e.target.value }))}>
                  <option value="">اختر الرتبة</option>
                  {MILITARY_RANKS.map(r => (
                    <option key={r.value} value={r.value}>{r.label} (تقاعد {r.retirementAge} سنة)</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setCurrentStep(1)} className="btn-secondary flex-1">
                → السابق
              </button>
              <button onClick={() => setCurrentStep(3)} disabled={!step2Complete}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                التالي ←
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Salary Info */}
        {currentStep === 3 && (
          <div className="card space-y-4">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">الخطوة 3: بيانات الراتب</h3>
            <div>
              <label className="label">الراتب الأساسي <span className="text-red-500">*</span></label>
              <input type="number" className="input-field" placeholder="0"
                value={form.basicSalary}
                onChange={e => setForm(f => ({ ...f, basicSalary: e.target.value }))} />
            </div>
            <div>
              <label className="label">بدل السكن</label>
              <input type="number" className="input-field" placeholder="0"
                value={form.housingAllowance}
                onChange={e => setForm(f => ({ ...f, housingAllowance: e.target.value }))} />
            </div>
            <div>
              <label className="label">البدلات الأخرى</label>
              <input type="number" className="input-field" placeholder="0"
                value={form.otherAllowances}
                onChange={e => setForm(f => ({ ...f, otherAllowances: e.target.value }))} />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">الراتب الصافي</span>
              <span className="text-lg font-bold text-blue-700">{netSalary.toLocaleString('ar-SA')} ر.س</span>
            </div>

            <div>
              <label className="label">هل أنت مدعوم من برنامج سكني؟ <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, sakaniSupport: true }))}
                  className={`py-3 px-4 rounded-xl border-2 font-medium transition ${
                    form.sakaniSupport === true 
                      ? 'bg-green-50 border-green-500 text-green-700' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                  }`}>
                  ✓ نعم
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, sakaniSupport: false }))}
                  className={`py-3 px-4 rounded-xl border-2 font-medium transition ${
                    form.sakaniSupport === false 
                      ? 'bg-red-50 border-red-500 text-red-700' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                  }`}>
                  ✗ لا
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setCurrentStep(2)} className="btn-secondary flex-1">
                → السابق
              </button>
              <button onClick={() => setCurrentStep(4)} disabled={!step3Complete}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                التالي ←
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Bank Selection */}
        {currentStep === 4 && (
          <div className="card space-y-4">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">الخطوة 4: اختر البنك</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {banks.map(b => (
                <button key={b.bank_key}
                  onClick={() => setForm(f => ({ ...f, selectedBank: b.bank_key }))}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    form.selectedBank === b.bank_key
                      ? 'bg-blue-50 border-blue-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}>
                  <BankLogo bank={b} size={56} />
                  <span className={`text-xs font-medium text-center ${
                    form.selectedBank === b.bank_key ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {b.bank_name}
                  </span>
                  {form.selectedBank === b.bank_key && (
                    <span className="absolute top-1 left-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <button onClick={() => setCurrentStep(3)} className="btn-secondary flex-1">
                → السابق
              </button>
              <button onClick={handleCalculate} disabled={!step4Complete || calculating}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                🎯 اعرض مبلغ التمويل المتوقع
              </button>
            </div>
          </div>
        )}

        {/* Calculating Progress */}
        {calculating && (
          <div className="card border-2 border-blue-200 !p-8 text-center">
            <div className="animate-pulse mb-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚙️</span>
              </div>
            </div>
            <p className="font-semibold text-gray-800 mb-4">{calcStage}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-l from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${calcProgress}%` }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{calcProgress}%</p>
          </div>
        )}

        {/* Result */}
        {result && !calculating && (
          <div id="result-section" className="card border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b">
              {selectedBankCfg && <BankLogo bank={selectedBankCfg} size={48} />}
              <div>
                <p className="text-xs text-gray-500">نتيجة الحساب من</p>
                <h3 className="font-bold text-gray-800 text-lg">{selectedBankCfg?.bank_name}</h3>
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 mt-3">
                  <strong>ملاحظة:</strong> هذه نتيجة تقديرية. يرجى مراجعة إدارة الموقع للحصول على عرض رسمي.
                </div>

                <button onClick={resetForm} className="btn-secondary w-full mt-4">
                  🔄 حساب جديد
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}