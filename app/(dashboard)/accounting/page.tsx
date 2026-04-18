import { 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  CreditCard, 
  Scale, 
  BarChart3,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import Link from "next/link"
import { getFinancialSummary, getChartOfAccounts } from "@/lib/actions/accounting"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AccountingPage() {
  const summary = await getFinancialSummary()
  const accounts = await getChartOfAccounts()

  const metrics = [
    { 
      label: "Net Profit", 
      value: `ZMW ${summary?.net_profit.toLocaleString() || '0'}`, 
      trend: "+12.5%", 
      color: "emerald",
      icon: BarChart3,
      desc: "Total revenue minus expenses"
    },
    { 
      label: "Total Assets", 
      value: `ZMW ${summary?.assets.toLocaleString() || '0'}`, 
      trend: "+4.2%", 
      color: "blue",
      icon: Wallet,
      desc: "Cash, bank, and physical assets"
    },
    { 
      label: "Liabilities", 
      value: `ZMW ${summary?.liabilities.toLocaleString() || '0'}`, 
      trend: "-2.1%", 
      color: "orange",
      icon: CreditCard,
      desc: "Debts and payables"
    },
    { 
      label: "Equity", 
      value: `ZMW ${summary?.equity.toLocaleString() || '0'}`, 
      trend: "+8.3%", 
      color: "purple",
      icon: Scale,
      desc: "Owner's residual interest"
    }
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue-deep bg-brand-blue-pale w-fit px-3 py-1 rounded-full">
            <Sparkles className="h-3 w-3" /> Double-Entry Core
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Finance & Accounting</h1>
          <p className="text-slate-700 font-medium">Real-time professional ledger and financial intelligence.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm">
            <Calendar className="h-4 w-4" /> Period: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </button>
          <Link 
            href="/accounting/journals/new"
            className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg hover:shadow-brand-navy/20 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 text-brand-blue-deep" /> New Transaction
          </Link>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className="group relative p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-blue-deep/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 items-center justify-center",
                  m.color === 'emerald' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" :
                  m.color === 'blue' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
                  m.color === 'orange' ? "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white" :
                  "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className={cn(
                  "text-[10px] font-black px-2 py-1 rounded-lg",
                  m.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                )}>
                  {m.trend}
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">{m.label}</p>
              <h3 className="text-2xl font-black text-brand-navy mb-2">{m.value}</h3>
              <p className="text-[10px] text-slate-600 font-medium leading-relaxed">{m.desc}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Core Sections List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-40 w-40 bg-brand-blue-pale rounded-full -mr-20 -mt-20 opacity-50 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-brand-navy">Financial Statements</h2>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-50/80 rounded-xl transition-colors text-slate-600"><Filter className="h-4 w-4" /></button>
                  <button className="p-2 hover:bg-slate-50/80 rounded-xl transition-colors text-slate-600"><Search className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/accounting/ledger" className="group/item p-6 rounded-[28px] border-2 border-slate-200 hover:border-brand-blue-deep/20 hover:bg-brand-blue-pale/30 transition-all">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-navy text-white flex items-center justify-center shadow-lg group-hover/item:bg-brand-blue-deep group-hover/item:scale-110 transition-all">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <span className="font-black text-brand-navy">General Ledger</span>
                  </div>
                  <p className="text-[10px] text-slate-700 font-bold leading-relaxed mb-4">Complete chronological record of all balanced journal entries.</p>
                  <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-brand-blue-deep">
                    View Ledger <ChevronRight className="h-3 w-3 ml-1 group-hover/item:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link href="/accounting/reports" className="group/item p-6 rounded-[28px] border-2 border-slate-200 hover:border-brand-blue-deep/20 hover:bg-brand-blue-pale/30 transition-all">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-navy text-white flex items-center justify-center shadow-lg group-hover/item:bg-brand-blue-deep group-hover/item:scale-110 transition-all">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <span className="font-black text-brand-navy">Profit & Loss</span>
                  </div>
                  <p className="text-[10px] text-slate-700 font-bold leading-relaxed mb-4">Revenue and expense statements for ZRA tax readiness.</p>
                  <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-brand-blue-deep">
                    Generate Report <ChevronRight className="h-3 w-3 ml-1 group-hover/item:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity Mini-Table */}
          <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
            <h2 className="text-lg font-black text-brand-navy mb-6">Recent Journal Postings</h2>
            <div className="space-y-4">
               <div className="flex items-center justify-center h-40 bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-200 italic text-[10px] text-slate-600 font-bold">
                 No recent postings found for this period.
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Chart of Accounts Snippet */}
        <div className="space-y-6">
           <div className="p-8 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 h-32 w-32 bg-brand-blue-deep rounded-full -mr-16 -mb-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue-pale mb-6">Chart of Accounts</h3>
              
              <div className="space-y-4 mb-8">
                 {accounts.slice(0, 6).map(acc => (
                   <div key={acc.id} className="flex items-center justify-between pb-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-slate-600">{acc.code}</span>
                         <span className="text-xs font-bold truncate max-w-[120px]">{acc.name}</span>
                      </div>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                        acc.type === 'asset' || acc.type === 'revenue' ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                      )}>{acc.type}</span>
                   </div>
                 ))}
              </div>

              <Link href="/accounting/accounts" className="flex items-center justify-center gap-2 w-full py-4 bg-brand-blue-deep rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-blue-deep-light transition-all shadow-lg active:scale-95">
                 Manage Accounts <ArrowRight className="h-3 w-3" />
              </Link>
           </div>

           {/* Quick Stats */}
           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6">Cash Flow Radar</h3>
              <div className="space-y-6">
                 <div>
                   <div className="flex justify-between text-xs mb-2">
                     <span className="text-slate-700 font-bold">Inflow Confidence</span>
                     <span className="font-black text-brand-navy">92%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-50/80 rounded-full overflow-hidden">
                     <div className="h-full bg-brand-blue-deep rounded-full" style={{ width: '92%' }} />
                   </div>
                 </div>
                 
                 <div>
                   <div className="flex justify-between text-xs mb-2">
                     <span className="text-slate-700 font-bold">Burn Rate Stability</span>
                     <span className="font-black text-brand-navy">Safe</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-50/80 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }} />
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

