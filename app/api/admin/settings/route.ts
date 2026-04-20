import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { serverSupabase } from '@/lib/supabase'

export async function GET(_req: NextRequest) {
  const user = await getAuthUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = serverSupabase()
  const { data: banks, error } = await db
    .from('bank_settings')
    .select('*')
    .order('bank_name')

  if (error) {
    return NextResponse.json({ error: error.message, banks: [] }, { status: 500 })
  }

  return NextResponse.json({ banks: banks || [] })
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bank_key, ...updates } = await req.json()
  const db = serverSupabase()

  const { data: bank, error } = await db
    .from('bank_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('bank_key', bank_key)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bank })
}