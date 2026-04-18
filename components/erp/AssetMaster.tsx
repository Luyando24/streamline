"use client"

import { useState } from "react"
import { 
  Building2, 
  Search, 
  ChevronRight, 
  MoreVertical,
  Wrench,
  ShieldCheck,
  LayoutGrid,
  Trash2,
  Loader2,
  Monitor,
  Truck
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { IndustrialModal } from "@/components/ui/IndustrialModal"
import { updateAsset, deleteAssetRecord } from "@/lib/actions/assets"
import { toast } from "sonner"

export function AssetMaster({ initialAssets }: { initialAssets: any[] }) {
  const [assets, setAssets] = useState(initialAssets)
  const [search, setSearch] = useState("")
  const [showEdit, setShowEdit] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = assets.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.asset_tag.toLowerCase().includes(search.toLowerCase())
  )

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAsset) return
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        name: formData.get("name"),
        asset_tag: formData.get("asset_tag"),
        location: formData.get("location"),
        status: formData.get("status"),
        purchase_cost: Number(formData.get("purchase_cost")),
      }
      await updateAsset(selectedAsset.id, data)
      toast.success("Asset registry record updated.")
      setShowEdit(false)
      setAssets(assets.map(a => a.id === selectedAsset.id ? { ...a, ...data } : a))
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to dispose of this asset? This action will archive the record as 'disposed'.")) return
    setIsSubmitting(true)
    try {
      await deleteAssetRecord(id)
      toast.success("Asset record archived for disposal.")
      setAssets(assets.filter(a => a.id !== id))
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80/50">
        <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
          <LayoutGrid className="h-5 w-5 text-brand-blue-deep" /> Capital Registry
        </h2>
        <div className="flex gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-brand-blue-deep transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by Tag/Name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-[10px] border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue-deep w-48 font-bold transition-all bg-white"
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((asset: any) => (
              <div key={asset.id} className="group p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-slate-50/80 rounded-2xl transition-all">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-brand-navy text-lg font-black shadow-sm group-hover:scale-110 transition-all">
                    {asset.name[0]}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-brand-navy leading-tight">{asset.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{asset.asset_tag}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        asset.status === 'active' ? "text-brand-blue-deep" : "text-orange-600"
                      )}>
                        {asset.status}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                        Acquired: {new Date(asset.purchase_date).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Book Value</span>
                    <div className="text-xl font-black text-brand-navy">K {Number(asset.current_value || asset.purchase_cost).toLocaleString()}</div>
                  </div>
                  
                  <div className="text-right hidden sm:block">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Location</span>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                      {asset.location || "Central Hub"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { setSelectedAsset(asset); setShowEdit(true); }}
                      className="p-3 bg-slate-50/80 rounded-xl text-slate-300 hover:text-brand-navy hover:shadow-md transition-all"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    <Link href={`/assets/${asset.id}`} className="p-3 bg-slate-50/80 rounded-xl text-slate-300 hover:text-brand-navy hover:shadow-md transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
              <Building2 className="h-10 w-10" />
            </div>
            <p className="text-sm font-black text-brand-navy italic opacity-50">Filtered capital registry is empty.</p>
          </div>
        )}
      </div>

      <IndustrialModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Asset Maintenance"
        subtitle="Catalogue Specification Update"
        icon={<ShieldCheck className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdate} className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Operational Identity</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Official Designation</label>
                   <input name="name" defaultValue={selectedAsset?.name} required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Industrial Asset Tag</label>
                      <input name="asset_tag" defaultValue={selectedAsset?.asset_tag} required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Deployment Status</label>
                      <select name="status" defaultValue={selectedAsset?.status} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 appearance-none">
                         <option value="active">Active Service</option>
                         <option value="maintenance">In Maintenance</option>
                         <option value="retired">Retired / Surplus</option>
                      </select>
                   </div>
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Valuation & Deployment</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Historical Cost (ZMW)</label>
                   <input name="purchase_cost" type="number" defaultValue={selectedAsset?.purchase_cost} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Deployment Location</label>
                   <input name="location" defaultValue={selectedAsset?.location} placeholder="e.g. Lusaka HQ" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
           </div>

           <div className="pt-6 space-y-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg shadow-brand-navy/10 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Catalogue Update"}
              </button>
              <button 
                type="button"
                onClick={() => handleDelete(selectedAsset.id)}
                disabled={isSubmitting}
                className="w-full py-5 bg-white border-2 border-orange-200 text-orange-600 rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Schedule Disposal / Retirement
              </button>
           </div>
        </form>
      </IndustrialModal>
    </div>
  )
}
