"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Scale,
  Wallet,
  CreditCard,
  BarChart3,
  Sparkles,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { getChartOfAccounts, createAccount, updateAccount, deleteAccount } from "@/lib/actions/accounting"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: 'asset', name: 'Assets', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'liability', name: 'Liabilities', icon: CreditCard, color: 'text-brand-navy', bg: 'bg-slate-100' },
  { id: 'equity', name: 'Equity', icon: Scale, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'revenue', name: 'Revenue', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'expense', name: 'Expenses', icon: Sparkles, color: 'text-orange-600', bg: 'bg-orange-50' },
]

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "asset",
    normal_balance: "debit" as "debit" | "credit",
    description: ""
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const data = await getChartOfAccounts()
      setAccounts(data)
    } catch (err) {
      toast.error("Failed to load chart of accounts")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, formData)
        toast.success("Account updated successfully")
      } else {
        await createAccount(formData)
        toast.success("New account added to ledger")
      }
      setIsModalOpen(false)
      setEditingAccount(null)
      setFormData({ code: "", name: "", type: "asset", normal_balance: "debit", description: "" })
      fetchAccounts()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone if the account is in use.")) return
    try {
      await deleteAccount(id)
      toast.success("Account removed")
      fetchAccounts()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(search.toLowerCase()) || acc.code.includes(search)
    const matchesCategory = activeCategory === "all" || acc.type === activeCategory
    return matchesSearch && matchesCategory
  })

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
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Chart of Accounts</h1>
          <p className="text-slate-700 font-medium">Manage your organization's financial structural integrity.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 text-brand-blue-deep" /> Add New Account
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "p-4 rounded-2xl border-2 transition-all text-left group",
              activeCategory === cat.id ? "border-brand-blue-deep bg-white shadow-md" : "border-slate-200 bg-slate-50/50 hover:bg-white"
            )}
          >
            <cat.icon className={cn("h-5 w-5 mb-3", cat.color)} />
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-brand-navy">{cat.name}</div>
            <div className="text-xl font-black text-brand-navy">
              {accounts.filter(a => a.type === cat.id).length}
            </div>
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white border-2 border-slate-200 rounded-[32px] shadow-xl overflow-hidden shadow-slate-200/50">
        <div className="p-8 border-b border-slate-200 flex flex-wrap items-center justify-between gap-6">
           <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-blue-deep transition-colors" />
              <input 
                type="text" 
                placeholder="Search by code or name..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-xs transition-all bg-slate-50/50 focus:bg-white"
              />
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeCategory === 'all' ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                All Accounts
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Code</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Account Name</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Balance Side</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-300" />
                  </td>
                </tr>
              ) : filteredAccounts.length > 0 ? filteredAccounts.map(acc => (
                <tr key={acc.id} className="group border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <span className="text-xs font-black text-brand-navy bg-slate-100 px-3 py-1 rounded-lg">{acc.code}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-black text-brand-navy text-sm">{acc.name}</div>
                    {acc.description && <div className="text-[10px] text-slate-500 mt-1 font-medium">{acc.description}</div>}
                  </td>
                  <td className="px-8 py-5">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      CATEGORIES.find(c => c.id === acc.type)?.bg,
                      CATEGORIES.find(c => c.id === acc.type)?.color
                    )}>
                      {acc.type}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                      {acc.normal_balance}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!acc.is_system && (
                        <>
                          <button 
                            onClick={() => {
                              setEditingAccount(acc)
                              setFormData({
                                code: acc.code,
                                name: acc.name,
                                type: acc.type,
                                normal_balance: acc.normal_balance,
                                description: acc.description || ""
                              })
                              setIsModalOpen(true)
                            }}
                            className="p-2 text-slate-400 hover:text-brand-navy hover:bg-white rounded-lg transition-all shadow-sm"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(acc.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {acc.is_system && <ShieldCheck className="h-4 w-4 text-slate-300 m-2" />}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold italic">No accounts found matching your selection.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-navy/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl border-2 border-slate-100 overflow-hidden scale-in-center transition-transform">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-brand-navy">{editingAccount ? "Edit Account" : "Deploy New Account"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all">
                <Plus className="h-5 w-5 rotate-45 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Account Code</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. 1010"
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm bg-slate-50/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Normal Balance</label>
                    <select 
                      value={formData.normal_balance}
                      onChange={e => setFormData({...formData, normal_balance: e.target.value as any})}
                      className="w-full px-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm bg-slate-50/30 appearance-none"
                    >
                      <option value="debit">DEBIT</option>
                      <option value="credit">CREDIT</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Account Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Office Equipment"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm bg-slate-50/30"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Category Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm bg-slate-50/30 appearance-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                    ))}
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Description (Optional)</label>
                  <textarea 
                    rows={2}
                    placeholder="Brief purpose of this account..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm bg-slate-50/30 resize-none"
                  />
               </div>

               <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-5 bg-brand-blue-deep text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-blue-deep/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {editingAccount ? "Update Account Details" : "Finalize Account Creation"}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
