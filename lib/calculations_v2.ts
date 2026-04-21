import { MILITARY_RANKS, BankConfig } from './calculations'

export interface LoanProduct {
  product_key: string
  product_name: string
  description: string
  max_deduction_rate: number
  min_years: number
  max_years: number
  enabled: boolean
}

export interface RateTable {
  product_key: string
  years: number
  annual_rate: number
}

export type SupportType = 'none' | 'monthly' | 'package'
export type SectorType = 'civil_government' | 'civil_private' | 'military'

export interface LoanInputV2 {
  // Salary
  basicSalary: number
  housingAllowance: number
  otherAllowances: number
  sector: SectorType
  
  // Birth (Gregorian)
  birthYear: number
  birthMonth: number
  birthDay: number
  
  // Employment (Gregorian)
  appointmentYear: number
  appointmentMonth: number
  appointmentDay: number
  militaryRank?: string
  
  // Product
  productKey: string
  years: number
  supportType: SupportType
  
  // From DB
  bankConfig: BankConfig
  rate: number // from rate_tables
  product: LoanProduct
}

export interface LoanResultV2 {
  // Salary breakdown
  grossSalary: number
  deduction: number
  netSalary: number
  
  // Loan
  maxInstallment: number
  maxDeductionRate: number
  selectedRate: number
  loanPeriodMonths: number
  realEstateLoan: number
  personalLoan: number
  packageSupport: number
  totalLoan: number
  
  // Installment
  monthlyInstallment: number
  
  // Retirement check
  monthsUntilRetirement: number
  canApply: boolean
  warnings: string[]
}

// حساب صافي الراتب حسب القطاع
export function calculateNetSalary(
  basicSalary: number,
  housingAllowance: number,
  otherAllowances: number,
  sector: SectorType
): { gross: number; deduction: number; net: number } {
  const gross = basicSalary + housingAllowance + otherAllowances
  let deduction = 0
  let net = 0

  if (sector === 'civil_private') {
    // القطاع الخاص: (الأساسي + السكن) × 0.9025 + البدلات
    const baseAndHousing = basicSalary + housingAllowance
    deduction = baseAndHousing * 0.0975
    net = baseAndHousing * 0.9025 + otherAllowances
  } else {
    // الحكومي/العسكري: (الأساسي - 9%) + البدلات
    deduction = basicSalary * 0.09
    net = basicSalary * 0.91 + housingAllowance + otherAllowances
  }

  return {
    gross: Math.round(gross),
    deduction: Math.round(deduction),
    net: Math.round(net),
  }
}

// تحديد حد الاستقطاع حسب نوع الدعم
export function getMaxDeductionRate(supportType: SupportType): number {
  switch (supportType) {
    case 'monthly': return 0.65   // دعم شهري: 65%
    case 'package': return 0.55   // دعم باقة: 55%
    case 'none':
    default:        return 0.55   // بدون دعم: 55%
  }
}

// حساب دعم باقة الدفعة الأولى
export function getPackageSupport(netSalary: number): number {
  return netSalary < 10000 ? 150000 : 100000
}

// صيغة PMT العكسية: حساب مبلغ التمويل من القسط
export function calculateLoanFromInstallment(
  monthlyInstallment: number,
  annualRate: number,
  months: number
): number {
  if (monthlyInstallment <= 0 || months <= 0) return 0
  
  const monthlyRate = annualRate / 100 / 12
  
  if (monthlyRate === 0) {
    return Math.floor(monthlyInstallment * months)
  }
  
  // PV = PMT × [(1 - (1+r)^-n) / r]
  const loanAmount = monthlyInstallment * (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate
  return Math.floor(loanAmount)
}

// الدالة الرئيسية للحساب
export function calculateLoanV2(input: LoanInputV2): LoanResultV2 {
  const warnings: string[] = []
  
  // 1. حساب الصافي
  const { gross, deduction, net } = calculateNetSalary(
    input.basicSalary,
    input.housingAllowance,
    input.otherAllowances,
    input.sector
  )
  
  // 2. حد الاستقطاع
  const maxDeductionRate = input.productKey === 'personal_only' 
    ? 0.33 
    : getMaxDeductionRate(input.supportType)
  
  const maxInstallment = Math.floor(net * maxDeductionRate)
  
  // 3. حساب المتبقي للتقاعد
  const retirementAge = input.sector === 'military' 
    ? (MILITARY_RANKS.find(r => r.value === input.militaryRank)?.retirementAge ?? 52)
    : 60
  
  const today = new Date()
  const birthDate = new Date(input.birthYear, input.birthMonth - 1, input.birthDay)
  const retirementDate = new Date(input.birthYear + retirementAge, input.birthMonth - 1, input.birthDay)
  const monthsUntilRetirement = Math.max(0, Math.floor(
    (retirementDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  ))
  
  // 4. مدة التمويل (لا تتجاوز التقاعد ولا السنوات المطلوبة)
  const requestedMonths = input.years * 12
  const loanPeriodMonths = Math.min(requestedMonths, monthsUntilRetirement)
  
  if (loanPeriodMonths < requestedMonths) {
    warnings.push(`تم تقليل مدة التمويل إلى ${Math.floor(loanPeriodMonths / 12)} سنة بسبب قرب التقاعد`)
  }
  
  if (loanPeriodMonths <= 0) {
    return {
      grossSalary: gross,
      deduction,
      netSalary: net,
      maxInstallment: 0,
      maxDeductionRate,
      selectedRate: input.rate,
      loanPeriodMonths: 0,
      realEstateLoan: 0,
      personalLoan: 0,
      packageSupport: 0,
      totalLoan: 0,
      monthlyInstallment: 0,
      monthsUntilRetirement: 0,
      canApply: false,
      warnings: ['وصلت أو تجاوزت سن التقاعد'],
    }
  }
  
  // 5. حساب التمويل بصيغة PMT العكسية
  let realEstateLoan = 0
  let personalLoan = 0
  let packageSupport = 0
  let monthlyInstallment = maxInstallment
  
  // الشخصي فقط
  if (input.productKey === 'personal_only') {
    const personalMonths = Math.min(loanPeriodMonths, 5 * 12)
    personalLoan = calculateLoanFromInstallment(maxInstallment, input.rate, personalMonths)
  } 
  // العقاري فقط
  else if (input.productKey === 'real_estate_only') {
    realEstateLoan = calculateLoanFromInstallment(maxInstallment, input.rate, loanPeriodMonths)
  }
  // عقاري + دعم دفعة
  else if (input.productKey === 'real_estate_down') {
    realEstateLoan = calculateLoanFromInstallment(maxInstallment, input.rate, loanPeriodMonths)
    packageSupport = getPackageSupport(net)
  }
  // عقاري + شخصي (2في1)
  else if (input.productKey === 'real_estate_personal') {
    // نقسم القسط: 80% للعقاري، 20% للشخصي (يمكن تعديل)
    const personalInstallment = maxInstallment * 0.2
    const realEstateInstallment = maxInstallment * 0.8
    const personalMonths = Math.min(loanPeriodMonths, 5 * 12)
    
    personalLoan = calculateLoanFromInstallment(personalInstallment, input.rate, personalMonths)
    realEstateLoan = calculateLoanFromInstallment(realEstateInstallment, input.rate, loanPeriodMonths)
  }
  // 3في1
  else if (input.productKey === 'real_estate_3in1') {
    const personalInstallment = maxInstallment * 0.2
    const realEstateInstallment = maxInstallment * 0.8
    const personalMonths = Math.min(loanPeriodMonths, 5 * 12)
    
    personalLoan = calculateLoanFromInstallment(personalInstallment, input.rate, personalMonths)
    realEstateLoan = calculateLoanFromInstallment(realEstateInstallment, input.rate, loanPeriodMonths)
    packageSupport = getPackageSupport(net)
  }
  
  const totalLoan = realEstateLoan + personalLoan + packageSupport
  
  return {
    grossSalary: gross,
    deduction,
    netSalary: net,
    maxInstallment,
    maxDeductionRate,
    selectedRate: input.rate,
    loanPeriodMonths,
    realEstateLoan,
    personalLoan,
    packageSupport,
    totalLoan,
    monthlyInstallment,
    monthsUntilRetirement,
    canApply: true,
    warnings,
  }
}

export function formatMoney(n: number): string {
  return n.toLocaleString('ar-SA') + ' ر.س'
}