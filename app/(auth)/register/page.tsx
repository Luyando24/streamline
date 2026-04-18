"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, Mail, Lock, User, ChevronRight, Check, Eye, EyeOff, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const registerSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)

  const handleGeneratePassword = () => {
    const generated = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
    form.setValue("password", generated, { shouldValidate: true })
    setShowPassword(true)
    toast.success("Secure password generated!")
  }

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
    },
  })

  async function nextStep() {
    const isValid = await form.trigger(["full_name", "email"])
    if (isValid) setStep(2)
  }

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
          emailRedirectTo: `${baseUrl}/auth/confirm`,
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Account created! Please check your email to verify.")
      router.push("/onboarding")
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { title: "Identity", desc: "Your basic info" },
    { title: "Security", desc: "Protect your account" }
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8 selection:bg-brand-blue selection:text-black">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#141414] p-10 rounded-[40px] border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <span className="text-3xl font-black tracking-tighter text-brand-blue">Streamline</span>
          </Link>
          
          {/* Progress Indicator */}
          <div className="mb-10 flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={cn(
                  "h-1.5 w-12 rounded-full transition-all duration-500",
                  step >= i + 1 ? "bg-brand-blue shadow-[0_0_10px_rgba(0,214,57,0.5)]" : "bg-white/10"
                )} />
              </div>
            ))}
          </div>

          <h2 className="text-[32px] font-black tracking-tight text-white leading-tight">
            {step === 1 ? "Create your account" : "Set your password"}
          </h2>
          <p className="mt-3 text-slate-400 font-medium">
            Step {step} of 2 — {steps[step - 1].desc}
          </p>
        </div>

        <form className="mt-10" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="relative overflow-hidden min-h-[280px]">
            <motion.div
              animate={{ x: step === 1 ? 0 : -400, opacity: step === 1 ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn("space-y-5", step === 2 && "pointer-events-none absolute w-full")}
            >
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 group-focus-within:text-brand-blue transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    {...form.register("full_name")}
                    type="text"
                    className="block w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all"
                    placeholder="John Doe"
                  />
                </div>
                {form.formState.errors.full_name && (
                  <p className="text-xs text-red-400 mt-1 ml-1">{form.formState.errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 group-focus-within:text-brand-blue transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    {...form.register("email")}
                    type="email"
                    className="block w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all"
                    placeholder="name@company.com"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-xs text-red-400 mt-1 ml-1">{form.formState.errors.email.message}</p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: step === 2 ? 0 : 400, opacity: step === 2 ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn("space-y-5", step === 1 && "pointer-events-none absolute w-full")}
            >
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">
                  Create Password
                </label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 group-focus-within:text-brand-blue transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    className="block w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all"
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-brand-blue transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-red-400 mt-1 ml-1">{form.formState.errors.password.message}</p>
                )}
              </div>
              
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-brand-blue/20 bg-brand-blue/5 text-[11px] font-black uppercase tracking-widest text-brand-blue hover:bg-brand-blue/10 transition-all border-dashed"
              >
                <Sparkles className="h-3.5 w-3.5" /> Magic Generate Password
              </button>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-400 leading-relaxed font-medium">
                Make sure your password is unique and contains at least 8 characters for your security.
              </div>
            </motion.div>
          </div>

          <div className="pt-8 flex gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center rounded-2xl border border-white/10 py-4 px-6 text-sm font-bold text-white hover:bg-white/5 transition-all active:scale-[0.98]"
              >
                Back
              </button>
            )}
            
            {step === 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="group relative flex flex-1 justify-center rounded-2xl bg-brand-blue py-4 px-4 text-sm font-bold text-black hover:bg-brand-blue-light transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(0,214,57,0.3)]"
              >
                Continue <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex flex-1 justify-center rounded-2xl bg-brand-blue py-4 px-4 text-sm font-bold text-black hover:bg-brand-blue-light transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(0,214,57,0.3)] active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Complete Registration <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            )}
          </div>

          <div className="text-center text-sm pt-6">
            <span className="text-slate-500">Already have an account? </span>
            <Link href="/login" className="font-bold text-brand-blue hover:text-brand-blue-light transition-colors">
              Sign in
            </Link>
          </div>

          <div className="text-center text-[11px] text-slate-500 px-6 mt-8 uppercase tracking-widest leading-relaxed font-bold opacity-30">
            Secure, encrypted verification powered by Streamline Cloud.
          </div>
        </form>
      </motion.div>
    </div>
  )
}
