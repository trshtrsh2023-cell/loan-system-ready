'use client'
import { useRouter } from 'next/navigation'

export default function PendingPage() {
  const router = useRouter()
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">طلبك قيد المراجعة</h2>
        <p className="text-gray-500 text-sm mb-6">
          تم استلام طلبك وسيتم مراجعته من قِبَل المسؤول. يرجى التواصل معه لتفعيل حسابك.
        </p>
        <button onClick={logout} className="btn-secondary w-full">تسجيل الخروج</button>
      </div>
    </div>
  )
}
