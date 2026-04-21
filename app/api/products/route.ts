import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase } from '@/lib/supabase'

export async function GET(_req: NextRequest) {
  try {
    const db = serverSupabase()
    
    const { data: products } = await db
      .from('loan_products')
      .select('*')
      .eq('enabled', true)
      .order('display_order')
    
    const { data: rates } = await db
      .from('rate_tables')
      .select('product_key, years, annual_rate')
      .order('years')

    return NextResponse.json({ 
      products: products || [], 
      rates: rates || [] 
    })
  } catch (e: any) {
    return NextResponse.json({ products: [], rates: [], error: e.message }, { status: 500 })
  }
}