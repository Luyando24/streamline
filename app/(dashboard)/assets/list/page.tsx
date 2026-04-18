"use client"

import { useState, useEffect } from "react"
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Loader2,
  Calendar,
  CreditCard,
  MapPin,
  Tag,
  Wrench,
  X,
  Sparkles,
  ArrowUpRight,
  Calculator
} from "lucide-react"
import Link from "next/link"
import { getFixedAssets, registerAsset, getAssetCategories, postMonthlyDepreciation } from "@/lib/actions/assets"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IndustrialModal } from "@/components/ui/IndustrialModal"

export default function AssetListPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [assetData, catData] = await Promise.all([
        getFixedAssets(),
        getAssetCategories()
      ])
      setAssets(assetData)
      setCategories(catData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        name: formData.get("name"),
        asset_tag: formData.get("asset_tag"),
        serial_no: formData.get("serial_no"),
        category_id: formData.get("category_id"),
        purchase_date: formData.get("purchase_date"),
        purchase_cost: Number(formData.get("purchase_cost")),
        salvage_value: Number(formData.get("salvage_value")),
        location: formData.get("location")
      }

      await registerAsset(data)
      toast.success("Asset successfully capitalized and registered.")
      setShowAdd(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDepreciate = async (id: string, name: string) => {
    toast.promise(
      postMonthlyDepreciation(id),
      {
        loading: `Calculating depreciation for ${name}...`,
        success: () => {
          fetchData()
          return `Depreciation posted to ledger for ${name}`
        },
        error: "Failed to post depreciation."
      }
    )
  }

  const filtered = assets.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.asset_tag.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/assets" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Command Center
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Capital Registry</h1>
          <p className="text-slate-700 font-medium tracking-tight">Governance and lifecycle tracking for institutional physical assets.</p>
        </div>

        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10"
        >
          <Plus className="h-4 w-4 text-brand-blue-deep" /> Register New Asset
        </button>
      </div>

      {/* Registry Controls */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <input 
                type="text" 
                placeholder="Find by Tag or Name..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 pr-5 py-2.5 text-xs border-2 border-slate-200 rounded-xl focus:border-brand-blue-deep focus:outline-none bg-slate-50/80 lg:w-[350px] font-bold"
              />
           </div>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700">
             <Filter className="h-4 w-4" /> Categorized
           </button>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
           Capitalized Items: <span className="text-brand-navy">{assets.length}</span>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="h-10 w-10 animate-spin text-brand-blue-deep" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Auditing Physical Capital Registry...</p>
          </div>
        ) : filtered.length > 0 ? filtered.map((a) => (
          <div key={a.id} className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-blue-deep/20 hover:shadow-2xl transition-all duration-500 overflow-hidden relative flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-8">
               <div className="h-16 w-16 rounded-[24px] bg-slate-50/80 border-2 border-slate-200 text-brand-navy flex items-center justify-center text-lg font-black shadow-sm group-hover:scale-110 group-hover:bg-brand-navy group-hover:text-white transition-all duration-500">
                  {a.category?.name[0] || 'A'}
               </div>
               
               <div className="space-y-1">
                  <div className="flex items-center gap-3">
                     <h3 className="text-xl font-black text-brand-navy group-hover:text-brand-blue-deep transition-colors">{a.name}</h3>
                     <span className="px-3 py-0.5 rounded-full bg-slate-50/80 text-slate-600 text-[9px] font-black uppercase tracking-widest border border-slate-200">
                        {a.asset_tag}
                     </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                     <Tag className="h-3.5 w-3.5 text-slate-300" /> {a.category?.name} 
                     <span className="h-1 w-1 rounded-full bg-slate-300" />
                     <MapPin className="h-3.5 w-3.5 text-slate-300" /> {a.location || 'Central Facility'}
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-14">
               <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Book Value</span>
                  <div className="text-xl font-black text-brand-navy">K {Number(a.current_value || a.purchase_cost).toLocaleString()}</div>
               </div>
               
               <div className="text-right hidden sm:block">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Condition</span>
                  <div className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                    a.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {a.status}
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <button 
                  onClick={() => handleDepreciate(a.id, a.name)}
                  className="h-12 px-6 rounded-2xl bg-brand-blue-pale text-brand-blue-deep text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue-deep hover:text-white transition-all shadow-sm flex items-center gap-2"
                  >
                     <Calculator className="h-4 w-4" /> Depreciate
                  </button>
                  <Link href={`/assets/${a.id}`} className="h-12 w-12 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-300 hover:text-brand-navy hover:shadow-lg transition-all">
                     <ChevronRight className="h-5 w-5" />
                  </Link>
               </div>
            </div>
          </div>
        )) : (
          <div className="py-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-6">
             <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                <Building2 className="h-10 w-10" />
             </div>
             <p className="text-sm font-black text-brand-navy italic opacity-50">Empty Capital Registry. Onboard your first asset.</p>
          </div>
        )}
      </div>

      {/* Add Asset Centered Modal */}
      <IndustrialModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Asset Registration"
        subtitle="Fixed Asset Capitalization"
        icon={<ShieldCheck className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAdd} className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Item Description</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Asset Name</label>
                   <input name="name" required placeholder="e.g. 2024 Toyota Hilux" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 placeholder:text-slate-300" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Unique Asset Tag</label>
                      <input name="asset_tag" required placeholder="TAG-1001" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 placeholder:text-slate-300" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Category Registry</label>
                      <select name="category_id" required className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 appearance-none">
                         {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                         {categories.length === 0 && <option value="">No categories defined</option>}
                      </select>
                   </div>
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Financial Coordinates</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Purchase Date</label>
                   <input name="purchase_date" type="date" required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Historical Cost (K)</label>
                   <input name="purchase_cost" type="number" required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Salvage Value (K)</label>
                   <input name="salvage_value" type="number" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Location Node</label>
                   <input name="location" placeholder="Site Alpha" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 placeholder:text-slate-300" />
                </div>
             </div>
           </div>

           <div className="pt-6">
             <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
             >
               {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Capitalization"}
             </button>
           </div>
        </form>
      </IndustrialModal>
    </div>
  )
}

