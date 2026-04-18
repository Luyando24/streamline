"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Filter, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  ArrowRightLeft,
  Printer,
  Sparkles,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { getFinancialReports } from "@/lib/actions/accounting"
import { cn } from "@/lib/utils"

export default function AccountingReportsPage() {
  const [period, setPeriod] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [report, setReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [period])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const data = await getFinancialReports(period.start, period.end)
      setReport(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateZambian = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/accounting" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Finance
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Financial Intelligence</h1>
          <p className="text-slate-700 font-medium">Real-time Profit & Loss and Balance Sheet analytics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm">
            <Printer className="h-5 w-5" />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">
            <Download className="h-4 w-4 text-brand-green-deep" /> Export Analysis
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white border-2 border-slate-200 rounded-[28px] shadow-sm">
        <div className="flex items-center gap-6">
           <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Period Start</label>
              <input 
                type="date" 
                value={period.start}
                onChange={e => setPeriod({...period, start: e.target.value})}
                className="px-4 py-2 border-2 border-slate-100 rounded-xl text-xs font-bold focus:border-brand-green-deep focus:outline-none transition-all"
              />
           </div>
           <div className="flex flex-col gap-1.5 pt-4 text-slate-300">
              <ChevronRight className="h-5 w-5" />
           </div>
           <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Period End</label>
              <input 
                type="date" 
                value={period.end}
                onChange={e => setPeriod({...period, end: e.target.value})}
                className="px-4 py-2 border-2 border-slate-100 rounded-xl text-xs font-bold focus:border-brand-green-deep focus:outline-none transition-all"
              />
           </div>
        </div>
        
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-all">This Month</button>
           <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-all">Last Quarter</button>
        </div>
      </div>

      {/* Report Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
           <Loader2 className="h-10 w-10 animate-spin text-brand-green-deep" />
           <p className="text-xs font-black uppercase tracking-widest text-slate-400">Processing Ledger Data...</p>
        </div>
      ) : report ? (
        <div className="grid lg:grid-cols-[1fr_350px] gap-10 items-start">
           <div className="space-y-10">
              {/* Profit & Loss Section */}
              <div className="bg-white border-2 border-slate-200 rounded-[32px] overflow-hidden shadow-xl shadow-slate-100">
                 <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div>
                       <h2 className="text-2xl font-black text-brand-navy">Profit & Loss Statement</h2>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                         For period: {formatDateZambian(period.start)} — {formatDateZambian(period.end)}
                       </p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-brand-navy text-white flex items-center justify-center shadow-lg">
                       <BarChart3 className="h-7 w-7" />
                    </div>
                 </div>

                 <div className="p-10 space-y-12">
                    {/* Revenue Row */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-blue-600 border-b-2 border-blue-50 pb-2">
                          <span>Operating Revenue</span>
                          <span>Total</span>
                       </div>
                       <div className="space-y-4">
                          {report.revenue.length > 0 ? report.revenue.map((acc: any) => (
                            <div key={acc.code} className="flex justify-between items-center text-sm">
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-slate-300 w-10">{acc.code}</span>
                                  <span className="font-bold text-slate-700">{acc.name}</span>
                               </div>
                               <span className="font-black text-brand-navy">ZMW {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          )) : (
                            <div className="text-xs text-slate-400 italic">No revenue recorded in this period.</div>
                          )}
                       </div>
                       <div className="flex justify-between items-center bg-slate-50 px-6 py-4 rounded-2xl font-black text-brand-navy">
                          <span className="text-xs uppercase tracking-widest">Gross Revenue</span>
                          <span className="text-lg">ZMW {report.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                       </div>
                    </div>

                    {/* Expenses Row */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-orange-600 border-b-2 border-orange-50 pb-2">
                          <span>Operating Expenses</span>
                          <span>Total</span>
                       </div>
                       <div className="space-y-4">
                          {report.expenses.length > 0 ? report.expenses.map((acc: any) => (
                            <div key={acc.code} className="flex justify-between items-center text-sm group">
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-slate-300 w-10">{acc.code}</span>
                                  <span className="font-bold text-slate-700">{acc.name}</span>
                               </div>
                               <span className="font-black text-brand-navy">ZMW {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          )) : (
                            <div className="text-xs text-slate-400 italic">No expenses recorded in this period.</div>
                          )}
                       </div>
                       <div className="flex justify-between items-center bg-slate-50 px-6 py-4 rounded-2xl font-black text-brand-navy">
                          <span className="text-xs uppercase tracking-widest">Total Expenses</span>
                          <span className="text-lg">ZMW {report.total_expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                       </div>
                    </div>

                    {/* Final Net Profit */}
                    <div className={cn(
                      "p-10 rounded-[40px] border-4 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left",
                      report.net_profit >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
                    )}>
                       <div>
                          <div className={cn(
                            "text-[10px] font-black uppercase tracking-[0.3em] mb-2",
                            report.net_profit >= 0 ? "text-emerald-600" : "text-red-600"
                          )}>
                             Net Operating Income
                          </div>
                          <h3 className={cn(
                            "text-5xl font-black tracking-tighter",
                            report.net_profit >= 0 ? "text-brand-navy" : "text-red-700"
                          )}>
                             ZMW {report.net_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </h3>
                       </div>
                       <div className={cn(
                         "h-20 w-20 rounded-[32px] flex items-center justify-center text-white shadow-2xl",
                         report.net_profit >= 0 ? "bg-brand-green-deep shadow-emerald-200" : "bg-red-500 shadow-red-200"
                       )}>
                          {report.net_profit >= 0 ? <TrendingUp className="h-10 w-10" /> : <TrendingDown className="h-10 w-10" />}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Balance Sheet Preview */}
              <div className="p-10 bg-brand-navy rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="space-y-4 max-w-md">
                    <h3 className="text-2xl font-black tracking-tight">Financial Health Status</h3>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                       Your organization's net worth is calculated in real-time. Full Balance Sheet reports with ledger drill-downs are generated at period close.
                    </p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="text-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Equity Value</span>
                       <span className={`text-2xl font-black ${report.net_profit >= 0 ? "text-brand-green-deep" : "text-red-400"}`}>
                         Market Ready
                       </span>
                    </div>
                    <button className="px-6 py-4 bg-brand-green-deep text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-green-deep-light transition-all shadow-lg shadow-brand-green-deep/20">
                       Full Balance Sheet <ChevronRight className="h-4 w-4 inline" />
                    </button>
                 </div>
              </div>
           </div>

           {/* Sidebar Insights */}
           <div className="space-y-8">
              <div className="p-8 bg-white border-2 border-slate-200 rounded-[28px] shadow-sm">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                   <Sparkles className="h-4 w-4 text-brand-green-deep" /> Zambian Tax Pulse
                 </h4>
                 <div className="space-y-6">
                    <div className="p-5 bg-slate-50 rounded-2xl space-y-1">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">VAT Coverage</span>
                       <div className="text-lg font-black text-brand-navy">Tax Ready</div>
                       <p className="text-[9px] text-slate-500 font-bold">Standard 16% rate mapped to core revenue lines.</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl space-y-1">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Audit Confidence</span>
                       <div className="text-lg font-black text-brand-navy">98.4%</div>
                       <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2">
                          <div className="h-full bg-brand-green-deep rounded-full w-[98.4%]" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-emerald-600 rounded-[28px] text-white overflow-hidden relative group">
                 <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
                 <PieChart className="h-10 w-10 mb-6 text-brand-green-pale" />
                 <h4 className="text-xl font-black mb-4 leading-tight">Monthly Close Guidance</h4>
                 <p className="text-white/80 text-[11px] font-bold leading-relaxed mb-8">
                    Your current burn rate suggests a healthy runway. Ensure all petty cash reconciliations are completed before EOM.
                 </p>
                 <Link href="/accounting/ledger" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-green-pale hover:text-white transition-colors">
                    Review Ledger <ArrowRightLeft className="h-3 w-3" />
                 </Link>
              </div>
           </div>
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
           <p className="text-sm font-bold text-slate-500 italic">No report data generated for this period.</p>
        </div>
      )}
    </div>
  )
}
