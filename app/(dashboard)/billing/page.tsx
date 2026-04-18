export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-navy">Billing & Subscription</h1>
        <p className="text-slate-700">Manage your subscription, invoices, and billing cycle.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
           <h3 className="text-lg font-bold text-brand-navy mb-4">Current Plan</h3>
           <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200 mb-6">
             <div className="h-12 w-12 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-xl">S</div>
             <div>
               <div className="text-sm font-bold text-brand-navy">Small Enterprise Tier</div>
               <div className="text-xs text-slate-700">6–15 Users • ZMW 300/mo</div>
             </div>
             <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Active</span>
           </div>
           
           <div className="space-y-2">
             <div className="flex justify-between text-sm">
               <span className="text-slate-700">Next Billing Date</span>
               <span className="font-bold text-brand-navy">May 1, 2026</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-slate-700">Estimated Amount</span>
               <span className="font-bold text-brand-blue">ZMW 4,200</span>
             </div>
           </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col justify-center items-center py-12 text-center gap-4">
           <div className="h-16 w-16 bg-slate-50/80 rounded-full flex items-center justify-center text-slate-300">
             <CreditCard className="h-8 w-8" />
           </div>
           <div>
             <h4 className="font-bold text-brand-navy text-lg">Payment Method</h4>
             <p className="text-sm text-slate-600">No payment method added yet.</p>
           </div>
           <button className="btn-primary">Link Paystack Account</button>
        </div>
      </div>
    </div>
  )
}

function CreditCard({ className }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

