import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { serverSupabase } from '@/lib/supabase'

export async function GET(_req: NextRequest) {
  const user = await getAuthUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = serverSupabase()
  
  const { data: products } = await db
    .from('loan_products')
    .select('*')
    .order('display_order')
  
  const { data: rates } = await db
    .from('rate_tables')
    .select('*')
    .order('years')

  return NextResponse.json({ 
    products: products || [], 
    rates: rates || [] 
  })
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { product_key, years, annual_rate } = await req.json()
  
  if (!product_key || !years || annual_rate === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const db = serverSupabase()
  
  const { data, error } = await db
    .from('rate_tables')
    .upsert({ 
      product_key, 
      years, 
      annual_rate: parseFloat(annual_rate),
      updated_at: new Date().toISOString() 
    }, { 
      onConflict: 'product_key,years' 
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rate: data })
}