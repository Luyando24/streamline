import { 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  FileText, 
  Lock, 
  Unlock,
  Sparkles,
  Banknote,
  ShieldCheck,
  CreditCard,
  Zap,
  Printer
} from "lucide-react"
import Link from "next/link"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { finalizePayrollRun } from "@/lib/actions/payroll"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

async function getPayrollRun(id: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
      },
    }
  )

  const { data: run } = await supabase
    .from('payroll_runs')
    .select(`
      *,
      payslips (
        *,
        employee:profiles (full_name, email)
      )
    `)
    .eq('id', id)
    .single()

  return run
}

export default async function PayrollRunPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const run = await getPayrollRun(id)

  if (!run) return <div>Run not found</div>

  const isFinalized = run.status === 'finalized'
  const totals = run.payslips.reduce((acc: any, p: any) => {
    acc.gross += Number(p.basic_pay)
    acc.paye += Number(p.paye_tax)
    acc.napsa += Number(p.napsa_deduction)
    acc.nhima += Number(p.nhima_deduction)
    acc.net += Number(p.net_pay)
    return acc
  }, { gross: 0, paye: 0, napsa: 0, nhima: 0, net: 0 })

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/payroll" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Payroll
          </Link>
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black tracking-tight text-brand-navy">Payroll Run</h1>
             <span className={cn(
               "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2",
               isFinalized ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-orange-50 border-orange-100 text-orange-700"
             )}>
               {run.status}
             </span>
          </div>
          <p className="text-slate-500 font-medium">Period: {run.month}/{run.year} • {run.payslips.length} Payslips Generated</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-brand-navy transition-all">
            <Printer className="h-5 w-5" />
          </button>
          {!isFinalized ? (
            <form action={async () => {
              "use server"
              await finalizePayrollRun(id)
            }}>
              <button 
                type="submit"
                className="flex items-center gap-2 px-8 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
              >
                <Lock className="h-4 w-4 text-brand-green-deep" /> Finalize & Post Ledger
              </button>
            </form>
          ) : (
            <Link 
              href={`/accounting/ledger`}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
            >
              <CheckCircle2 className="h-4 w-4" /> View in Ledger
            </Link>
          )}
        </div>
      </div>

      {/* Totals Summary Card */}
      <div className="bg-brand-navy p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 h-40 w-40 bg-brand-green-deep rounded-full -mr-20 -mt-20 opacity-20 transition-transform group-hover:scale-150 duration-700" />
         
         <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="space-y-4">
               <div className="text-[10px] font-black uppercase tracking-widest text-brand-green-pale">Gross Wage Bill</div>
               <div className="text-2xl font-black">ZMW {totals.gross.toLocaleString()}</div>
            </div>
            <div className="space-y-4">
               <div className="text-[10px] font-black uppercase tracking-widest text-orange-200/60">PAYE Liability</div>
               <div className="text-2xl font-black">ZMW {totals.paye.toLocaleString()}</div>
            </div>
            <div className="space-y-4">
               <div className="text-[10px] font-black uppercase tracking-widest text-blue-200/60">NAPSA Total</div>
               <div className="text-2xl font-black">ZMW {totals.napsa.toLocaleString()}</div>
            </div>
            <div className="space-y-4">
               <div className="text-[10px] font-black uppercase tracking-widest text-purple-200/60">NHIMA Total</div>
               <div className="text-2xl font-black">ZMW {totals.nhima.toLocaleString()}</div>
            </div>
            <div className="space-y-4 border-l border-white/10 pl-10">
               <div className="text-[10px] font-black uppercase tracking-widest text-brand-green-deep">Net Disbursement</div>
               <div className="text-2xl font-black text-brand-green-deep">ZMW {totals.net.toLocaleString()}</div>
            </div>
         </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-white border-2 border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
         <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-black text-brand-navy">Detailed Payslips</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
               <Sparkles className="h-3 w-3 text-brand-green-deep" /> Zambian Statutory Calculations applied
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-slate-50">
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Employee</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Basic</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">PAYE</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Statutory</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Net Pay</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400"></th>
                  </tr>
               </thead>
               <tbody>
                  {run.payslips.map((p: any) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-brand-navy font-black text-[10px]">
                                {p.employee.full_name.split(' ').map((n: string) => n[0]).join('')}
                             </div>
                             <div>
                                <div className="text-sm font-black text-brand-navy">{p.employee.full_name}</div>
                                <div className="text-[10px] font-semibold text-slate-400">{p.employee.email}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-right font-bold text-slate-600 text-sm">
                          ZMW {Number(p.basic_pay).toLocaleString()}
                       </td>
                       <td className="px-8 py-5 text-right font-black text-orange-600 text-sm">
                          ZMW {Number(p.paye_tax).toLocaleString()}
                       </td>
                       <td className="px-8 py-5 text-right text-sm">
                          <div className="font-bold text-slate-600">ZMW {(Number(p.napsa_deduction) + Number(p.nhima_deduction)).toLocaleString()}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">NAPSA + NHIMA</div>
                       </td>
                       <td className="px-8 py-5 text-right font-black text-brand-green-deep text-sm">
                          ZMW {Number(p.net_pay).toLocaleString()}
                       </td>
                       <td className="px-8 py-5 text-right">
                          <button className="p-2 text-slate-300 hover:text-brand-navy transition-all opacity-0 group-hover:opacity-100">
                             <FileText className="h-5 w-5" />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Accountability Banner */}
      <div className={cn(
        "p-10 rounded-[48px] flex items-start gap-8 border-2 transition-all",
        isFinalized ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"
      )}>
         <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            {isFinalized ? <Sparkles className="h-8 w-8 text-emerald-600" /> : <Zap className="h-8 w-8 text-brand-navy" />}
         </div>
         <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-widest text-brand-navy">
               {isFinalized ? "Ledger Posting Finalized" : "Ready for Ledger Posting"}
            </h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
               {isFinalized 
                 ? "This payroll run has been locked and posted to the General Ledger. The financial impact is now reflected in your profit & loss and balance sheet statements."
                 : "Finalizing this run will calculate net payouts and statutory obligations. Streamline will automatically create a balanced double-entry journal posting for your financial records."}
            </p>
         </div>
      </div>
    </div>
  )
}
