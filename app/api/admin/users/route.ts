import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { serverSupabase } from '@/lib/supabase'

export async function GET(_req: NextRequest) {
  const user = await getAuthUser()
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const db = serverSupabase()
  const { data: users } = await db
    .from('users')
    .select('*')
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  return NextResponse.json({ users })
}
