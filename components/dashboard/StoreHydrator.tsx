"use client"

import { useEffect } from "react"
import { useModuleStore } from "@/lib/store/useModuleStore"

export function StoreHydrator({ activeModuleSlugs }: { activeModuleSlugs: string[] }) {
  const { hydrateActiveModules } = useModuleStore()

  useEffect(() => {
    hydrateActiveModules(activeModuleSlugs)
  }, [activeModuleSlugs, hydrateActiveModules])

  return null
}
