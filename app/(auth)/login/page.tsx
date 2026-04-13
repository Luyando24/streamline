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
import { Loader2, Mail, Lock, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isUnverified, setIsUnverified] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setIsUnverified(true)
        }
        toast.error(error.message)
        return
      }

      toast.success("Logged in successfully")
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendEmail() {
    setIsResending(true)
    try {
      const email = form.getValues("email")
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${baseUrl}/auth/confirm`,
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Verification email resent! Please check your inbox.")
      setIsUnverified(false)
    } catch (error) {
      toast.error("Failed to resend email")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8 selection:bg-brand-teal selection:text-black">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-teal/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 bg-[#141414] p-10 rounded-[32px] border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <span className="text-3xl font-black tracking-tighter text-brand-teal">Streamline</span>
          </Link>
          <h2 className="text-[32px] font-black tracking-tight text-white leading-tight">Welcome back</h2>
          <p className="mt-3 text-slate-400 font-medium">
            Log in to manage your business operations
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[13px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 group-focus-within:text-brand-teal transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  {...form.register("email")}
                  type="email"
                  className="block w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal transition-all"
                  placeholder="name@company.com"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-red-400 mt-1 ml-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password" className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <Link href="#" className="text-xs font-bold text-brand-teal hover:text-brand-teal-light">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 group-focus-within:text-brand-teal transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  {...form.register("password")}
                  type="password"
                  className="block w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal transition-all"
                  placeholder="••••••••"
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-red-400 mt-1 ml-1">{form.formState.errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="pt-2 space-y-4">
            {isUnverified && (
              <div className="p-4 rounded-2xl bg-brand-teal/5 border border-brand-teal/20 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs text-brand-teal font-medium leading-relaxed mb-3">
                  Your email hasn't been verified yet. Check your inbox or click below to get a new link.
                </p>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full py-2 px-4 rounded-xl bg-brand-teal text-black text-[11px] font-black uppercase tracking-widest hover:bg-brand-teal-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isResending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Resend Verification Link"}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-2xl bg-brand-teal py-4 px-4 text-sm font-bold text-black hover:bg-brand-teal-light focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 focus:ring-offset-black transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(0,214,57,0.3)] hover:shadow-[0_0_30px_rgba(0,214,57,0.5)] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>

          <div className="text-center text-sm pt-4">
            <span className="text-slate-500">Don't have an account? </span>
            <Link href="/register" className="font-bold text-brand-teal hover:text-brand-teal-light transition-colors">
              Get started
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
