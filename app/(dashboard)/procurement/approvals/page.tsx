import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  UserCheck,
  FileText,
  Banknote,
  Building2,
  Clock,
  Zap,
  MessageSquare,
  Lock,
  Unlock,
  Printer,
  Sparkles,
  Search,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { getRequisitions, approveRequisition, disbursePayment } from "@/lib/actions/procurement"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function ProcurementApprovalsPage() {
  const pending = await getRequisitions('pending')
  const approved = await getRequisitions('all')
  const toPay = approved.filter(r => r.status === 'approved')

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/procurement" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Procurement
          </Link>
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black tracking-tight text-brand-navy">Approval Inbox</h1>
             <span className="px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border-2 border-orange-100">
               {pending.length} Pending Actions
             </span>
          </div>
          <p className="text-slate-700 font-medium">Review, vet, and authorize organizational spending.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-8">
           {/* Section 1: Disbursement (The "Pay" Stage) */}
           {toPay.length > 0 && (
              <div className="space-y-6">
                 <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                    <Banknote className="h-4 w-4" /> Ready for Disbursement
                 </h2>
                 <div className="grid gap-4">
                    {toPay.map((r: any) => (
                      <div key={r.id} className="p-8 bg-emerald-50/30 border-2 border-emerald-100/50 rounded-2xl flex items-center justify-between gap-8 group hover:shadow-xl transition-all duration-500">
                         <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                               <Zap className="h-6 w-6" />
                            </div>
                            <div>
                               <div className="text-lg font-black text-brand-navy leading-tight">{r.title}</div>
                               <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Fully Approved • Vendor: {r.vendor?.name}</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-10">
                            <div className="text-right">
                               <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block mb-1">Total Payout</span>
                               <div className="text-xl font-black text-brand-navy">K {Number(r.total_amount).toLocaleString()}</div>
                            </div>
                            <form action={async () => {
                              "use server"
                              await disbursePayment(r.id)
                            }}>
                               <button 
                                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
                               >Disburse & Register</button>
                            </form>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           )}

           {/* Section 2: Requisition Approvals */}
           <div className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4" /> Requisition Reviews
              </h2>
              {pending.length > 0 ? pending.map((r: any) => (
                <div key={r.id} className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                   <div className="p-8 border-b border-slate-200 bg-slate-50/80/50 flex flex-wrap items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                         <div className="h-16 w-16 rounded-[24px] bg-white border border-slate-200 flex items-center justify-center text-brand-navy font-black text-[10px] shadow-sm">
                            {r.requestor.full_name[0]}
                         </div>
                         <div>
                            <div className="text-lg font-black text-brand-navy leading-tight">{r.title}</div>
                            <div className="flex items-center gap-3 mt-1">
                               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Requested by {r.requestor.full_name}</span>
                               <span className="h-1 w-1 rounded-full bg-slate-200" />
                               <span className="text-[10px] font-black text-brand-green-deep uppercase tracking-widest">L{r.current_level} Pending</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="text-right">
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Total Estimate</span>
                         <div className="text-2xl font-black text-brand-navy">K {Number(r.total_amount).toLocaleString()}</div>
                      </div>
                   </div>

                   <div className="p-10 grid md:grid-cols-[1fr_240px] gap-12">
                      <div className="space-y-8">
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                               <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Preferred Supplier</div>
                               <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                  <Building2 className="h-4 w-4 text-brand-green-deep" /> {r.vendor?.name || "N/A"}
                               </div>
                            </div>
                            <div className="space-y-2 text-right">
                               <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Submission Date</div>
                               <div className="flex items-center justify-end gap-3 text-sm font-bold text-slate-600">
                                  <Clock className="h-4 w-4 text-slate-300" /> {new Date(r.created_at).toLocaleDateString()}
                               </div>
                            </div>
                         </div>

                         <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                  <FileText className="h-5 w-5 text-slate-600" />
                               </div>
                               <span className="text-xs font-bold text-slate-700">View detailed items & specifications</span>
                            </div>
                            <button className="p-2.5 bg-white rounded-xl shadow-sm text-brand-navy hover:text-brand-green-deep transition-all">
                               <ExternalLink className="h-4 w-4" />
                            </button>
                         </div>
                      </div>

                      <div className="space-y-4 flex flex-col justify-end border-l border-slate-200 pl-10">
                         <form action={async (formData) => {
                           "use server"
                           await approveRequisition(r.id, r.current_level, "Audited and approved.")
                         }}>
                            <button className="w-full py-4 bg-brand-navy text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-brand-navy/10 active:scale-[0.98]">
                               Approve L{r.current_level}
                            </button>
                         </form>
                         <button className="w-full py-4 bg-white border-2 border-red-100 text-red-500 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-500 transition-all active:scale-[0.98]">
                            Reject Request
                         </button>
                      </div>
                   </div>
                </div>
              )) : (
                <div className="py-24 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-6">
                   <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                      <CheckCircle2 className="h-10 w-10" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-xl font-black text-brand-navy text-brand-navy">All Caught Up</h3>
                      <p className="text-sm font-medium text-slate-600">Zero pending requisitions awaiting your review.</p>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8 animate-in slide-in-from-right duration-700">
           <div className="p-8 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mt-16 opacity-20" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-8">Governance Map</h3>
              
              <div className="space-y-6 mb-10">
                 <div className="relative pl-8 border-l-2 border-white/10 space-y-8">
                    <div className="relative">
                       <div className="absolute -left-[37px] top-0 h-4 w-4 rounded-full bg-brand-green-deep shadow-[0_0_10px_rgba(34,197,94,1)]" />
                       <div className="text-[11px] font-black uppercase text-brand-green-deep">L1: Supervisor</div>
                       <div className="text-[10px] opacity-40">Initial Vet & Validity</div>
                    </div>
                    <div className="relative">
                       <div className="absolute -left-[37px] top-0 h-4 w-4 rounded-full bg-white/20" />
                       <div className="text-[11px] font-black uppercase opacity-60">L2: Finance Dept</div>
                       <div className="text-[10px] opacity-40">Budget & VAT Compliance</div>
                    </div>
                    <div className="relative opacity-40">
                       <div className="absolute -left-[37px] top-0 h-4 w-4 rounded-full bg-white/20" />
                       <div className="text-[11px] font-black uppercase">L3: Final/Director</div>
                       <div className="text-[10px]">High-Value Authorization</div>
                    </div>
                 </div>
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                 <ShieldCheck className="h-4 w-4 text-brand-green-deep" />
                 <span className="text-[10px] font-bold opacity-60 italic">Audit Trial Log Active</span>
              </div>
           </div>

           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6 flex items-center gap-2">
                 <Sparkles className="h-4 w-4 text-brand-green-deep" /> Spend Intelligence
              </h3>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <div className="text-xs font-black text-brand-navy mb-1">Budget Confidence</div>
                    <div className="text-[10px] text-slate-700 font-medium">Your current pending requests are within the K250k quarterly budget.</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function ExternalLink(props: any) {
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
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

