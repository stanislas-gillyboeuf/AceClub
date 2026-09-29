import { Providers } from "@/app/providers"

export default function AdherentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="marketing-theme min-h-screen bg-mkt-bg text-mkt-fg">{children}</div>
    </Providers>
  )
}
