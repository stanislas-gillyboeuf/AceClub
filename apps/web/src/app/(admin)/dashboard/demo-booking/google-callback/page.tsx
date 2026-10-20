"use client"

import { Suspense, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useExchangeDemoBookingGoogleCode } from "@/hooks/use-demo-booking-mutations"

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const exchangeMutation = useExchangeDemoBookingGoogleCode()
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true

    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error || !code) {
      router.replace(`/dashboard/demo-booking?error=${encodeURIComponent(error || "missing_code")}`)
      return
    }

    exchangeMutation.mutate(code, {
      onSuccess: () => router.replace("/dashboard/demo-booking?connected=1"),
      onError: () => router.replace("/dashboard/demo-booking?error=exchange_failed"),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-full items-center justify-center py-20">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Connexion à Google Agenda…
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackContent />
    </Suspense>
  )
}
