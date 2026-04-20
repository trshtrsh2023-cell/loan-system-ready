import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { serverSupabase } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { status } = await req.json()
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
  }

  const db = serverSupabase()
  const { data } = await db
    .from('users')
    .update({ 
      status, 
      approved_at: status === 'approved' ? new Date().toISOString() : null 
    })
    .eq('id', params.id)
    .select()
    .single()

  return NextResponse.json({ user: data })
}
