import { useState } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  initialSize?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 0, initialSize = 20 } = options
  const [page, setPage] = useState(initialPage)
  const [size, setSize] = useState(initialSize)

  const nextPage = () => setPage((prev) => prev + 1)
  const previousPage = () => setPage((prev) => Math.max(0, prev - 1))
  const goToPage = (newPage: number) => setPage(Math.max(0, newPage))
  const resetPage = () => setPage(initialPage)

  return {
    page,
    size,
    setPage,
    setSize,
    nextPage,
    previousPage,
    goToPage,
    resetPage,
  }
}
