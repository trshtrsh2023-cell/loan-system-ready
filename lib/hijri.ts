/**
 * مكتبة تحويل التواريخ بين الهجري والميلادي
 * Hijri <-> Gregorian converter
 */

// تحويل من ميلادي إلى هجري (تقريبي)
export function gregorianToHijri(year: number, month: number, day: number): { year: number; month: number; day: number } {
  const jd = gregorianToJD(year, month, day)
  return jdToHijri(jd)
}

// تحويل من هجري إلى ميلادي
export function hijriToGregorian(year: number, month: number, day: number): { year: number; month: number; day: number } {
  const jd = hijriToJD(year, month, day)
  return jdToGregorian(jd)
}

// Julian Day Number helpers
function gregorianToJD(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1
    month += 12
  }
  const a = Math.floor(year / 100)
  const b = 2 - a + Math.floor(a / 4)
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5
}

function jdToGregorian(jd: number): { year: number; month: number; day: number } {
  jd = Math.floor(jd + 0.5)
  const a = jd + 32044
  const b = Math.floor((4 * a + 3) / 146097)
  const c = a - Math.floor(146097 * b / 4)
  const d = Math.floor((4 * c + 3) / 1461)
  const e = c - Math.floor(1461 * d / 4)
  const m = Math.floor((5 * e + 2) / 153)
  const day = e - Math.floor((153 * m + 2) / 5) + 1
  const month = m + 3 - 12 * Math.floor(m / 10)
  const year = 100 * b + d - 4800 + Math.floor(m / 10)
  return { year, month, day }
}

function hijriToJD(year: number, month: number, day: number): number {
  return Math.floor((11 * year + 3) / 30) + 354 * year + 30 * month - Math.floor((month - 1) / 2) + day + 1948440 - 385
}

function jdToHijri(jd: number): { year: number; month: number; day: number } {
  jd = Math.floor(jd) + 0.5
  const year = Math.floor((30 * (jd - 1948439.5) + 10646) / 10631)
  const month = Math.min(12, Math.ceil((jd - (29 + hijriToJD(year, 1, 1))) / 29.5) + 1)
  const day = Math.floor(jd - hijriToJD(year, month, 1)) + 1
  return { year, month, day }
}

// أسماء الأشهر
export const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
]

export const GREGORIAN_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

// تنسيق التاريخ للعرض
export function formatHijri(d: { year: number; month: number; day: number }): string {
  return `${d.day} ${HIJRI_MONTHS[d.month - 1]} ${d.year}هـ`
}

export function formatGregorian(d: { year: number; month: number; day: number }): string {
  return `${d.day} ${GREGORIAN_MONTHS[d.month - 1]} ${d.year}م`
}

// حساب العمر بالسنوات من تاريخ ميلادي
export function calculateAgeFromGregorian(birthYear: number, birthMonth: number, birthDay: number): number {
  const today = new Date()
  let age = today.getFullYear() - birthYear
  const monthDiff = (today.getMonth() + 1) - birthMonth
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--
  }
  return age
}

// حساب الأشهر المتبقية للتقاعد
export function monthsUntilRetirement(
  birthYear: number, birthMonth: number, birthDay: number,
  retirementAge: number
): number {
  const today = new Date()
  const retirementDate = new Date(birthYear + retirementAge, birthMonth - 1, birthDay)
  const diffMs = retirementDate.getTime() - today.getTime()
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))
  return Math.max(0, diffMonths)
}