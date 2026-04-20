export const MILITARY_RANKS = [
  { value: 'جندي', label: 'جندي', retirementAge: 44 },
  { value: 'عريف', label: 'عريف', retirementAge: 49 },
  { value: 'وكيل رقيب', label: 'وكيل رقيب', retirementAge: 50 },
  { value: 'رقيب', label: 'رقيب / رقيب أول / رئيس رقباء', retirementAge: 52 },
  { value: 'ملازم', label: 'ملازم / ملازم أول', retirementAge: 48 },
  { value: 'نقيب', label: 'نقيب', retirementAge: 53 },
  { value: 'رائد', label: 'رائد', retirementAge: 55 },
  { value: 'مقدم', label: 'مقدم', retirementAge: 57 },
  { value: 'عقيد', label: 'عقيد', retirementAge: 58 },
  { value: 'عميد', label: 'عميد', retirementAge: 60 },
  { value: 'لواء', label: 'لواء', retirementAge: 62 },
]

export interface BankConfig {
  bank_key: string
  bank_name: string
  name?: string
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

export interface LoanInput {
  basicSalary: number
  housingAllowance: number
  otherAllowances: number
  netSalary: number
  birthYear: number
  appointmentYear: number
  jobType: 'civil_government' | 'civil_private' | 'military'
  militaryRank?: string
  sakaniSupport: boolean
  bankConfig: BankConfig
}

export interface LoanResult {
  loanAmount: number
  sakaniAmount: number
  totalLoan: number
  installment: number
  periodMonths: number
  periodYears: number
  effectiveMultiplier: number
  remainingMonthsToRetirement: number
  retirementAge: number
  annualRate: number
  totalProfit: number
  totalWithProfit: number
  canApply: boolean
  note?: string
}

export function getRetirementAge(jobType: string, militaryRank?: string): number {
  if (jobType === 'military') {
    const rank = MILITARY_RANKS.find(r => r.value === militaryRank)
    return rank?.retirementAge ?? 52
  }
  return 60
}

export function calculateLoan(input: LoanInput): LoanResult {
  const currentYear = new Date().getFullYear()
  const cfg = input.bankConfig

  const currentAge = currentYear - input.birthYear
  const retirementAge = getRetirementAge(input.jobType, input.militaryRank)
  const yearsToRetirement = retirementAge - currentAge
  const monthsToRetirement = Math.max(0, yearsToRetirement * 12)

  const maxPeriod = Math.min(monthsToRetirement, cfg.max_period_months)

  if (maxPeriod <= 0) {
    return {
      loanAmount: 0, sakaniAmount: 0, totalLoan: 0,
      installment: 0, periodMonths: 0, periodYears: 0,
      effectiveMultiplier: 0, remainingMonthsToRetirement: 0,
      retirementAge, annualRate: cfg.annual_rate,
      totalProfit: 0, totalWithProfit: 0,
      canApply: false, note: 'وصل أو تجاوز سن التقاعد'
    }
  }

  // Effective multiplier — proportional reduction if < 60 months remaining
  const effectiveMultiplier = maxPeriod >= cfg.max_period_months
    ? cfg.personal_multiplier
    : parseFloat((cfg.personal_multiplier * (maxPeriod / cfg.max_period_months)).toFixed(2))

  const baseLoan = Math.floor(input.netSalary * effectiveMultiplier)

  let sakaniAmount = 0
  if (input.sakaniSupport) {
    sakaniAmount = input.netSalary < cfg.sakani_low_threshold
      ? cfg.sakani_low_support
      : cfg.sakani_high_support
  }

  const totalLoan = baseLoan + sakaniAmount

  // Installment using PMT formula
  const monthlyRate = cfg.annual_rate / 100 / 12
  let installment: number
  let totalProfit: number

  if (monthlyRate > 0) {
    const factor = Math.pow(1 + monthlyRate, maxPeriod)
    installment = Math.ceil(totalLoan * monthlyRate * factor / (factor - 1))
    totalProfit = Math.round(installment * maxPeriod - totalLoan)
  } else {
    installment = Math.ceil(totalLoan / maxPeriod)
    totalProfit = 0
  }

  const totalWithProfit = installment * maxPeriod

  // Verify affordability (installment should not exceed deduction_rate of salary)
  const maxAllowedInstallment = Math.floor(input.netSalary * cfg.deduction_rate)
  const note = installment > maxAllowedInstallment
    ? `القسط الشهري ${installment.toLocaleString('ar-SA')} ر.س يتجاوز نسبة الاستقطاع المسموحة`
    : undefined

  return {
    loanAmount: baseLoan,
    sakaniAmount,
    totalLoan,
    installment,
    periodMonths: maxPeriod,
    periodYears: parseFloat((maxPeriod / 12).toFixed(1)),
    effectiveMultiplier,
    remainingMonthsToRetirement: monthsToRetirement,
    retirementAge,
    annualRate: cfg.annual_rate,
    totalProfit,
    totalWithProfit,
    canApply: true,
    note
  }
}

export function formatMoney(n: number) {
  return n.toLocaleString('ar-SA') + ' ر.س'
}
