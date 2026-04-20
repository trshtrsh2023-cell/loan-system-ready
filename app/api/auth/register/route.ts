import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { serverSupabase } from '@/lib/supabase'

function generateRequestId() {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `REQ-${ts}-${rand}`
}

export async function POST(req: NextRequest) {
  const { username, password, full_name, phone } = await req.json()

  if (!username || !password) return NextResponse.json({ error: 'الرجاء إدخال اسم المستخدم وكلمة المرور' }, { status: 400 })
  if (username.length < 3) return NextResponse.json({ error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' }, { status: 400 })

  const db = serverSupabase()
  const { data: existing } = await db.from('users').select('id').eq('username', username).single()
  if (existing) return NextResponse.json({ error: 'اسم المستخدم مستخدم مسبقاً' }, { status: 400 })

  const password_hash = await bcrypt.hash(password, 10)
  const request_id = generateRequestId()

  const { data, error } = await db.from('users').insert({
    username, password_hash, request_id,
    full_name: full_name || null,
    phone: phone || null,
    status: 'pending', role: 'user'
  }).select('request_id').single()

  if (error) return NextResponse.json({ error: 'خطأ في إنشاء الحساب' }, { status: 500 })

  return NextResponse.json({ request_id: data.request_id })
}
