import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { serverSupabase } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { bank: string } }) {
  const user = await getAuthUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const updates = await req.json()
  const db = serverSupabase()
  
  const { data: bank, error } = await db
    .from('bank_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('bank_key', params.bank)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bank })
}