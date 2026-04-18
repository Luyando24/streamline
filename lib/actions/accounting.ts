"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function getChartOfAccounts() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return []

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('code', { ascending: true })

  return accounts || []
}

export async function initializeDefaultAccounts(orgId: string) {
  const supabase = await getSupabase()
  
  const defaultAccounts = [
    // ASSETS
    { code: '1000', name: 'Petty Cash', type: 'asset', normal_balance: 'debit', is_system: true },
    { code: '1010', name: 'Cash at Bank', type: 'asset', normal_balance: 'debit', is_system: true },
    { code: '1200', name: 'Accounts Receivable', type: 'asset', normal_balance: 'debit', is_system: true },
    { code: '1500', name: 'Inventory', type: 'asset', normal_balance: 'debit', is_system: true },
    
    // LIABILITIES
    { code: '2000', name: 'Accounts Payable', type: 'liability', normal_balance: 'credit', is_system: true },
    { code: '2100', name: 'ZRA VAT Payable', type: 'liability', normal_balance: 'credit', is_system: true },
    { code: '2200', name: 'NAPSA/NHIMA Payable', type: 'liability', normal_balance: 'credit', is_system: true },
    
    // EQUITY
    { code: '3000', name: 'Retained Earnings', type: 'equity', normal_balance: 'credit', is_system: true },
    { code: '3100', name: 'Owner Investment', type: 'equity', normal_balance: 'credit', is_system: true },
    
    // REVENUE
    { code: '4000', name: 'Sales Revenue', type: 'revenue', normal_balance: 'credit', is_system: true },
    { code: '4100', name: 'Service Income', type: 'revenue', normal_balance: 'credit', is_system: true },
    
    // EXPENSES
    { code: '5000', name: 'Cost of Goods Sold', type: 'expense', normal_balance: 'debit', is_system: true },
    { code: '6000', name: 'Office Rent', type: 'expense', normal_balance: 'debit', is_system: true },
    { code: '6100', name: 'Salaries & Wages', type: 'expense', normal_balance: 'debit', is_system: true },
    { code: '6200', name: 'Utilities', type: 'expense', normal_balance: 'debit', is_system: true },
  ]

  const accountsWithOrg = defaultAccounts.map(acc => ({ ...acc, org_id: orgId }))

  const { error } = await supabase.from('accounts').upsert(accountsWithOrg, { onConflict: 'org_id,code' })
  if (error) throw error
  
  return { success: true }
}

export async function postJournalEntry(formData: {
  date: string,
  description: string,
  reference_no?: string,
  entries: { account_id: string, amount: number, entry_type: 'debit' | 'credit' }[]
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) throw new Error("No organization found")

  // Use the RPC for atomic balanced posting
  const { data: journalId, error } = await supabase.rpc('post_balanced_journal', {
    p_org_id: profile.org_id,
    p_date: formData.date,
    p_description: formData.description,
    p_reference_no: formData.reference_no,
    p_entries: formData.entries
  })

  if (error) throw new Error(error.message)

  revalidatePath('/accounting')
  return { success: true, id: journalId }
}

export async function getFinancialSummary() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return null

  // Fetch balances by account type for a quick overview
  const { data: ledgerImpact } = await supabase
    .from('ledger_entries')
    .select(`
      amount,
      entry_type,
      accounts!inner (
        type
      )
    `)
    .eq('accounts.org_id', profile.org_id)

  const summary = {
    assets: 0,
    liabilities: 0,
    equity: 0,
    revenue: 0,
    expenses: 0,
    net_profit: 0
  }

  ledgerImpact?.forEach(entry => {
    const type = (entry.accounts as any).type as keyof typeof summary
    const val = Number(entry.amount)
    
    // Calculate based on accounting principles
    if (entry.entry_type === 'debit') {
      if (['asset', 'expense'].includes(type)) summary[type] += val
      else summary[type] -= val
    } else {
      if (['liability', 'equity', 'revenue'].includes(type)) summary[type] += val
      else summary[type] -= val
    }
  })

  summary.net_profit = summary.revenue - summary.expenses

  return summary
}

export async function getLedgerEntries() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return []

  const { data: journals } = await supabase
    .from('journal_entries')
    .select(`
      *,
      ledger_entries (
        id,
        amount,
        entry_type,
        accounts (
          code,
          name
        )
      )
    `)
    .eq('org_id', profile.org_id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  return journals || []
}

export async function createAccount(data: { code: string, name: string, type: string, normal_balance: 'debit' | 'credit', description?: string }) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) throw new Error("No organization found")

  const { error } = await supabase
    .from('accounts')
    .insert([{ ...data, org_id: profile.org_id }])

  if (error) throw new Error(error.message)
  
  revalidatePath('/accounting/accounts')
  return { success: true }
}

export async function updateAccount(id: string, data: any) {
  const supabase = await getSupabase()
  const { error } = await supabase
    .from('accounts')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/accounting/accounts')
  return { success: true }
}

export async function deleteAccount(id: string) {
  const supabase = await getSupabase()
  
  // Check if system account
  const { data: account } = await supabase.from('accounts').select('is_system').eq('id', id).single()
  if (account?.is_system) throw new Error("System accounts cannot be deleted")

  // Check if has ledger entries
  const { data: hasEntries } = await supabase.from('ledger_entries').select('id').eq('account_id', id).limit(1)
  if (hasEntries && hasEntries.length > 0) throw new Error("Cannot delete account with existing transactions")

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/accounting/accounts')
  return { success: true }
}

export async function getFinancialReports(periodStart: string, periodEnd: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return null

  // Fetch all ledger entries in period joined with account type
  const { data: entries } = await supabase
    .from('ledger_entries')
    .select(`
      amount,
      entry_type,
      journal_entries!inner(date),
      accounts!inner(code, name, type)
    `)
    .eq('accounts.org_id', profile.org_id)
    .gte('journal_entries.date', periodStart)
    .lte('journal_entries.date', periodEnd)

  const report = {
    revenue: [] as any[],
    expenses: [] as any[],
    net_profit: 0,
    total_revenue: 0,
    total_expenses: 0
  }

  const accountMap: Record<string, any> = {}

  entries?.forEach(e => {
    const acc = e.accounts as any
    const key = acc.code
    if (!accountMap[key]) {
      accountMap[key] = { code: acc.code, name: acc.name, type: acc.type, balance: 0 }
    }
    
    const val = Number(e.amount)
    if (acc.type === 'revenue') {
      accountMap[key].balance += e.entry_type === 'credit' ? val : -val
    } else if (acc.type === 'expense') {
      accountMap[key].balance += e.entry_type === 'debit' ? val : -val
    }
  })

  Object.values(accountMap).forEach((acc: any) => {
    if (acc.type === 'revenue') {
      report.revenue.push(acc)
      report.total_revenue += acc.balance
    } else if (acc.type === 'expense') {
      report.expenses.push(acc)
      report.total_expenses += acc.balance
    }
  })

  report.net_profit = report.total_revenue - report.total_expenses

  return report
}
