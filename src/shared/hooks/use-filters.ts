import { useState } from 'react'
import { useDebounce } from './use-debounce'

export function useFilters<T extends Record<string, any>>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters)
  const debouncedFilters = useDebounce(filters, 500)

  const updateFilter = <K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(initialFilters)
  }

  return {
    filters,
    debouncedFilters,
    updateFilter,
    setFilters,
    resetFilters,
  }
}
