import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { serverSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { secret, username, password } = await req.json()

    if (secret !== process.env.ADMIN_INIT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const db = serverSupabase()

    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const request_id = `ADMIN-${Date.now()}`

    const { error } = await db.from('users').insert({
      username,
      password_hash,
      request_id,
      role: 'admin',
      status: 'approved',
      full_name: 'Admin',
      approved_at: new Date().toISOString(),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: 'Admin created successfully'
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}