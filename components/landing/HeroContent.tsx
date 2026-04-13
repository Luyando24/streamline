"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

const TAB_CONTENT = {
  "Accounting": {
    base: {
      title: "Accounting Base",
      desc: "Manage income and expenses with ease, generate invoices, and keep your ledger balanced securely.",
      price: "Try free for 30 days, then from ZMW 300/mo."
    },
    pro: {
      title: "Accounting Advanced",
      desc: "Full multi-currency support, advanced financial reporting, and consolidated multi-entity views.",
      price: "Price on request."
    }
  },
  "HR & Payroll": {
    base: {
      title: "Payroll Core",
      desc: "Automated payslip generation with built-in NAPSA, NHIMA, and PAYE local deductions.",
      price: "Try free for 30 days, then from ZMW 450/mo."
    },
    pro: {
      title: "Full HRIS Suite",
      desc: "Complete leave management, performance reviews, recruitment tracking, and custom workflows.",
      price: "Price on request."
    }
  },
  "Inventory": {
    base: {
      title: "Stock Tracker",
      desc: "Real-time inventory levels, simple receiving, and low-stock automated alerts.",
      price: "Try free for 30 days, then from ZMW 250/mo."
    },
    pro: {
      title: "Advanced Warehouse",
      desc: "Multi-branch routing, barcode scanning, sophisticated fleet vehicle tracking, and asset depreciation.",
      price: "Price on request."
    }
  },
  "Tax & Compliance": {
    base: {
      title: "Compliance Basic",
      desc: "ZRA-ready export formats and basic audit checklists for peace of mind.",
      price: "Included with Base modules."
    },
    pro: {
      title: "Audit Trail Pro",
      desc: "Immutable blockchain-style audit logs and custom regulatory checklists for enterprise governance.",
      price: "Price on request."
    }
  }
}

type TabType = keyof typeof TAB_CONTENT;
const TABS: TabType[] = ["Accounting", "HR & Payroll", "Inventory", "Tax & Compliance"]

export function HeroContent() {
  const [activeTab, setActiveTab] = useState<TabType>("Accounting")

  return (
    <>
      <div className="mt-12 mb-16 inline-flex p-1.5 rounded-full bg-[#1c1c1c] overflow-x-auto max-w-full relative shadow-[0_0_40px_-10px_rgba(0,128,0,0.2)]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative rounded-full px-8 py-3.5 text-[15px] font-bold transition-all whitespace-nowrap z-10 ${
              activeTab === tab ? "text-black" : "text-white hover:bg-white/10"
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="hero-active-pill"
                className="absolute inset-0 bg-brand-teal rounded-full -z-10 shadow-[0_0_20px_rgba(0,214,57,0.5)]"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-[1100px] mx-auto min-h-[380px]">
        <AnimatePresence mode="popLayout">
          {/* Card 1 */}
          <motion.div 
            key={`base-${activeTab}`} 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="rounded-[32px] bg-[#f2f2f2] text-black p-6 sm:p-10 md:p-14 flex flex-col items-start text-left hover:-translate-y-2 transition-transform relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal opacity-0 group-hover:opacity-[0.05] blur-[80px] rounded-full transition-opacity duration-700" />
            <div className="text-[11px] sm:text-[13px] font-bold text-slate-600 mb-2 sm:mb-4 tracking-widest uppercase">Small to Medium</div>
            <h2 className="text-2xl sm:text-3xl md:text-[40px] leading-tight font-black tracking-tight mb-3 sm:mb-4 text-slate-900 group-hover:text-brand-teal transition-colors duration-500">
              {TAB_CONTENT[activeTab].base.title}
            </h2>
            <p className="text-base sm:text-[17px] text-slate-700 mb-6 sm:mb-8 max-w-[380px]">
              {TAB_CONTENT[activeTab].base.desc}
            </p>
            <p className="text-base sm:text-[17px] mb-8 sm:mb-12 text-slate-800">
              <span className="font-bold">{TAB_CONTENT[activeTab].base.price.split(', ')[0]}</span>{TAB_CONTENT[activeTab].base.price.includes(',') ? ', ' + TAB_CONTENT[activeTab].base.price.split(', ')[1] : ''}
            </p>
            <Link 
              href="/register"
              className="relative overflow-hidden mt-auto inline-flex items-center justify-center rounded-full bg-black px-6 sm:px-8 py-3 sm:py-4 text-[14px] sm:text-[15px] font-bold text-white transition-all hover:scale-105 active:scale-95 group/btn"
            >
              <span className="relative z-10">Discover {TAB_CONTENT[activeTab].base.title}</span>
              <div className="absolute inset-0 bg-brand-teal translate-y-[100%] group-hover/btn:translate-y-[0%] transition-transform duration-300 ease-out" />
            </Link>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            key={`pro-${activeTab}`} 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
            className="rounded-[32px] bg-[#f2f2f2] text-black p-6 sm:p-10 md:p-14 flex flex-col items-start text-left hover:-translate-y-2 transition-transform relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-black opacity-0 group-hover:opacity-[0.05] blur-[80px] rounded-full transition-opacity duration-700" />
            <div className="text-[11px] sm:text-[13px] font-bold text-slate-600 mb-2 sm:mb-4 tracking-widest uppercase">Growing & Enterprise</div>
            <h2 className="text-2xl sm:text-3xl md:text-[40px] leading-tight font-black tracking-tight mb-3 sm:mb-4 text-slate-900 group-hover:text-black transition-colors duration-500">
              {TAB_CONTENT[activeTab].pro.title}
            </h2>
            <p className="text-base sm:text-[17px] text-slate-700 mb-6 sm:mb-8 max-w-[380px]">
              {TAB_CONTENT[activeTab].pro.desc}
            </p>
            <p className="text-base sm:text-[17px] mb-8 sm:mb-12 font-bold text-slate-800">
              {TAB_CONTENT[activeTab].pro.price}
            </p>
            <Link 
              href="/register"
              className="relative overflow-hidden mt-auto inline-flex items-center justify-center rounded-full bg-black px-6 sm:px-8 py-3 sm:py-4 text-[14px] sm:text-[15px] font-bold text-white transition-all hover:scale-105 active:scale-95 group/btn"
            >
              <span className="relative z-10">Discover {TAB_CONTENT[activeTab].pro.title}</span>
              <div className="absolute inset-0 bg-brand-teal translate-y-[100%] group-hover/btn:translate-y-[0%] transition-transform duration-300 ease-out" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
