import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  ArrowLeft,
  Calendar,
  MoreVertical,
  Plus,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import Link from "next/link"
import { getLedgerEntries } from "@/lib/actions/accounting"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function LedgerPage() {
  const journals = await getLedgerEntries()

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
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">General Ledger</h1>
          <p className="text-slate-700 font-medium">Full audit trail of all balanced financial postings.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const headers = "Date,Description,Reference,Total Amount\n";
              const rows = journals.map(j => `${new Date(j.date).toLocaleDateString('en-GB')},"${j.description}",${j.reference_no || ''},${j.ledger_entries.reduce((acc: any, e: any) => e.entry_type === 'debit' ? acc + Number(e.amount) : acc, 0)}`).join("\n");
              const blob = new Blob([headers + rows], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.setAttribute('hidden', '');
              a.setAttribute('href', url);
              a.setAttribute('download', 'general_ledger.csv');
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm"
          >
            <Download className="h-5 w-5" />
          </button>
          <Link 
            href="/accounting/journals/new" 
            className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 text-brand-blue-deep" /> New Entry
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-brand-blue-deep transition-colors" />
              <input 
                type="text" 
                placeholder="Search descriptions, refs..." 
                className="pl-11 pr-5 py-2.5 text-xs border-2 border-slate-200 rounded-xl focus:border-brand-blue-deep focus:outline-none bg-slate-50/80 lg:w-[300px] font-bold transition-all"
              />
           </div>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-white hover:border-slate-300 transition-all">
             <Filter className="h-4 w-4" /> Filters
           </button>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
           Showing <span className="text-brand-navy">{journals.length}</span> Postings
        </div>
      </div>

      {/* Ledger Table */}
      <div className="space-y-6">
        {journals.length > 0 ? journals.map((journal) => (
          <div key={journal.id} className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="p-6 bg-slate-50/80/50 flex flex-wrap items-center justify-between gap-6 border-b border-slate-200">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-navy font-black text-xs shadow-sm">
                     {new Date(journal.date).getDate()}
                  </div>
                  <div>
                     <div className="text-sm font-black text-brand-navy">{journal.description}</div>
                     <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{new Date(journal.date).toLocaleDateString('en-GB')}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] text-brand-blue-deep font-black uppercase tracking-widest">Ref: {journal.reference_no || 'N/A'}</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-6">
                  <div className="text-right">
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-0.5">Amount</span>
                     <div className="text-base font-black text-brand-navy">
                        ZMW {journal.ledger_entries.reduce((acc: any, e: any) => e.entry_type === 'debit' ? acc + Number(e.amount) : acc, 0).toLocaleString()}
                     </div>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-brand-navy hover:bg-white rounded-lg transition-all">
                     <MoreVertical className="h-5 w-5" />
                  </button>
               </div>
            </div>

            <div className="px-8 py-6">
               <div className="grid grid-cols-[1fr_120px_120px] gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mb-4 px-2">
                  <span>Account Detail</span>
                  <span className="text-right">Debit</span>
                  <span className="text-right">Credit</span>
               </div>
               
               <div className="space-y-3">
                  {journal.ledger_entries.map((entry: any) => (
                    <div key={entry.id} className="grid grid-cols-[1fr_120px_120px] gap-8 items-center py-1 group/line">
                       <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-5 w-1 rounded-full",
                            entry.entry_type === 'debit' ? "bg-emerald-500" : "bg-brand-navy/20"
                          )} />
                          <div>
                            <span className="text-[11px] font-black text-slate-600 mr-2">{(entry.accounts as any).code}</span>
                            <span className="text-xs font-bold text-slate-700">{(entry.accounts as any).name}</span>
                          </div>
                       </div>
                       
                       <div className="text-right text-[11px] font-black text-emerald-600">
                          {entry.entry_type === 'debit' ? `ZMW ${Number(entry.amount).toLocaleString()}` : '—'}
                       </div>
                       
                       <div className="text-right text-[11px] font-black text-brand-navy">
                          {entry.entry_type === 'credit' ? `ZMW ${Number(entry.amount).toLocaleString()}` : '—'}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-2xl space-y-4">
             <div className="h-16 w-16 rounded-[24px] bg-slate-50/80 flex items-center justify-center text-slate-300">
                <Receipt className="h-8 w-8" />
             </div>
             <p className="text-sm font-bold text-slate-600 italic">No ledger entries found for this organization.</p>
             <Link 
               href="/accounting/journals/new" 
               className="text-xs font-black uppercase tracking-widest text-brand-blue-deep flex items-center gap-2 hover:gap-3 transition-all"
             >
               Post Your First Journal <ArrowRightLeft className="h-3 w-3" />
             </Link>
          </div>
        )}
      </div>

      {/* Safety Reminder */}
      <div className="p-8 bg-brand-blue-pale border-2 border-brand-blue-deep/10 rounded-2xl flex items-start gap-5">
         <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            <Sparkles className="h-5 w-5 text-brand-blue-deep" />
         </div>
         <div className="space-y-1">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-blue-deep">Industrial Integrity</h4>
            <p className="text-[10px] text-brand-navy/60 font-medium leading-relaxed max-w-2xl">
               Every entry shown here has been validated for balance. Modifying a ledger entry directly is prohibited; audit-compliant corrections should be made via adjustment journals.
            </p>
         </div>
      </div>
    </div>
  )
}

function ArrowRightLeft(props: any) {
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
      <path d="m16 3 4 4-4 4" />
      <path d="M20 7H4" />
      <path d="m8 21-4-4 4-4" />
      <path d="M4 17h16" />
    </svg>
  )
}

