"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { postJournalEntry } from "./accounting"

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

/**
 * Zambian Tax Logic (2024/2025 Bands)
 * @param grossPay Total taxable income
 * @returns Object with PAYE, NAPSA, and NHIMA calculations
 */
export async function calculateZambianTax(basicSalary: number, allowances: number = 0) {
  const grossPay = basicSalary + allowances

  // 1. NAPSA (5% of Gross, Capped at ZMW 1,424.40 for 2024)
  const napsaRate = 0.05
  const napsaCap = 1424.40
  const napsa = Math.min(grossPay * napsaRate, napsaCap)

  // 2. NHIMA (1% of Basic Salary)
  const nhima = basicSalary * 0.01

  // 3. PAYE (Calculated on Taxable Income: Gross - NAPSA)
  const taxableIncome = grossPay - napsa
  let paye = 0

  if (taxableIncome > 9200) {
    paye += (taxableIncome - 9200) * 0.37
    paye += (9200 - 7100) * 0.30
    paye += (7100 - 5100) * 0.20
  } else if (taxableIncome > 7100) {
    paye += (taxableIncome - 7100) * 0.30
    paye += (7100 - 5100) * 0.20
  } else if (taxableIncome > 5100) {
    paye += (taxableIncome - 5100) * 0.20
  }

  return {
    napsa: Number(napsa.toFixed(2)),
    nhima: Number(nhima.toFixed(2)),
    paye: Number(paye.toFixed(2)),
    netPay: Number((grossPay - napsa - nhima - paye).toFixed(2))
  }
}

export async function getEmployeePayrollProfiles() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return []

  // Fetch all members of the org and their payroll profiles
  const { data: members } = await supabase
    .from('organization_members')
    .select(`
      profile_id,
      profiles (
        full_name,
        email
      ),
      employee_profiles (*)
    `)
    .eq('org_id', profile.org_id)

  return members || []
}

export async function updateEmployeePayrollProfile(profileId: string, data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) throw new Error("No organization found")

  const { error } = await supabase
    .from('employee_profiles')
    .upsert({
      id: profileId,
      org_id: profile.org_id,
      ...data
    })

  if (error) throw error
  revalidatePath('/payroll/employees')
}

export async function createPayrollRun(month: number, year: number) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) throw new Error("No organization found")

  // 1. Create the Run
  const { data: run, error: runError } = await supabase
    .from('payroll_runs')
    .insert({
      org_id: profile.org_id,
      month,
      year,
      status: 'draft'
    })
    .select()
    .single()

  if (runError) throw runError

  // 2. Fetch all active employee profiles
  const { data: employees } = await supabase
    .from('employee_profiles')
    .select('*')
    .eq('org_id', profile.org_id)
    .eq('is_active', true)

  if (!employees || employees.length === 0) throw new Error("No active employees found")

  // 3. Generate Payslips
  const payslips = await Promise.all(employees.map(async (emp) => {
    const tax = await calculateZambianTax(Number(emp.basic_salary))
    return {
      run_id: run.id,
      employee_id: emp.id,
      basic_pay: emp.basic_salary,
      napsa_deduction: tax.napsa,
      nhima_deduction: tax.nhima,
      paye_tax: tax.paye,
      net_pay: tax.netPay
    }
  }))

  const { error: payslipError } = await supabase.from('payslips').insert(payslips)
  if (payslipError) throw payslipError

  revalidatePath('/payroll')
  return run
}

export async function finalizePayrollRun(runId: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) throw new Error("No organization found")

  // 1. Fetch the Run and Payslips
  const { data: run } = await supabase.from('payroll_runs').select('*').eq('id', runId).single()
  const { data: payslips } = await supabase.from('payslips').select('*').eq('run_id', runId)

  if (!run || !payslips) throw new Error("Payroll run data not found")

  // 2. Aggregate totals for the ledger posting
  const totals = payslips.reduce((acc, p) => {
    acc.basic += Number(p.basic_pay)
    acc.paye += Number(p.paye_tax)
    acc.napsa += Number(p.napsa_deduction)
    acc.nhima += Number(p.nhima_deduction)
    acc.net += Number(p.net_pay)
    return acc
  }, { basic: 0, paye: 0, napsa: 0, nhima: 0, net: 0 })

  // 3. Get Account IDs for posting (Industrial Standard: using standard codes)
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, code')
    .eq('org_id', profile.org_id)

  const getAccId = (code: string) => accounts?.find(a => a.code === code)?.id
  
  if (!getAccId('6100') || !getAccId('2100') || !getAccId('2200')) {
    throw new Error("Required accounting codes (6100, 2100, 2200) not found. Please ensure Finance module is active.")
  }

  // 4. Post to General Ledger
  const journalResult = await postJournalEntry({
    date: new Date().toISOString().split('T')[0],
    description: `Payroll Finalization: ${run.month}/${run.year}`,
    reference_no: `PAY-RUN-${runId.substring(0, 8)}`,
    entries: [
      { account_id: getAccId('6100')!, amount: totals.basic, entry_type: 'debit' }, // Salary Expense
      { account_id: getAccId('2100')!, amount: totals.paye, entry_type: 'credit' }, // PAYE Payable
      { account_id: getAccId('2200')!, amount: totals.napsa + totals.nhima, entry_type: 'credit' }, // NAPSA/NHIMA Payable
      { account_id: getAccId('1010')!, amount: totals.net, entry_type: 'credit' } // Cash/Bank (Payment)
    ]
  })

  // 5. Update Run Status
  await supabase
    .from('payroll_runs')
    .update({ 
      status: 'finalized',
      journal_entry_id: journalResult.id
    })
    .eq('id', runId)

  revalidatePath('/payroll')
  return { success: true }
}
