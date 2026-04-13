"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Building2, 
  Users, 
  Layers, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Info,
  Zap,
  Check,
  Loader2,
  Package,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const STEPS = [
  { id: 1, name: "Identity", desc: "Name", icon: Building2 },
  { id: 2, name: "Sector", desc: "Industry", icon: Info },
  { id: 3, name: "Scale", desc: "User Tier", icon: Users },
  { id: 4, name: "Tools", desc: "Modules", icon: Layers },
  { id: 5, name: "Cycle", desc: "Billing", icon: CreditCard },
  { id: 6, name: "Launch", desc: "Review", icon: CheckCircle2 },
]

const TIERS = [
  { id: "micro", name: "Micro", range: "1–5", price: 0 },
  { id: "small", name: "Small", range: "6–15", price: 300 },
  { id: "medium", name: "Medium", range: "16–50", price: 800 },
  { id: "large", name: "Large", range: "51–150", price: 1800 },
  { id: "enterprise", name: "Enterprise", range: "151+", price: "Custom" },
]

const MODULES = [
  { id: "finance-accounting", name: "Finance & Accounting", price: 1200, category: "Core" },
  { id: "payroll-management", name: "Payroll Management", price: 800, category: "Core" },
  { id: "leave-management", name: "Leave Management", price: 400, category: "Core" },
  { id: "performance-management", name: "Performance Management", price: 600, category: "Core" },
  { id: "procurement-management", name: "Procurement Management", price: 700, category: "Core" },
  { id: "inventory-management", name: "Inventory Management", price: 700, category: "Core" },
  { id: "fleet-management", name: "Fleet Management", price: 600, category: "Core" },
  { id: "hris-suite", name: "HRIS Full Suite", price: 1000, category: "Add-On" },
]

export default function OnboardingWizard() {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [direction, setDirection] = useState(0)
  
  const [orgData, setOrgData] = useState({ name: "", industry: "", country: "Zambia" })
  const [selectedTier, setSelectedTier] = useState("micro")
  const [selectedModules, setSelectedModules] = useState<string[]>(["finance-accounting"])
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Auto-fill and recovery logic
  useEffect(() => {
    async function checkExistingOrg() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Check Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('org_id')
          .eq('id', user.id)
          .single()

        if (profile?.org_id) {
          // 2. Fetch Organization Details
          const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profile.org_id)
            .single()

          if (org) {
            setOrgData({
              name: org.name || "",
              industry: org.industry || "",
              country: org.country || "Zambia"
            })
            setSelectedTier(org.tier || "micro")
            setBillingCycle(org.billing_cycle || "monthly")
            
            // 3. Fetch Active Modules for recovery
            const { data: modules } = await supabase
              .from('organization_modules')
              .select('module_key')
              .eq('org_id', org.id)
            
            if (modules && modules.length > 0) {
              setSelectedModules(modules.map(m => m.module_key))
            }
          }
        }
      } catch (err) {
        console.error("Recovery check failed:", err)
      } finally {
        setIsInitialLoading(false)
      }
    }
    checkExistingOrg()
  }, [supabase])

  const totals = useMemo(() => {
    const tier = TIERS.find(t => t.id === selectedTier)
    const tierPrice = typeof tier?.price === "number" ? tier.price : 0
    const modulesPrice = selectedModules.reduce((acc, id) => {
      const mod = MODULES.find(m => m.id === id)
      return acc + (mod?.price || 0)
    }, 0)
    
    let multiplier = 1
    let discount = 0
    if (billingCycle === "quarterly") {
      multiplier = 3
      discount = 0.1
    } else if (billingCycle === "annual") {
      multiplier = 10 // Pays for 10 months
      discount = 0.2
    }

    const subtotal = (tierPrice + modulesPrice) * multiplier
    const finalTotal = subtotal 

    return {
      monthlyBase: tierPrice + modulesPrice,
      subtotal,
      discount: discount > 0 ? (tierPrice + modulesPrice) * multiplier * 0.2 : 0,
      total: finalTotal
    }
  }, [selectedTier, selectedModules, billingCycle])

  const toggleModule = (id: string) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const nextStep = () => {
    if (currentStep === 1 && !orgData.name) {
      toast.error("Please enter your organization name")
      return
    }
    if (currentStep === 2 && !orgData.industry) {
      toast.error("Please select an industry")
      return
    }
    setDirection(1)
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
  }

  const quickLaunch = () => {
    if (!orgData.name || !orgData.industry) {
      toast.error("Please provide both name and industry for Quick Launch")
      return
    }
    setDirection(1)
    setCurrentStep(6)
  }

  const prevStep = () => {
    setDirection(-1)
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const completeOnboarding = async () => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Authentication required")
        return
      }

      const slug = orgData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 6)

      // 1. Create Organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name,
          slug,
          industry: orgData.industry,
          country: orgData.country,
          tier: selectedTier,
          billing_cycle: billingCycle,
          created_by: user.id
        })
        .select()
        .single()

      if (orgError) throw orgError

      // 2. Clear established ownership in memberships table
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          org_id: org.id,
          profile_id: user.id,
          role: 'owner'
        })
      
      if (memberError) throw memberError

      // 3. Link Profile to Org as Owner for active session (Using UPSERT to repair missing profiles)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          email: user.email,
          org_id: org.id,
          role: 'owner',
          onboarded: true
        })

      if (profileError) throw profileError

      // 3.5 Backup: Sync status to Auth Metadata for fail-safe middleware checks
      await supabase.auth.updateUser({
        data: { 
          org_id: org.id,
          onboarded: true 
        }
      })

      // 4. Activate Selected Modules
      const moduleInserts = selectedModules.map(slug => ({
        org_id: org.id,
        module_key: slug,
        status: 'active'
      }))

      if (moduleInserts.length > 0) {
        const { error: modulesError } = await supabase
          .from('organization_modules')
          .insert(moduleInserts)

        if (modulesError) throw modulesError
      }

      toast.success("Welcome aboard! Your ecosystem is ready.")
      
      // Force a hard reload to ensure middleware and layout see the updated DB state
      window.location.href = "/dashboard"
    } catch (error: any) {
      const errorDetail = JSON.stringify({
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        error: error
      }, null, 2)
      
      console.error('CRITICAL ONBOARDING ERROR:', errorDetail)
      toast.error(`Setup Error: ${error.message || "Finalization failed"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-brand-teal selection:text-black font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-teal/5 blur-[120px] rounded-full" />
      </div>

      <header className="border-b border-black/5 bg-black py-4 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <span className="text-xl font-black tracking-tighter text-brand-teal">Streamline</span>
          </div>
          
          {/* Stepper */}
          <div className="flex justify-center">
            <div className="flex items-center gap-1.5">
              {STEPS.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "h-1 w-10 rounded-full transition-all duration-700",
                    currentStep >= step.id ? "bg-brand-teal shadow-[0_0_10px_rgba(0,214,57,0.5)]" : "bg-white/10"
                  )} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Phase <span className="text-white">{currentStep.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-20 max-w-3xl mx-auto relative z-10 px-6 flex flex-col items-center">
        <div className="w-full">
          
          {/* Active Step Content */}
          <div className="relative min-h-[600px]">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="w-full"
              >
                {currentStep === 1 && (
                  <>
                    <div className="space-y-4 flex flex-col items-center text-center">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-[32px] bg-brand-teal/5 flex items-center justify-center border border-brand-teal/10 text-brand-teal mb-2">
                        <Building2 className="h-8 w-8 sm:h-10 sm:w-10" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-brand-navy">Business Identity</h2>
                      <p className="text-slate-500 text-base sm:text-lg font-medium max-w-md px-4">Define how your organization appears in the Streamline ecosystem.</p>
                    </div>

                    <div className="space-y-8 w-full max-w-md mx-auto mt-10">
                      <div className="space-y-3 flex flex-col items-center px-4">
                        <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 text-center w-full">Organization Name</label>
                        <input 
                          type="text" 
                          value={orgData.name}
                          onChange={e => setOrgData({...orgData, name: e.target.value})}
                          className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 text-center text-base sm:text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all shadow-sm"
                          placeholder="e.g. Copperbelt Enterprises"
                        />
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="space-y-4 flex flex-col items-center text-center">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-[32px] bg-brand-teal/5 flex items-center justify-center border border-brand-teal/10 text-brand-teal mb-2">
                        <Info className="h-8 w-8 sm:h-10 sm:w-10" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-brand-navy">Industry Sector</h2>
                      <p className="text-slate-500 text-base sm:text-lg font-medium max-w-md px-4">Select the primary ecosystem your business operates within.</p>
                    </div>

                    <div className="space-y-8 w-full max-w-md mx-auto mt-10 px-4">
                      <div className="space-y-3 flex flex-col items-center">
                        <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center w-full mb-2">Primary Industry</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          {['Mining', 'Agriculture', 'NGO', 'Retail', 'Financial', 'Services'].map(industry => (
                            <button
                              key={industry}
                              onClick={() => setOrgData({...orgData, industry})}
                              className={cn(
                                "p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm font-bold transition-all text-center",
                                orgData.industry === industry ? "bg-brand-teal border-brand-teal text-black shadow-md scale-[1.02]" : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                              )}
                            >
                              {industry}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <div className="space-y-10 flex flex-col items-center">
                    <div className="space-y-4 text-center flex flex-col items-center">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-[32px] bg-brand-teal/5 flex items-center justify-center border border-brand-teal/10 text-brand-teal mb-2">
                        <Users className="h-8 w-8 sm:h-10 sm:w-10" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-brand-navy">Operational Scale</h2>
                      <p className="text-slate-500 text-base sm:text-lg font-medium max-w-md px-4">Choose the user tier that fits your team. You can scale anytime.</p>
                    </div>

                    <div className="grid gap-3 sm:gap-4 w-full max-w-xl px-4">
                      {TIERS.map(tier => (
                        <button
                          key={tier.id}
                          onClick={() => setSelectedTier(tier.id)}
                          className={cn(
                            "flex items-center justify-between p-4 sm:p-6 rounded-[24px] sm:rounded-3xl border-2 transition-all text-left group",
                            selectedTier === tier.id ? "border-brand-teal bg-brand-teal/5 shadow-lg" : "border-slate-100 bg-white hover:border-slate-200"
                          )}
                        >
                          <div className="flex items-center gap-4 sm:gap-5">
                            <div className={cn(
                              "h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all",
                              selectedTier === tier.id ? "bg-brand-teal text-black" : "bg-slate-50 text-slate-400 group-hover:bg-brand-teal/5"
                            )}>
                              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div>
                              <div className={cn("font-black text-lg sm:text-xl", selectedTier === tier.id ? "text-brand-navy" : "text-slate-700")}>{tier.name}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tier.range} Users</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-brand-navy text-lg sm:text-xl">
                              {typeof tier.price === "number" ? `ZMW ${tier.price.toLocaleString()}` : tier.price}
                            </div>
                            <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Base / Month</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-10 flex flex-col items-center">
                    <div className="space-y-4 text-center flex flex-col items-center">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-[32px] bg-brand-teal/5 flex items-center justify-center border border-brand-teal/10 text-brand-teal mb-2">
                        <Layers className="h-8 w-8 sm:h-10 sm:w-10" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-brand-navy">Equip Platform</h2>
                      <p className="text-slate-500 text-base sm:text-lg font-medium max-w-md px-4">Select the specialized modules your business needs.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full px-4">
                      {MODULES.map(module => (
                        <button
                          key={module.id}
                          onClick={() => toggleModule(module.id)}
                          className={cn(
                            "group p-6 rounded-[24px] sm:rounded-[32px] border-2 transition-all text-left relative overflow-hidden",
                            selectedModules.includes(module.id) ? "border-brand-teal bg-brand-teal/5" : "border-slate-100 bg-white hover:border-slate-200"
                          )}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className={cn(
                              "text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full",
                              module.category === 'Core' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                            )}>{module.category}</span>
                            {selectedModules.includes(module.id) && <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-brand-teal" />}
                          </div>
                          <div className="text-base sm:text-lg font-black text-brand-navy mb-1">{module.name}</div>
                          <div className="text-xs sm:text-sm font-bold text-slate-400">ZMW {module.price.toLocaleString()} / mo</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-10 flex flex-col items-center">
                    <div className="space-y-4 text-center flex flex-col items-center">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-[32px] bg-brand-teal/5 flex items-center justify-center border border-brand-teal/10 text-brand-teal mb-2">
                        <CreditCard className="h-8 w-8 sm:h-10 sm:w-10" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-brand-navy">Billing Frequency</h2>
                      <p className="text-slate-500 text-base sm:text-lg font-medium max-w-md px-4">Choose a cycle that suits your cash flow. Annual billing saves 20%.</p>
                    </div>

                    <div className="grid gap-3 sm:gap-4 w-full max-w-xl px-4">
                      {[
                        { id: "monthly", name: "Monthly", desc: "Pay as you go", discount: null },
                        { id: "quarterly", name: "Quarterly", desc: "Pay every 3 months", discount: 10 },
                        { id: "annual", name: "Annual", desc: "Pay for the full year", discount: 20 },
                      ].map(cycle => (
                        <button
                          key={cycle.id}
                          onClick={() => setBillingCycle(cycle.id)}
                          className={cn(
                            "flex items-center justify-between p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] border-2 transition-all relative group shadow-sm",
                            billingCycle === cycle.id ? "border-brand-teal bg-brand-teal/5" : "border-slate-100 bg-white hover:border-slate-200"
                          )}
                        >
                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className={cn(
                              "h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2 flex items-center justify-center transition-all",
                              billingCycle === cycle.id ? "border-brand-teal" : "border-slate-200"
                            )}>
                              {billingCycle === cycle.id && <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-brand-teal shadow-[0_0_15px_rgba(0,183,49,1)]" />}
                            </div>
                            <div>
                              <span className="font-black text-brand-navy text-xl sm:text-2xl block">{cycle.name}</span>
                              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">{cycle.desc}</span>
                            </div>
                          </div>
                          {cycle.discount && (
                            <span className="bg-brand-teal/10 text-brand-teal text-[9px] sm:text-[10px] font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-full uppercase tracking-widest border border-brand-teal/20 shadow-sm">
                              -{cycle.discount}%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-10 flex flex-col items-center">
                    <div className="space-y-4 text-center flex flex-col items-center">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-[32px] bg-brand-teal/5 flex items-center justify-center border border-brand-teal/10 text-brand-teal mb-2">
                        <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-brand-navy">Summary & Activation</h2>
                      <p className="text-slate-500 text-base sm:text-lg font-medium max-w-md px-4">Final review of your custom business ecosystem.</p>
                    </div>

                    <div className="w-full max-w-xl p-6 sm:p-10 bg-white rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-2xl relative overflow-hidden group mx-4">
                      <div className="absolute top-0 right-0 h-40 w-40 bg-brand-teal/5 -mr-10 -mt-20 rounded-full blur-3xl group-hover:bg-brand-teal/10 transition-all duration-700" />
                      
                      <div className="space-y-4 sm:space-y-6 relative z-10 text-center">
                        <div className="flex flex-col items-center pb-4 sm:pb-6 border-b border-slate-50">
                           <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Organization</div>
                           <div className="text-xl sm:text-2xl font-black text-brand-navy">{orgData.name}</div>
                        </div>
                        <div className="flex justify-between items-center py-3 sm:py-4 border-b border-slate-50">
                           <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Selected Tier</div>
                           <div className="text-sm sm:text-base font-black text-brand-navy uppercase tracking-widest">{selectedTier} Scale</div>
                        </div>
                        <div className="flex justify-between items-center py-3 sm:py-4 border-b border-slate-50">
                           <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Ecosystem</div>
                           <div className="text-sm sm:text-base font-black text-slate-600">{selectedModules.length} Active Modules</div>
                        </div>
                        <div className="flex flex-col items-center pt-6 sm:pt-8">
                           <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Final Monthly Commitment</div>
                           <div className="text-4xl sm:text-5xl font-black text-brand-navy">ZMW {totals.total.toLocaleString()}</div>
                           <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mt-2">Plus applicable local Zambian taxes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 sm:mt-20 flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md mx-auto px-4">
                {currentStep < 6 ? (
                  <button
                    onClick={nextStep}
                    className="group relative w-full h-14 sm:h-16 flex items-center justify-center rounded-2xl sm:rounded-3xl bg-brand-navy text-white text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl"
                  >
                    CONTINUE SETUP <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={completeOnboarding}
                    disabled={isSubmitting}
                    className="group relative w-full h-14 sm:h-16 flex items-center justify-center rounded-2xl sm:rounded-3xl bg-brand-navy text-white text-xs sm:text-sm font-black uppercase tracking-[0.15em] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : (
                      <div className="flex items-center gap-2 sm:gap-3">
                         ACTIVATE BUSINESS ECOSYSTEM <Zap className="h-4 w-4 sm:h-5 sm:w-5 fill-brand-teal text-brand-teal" />
                      </div>
                    )}
                  </button>
                )}

                {currentStep >= 2 && currentStep < 6 && (
                  <button
                    onClick={quickLaunch}
                    className="w-full py-4 rounded-2xl border-2 border-brand-teal/20 text-brand-teal text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-teal/5 transition-all flex items-center justify-center gap-2"
                  >
                    Quick Launch with Defaults <Zap className="h-3 w-3 fill-brand-teal" />
                  </button>
                )}

                <button
                  onClick={prevStep}
                  disabled={currentStep === 1 || isSubmitting}
                  className="flex items-center gap-2 sm:gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-brand-navy transition-all disabled:opacity-0 active:scale-95 mx-auto py-2"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> REVISE PREVIOUS STEP
                </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
