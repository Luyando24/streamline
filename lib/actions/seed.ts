"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}

export async function seedDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return

  const orgId = profile.org_id

  // Check if transactions already exist
  const { count } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('org_id', orgId)
  if (count && count > 0) return { message: "Data already seeded" }

  const transactions = []
  const categories = ['Sales', 'Consultancy', 'Subscriptions', 'Rent', 'Payroll', 'Utilities', 'Marketing']
  
  // Seed last 6 months
  for (let i = 0; i < 6; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    
    // 5-8 income transactions per month
    const incomeCount = 5 + Math.floor(Math.random() * 3)
    for (let j = 0; j < incomeCount; j++) {
      transactions.push({
        org_id: orgId,
        type: 'income',
        category: categories[Math.floor(Math.random() * 3)],
        amount: 2000 + Math.floor(Math.random() * 15000),
        description: `Customer payment #${j}`,
        created_at: new Date(d.getFullYear(), d.getMonth(), 5 + Math.floor(Math.random() * 20)).toISOString()
      })
    }

    // 4-6 expense transactions per month
    const expenseCount = 4 + Math.floor(Math.random() * 2)
    for (let j = 0; j < expenseCount; j++) {
      transactions.push({
        org_id: orgId,
        type: 'expense',
        category: categories[3 + Math.floor(Math.random() * 4)],
        amount: 500 + Math.floor(Math.random() * 8000),
        description: `Vendor payment #${j}`,
        created_at: new Date(d.getFullYear(), d.getMonth(), 5 + Math.floor(Math.random() * 20)).toISOString()
      })
    }
  }

  const { error } = await supabase.from('transactions').insert(transactions)
  if (error) throw error

  return { message: "Dashboard seeded successfully" }
}
