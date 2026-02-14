import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { router } from '@inertiajs/react'

interface PaginationMeta {
  page: number
  last: number
  prev: number | null
  next: number | null
  pages: number
  count: number
  from: number
  to: number
}

interface PaginationProps {
  pagination: PaginationMeta
  paramName?: string
}

export function Pagination({ pagination, paramName = 'page' }: PaginationProps) {
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set(paramName, page.toString())
    router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true, preserveScroll: true })
  }

  if (pagination.pages <= 1) return null

  const pages = Array.from({ length: pagination.last }, (_, i) => i + 1)
  const visiblePages = pages.filter(p =>
    p === 1 ||
    p === pagination.last ||
    Math.abs(p - pagination.page) <= 1
  )

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-sm text-muted-foreground">
        Showing {pagination.from} to {pagination.to} of {pagination.count} results
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => pagination.prev && handlePageChange(pagination.prev)}
          disabled={!pagination.prev}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {visiblePages.map((page, idx) => {
          const showEllipsis = idx > 0 && page - visiblePages[idx - 1] > 1

          return (
            <div key={page} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-2 text-muted-foreground">
                  <MoreHorizontal className="size-4" />
                </span>
              )}
              <Button
                variant={page === pagination.page ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            </div>
          )
        })}

        <Button
          variant="outline"
          size="icon"
          onClick={() => pagination.next && handlePageChange(pagination.next)}
          disabled={!pagination.next}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
