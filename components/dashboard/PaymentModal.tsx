"use client"

import { useState } from "react"
import { 
  X, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck,
  ChevronRight,
  ArrowLeft
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  items: { name: string; price: number }[]
  total: number
  billingCycle: string
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  items, 
  total, 
  billingCycle 
}: PaymentModalProps) {
  const [step, setStep] = useState<'summary' | 'payment' | 'processing' | 'success'>('summary')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo' | null>(null)

  const handlePayment = () => {
    setStep('processing')
    setTimeout(() => {
      setStep('success')
      onSuccess()
    }, 2500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step !== 'processing' ? onClose : undefined}
        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
             {step === 'payment' && (
               <button onClick={() => setStep('summary')} className="p-1 hover:bg-slate-50 rounded-lg transition-colors">
                 <ArrowLeft className="h-4 w-4 text-slate-400" />
               </button>
             )}
             <h2 className="text-lg font-black text-brand-navy">
               {step === 'summary' && "Order Summary"}
               {step === 'payment' && "Payment Method"}
               {step === 'processing' && "Securing Items..."}
               {step === 'success' && "Success!"}
             </h2>
          </div>
          <button 
            onClick={onClose}
            disabled={step === 'processing'}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'summary' && (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">{item.name}</span>
                      <span className="text-brand-navy font-bold">ZMW {item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Total to Pay ({billingCycle})</span>
                      <span className="text-2xl font-black text-brand-blue-deep">ZMW {total.toLocaleString()}</span>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-brand-blue-deep opacity-50 mb-1" />
                  </div>
                </div>

                <button 
                  onClick={() => setStep('payment')}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-navy py-4 text-sm font-black text-white hover:bg-brand-navy/90 transition-all shadow-xl"
                >
                  Continue to Payment <ChevronRight className="h-4 w-4 text-brand-blue-deep" />
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-2xl border-2 p-5 transition-all text-left",
                    paymentMethod === 'card' ? "border-brand-blue-deep bg-brand-blue-pale" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center",
                    paymentMethod === 'card' ? "bg-brand-blue-deep text-white" : "bg-slate-50 text-slate-400"
                  )}>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">Direct Paystack</h4>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">Debit/Credit Cards</p>
                  </div>
                </button>

                <button 
                  onClick={() => setPaymentMethod('momo')}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-2xl border-2 p-5 transition-all text-left",
                    paymentMethod === 'momo' ? "border-brand-blue-deep bg-brand-blue-pale" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center",
                    paymentMethod === 'momo' ? "bg-brand-blue-deep text-white" : "bg-slate-50 text-slate-400"
                  )}>
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">Mobile Money</h4>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">MTN, Airtel, Zamtel</p>
                  </div>
                </button>

                <button 
                  onClick={handlePayment}
                  disabled={!paymentMethod}
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl bg-brand-blue-deep py-4 text-sm font-black text-white hover:bg-brand-blue-deep/90 transition-all shadow-xl disabled:opacity-50 disabled:grayscale"
                >
                  Complete Secure Payment
                </button>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center gap-6"
              >
                <div className="relative">
                   <Loader2 className="h-16 w-16 text-brand-blue-deep animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <ShieldCheck className="h-6 w-6 text-brand-blue-deep opacity-50" />
                   </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-brand-navy">Encrypting Transaction</h3>
                  <p className="text-sm text-slate-500 font-medium">Please do not refresh the page...</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center justify-center gap-6 text-center"
              >
                <div className="h-20 w-20 rounded-full bg-brand-blue-pale flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-brand-blue-deep" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-brand-navy">Modules Activated!</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto font-medium">
                    Your new modules are now active and visible in your sidebar.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-full mt-4 rounded-2xl bg-brand-navy py-4 text-sm font-black text-white hover:bg-brand-navy/90 transition-all"
                >
                  Back to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
