'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [requestId, setRequestId] = useState('')

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [regForm, setRegForm] = useState({
    username: '', password: '', confirmPassword: '',
    full_name: '', phone: ''
  })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'خطأ في تسجيل الدخول')
    if (data.role === 'admin') router.push('/admin')
    else if (data.status === 'approved') router.push('/calculator')
    else router.push('/pending')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (regForm.password !== regForm.confirmPassword) return setError('كلمتا المرور غير متطابقتين')
    if (regForm.password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: regForm.username, password: regForm.password, full_name: regForm.full_name, phone: regForm.phone })
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'خطأ في التسجيل')
    setRequestId(data.request_id)
  }

  if (requestId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">تم التسجيل بنجاح!</h2>
          <p className="text-gray-600 mb-4">رقم طلبك هو:</p>
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-4">
            <span className="text-2xl font-bold text-blue-700 tracking-widest">{requestId}</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">احتفظ بهذا الرقم وأرسله للمسؤول للموافقة على حسابك.</p>
          <button onClick={() => { setRequestId(''); setTab('login') }} className="btn-primary w-full">
            الذهاب لتسجيل الدخول
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-3 shadow-lg">
            <span className="text-3xl">🏦</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">حاسبة القروض البنكية</h1>
          <p className="text-gray-500 text-sm mt-1">البنوك السعودية</p>
        </div>

        <div className="card">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${tab === t ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                {t === 'login' ? 'تسجيل الدخول' : 'حساب جديد'}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              ⚠️ {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">اسم المستخدم</label>
                <input className="input-field" placeholder="أدخل اسم المستخدم" value={loginForm.username}
                  onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} required />
              </div>
              <div>
                <label className="label">كلمة المرور</label>
                <input type="password" className="input-field" placeholder="••••••" value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'جاري الدخول...' : 'دخول'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">الاسم الكامل</label>
                  <input className="input-field" placeholder="محمد أحمد" value={regForm.full_name}
                    onChange={e => setRegForm({ ...regForm, full_name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">رقم الجوال</label>
                  <input className="input-field" placeholder="05xxxxxxxx" value={regForm.phone}
                    onChange={e => setRegForm({ ...regForm, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">اسم المستخدم</label>
                <input className="input-field" placeholder="يُستخدم للدخول لاحقاً" value={regForm.username}
                  onChange={e => setRegForm({ ...regForm, username: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">كلمة المرور</label>
                  <input type="password" className="input-field" placeholder="••••••" value={regForm.password}
                    onChange={e => setRegForm({ ...regForm, password: e.target.value })} required />
                </div>
                <div>
                  <label className="label">تأكيد كلمة المرور</label>
                  <input type="password" className="input-field" placeholder="••••••" value={regForm.confirmPassword}
                    onChange={e => setRegForm({ ...regForm, confirmPassword: e.target.value })} required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'جاري التسجيل...' : 'إنشاء حساب'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
