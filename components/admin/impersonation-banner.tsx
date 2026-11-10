"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { VenetianMask } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export function ImpersonationBanner({ email }: { email: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const stop = () =>
    startTransition(async () => {
      try {
        const { error } = await authClient.admin.stopImpersonating()
        if (error) {
          toast({
            variant: "destructive",
            title: "Couldn't stop impersonating",
            description: error.message ?? "Your impersonation session may have expired. Sign in again.",
          })
          return
        }
        router.push("/users")
        router.refresh()
      } catch {
        toast({
          variant: "destructive",
          title: "Couldn't stop impersonating",
          description: "Network error. Please try again.",
        })
      }
    })

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-400 px-4 py-2 text-sm text-amber-950"
    >
      <VenetianMask className="size-4" />
      <span>
        You are impersonating <strong>{email}</strong>
      </span>
      <Button
        size="sm"
        variant="outline"
        onClick={stop}
        disabled={isPending}
        className="h-7 border-amber-950/30 bg-transparent hover:bg-amber-300"
      >
        {isPending ? "Returning..." : "Stop impersonating"}
      </Button>
    </div>
  )
}
