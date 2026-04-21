'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MILITARY_RANKS, BankConfig } from '@/lib/calculations'
import { calculateLoanV2, formatMoney, SupportType, SectorType, LoanProduct } from '@/lib/calculations_v2'
import { hijriToGregorian, HIJRI_MONTHS, GREGORIAN_MONTHS } from '@/lib/hijri'

interface BankWithLogo extends BankConfig {
  logo_url?: string
}

interface Rate {
  product_key: string
  years: number
  annual_rate: number
}

const SECTORS = [
  { value: 'civil_government', label: 'مدني - قطاع حكومي' },
  { value: 'civil_private', label: 'مدني - قطاع خاص' },
  { value: 'military', label: 'عسكري' },
]

function BankLogo({ bank, size = 48 }: { bank: BankWithLogo; size?: number }) {
  const [imgError, setImgError] = useState(false)
  const initial = (bank.bank_name || 'B').replace('بنك ', '').replace('مصرف ', '').charAt(0)
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
      <img src={bank.logo_url} alt={bank.bank_name} className="w-full h-full object-contain p-1" onError={() => setImgError(true)} />
    </div>
  )
}

// Date picker component
function DatePicker({ 
  label, value, onChange, required 
}: { 
  label: string
  value: { year: string; month: string; day: string; type: 'hijri' | 'gregorian' }
  onChange: (v: typeof value) => void
  required?: boolean 
}) {
  const CURRENT_YEAR_GREG = new Date().getFullYear()
  const CURRENT_YEAR_HIJRI = CURRENT_YEAR_GREG - 579
  
  const maxYear = value.type === 'hijri' ? CURRENT_YEAR_HIJRI : CURRENT_YEAR_GREG
  const minYear = value.type === 'hijri' ? 1350 : 1920
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i)
  const months = value.type === 'hijri' ? HIJRI_MONTHS : GREGORIAN_MONTHS
  const days = Array.from({ length: 30 }, (_, i) => i + 1)

  return (
    <div className="space-y-2">
      <label className="label">{label} {required && <span className="text-red-500">*</span>}</label>
      
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={() => onChange({ ...value, type: 'hijri' })}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
            value.type === 'hijri' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
          هجري
        </button>
        <button type="button" onClick={() => onChange({ ...value, type: 'gregorian' })}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
            value.type === 'gregorian' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
          ميلادي
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <select className="input-field !py-2" value={value.day} onChange={e => onChange({ ...value, day: e.target.value })}>
          <option value="">اليوم</option>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input-field !py-2" value={value.month} onChange={e => onChange({ ...value, month: e.target.value })}>
          <option value="">الشهر</option>
          {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <select className="input-field !py-2" value={value.year} onChange={e => onChange({ ...value, year: e.target.value })}>
          <option value="">السنة</option>
          {years.map(y => <option key={y} value={y}>{y}{value.type === 'hijri' ? 'هـ' : 'م'}</option>)}
        </select>
      </div>
    </div>
  )
}

export default function CalculatorPage() {
  const router = useRouter()
  const [banks, setBanks] = useState<BankWithLogo[]>([])
  const [products, setProducts] = useState<LoanProduct[]>([])
  const [rates, setRates] = useState<Rate[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [calculating, setCalculating] = useState(false)
  const [calcProgress, setCalcProgress] = useState(0)
  const [calcStage, setCalcStage] = useState('')
  
  const [birthDate, setBirthDate] = useState({ year: '', month: '', day: '', type: 'gregorian' as 'hijri' | 'gregorian' })
  const [appointmentDate, setAppointmentDate] = useState({ year: '', month: '', day: '', type: 'gregorian' as 'hijri' | 'gregorian' })
  
  const [form, setForm] = useState({
    sector: '' as SectorType | '',
    militaryRank: '',
    basicSalary: '',
    housingAllowance: '',
    otherAllowances: '',
    supportType: 'none' as SupportType,
    productKey: '',
    years: '',
    selectedBank: ''
  })
  
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/banks').then(r => r.json()),
      fetch('/api/products').then(r => r.json())
    ]).then(([banksData, productsData]) => {
      setBanks((banksData.banks || []).filter((b: BankWithLogo) => b.enabled))
      setProducts(productsData.products || [])
      setRates(productsData.rates || [])
      setLoading(false)
    })
  }, [])

  // Convert to Gregorian if Hijri
  function getGregorianDate(d: typeof birthDate) {
    if (!d.year || !d.month || !d.day) return null
    const y = parseInt(d.year), m = parseInt(d.month), day = parseInt(d.day)
    if (d.type === 'hijri') {
      return hijriToGregorian(y, m, day)
    }
    return { year: y, month: m, day }
  }

  // Calculate net salary based on sector
  const basicNum = Number(form.basicSalary) || 0
  const housingNum = Number(form.housingAllowance) || 0
  const otherNum = Number(form.otherAllowances) || 0
  
  let netSalary = 0
  if (form.sector === 'civil_private') {
    netSalary = Math.round((basicNum + housingNum) * 0.9025 + otherNum)
  } else if (form.sector) {
    netSalary = Math.round(basicNum * 0.91 + housingNum + otherNum)
  }

  const selectedProduct = products.find(p => p.product_key === form.productKey)
  const availableYears = form.productKey 
    ? rates.filter(r => r.product_key === form.productKey).map(r => r.years).sort((a, b) => a - b)
    : []

  // Validation
  const step1Complete = birthDate.year && birthDate.month && birthDate.day
  const step2Complete = !!form.sector && (form.sector !== 'military' || !!form.militaryRank) && 
                        appointmentDate.year && appointmentDate.month && appointmentDate.day
  const step3Complete = basicNum > 0
  const step4Complete = !!form.productKey && !!form.years
  const step5Complete = !!form.selectedBank

  async function handleCalculate() {
    const birthGreg = getGregorianDate(birthDate)
    const appointmentGreg = getGregorianDate(appointmentDate)
    const selectedBankCfg = banks.find(b => b.bank_key === form.selectedBank)
    const rate = rates.find(r => r.product_key === form.productKey && r.years === Number(form.years))
    
    if (!birthGreg || !appointmentGreg || !selectedBankCfg || !rate || !selectedProduct) return

    setCalculating(true)
    setResult(null)
    
    const stages = [
      { text: 'جاري التحقق من البيانات...', progress: 15 },
      { text: 'جاري حساب الراتب الصافي...', progress: 30 },
      { text: 'جاري حساب المتبقي للتقاعد...', progress: 50 },
      { text: 'جاري جلب نسبة الربح...', progress: 65 },
      { text: 'جاري حساب القسط الشهري...', progress: 80 },
      { text: 'جاري حساب مبلغ التمويل...', progress: 95 },
      { text: 'جاري إعداد النتيجة...', progress: 100 },
    ]
    for (const stage of stages) {
      setCalcStage(stage.text)
      setCalcProgress(stage.progress)
      await new Promise(r => setTimeout(r, 500))
    }

    const r = calculateLoanV2({
      basicSalary: basicNum,
      housingAllowance: housingNum,
      otherAllowances: otherNum,
      sector: form.sector as SectorType,
      birthYear: birthGreg.year,
      birthMonth: birthGreg.month,
      birthDay: birthGreg.day,
      appointmentYear: appointmentGreg.year,
      appointmentMonth: appointmentGreg.month,
      appointmentDay: appointmentGreg.day,
      militaryRank: form.militaryRank,
      productKey: form.productKey,
      years: Number(form.years),
      supportType: form.supportType,
      bankConfig: selectedBankCfg,
      rate: rate.annual_rate,
      product: selectedProduct,
    })

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: 'calculate_loan',
          bank_key: form.selectedBank,
          details: {
            bank_name: selectedBankCfg.bank_name,
            product_name: selectedProduct.product_name,
            net_salary: r.netSalary,
            total_loan: r.totalLoan,
            installment: r.monthlyInstallment,
            years: Number(form.years),
          }
        })
      })
    } catch (e) { console.error(e) }

    setResult(r)
    setCalculating(false)
    setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  function resetForm() {
    setBirthDate({ year: '', month: '', day: '', type: 'gregorian' })
    setAppointmentDate({ year: '', month: '', day: '', type: 'gregorian' })
    setForm({
      sector: '', militaryRank: '', basicSalary: '', housingAllowance: '',
      otherAllowances: '', supportType: 'none', productKey: '', years: '', selectedBank: ''
    })
    setResult(null)
    setCurrentStep(1)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">جاري التحميل...</p></div>

  const selectedBankCfg = banks.find(b => b.bank_key === form.selectedBank)

  return (
    <div className="app-bg">
      <nav className="bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏦</span>
          <span className="font-bold text-gray-800">حاسبة القروض البنكية</span>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600 transition">خروج ←</button>
      </nav>

      <div className="max-w-5xl mx-auto p-4 space-y-5">
        {/* Progress Steps */}
        <div className="card !p-5">
          <div className="flex items-center justify-between relative flex-wrap gap-y-3">
            {[
              { num: 1, label: 'البيانات الشخصية', done: !!step1Complete },
              { num: 2, label: 'البيانات الوظيفية', done: !!step2Complete },
              { num: 3, label: 'بيانات الراتب', done: !!step3Complete },
              { num: 4, label: 'المنتج والمدة', done: !!step4Complete },
              { num: 5, label: 'اختيار البنك', done: !!step5Complete },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-2 z-10 bg-white px-2">
                <div className={`step-dot ${
                  currentStep === s.num ? 'step-dot-active' : s.done ? 'step-dot-done' : 'step-dot-pending'
                }`}>
                  {s.done && currentStep !== s.num ? '✓' : s.num}
                </div>
                <span className={`text-xs font-medium text-center ${currentStep === s.num ? 'text-blue-600' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Personal */}
        {currentStep === 1 && (
          <div className="card space-y-4">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">الخطوة 1: البيانات الشخصية</h3>
            <DatePicker label="تاريخ الميلاد" value={birthDate} onChange={setBirthDate} required />
            <button onClick={() => setCurrentStep(2)} disabled={!step1Complete}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              التالي ←
            </button>
          </div>
        )}

        {/* Step 2: Job */}
        {currentStep === 2 && (
          <div className="card space-y-4">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">الخطوة 2: البيانات الوظيفية</h3>
            
            <DatePicker label="تاريخ التعيين" value={appointmentDate} onChange={setAppointmentDate} required />
            
            <div>
              <label className="label">القطاع <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.sector}
                onChange={e => setForm(f => ({ ...f, sector: e.target.value as SectorType, militaryRank: '' }))}>
                <option value="">اختر القطاع</option>
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {form.sector === 'military' && (
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
              <button onClick={() => setCurrentStep(1)} className="btn-secondary flex-1">→ السابق</button>
              <button onClick={() => setCurrentStep(3)} disabled={!step2Complete}
                className="btn-primary flex-1 disabled:opacity-50">التالي ←</button>
            </div>
          </div>
        )}

        {/* Step 3: Salary */}
        {currentStep === 3 && (
          <div className="card space-y-4">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">الخطوة 3: بيانات الراتب</h3>
            
            <div>
              <label className="label">الراتب الأساسي <span className="text-red-500">*</span></label>
              <input type="number" className="input-field" placeholder="0" value={form.basicSalary}
                onChange={e => setForm(f => ({ ...f, basicSalary: e.target.value }))} />
            </div>
            <div>
              <label className="label">بدل السكن</label>
              <input type="number" className="input-field" placeholder="0" value={form.housingAllowance}
                onChange={e => setForm(f => ({ ...f, housingAllowance: e.target.value }))} />
            </div>
            <div>
              <label className="label">البدلات الأخرى</label>
              <input type="number" className="input-field" placeholder="0" value={form.otherAllowances}
                onChange={e => setForm(f => ({ ...f, otherAllowances: e.target.value }))} />
            </div>

            <div className="bg-gradient-to-l from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-700">الراتب الصافي (بعد الاستقطاع)</span>
                <span className="text-xl font-bold text-blue-700">{netSalary.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <p className="text-xs text-blue-600">
                {form.sector === 'civil_private' 
                  ? '(الأساسي + السكن) × 90.25% + البدلات' 
                  : form.sector 
                    ? '(الأساسي × 91%) + البدلات' 
                    : 'اختر القطاع أولاً'}
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setCurrentStep(2)} className="btn-secondary flex-1">→ السابق</button>
              <button onClick={() => setCurrentStep(4)} disabled={!step3Complete}
                className="btn-primary flex-1 disabled:opacity-50">التالي ←</button>
            </div>
          </div>
        )}

        {/* Step 4: Product + Duration */}
        {currentStep === 4 && (
          <div className="card space-y-4">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">الخطوة 4: نوع المنتج والمدة</h3>
            
            <div>
              <label className="label">نوع المنتج <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {products.map(p => (
                  <button key={p.product_key} type="button"
                    onClick={() => setForm(f => ({ ...f, productKey: p.product_key, years: '' }))}
                    className={`text-right p-3 rounded-xl border-2 transition ${
                      form.productKey === p.product_key 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}>
                    <div className="font-semibold text-gray-800 text-sm">{p.product_name}</div>
                    <div className="text-xs text-gray-500 mt-1">{p.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Support type (only if product allows it) */}
            {form.productKey && form.productKey !== 'personal_only' && (
              <div>
                <label className="label">نوع الدعم السكني</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setForm(f => ({ ...f, supportType: 'none' }))}
                    className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition ${
                      form.supportType === 'none' ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-200'
                    }`}>
                    بدون دعم (55%)
                  </button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, supportType: 'monthly' }))}
                    className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition ${
                      form.supportType === 'monthly' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200'
                    }`}>
                    دعم شهري (65%)
                  </button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, supportType: 'package' }))}
                    className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition ${
                      form.supportType === 'package' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200'
                    }`}>
                    دعم باقة (55%)
                  </button>
                </div>
              </div>
            )}

            {form.productKey && (
              <div>
                <label className="label">مدة التمويل <span className="text-red-500">*</span></label>
                <select className="input-field" value={form.years}
                  onChange={e => setForm(f => ({ ...f, years: e.target.value }))}>
                  <option value="">اختر عدد السنوات</option>
                  {availableYears.map(y => <option key={y} value={y}>{y} سنة ({y * 12} شهر)</option>)}
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setCurrentStep(3)} className="btn-secondary flex-1">→ السابق</button>
              <button onClick={() => setCurrentStep(5)} disabled={!step4Complete}
                className="btn-primary flex-1 disabled:opacity-50">التالي ←</button>
            </div>
          </div>
        )}

        {/* Step 5: Bank */}
        {currentStep === 5 && (
          <div className="card space-y-4">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">الخطوة 5: اختر البنك</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {banks.map(b => (
                <button key={b.bank_key}
                  onClick={() => setForm(f => ({ ...f, selectedBank: b.bank_key }))}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                    form.selectedBank === b.bank_key
                      ? 'bg-blue-50 border-blue-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}>
                  <BankLogo bank={b} size={56} />
                  <span className={`text-xs font-medium text-center ${
                    form.selectedBank === b.bank_key ? 'text-blue-700' : 'text-gray-700'
                  }`}>{b.bank_name}</span>
                  {form.selectedBank === b.bank_key && (
                    <span className="absolute top-1 left-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <button onClick={() => setCurrentStep(4)} className="btn-secondary flex-1">→ السابق</button>
              <button onClick={handleCalculate} disabled={!step5Complete || calculating}
                className="btn-primary flex-1 disabled:opacity-50">
                🎯 اعرض مبلغ التمويل المتوقع
              </button>
            </div>
          </div>
        )}

        {/* Calculating */}
        {calculating && (
          <div className="card border-2 border-blue-200 !p-8 text-center">
            <div className="animate-pulse mb-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚙️</span>
              </div>
            </div>
            <p className="font-semibold text-gray-800 mb-4">{calcStage}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-l from-blue-500 to-blue-600 h-full transition-all duration-500"
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
                <p className="text-red-700 font-medium">⚠️ {result.warnings.join(', ')}</p>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-l from-blue-600 to-blue-700 rounded-xl p-5 text-white mb-5 text-center">
                  <p className="text-blue-200 text-sm mb-1">إجمالي التمويل المتوقع</p>
                  <p className="text-4xl font-bold">{formatMoney(result.totalLoan)}</p>
                  <p className="text-blue-200 text-sm mt-1">القسط الشهري: {formatMoney(result.monthlyInstallment)}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">الراتب الصافي</p>
                    <p className="font-bold text-blue-700">{formatMoney(result.netSalary)}</p>
                  </div>
                  {result.realEstateLoan > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">التمويل العقاري</p>
                      <p className="font-bold text-green-700">{formatMoney(result.realEstateLoan)}</p>
                    </div>
                  )}
                  {result.personalLoan > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">التمويل الشخصي</p>
                      <p className="font-bold text-orange-700">{formatMoney(result.personalLoan)}</p>
                    </div>
                  )}
                  {result.packageSupport > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">دعم باقة الدفعة</p>
                      <p className="font-bold text-purple-700">{formatMoney(result.packageSupport)}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">مدة التمويل</p>
                    <p className="font-bold text-gray-700">{result.loanPeriodMonths} شهر</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">نسبة الربح</p>
                    <p className="font-bold text-gray-700">{result.selectedRate}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">حد الاستقطاع</p>
                    <p className="font-bold text-gray-700">{(result.maxDeductionRate * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">المتبقي للتقاعد</p>
                    <p className="font-bold text-gray-700">{Math.floor(result.monthsUntilRetirement / 12)} سنة</p>
                  </div>
                </div>

                {result.warnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 mb-3">
                    {result.warnings.map((w: string, i: number) => <div key={i}>⚠️ {w}</div>)}
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