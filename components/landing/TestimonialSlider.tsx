"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const TESTIMONIALS = [
  {
    quote: "Streamline completely transformed how we manage our payroll and tax compliance. It's built for Zambia, and it shows.",
    author: "Chanda Mulenga",
    role: "CEO, Copperbelt Logistics Group",
  },
  {
    quote: "Before Streamline, managing multiple branches was a nightmare. Now, our entire team uses a single, integrated source of truth.",
    author: "Sarah Phiri",
    role: "Operations Director, Lusaka SME Hub",
  },
  {
    quote: "The modular approach means we only pay for what we use. It's the most cost-effective ERP we've ever deployed across our operations.",
    author: "David Mwansa",
    role: "CFO, Zambezi Trading Co.",
  }
]

export function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))
  }

  return (
    <div className="mx-auto max-w-5xl px-6 relative mt-16 z-10">
      <div className="text-center min-h-[300px] sm:min-h-[220px] transition-all duration-300">
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-[44px] font-black text-white leading-tight tracking-tight mb-8 sm:mb-10">
          "{TESTIMONIALS[currentIndex].quote}"
        </p>
        <div className="flex flex-col items-center">
          <p className="text-base sm:text-[17px] font-bold text-brand-blue">{TESTIMONIALS[currentIndex].author}</p>
          <p className="text-sm sm:text-[15px] font-bold text-slate-500">{TESTIMONIALS[currentIndex].role}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-4 mt-12 bg-black py-4">
        <button 
          onClick={prevSlide}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 text-white hover:bg-white hover:border-white hover:text-black transition-all cursor-pointer"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 text-white hover:bg-white hover:border-white hover:text-black transition-all cursor-pointer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
