import { 
  Users, 
  Banknote, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Play, 
  CheckCircle2, 
  History, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Search,
  Zap,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { getEmployeePayrollProfiles, createPayrollRun } from "@/lib/actions/payroll"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function PayrollPage() {
  const employees = await getEmployeePayrollProfiles()
  
  const activeHeadcount = employees.filter(e => e.employee_profiles?.is_active).length
  const totalMonthlyWage = employees
    .filter(e => e.employee_profiles?.is_active)
    .reduce((acc, e) => acc + Number(e.employee_profiles?.basic_salary || 0), 0)

  const stats = [
    { label: "Active Headcount", value: activeHeadcount, icon: Users, color: "blue", desc: "Total staff on payroll" },
    { label: "Monthly Wage bill", value: `ZMW ${totalMonthlyWage.toLocaleString()}`, icon: Banknote, color: "emerald", desc: "Before taxes & benefits" },
    { label: "Statutory Deductions", value: `~ZMW ${(totalMonthlyWage * 0.15).toLocaleString()}`, icon: ShieldCheck, color: "orange", desc: "Est. PAYE + Social" },
    { label: "Pending Repsonses", value: "0", icon: History, color: "purple", desc: "Requires admin review" }
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-deep bg-brand-green-pale w-fit px-3 py-1 rounded-full">
            <Zap className="h-3 w-3" /> Statutory Compliance
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Payroll Management</h1>
          <p className="text-slate-700 font-medium">Automated Zambian payroll with ZRA, NAPSA, and NHIMA integration.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/payroll/employees" 
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm"
          >
            <Users className="h-4 w-4" /> Setup Employees
          </Link>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">
            <Play className="h-4 w-4 text-brand-green-deep fill-brand-green-deep" /> Process April Payroll
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="group p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-green-deep/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                  s.color === 'emerald' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" :
                  s.color === 'blue' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
                  s.color === 'orange' ? "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white" :
                  "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">{s.label}</p>
              <h3 className="text-2xl font-black text-brand-navy mb-2">{s.value}</h3>
              <p className="text-[10px] text-slate-600 font-medium leading-relaxed">{s.desc}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Process Area */}
        <div className="lg:col-span-2 space-y-8">
           <div className="p-10 bg-white border-2 border-slate-200 rounded-2xl shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-64 w-64 bg-brand-green-pale rounded-full -mr-32 -mt-32 opacity-30 group-hover:scale-110 transition-transform duration-1000" />
              
              <div className="relative z-10 grid md:grid-cols-[1.5fr_1fr] gap-12 items-center">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <h2 className="text-2xl font-black text-brand-navy">April 2026 Payroll Run</h2>
                       <p className="text-sm font-medium text-slate-600 leading-relaxed">
                          Your team is ready for month-end processing. All {activeHeadcount} active employees will have their payslips generated with automated tax calculations.
                       </p>
                    </div>

                    <div className="flex items-center gap-4">
                       <div className="flex -space-x-3">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="h-10 w-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                               E{i}
                            </div>
                          ))}
                       </div>
                       <div className="text-[11px] font-bold text-slate-700">
                          + {activeHeadcount - 4} others ready to process
                       </div>
                    </div>

                    <button className="group/btn flex items-center justify-center gap-3 px-8 py-4 bg-brand-navy text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-brand-navy/10 active:scale-[0.98]">
                       Start April Run <ChevronRight className="h-4 w-4 text-brand-green-deep group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                 </div>

                 <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Statutory Health</div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                          <span className="text-xs font-bold text-slate-600">PAYE Bands</span>
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">2024 V1</span>
                       </div>
                       <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                          <span className="text-xs font-bold text-slate-600">NAPSA Cap</span>
                          <span className="text-xs font-black text-brand-navy">ZMW 1,424</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-600">NHIMA Rate</span>
                          <span className="text-xs font-black text-brand-navy">1.0%</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Runs History */}
           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-brand-navy">Payroll History</h2>
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors">View All</button>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-center h-48 bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-200 italic text-[10px] text-slate-600 font-bold">
                   No payroll runs recorded for this organization yet.
                </div>
             </div>
           </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="p-8 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mb-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-6">Accounting Sync</h3>
              <p className="text-xs font-medium opacity-60 leading-relaxed mb-8">
                 When you finalize a payroll run, Streamline automatically posts the salary expenses and tax payables to your general ledger.
              </p>
              
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4 mb-8">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold opacity-60">Status</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-brand-green-deep">
                       <CheckCircle2 className="h-3 w-3" /> Connected
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="opacity-60">Ledger Balance</span>
                    <span>Ready</span>
                 </div>
              </div>

              <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-brand-green-pale">
                 <ShieldCheck className="h-4 w-4" /> Balanced Entry Guaranteed
              </div>
           </div>

           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6">Payroll Breakdown</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-xs mb-2">
                       <span className="text-slate-700 font-bold">Net Salaries</span>
                       <span className="font-black text-brand-navy">~78%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50/80 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-green-deep rounded-full" style={{ width: '78%' }} />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs mb-2">
                       <span className="text-slate-700 font-bold">Tax & Statutory</span>
                       <span className="font-black text-brand-navy">~22%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50/80 rounded-full overflow-hidden">
                       <div className="h-full bg-orange-500 rounded-full" style={{ width: '22%' }} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

