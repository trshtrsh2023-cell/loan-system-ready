import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { serverSupabase } from '@/lib/supabase'
import { signToken, COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  if (!username || !password) return NextResponse.json({ error: 'أدخل اسم المستخدم وكلمة المرور' }, { status: 400 })

  const db = serverSupabase()
  const { data: user } = await db.from('users').select('*').eq('username', username).single()
  if (!user) return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 })

  const token = await signToken({ id: user.id, username: user.username, role: user.role, status: user.status, request_id: user.request_id })

  const res = NextResponse.json({ role: user.role, status: user.status })
  res.cookies.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
  return res
}
