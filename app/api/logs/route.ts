import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { serverSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action_type, bank_key, details } = await req.json()
    const db = serverSupabase()

    await db.from('activity_logs').insert({
      user_id: user.id,
      username: user.username,
      action_type,
      bank_key,
      details,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = serverSupabase()
    const { data: logs, error } = await db
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) return NextResponse.json({ error: error.message, logs: [] }, { status: 500 })

    return NextResponse.json({ logs: logs || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, logs: [] }, { status: 500 })
  }
}