import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase } from '@/lib/supabase'

export async function GET(_req: NextRequest) {
  try {
    const db = serverSupabase()
    const { data: banks, error } = await db
      .from('bank_settings')
      .select('*')
      .eq('enabled', true)
      .order('bank_name')
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ banks: [], error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ banks: banks || [] })
  } catch (e: any) {
    console.error('Banks API error:', e)
    return NextResponse.json({ banks: [], error: e.message }, { status: 500 })
  }
}