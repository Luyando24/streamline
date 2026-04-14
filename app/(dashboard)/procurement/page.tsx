import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  Building2, 
  BarChart3, 
  FileText, 
  Users, 
  Wallet,
  Zap,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
  ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { getRequisitions } from "@/lib/actions/procurement"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function ProcurementPage() {
  const requisitions = await getRequisitions('all')
  const myRequisitions = await getRequisitions('my')
  const pending = await getRequisitions('pending')

  const stats = [
    { label: "Active Requisitions", value: pending.length, icon: Clock, color: "orange", desc: "Awaiting approval levels" },
    { label: "Vetted Suppliers", value: "12", icon: Building2, color: "blue", desc: "Pre-approved for procurement" },
    { label: "Total Spend (MTD)", value: "K 142k", icon: Wallet, color: "emerald", desc: "Month-to-date disbursement" },
    { label: "Audit Level", value: "Triple", icon: ShieldCheck, color: "purple", desc: "Supervisor + Finance + Director" }
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-deep bg-brand-green-pale w-fit px-3 py-1 rounded-full">
            <Zap className="h-3 w-3" /> Enterprise Governance
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Procurement</h1>
          <p className="text-slate-500 font-medium">Multi-level approval workflows and automated spend management.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/procurement/vendors" 
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm"
          >
            <Building2 className="h-4 w-4" /> Vendors
          </Link>
          <Link 
            href="/procurement/new"
            className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 text-brand-green-deep" /> New Requisition
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="group p-6 bg-white border-2 border-slate-100 rounded-[32px] hover:border-brand-green-deep/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
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
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
              <h3 className="text-2xl font-black text-brand-navy mb-2">{s.value}</h3>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{s.desc}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Process Area */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border-2 border-slate-100 rounded-[48px] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                 <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
                    <History className="h-5 w-5 text-brand-green-deep" /> Spend Activity
                 </h2>
                 <div className="flex gap-2">
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-navy transition-all"><Search className="h-4 w-4" /></button>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-navy transition-all"><Filter className="h-4 w-4" /></button>
                 </div>
              </div>

              <div className="p-4">
                 {requisitions.length > 0 ? (
                   <div className="space-y-3">
                      {requisitions.slice(0, 5).map((r: any) => (
                        <div key={r.id} className="group p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-slate-50 rounded-[32px] transition-all">
                           <div className="flex items-center gap-6">
                              <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-brand-navy font-black text-[10px] shadow-sm group-hover:scale-110 transition-transform">
                                 {r.title[0]}
                              </div>
                              <div className="space-y-1">
                                 <h3 className="text-base font-black text-brand-navy leading-tight">{r.title}</h3>
                                 <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.requestor.full_name}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-black text-brand-green-deep uppercase tracking-widest">{r.vendor?.name || "No Vendor"}</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-12">
                              <div className="text-right">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Cost</span>
                                 <div className="text-base font-black text-brand-navy">ZMW {Number(r.total_amount).toLocaleString()}</div>
                              </div>
                              <div className={cn(
                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2",
                                r.status === 'paid' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                r.status === 'rejected' ? "bg-red-50 border-red-100 text-red-600" :
                                "bg-orange-50 border-orange-100 text-orange-600"
                              )}>
                                 {r.status.replace('_', ' ')}
                              </div>
                              <Link href={`/procurement/approvals`} className="p-2 text-slate-300 hover:text-brand-navy transition-all">
                                 <ChevronRight className="h-5 w-5" />
                              </Link>
                           </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="h-20 w-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200">
                         <ShoppingBag className="h-10 w-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-brand-navy italic opacity-60">No requisitions recorded yet.</p>
                        <Link href="/procurement/new" className="text-xs font-black uppercase tracking-widest text-brand-green-deep flex items-center gap-2 hover:gap-3 transition-all justify-center">
                           Create Your First Request <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar Mini-Analysis */}
        <div className="space-y-8">
           <div className="p-10 bg-brand-navy rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mb-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-8">Approval Inbox</h3>
              
              <div className="space-y-6 mb-10">
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold opacity-60">Pending Finance</span>
                    <span className="text-xs font-black">2 Requests</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold opacity-60">Pending Director</span>
                    <span className="text-xs font-black text-orange-400">1 Urgent</span>
                 </div>
              </div>

              <Link 
                href="/procurement/approvals" 
                className="flex items-center justify-center gap-2 w-full py-4 bg-brand-green-deep rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-green-deep-light shadow-xl transition-all shadow-brand-green-deep/20 active:scale-95"
              >
                Go to Approvals <ArrowRight className="h-3 w-3" />
              </Link>
           </div>

           <div className="p-8 bg-white border-2 border-slate-100 rounded-[40px] shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                 <Sparkles className="h-4 w-4 text-brand-green-deep" /> Supplier Reliability
              </h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-xs mb-2">
                       <span className="text-slate-500 font-bold">Zambian Tech Hub</span>
                       <span className="font-black text-brand-navy">98%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-green-deep" style={{ width: '98%' }} />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs mb-2">
                       <span className="text-slate-500 font-bold">Lusaka Stationery</span>
                       <span className="font-black text-brand-navy">82%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: '82%' }} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function History(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}
