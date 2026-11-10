"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Loader2, Search } from "lucide-react"

import { Input } from "@/components/ui/input"

export function UsersToolbar({ defaultQuery }: { defaultQuery: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get("q") ?? ""
  const [query, setQuery] = useState(defaultQuery)
  const [isPending, startTransition] = useTransition()
  // Last `q` this component wrote (or saw) in the URL, so we can tell our own
  // updates apart from outside navigation (sidebar link, Back/Forward).
  const syncedQuery = useRef(urlQuery)

  // Outside navigation changed `q`: adopt it instead of pushing the stale input back.
  useEffect(() => {
    if (urlQuery !== syncedQuery.current) {
      syncedQuery.current = urlQuery
      setQuery(urlQuery)
    }
  }, [urlQuery])

  // Debounce: push the search term to the URL so the server component re-fetches.
  useEffect(() => {
    if (query === urlQuery) return
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (query) params.set("q", query)
      else params.delete("q")
      params.delete("page")
      syncedQuery.current = query
      const qs = params.toString()
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname))
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, urlQuery, pathname, router, searchParams])

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label="Search users by email"
        placeholder="Search by email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-8"
      />
      {isPending && (
        <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}
