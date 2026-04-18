"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  X,
  Calendar as CalendarIcon,
  ChevronRight,
  ArrowRightLeft,
  Search,
  Filter,
  Receipt,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { getChartOfAccounts, postJournalEntry } from "@/lib/actions/accounting"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface EntryLine {
  account_id: string
  amount: string
  entry_type: 'debit' | 'credit'
}

export default function NewJournalPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState("")
  const [reference, setReference] = useState("")
  const [entries, setEntries] = useState<EntryLine[]>([
    { account_id: "", amount: "", entry_type: "debit" },
    { account_id: "", amount: "", entry_type: "credit" }
  ])

  useEffect(() => {
    getChartOfAccounts().then(setAccounts)
  }, [])

  const addLine = () => {
    setEntries([...entries, { account_id: "", amount: "", entry_type: "debit" }])
  }

  const removeLine = (index: number) => {
    if (entries.length <= 2) return
    setEntries(entries.filter((_, i) => i !== index))
  }

  const updateLine = (index: number, field: keyof EntryLine, value: string) => {
    const newEntries = [...entries]
    newEntries[index] = { ...newEntries[index], [field]: value }
    setEntries(newEntries)
  }

  const totalDebits = entries
    .filter(e => e.entry_type === 'debit')
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0)

  const totalCredits = entries
    .filter(e => e.entry_type === 'credit')
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0)

  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0

  const handlePost = async () => {
    if (!isBalanced) {
      toast.error("Journal entry must be balanced (Debits = Credits)")
      return
    }

    if (!description) {
      toast.error("Please provide a description")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        date,
        description,
        reference_no: reference,
        entries: entries.map(e => ({
          account_id: e.account_id,
          amount: parseFloat(e.amount),
          entry_type: e.entry_type
        }))
      }

      await postJournalEntry(payload)
      toast.success("Industry-standard journal entry posted successfully")
      
      // Reset
      setDescription("")
      setReference("")
      setEntries([
        { account_id: "", amount: "", entry_type: "debit" },
        { account_id: "", amount: "", entry_type: "credit" }
      ])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-green-deep">
             <ArrowRightLeft className="h-3.5 w-3.5" /> High-Precision Posting
          </div>
          <h1 className="text-3xl font-black tracking-tight text-brand-navy">New Journal Entry</h1>
          <p className="text-slate-600 text-xs font-bold font-medium">Record a professional double-entry transaction.</p>
        </div>

        <div className={cn(
          "px-6 py-3 rounded-2xl flex items-center gap-4 transition-all border-2",
          isBalanced ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
        )}>
          <div className="text-[10px] font-black uppercase tracking-wider">Status</div>
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest">
            {isBalanced ? (
              <><Check className="h-4 w-4" /> Balanced</>
            ) : (
              <><AlertCircle className="h-4 w-4" /> Imbalanced</>
            )}
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
        <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-xl overflow-hidden shadow-slate-200/50">
          <div className="p-8 border-b border-slate-200 flex flex-wrap gap-6 bg-slate-50/80/50">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Transaction Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full pl-11 pr-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm transition-all"
                />
              </div>
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Reference Number</label>
              <input 
                type="text" 
                placeholder="INV-001 or Receipt #"
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm transition-all"
              />
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Description / Memo</label>
              <textarea 
                rows={2}
                placeholder="Purpose of this entry..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm transition-all resize-none"
              />
            </div>

            {/* Entry Table */}
            <div className="space-y-4 pt-4">
               <div className="grid grid-cols-[1fr_120px_100px_40px] gap-4 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                  <span>Account</span>
                  <span>Amount</span>
                  <span>Type</span>
                  <span></span>
               </div>

               <div className="space-y-3">
                 {entries.map((entry, i) => (
                   <div key={i} className="grid grid-cols-[1fr_120px_100px_40px] gap-4 group items-center animate-in fade-in slide-in-from-left-2 duration-300">
                      <select 
                        value={entry.account_id}
                        onChange={e => updateLine(i, 'account_id', e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-[12px] truncate transition-all appearance-none bg-white"
                      >
                        <option value="">Select Account...</option>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                        ))}
                      </select>

                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        value={entry.amount}
                        onChange={e => updateLine(i, 'amount', e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-black text-[12px] transition-all"
                      />

                      <select 
                        value={entry.entry_type}
                        onChange={e => updateLine(i, 'entry_type', e.target.value as 'debit' | 'credit')}
                        className={cn(
                          "w-full px-4 py-3 rounded-2xl border-2 focus:outline-none font-black text-[10px] uppercase transition-all appearance-none bg-white",
                          entry.entry_type === 'debit' ? "border-emerald-100 text-emerald-600" : "border-brand-navy/10 text-brand-navy"
                        )}
                      >
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                      </select>

                      <button 
                        onClick={() => removeLine(i)}
                        className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                 ))}
               </div>

               <button 
                 onClick={addLine}
                 className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-600 hover:text-brand-green-deep hover:border-brand-green-deep/30 transition-all font-black text-[10px] uppercase tracking-widest w-full justify-center"
               >
                 <Plus className="h-4 w-4" /> Add Journal Line
               </button>
            </div>
          </div>

          {/* Table Footer / Summary */}
          <div className="bg-slate-50/80 p-8 flex justify-end gap-12 border-t border-slate-200">
             <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Total Debits</div>
                <div className="text-xl font-black text-emerald-600">ZMW {totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
             </div>
             <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Total Credits</div>
                <div className="text-xl font-black text-brand-navy">ZMW {totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="p-8 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-6">Posting Rules</h3>
              
              <ul className="space-y-4 text-[11px] font-medium leading-relaxed mb-10">
                 <li className="flex gap-3">
                   <div className="h-2 w-2 rounded-full bg-brand-green-deep mt-1 transition-all group-hover:scale-150 shadow-[0_0_10px_rgba(34,197,94,1)]" />
                   Debits must exactly equal Credits before posting.
                 </li>
                 <li className="flex gap-3">
                   <div className="h-2 w-2 rounded-full bg-brand-green-deep mt-1 transition-all group-hover:scale-150 shadow-[0_0_10px_rgba(34,197,94,1)]" />
                   Each entry requires at least two lines for balance.
                 </li>
                 <li className="flex gap-3">
                   <div className="h-2 w-2 rounded-full bg-brand-green-deep mt-1 transition-all group-hover:scale-150 shadow-[0_0_10px_rgba(34,197,94,1)]" />
                   Once posted, journals are immutable. Corrections require adjustment entries.
                 </li>
              </ul>

              <button 
                disabled={!isBalanced || isSubmitting}
                onClick={handlePost}
                className="w-full flex items-center justify-center gap-3 py-5 bg-brand-green-deep rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-brand-green-deep-light shadow-2xl shadow-brand-green-deep/20 transition-all disabled:opacity-50 disabled:grayscale active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Post to Ledger"}
              </button>
           </div>

           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4">Quick Reference</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-700">Asset Account</span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">DR Increases</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-700">Liability Account</span>
                    <span className="text-brand-navy bg-slate-50/80 px-2 py-0.5 rounded">CR Increases</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function Loader2(props: any) {
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

