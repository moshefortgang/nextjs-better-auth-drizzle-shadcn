"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function UsersPagination({ page, pageCount }: { page: number; pageCount: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hrefFor = (target: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(target))
    return `${pathname}?${params}`
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="mr-2 text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </span>
      <PageButton href={hrefFor(page - 1)} disabled={page <= 1} label="Previous page">
        <ChevronLeft />
      </PageButton>
      <PageButton href={hrefFor(page + 1)} disabled={page >= pageCount} label="Next page">
        <ChevronRight />
      </PageButton>
    </div>
  )
}

function PageButton({
  href,
  disabled,
  label,
  children,
}: {
  href: string
  disabled: boolean
  label: string
  children: React.ReactNode
}) {
  if (disabled) {
    return (
      <Button variant="outline" size="icon" disabled aria-label={label}>
        {children}
      </Button>
    )
  }
  return (
    <Button variant="outline" size="icon" asChild>
      <Link href={href} aria-label={label}>
        {children}
      </Link>
    </Button>
  )
}
